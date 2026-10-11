"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CATALOG, type CatalogKind } from "@/lib/catalog";
import { serverClient } from "@/lib/supabase/server";

export interface CatalogFormState {
  error?: string;
  saved?: boolean;
}

/** Shared save for courses and products: the field list in lib/catalog.ts decides what is read and how. */
async function save(kind: CatalogKind, fd: FormData): Promise<CatalogFormState> {
  const cfg = CATALOG[kind];
  const raw = (k: string) => String(fd.get(k) ?? "").trim();
  const id = raw("id").slice(0, 40) || null;
  const slug = raw("slug").toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{2,59}$/.test(slug)) return { error: "ลิงก์ (slug) ต้องเป็นภาษาอังกฤษตัวเล็ก ตัวเลข หรือ - อย่างน้อย 3 ตัว เช่น sketchup-basic" };

  const row: Record<string, unknown> = { slug };
  for (const f of cfg.fields) {
    const v = raw(f.name);
    if (f.type === "number") {
      if (!v) {
        if (f.required) return { error: `กรุณากรอก ${f.label}` };
        row[f.name] = f.name === "shipping_fee" ? 0 : null;
        continue;
      }
      const n = Number(v.replace(/,/g, ""));
      if (!Number.isFinite(n) || n < 0) return { error: `${f.label} ต้องเป็นตัวเลข` };
      row[f.name] = Math.round(n);
    } else if (f.type === "lines") {
      row[f.name] = v.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 30).map((l) => l.slice(0, 200));
    } else if (f.type === "select") {
      row[f.name] = f.options.some(([o]) => o === v) ? v : f.options[0][0];
    } else if (f.type === "date") {
      row[f.name] = /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
    } else {
      if (!v && f.required) return { error: `กรุณากรอก ${f.label}` };
      row[f.name] = v ? v.slice(0, f.max ?? 300) : null;
    }
  }
  if (kind === "product" && !row.unit) row.unit = "ชิ้น";
  row.image = raw("image").slice(0, 500) || null;
  if (kind === "product") {
    try {
      row.gallery = (JSON.parse(raw("gallery") || "[]") as unknown[]).filter((g): g is string => typeof g === "string").slice(0, 8);
    } catch {
      row.gallery = [];
    }
  }
  row.is_published = fd.get("is_published") === "on";
  row.sort_order = Number(raw("sort_order")) || 100;

  const sb = await serverClient();
  const { error } = id ? await sb.from(cfg.table).update(row).eq("id", id) : await sb.from(cfg.table).insert(row);
  if (error) {
    if (error.code === "23505") return { error: `ลิงก์ ${slug} มีอยู่แล้ว กรุณาใช้ชื่ออื่น` };
    console.error("save " + kind, error.message);
    return { error: "บันทึกไม่สำเร็จ: " + error.message };
  }
  revalidatePath(cfg.publicPath);
  revalidatePath(`${cfg.publicPath}/${slug}`);
  if (!id) redirect(`${cfg.adminPath}?saved=${encodeURIComponent(String(row[cfg.titleField]))}`);
  return { saved: true };
}

async function remove(kind: CatalogKind, fd: FormData) {
  const cfg = CATALOG[kind];
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  const sb = await serverClient();
  const { data } = await sb.from(cfg.table).delete().eq("id", id).select(`slug, ${cfg.titleField}`).maybeSingle();
  revalidatePath(cfg.publicPath);
  const title = (data as Record<string, string> | null)?.[cfg.titleField] ?? "";
  redirect(`${cfg.adminPath}?deleted=${encodeURIComponent(title)}`);
}

export async function saveCourse(_prev: CatalogFormState | null, fd: FormData) {
  return save("course", fd);
}
export async function saveProduct(_prev: CatalogFormState | null, fd: FormData) {
  return save("product", fd);
}
export async function deleteCourse(fd: FormData) {
  return remove("course", fd);
}
export async function deleteProduct(fd: FormData) {
  return remove("product", fd);
}
