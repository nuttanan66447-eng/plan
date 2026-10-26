import { createHmac, timingSafeEqual } from "node:crypto";
import Stripe from "stripe";
import { SITE } from "./site";

let client: Stripe | null = null;

/** Stripe is switched on only when the secret key is set on the server (Vercel env STRIPE_SECRET_KEY). */
export function stripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client ??= new Stripe(key);
  return client;
}

/** Online payment needs all three: the key to open Checkout, the webhook secret and the service-role key to mark orders paid. */
export const paymentsEnabled = () =>
  Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && process.env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * Leads can be inserted with the public key, so a stored amount is only trusted for Checkout when it
 * carries this server signature (set by submitLead after pricing the order from the database).
 */
export function priceSig(orderNo: string, amount: number) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return createHmac("sha256", key).update(`natbuild-price|${orderNo}|${amount}`).digest("hex").slice(0, 32);
}
export function priceSigOk(orderNo: string, amount: number, sig: unknown) {
  const want = priceSig(orderNo, amount);
  if (!want || typeof sig !== "string" || sig.length !== want.length) return false;
  return timingSafeEqual(Buffer.from(want), Buffer.from(sig));
}

/** Hosted Checkout for one order. Card and any other methods enabled in the Stripe dashboard (e.g. PromptPay). */
export async function createCheckout(o: { orderNo: string; amount: number; title: string; email?: string | null; origin?: string | null }) {
  const s = stripe();
  if (!s || o.amount <= 0) return null;
  // return to the site the order came from only for localhost; everything else goes back to production
  const base = (o.origin && /^http:\/\/localhost(:\d+)?$/.test(o.origin) ? o.origin : SITE.url).replace(/\/$/, "");
  const session = await s.checkout.sessions.create({
    mode: "payment",
    currency: "thb",
    line_items: [{
      quantity: 1,
      price_data: { currency: "thb", unit_amount: Math.round(o.amount * 100), product_data: { name: `${o.title} • ${o.orderNo}`.slice(0, 250) } },
    }],
    client_reference_id: o.orderNo,
    metadata: { order_no: o.orderNo },
    payment_intent_data: { metadata: { order_no: o.orderNo }, description: `NATBUILD ${o.orderNo}` },
    customer_email: o.email || undefined,
    locale: "th",
    success_url: `${base}/track?order=${o.orderNo}&paid=1`,
    cancel_url: `${base}/track?order=${o.orderNo}&cancelled=1`,
  });
  return session.url;
}
