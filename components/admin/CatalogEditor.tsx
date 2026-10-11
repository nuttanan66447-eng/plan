"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { deleteCourse, deleteProduct, saveCourse, saveProduct, type CatalogFormState } from "@/app/admin/catalog-actions";
import { Icon } from "@/components/Icon";
import { CATALOG, type CatalogKind } from "@/lib/catalog";
import { uploadImage } from "@/lib/upload";

type Row = Record<string, unknown> & { id?: string; slug?: string; image?: string | null; gallery?: string[]; is_published?: boolean; sort_order?: number };

/** Add / edit form for a course or a product, driven by the field list in lib/catalog.ts. */
export function CatalogEditor({ kind, item }: { kind: CatalogKind; item?: Row }) {
  const cfg = CATALOG[kind];
  const [state, action, pending] = useActionState<CatalogFormState | null, FormData>(kind === "course" ? saveCourse : saveProduct, null);
  const [image, setImage] = useState<string>((item?.image as string) ?? "");
  const [gallery, setGallery] = useState<string[]>((item?.gallery as string[]) ?? []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [slug] = useState(() => item?.slug ?? `${cfg.slugPrefix}-${Date.now().toString(36)}`);

  const upload = async (files: FileList | null, into: "cover" | "gallery") => {
    if (!files?.length) return;
    setErr(null);
    setBusy(true);
    try {
      for (const f of [...files]) {
        const url = await uploadImage(f, `${cfg.table}/${slug}`);
        if (into === "cover") setImage(url);
        else setGallery((g) => [...g, url].slice(0, 8));
        if (into === "cover") break;
      }
    } catch (e) {
      setErr(`อัปโหลดไม่สำเร็จ: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const val = (name: string) => {
    const v = item?.[name];
    if (Array.isArray(v)) return v.join("\n");
    return v == null ? "" : String(v);
  };

  return (
    <div className="space-y-6">
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }}>
        {item?.id && <input type="hidden" name="id" value={item.id} />}
        <input type="hidden" name="image" value={image} />
        {kind === "product" && <input type="hidden" name="gallery" value={JSON.stringify(gallery)} />}

        <section className="card p-5">
          <h2 className="text-[16px] font-bold">1. ข้อมูล{cfg.label}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {cfg.fields.map((f) => (
              <div key={f.name} className={`field ${f.wide ? "md:col-span-3" : ""}`}>
                <label htmlFor={`c-${f.name}`} className="field-label">{f.label} {"required" in f && f.required && <span className="text-bronze-dark">*</span>}</label>
                {f.type === "select" ? (
                  <select id={`c-${f.name}`} name={f.name} defaultValue={val(f.name) || f.options[0][0]} className="input">
                    {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                ) : f.type === "textarea" || f.type === "lines" ? (
                  <textarea id={`c-${f.name}`} name={f.name} defaultValue={val(f.name)} placeholder={"placeholder" in f ? f.placeholder : undefined} className="input min-h-[120px]" />
                ) : (
                  <input id={`c-${f.name}`} name={f.name} type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"} min={f.type === "number" ? 0 : undefined}
                    defaultValue={val(f.name)} placeholder={"placeholder" in f ? f.placeholder : undefined} className="input" />
                )}
                {"hint" in f && f.hint && <span className="text-[11px] text-subtle">{f.hint}</span>}
              </div>
            ))}
            <div className="field md:col-span-3">
              <label htmlFor="c-slug" className="field-label">ลิงก์หน้า (ภาษาอังกฤษ) <span className="text-bronze-dark">*</span></label>
              <div className="flex items-center border border-hairline bg-white">
                <span className="pl-3 text-[13px] text-muted">{cfg.publicPath}/</span>
                <input id="c-slug" name="slug" defaultValue={slug} required className="w-full px-1 py-2.5 text-[14px] outline-none" />
              </div>
              <span className="text-[11px] text-subtle">ตัวอักษรอังกฤษตัวเล็ก ตัวเลข และ - เช่น sketchup-basic</span>
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-[16px] font-bold">2. รูปภาพ</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-[320px_1fr]">
            <div>
              <p className="field-label">รูปหลัก</p>
              <label className={`relative mt-1 block cursor-pointer overflow-hidden border-2 ${kind === "product" ? "aspect-square" : "aspect-[16/10]"} ${image ? "border-hairline" : "border-dashed border-hairline bg-wash hover:border-ink"}`}>
                {image ? <Image src={image} alt="" fill sizes="320px" className="object-cover" /> : (
                  <span className="absolute inset-0 grid place-items-center text-center text-[12.5px] text-muted"><span><Icon name="add_photo_alternate" className="text-[28px]" /><br />{busy ? "กำลังอัปโหลด..." : "คลิกเพื่ออัปโหลด"}</span></span>
                )}
                <input type="file" accept="image/*" className="sr-only" disabled={busy} onChange={(e) => { upload(e.target.files, "cover"); e.target.value = ""; }} />
              </label>
              {image && <button type="button" onClick={() => setImage("")} className="mt-1 text-[12px] text-danger hover:underline">ลบรูป (ใช้ไอคอนแทน)</button>}
            </div>
            {kind === "product" && (
              <div>
                <p className="field-label">รูปเพิ่มเติม (สูงสุด 8)</p>
                <div className="mt-1 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {gallery.map((g) => (
                    <div key={g} className="relative aspect-square border border-hairline">
                      <Image src={g} alt="" fill sizes="140px" className="object-cover" />
                      <button type="button" onClick={() => setGallery((x) => x.filter((y) => y !== g))} className="absolute right-1 top-1 grid h-7 w-7 place-items-center bg-ink/85 text-white hover:bg-danger" aria-label="ลบรูป"><Icon name="delete" /></button>
                    </div>
                  ))}
                  {gallery.length < 8 && (
                    <label className="grid aspect-square cursor-pointer place-items-center border-2 border-dashed border-hairline bg-wash text-center text-[12px] text-muted hover:border-ink">
                      <span><Icon name="add_photo_alternate" className="text-[24px]" /><br />เพิ่มรูป</span>
                      <input type="file" accept="image/*" multiple className="sr-only" disabled={busy} onChange={(e) => { upload(e.target.files, "gallery"); e.target.value = ""; }} />
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>
          {err && <p className="mt-3 text-[13px] text-danger">{err}</p>}
        </section>

        <section className="card flex flex-wrap items-center gap-4 p-5">
          <label className="flex items-center gap-2 text-[14px] font-semibold">
            <input type="checkbox" name="is_published" defaultChecked={item?.is_published ?? true} className="check" /> แสดงบนเว็บไซต์
          </label>
          <div className="flex items-center gap-2 text-[13px]">
            <label htmlFor="c-sort" className="text-muted">ลำดับการแสดง</label>
            <input id="c-sort" name="sort_order" type="number" defaultValue={item?.sort_order ?? 100} className="input !w-24 !py-2" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            {state?.error && <p className="text-[13px] text-danger" role="alert">{state.error}</p>}
            {state?.saved && <p className="flex items-center gap-1 text-[13px] text-success" role="status"><Icon name="check_circle" /> บันทึกแล้ว</p>}
            {item?.slug && <Link href={`${cfg.publicPath}/${item.slug}`} target="_blank" className="btn btn-ghost btn-sm"><Icon name="open_in_new" /> ดูหน้าเว็บ</Link>}
            <button disabled={pending || busy} className="btn btn-primary">{pending ? "กำลังบันทึก..." : item ? "บันทึกการแก้ไข" : `เพิ่ม${cfg.label}`}</button>
          </div>
        </section>
      </form>

      {item?.id && (
        <form action={kind === "course" ? deleteCourse : deleteProduct}
          onSubmit={(e) => { if (!confirm(`ลบ${cfg.label}นี้ถาวร?`)) e.preventDefault(); }}
          className="card flex flex-wrap items-center justify-between gap-3 border-danger/30 p-5">
          <input type="hidden" name="id" value={item.id} />
          <div><p className="font-bold text-danger">ลบ{cfg.label}นี้</p><p className="text-[12.5px] text-muted">หากต้องการซ่อนชั่วคราว ให้เอาเครื่องหมาย “แสดงบนเว็บไซต์” ออกแทน</p></div>
          <button className="btn btn-sm border-danger text-danger hover:bg-danger hover:text-white"><Icon name="delete" /> ลบ</button>
        </form>
      )}
    </div>
  );
}
