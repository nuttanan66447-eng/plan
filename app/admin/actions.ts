"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";

const STATUSES = ["new", "contacted", "quoted", "won", "lost"];

export async function signIn(_prev: { error?: string } | null, fd: FormData) {
  const email = String(fd.get("email") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { error: "กรุณากรอกอีเมลและรหัสผ่าน" };
  const sb = await serverClient();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  redirect("/admin");
}

export async function signOut() {
  const sb = await serverClient();
  await sb.auth.signOut();
  redirect("/admin/login");
}

export async function updateLead(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  const status = String(fd.get("status") ?? "");
  const note = String(fd.get("admin_note") ?? "").slice(0, 2000);
  if (!id || !STATUSES.includes(status)) return;
  const sb = await serverClient();
  await sb.from("leads").update({ status, admin_note: note || null }).eq("id", id);
  revalidatePath("/admin");
}

export async function updatePlan(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  const price = Number(fd.get("price"));
  const published = fd.get("is_published") === "on";
  if (!id || !Number.isFinite(price) || price <= 0) return;
  const sb = await serverClient();
  const { data } = await sb.from("plans").update({ price: Math.round(price), is_published: published }).eq("id", id).select("code").maybeSingle();
  revalidatePath("/admin/plans");
  revalidatePath("/plans");
  revalidatePath("/");
  if (data?.code) revalidatePath(`/plans/${data.code}`);
}
