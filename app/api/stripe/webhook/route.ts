import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { adminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Stripe → marks the order paid once Checkout is paid (cards at once, PromptPay when the transfer lands). */
export async function POST(req: Request) {
  const s = stripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const db = adminClient();
  if (!s || !secret || !db) return new Response("payments not configured", { status: 503 });

  let event: Stripe.Event;
  try {
    event = s.webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return new Response("bad signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    const orderNo = session.metadata?.order_no;
    if (session.payment_status !== "paid" || !orderNo) return Response.json({ ok: true, skipped: true });

    const { data: lead, error } = await db.from("leads").select("id, order_status, estimate_thb").eq("order_no", orderNo).maybeSingle();
    if (error) return new Response("db error", { status: 500 }); // Stripe retries
    if (!lead) return Response.json({ ok: true, skipped: "unknown order" });

    const paid = (session.amount_total ?? 0) / 100;
    if (lead.order_status !== "pending_payment") return Response.json({ ok: true, skipped: "already handled" });
    if (paid < Number(lead.estimate_thb ?? 0)) {
      console.error("stripe webhook: amount below order total", orderNo, paid, lead.estimate_thb);
      return Response.json({ ok: true, skipped: "amount mismatch" });
    }
    const now = new Date().toISOString();
    const { error: upd } = await db.from("leads")
      .update({ order_status: "paid", stripe_session_id: session.id, paid_amount: Math.round(paid), paid_at: now, order_updated_at: now })
      .eq("id", lead.id).eq("order_status", "pending_payment");
    if (upd) return new Response("db error", { status: 500 });
  }
  return Response.json({ ok: true });
}
