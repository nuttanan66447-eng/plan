import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const sb = await serverClient();
  const { data } = await sb.auth.getUser();
  if (!data.user) redirect("/admin/login");
  const { data: isAdmin } = await sb.rpc("is_admin");
  return { sb, user: data.user, isAdmin: Boolean(isAdmin) };
}
