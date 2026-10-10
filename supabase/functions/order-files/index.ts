// Download links for a paid blueprint order.
// Auth is the order number + the phone used to order (same as the /track page); no account needed.
// Files live in the private "plan-files" bucket; links are signed and expire after one hour.
import { createClient } from "npm:@supabase/supabase-js@2";

const PAID = ["paid", "preparing", "shipped", "delivered"];
const digits = (s: unknown) => String(s ?? "").replace(/\D/g, "");
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);
  let input: { order_no?: string; phone?: string };
  try {
    input = await req.json();
  } catch {
    return json({ error: "bad request" }, 400);
  }
  const orderNo = String(input.order_no ?? "").trim().toUpperCase();
  const phone = digits(input.phone);
  if (!/^NB\d{6}-[A-Z0-9]{4}$/.test(orderNo) || phone.length < 9) return json({ error: "not found" }, 404);

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
  const { data: order } = await sb
    .from("leads")
    .select("phone, plan_code, order_status, service_package, meta")
    .eq("type", "order")
    .eq("order_no", orderNo)
    .maybeSingle();
  if (!order || digits(order.phone) !== phone) return json({ error: "not found" }, 404);
  if (!PAID.includes(order.order_status ?? "")) return json({ locked: true, files: [] });

  const { data: plan } = await sb.from("plans").select("id").eq("code", order.plan_code).maybeSingle();
  if (!plan) return json({ files: [] });
  const { data: rows } = await sb.from("plan_files").select("kind, name, path, size").eq("plan_id", plan.id).order("created_at");

  // BIM / SketchUp / DWG source files and renders come with the "ไฟล์ดิจิทัล BIM" add-on only
  const bought = `${order.service_package ?? ""} ${(order.meta as Record<string, string> | null)?.deliverables ?? ""}`;
  const hasCad = /BIM/i.test(bought);
  const files = [];
  for (const f of rows ?? []) {
    if ((f.kind === "cad" || f.kind === "render") && !hasCad) continue;
    const { data } = await sb.storage.from("plan-files").createSignedUrl(f.path, 3600, { download: f.name });
    if (data?.signedUrl) files.push({ kind: f.kind, name: f.name, size: f.size, url: data.signedUrl });
  }
  return json({ files, cadLocked: !hasCad && (rows ?? []).some((f) => f.kind === "cad" || f.kind === "render") });
});
