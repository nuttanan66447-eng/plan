"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useActionState, useRef, useState } from "react";
import { deleteProject, saveProject, type ProjectFormState } from "@/app/admin/actions";
import { Icon } from "@/components/Icon";
import type { Project } from "@/lib/types";
import { uploadImage } from "@/lib/upload";

type P = Project & { is_published?: boolean; sort_order?: number };

function Field({ name, label, value, type = "text", required, placeholder, hint, step }: {
  name: string; label: string; value?: string | number | null; type?: string; required?: boolean; placeholder?: string; hint?: string; step?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={`pj-${name}`} className="field-label">{label} {required && <span className="text-bronze-dark">*</span>}</label>
      <input id={`pj-${name}`} name={name} type={type} step={step} min={type === "number" ? 0 : undefined} defaultValue={value ?? ""} placeholder={placeholder} className="input" />
      {hint && <span className="text-[11px] text-subtle">{hint}</span>}
    </div>
  );
}

function PhotoSlot({ label, hint, value, onChange, busy }: { label: string; hint: string; value: string; onChange: (f: File) => void; busy: boolean }) {
  return (
    <div>
      <p className="field-label">{label}</p>
      <p className="mb-2 text-[11.5px] text-muted">{hint}</p>
      <label className={`relative block aspect-[16/10] cursor-pointer overflow-hidden border-2 ${value ? "border-hairline" : "border-dashed border-hairline bg-wash hover:border-ink"}`}>
        {value ? <Image src={value} alt={label} fill sizes="480px" className="object-cover" /> : (
          <span className="absolute inset-0 grid place-items-center text-center text-[12.5px] text-muted">
            <span><Icon name="add_photo_alternate" className="text-[28px]" /><br />{busy ? "กำลังอัปโหลด..." : "คลิกเพื่ออัปโหลดรูป"}</span>
          </span>
        )}
        {value && <span className="absolute bottom-2 right-2 bg-ink/85 px-2 py-1 text-[11px] text-white"><Icon name="sync" /> เปลี่ยนรูป</span>}
        <input type="file" accept="image/*" className="sr-only" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); e.target.value = ""; }} />
      </label>
    </div>
  );
}

export interface ReviewOption { id: string; name: string; role: string | null; body: string; rating: number; is_published?: boolean; plan_code?: string | null }

export function ProjectEditor({ project, plans, reviews = [] }: { project?: P; plans: { code: string; name_en: string }[]; reviews?: ReviewOption[] }) {
  const [state, action, pending] = useActionState<ProjectFormState | null, FormData>(saveProject, null);
  const [image, setImage] = useState(project?.image ?? "");
  const [before, setBefore] = useState(project?.before_image ?? "");
  const [busy, setBusy] = useState<"image" | "before" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const quoteRef = useRef<HTMLTextAreaElement>(null);
  const quoteByRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState("");

  const pickReview = (id: string) => {
    setPicked(id);
    const r = reviews.find((x) => x.id === id);
    if (!r) return;
    if (quoteRef.current) quoteRef.current.value = r.body;
    if (quoteByRef.current) quoteByRef.current.value = r.role ? `${r.name} • ${r.role}` : r.name;
  };

  const upload = async (f: File, which: "image" | "before") => {
    setErr(null);
    setBusy(which);
    try {
      const url = await uploadImage(f, `projects/${(codeRef.current?.value || "new").toUpperCase().replace(/[^A-Z0-9-]/g, "")}`);
      (which === "image" ? setImage : setBefore)(url);
    } catch (e) {
      setErr(`อัปโหลดไม่สำเร็จ: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }}>
        {project && <input type="hidden" name="id" value={project.id} />}
        <input type="hidden" name="image" value={image} />
        <input type="hidden" name="before_image" value={before} />

        <section className="card p-5">
          <h2 className="text-[16px] font-bold">1. ข้อมูลผลงาน</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="field">
              <label htmlFor="pj-code" className="field-label">รหัสผลงาน <span className="text-bronze-dark">*</span></label>
              <input id="pj-code" ref={codeRef} name="code" defaultValue={project?.code} placeholder="RE-SL-035" className="input uppercase" />
              <span className="text-[11px] text-subtle">เช่น RE-อำเภอ-ลำดับ</span>
            </div>
            <div className="md:col-span-2"><Field name="title" label="ชื่อผลงาน" value={project?.title} required placeholder="บ้านเดี่ยวชั้นเดียว คอร์ตยาร์ดกลางบ้าน" /></div>
            <Field name="district" label="อำเภอ" value={project?.district} required placeholder="อ.เสลภูมิ" />
            <Field name="province" label="จังหวัด" value={project?.province ?? "ร้อยเอ็ด"} />
            <Field name="style_label" label="สไตล์" value={project?.style_label} placeholder="Japandi Courtyard" />
            <div className="field">
              <label htmlFor="pj-plan" className="field-label">สร้างจากแบบบ้าน</label>
              <select id="pj-plan" name="plan_code" defaultValue={project?.plan_code ?? ""} className="input">
                <option value="">— ไม่ได้ใช้แบบจากคลัง / ออกแบบเฉพาะ —</option>
                {plans.map((p) => <option key={p.code} value={p.code}>{p.code} — {p.name_en}</option>)}
              </select>
              <span className="text-[11px] text-subtle">ผลงานจะแสดงในหน้าแบบนั้นด้วย</span>
            </div>
            <Field name="handover_on" label="วันที่ส่งมอบ" type="date" value={project?.handover_on} />
            <Field name="highlight" label="จุดเด่น (ป้ายสั้น)" value={project?.highlight} placeholder="ผ่านตรวจ 0 Defect" />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Field name="area_sqm" label="พื้นที่ใช้สอย (ตร.ม.)" type="number" step="0.1" value={project?.area_sqm} />
            <Field name="bedrooms" label="ห้องนอน" type="number" value={project?.bedrooms} />
            <Field name="bathrooms" label="ห้องน้ำ" type="number" value={project?.bathrooms} />
            <Field name="budget_million" label="งบก่อสร้างจริง (ล้านบาท)" type="number" step="0.01" value={project?.budget_million} />
          </div>
          <div className="field mt-4">
            <label htmlFor="pj-description" className="field-label">รายละเอียดผลงาน</label>
            <textarea id="pj-description" name="description" defaultValue={project?.description ?? ""} className="input min-h-[90px]" />
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-[16px] font-bold">2. รูปภาพ</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <PhotoSlot label="รูปบ้านที่สร้างเสร็จ *" hint="รูปหลักบนการ์ดผลงาน (แนะนำแนวนอน)" value={image} busy={busy === "image"} onChange={(f) => upload(f, "image")} />
            <div>
              <PhotoSlot label="รูประหว่างก่อสร้าง (ไม่บังคับ)" hint="ถ้าใส่ จะมีสไลด์เทียบก่อน-หลังเมื่อผลงานนี้เป็นผลงานแนะนำ" value={before} busy={busy === "before"} onChange={(f) => upload(f, "before")} />
              {before && <button type="button" onClick={() => setBefore("")} className="mt-1 text-[12px] text-danger hover:underline">ลบรูปก่อนสร้าง</button>}
            </div>
          </div>
          {err && <p className="mt-3 text-[13px] text-danger">{err}</p>}
        </section>

        <section className="card p-5">
          <h2 className="text-[16px] font-bold">3. คำพูดจากเจ้าของบ้าน (ไม่บังคับ)</h2>
          <p className="mt-1 text-[12px] text-muted">พิมพ์เอง หรือเลือกจากรีวิวที่ลูกค้าส่งมาทางหน้าเว็บ แล้วแก้ไขข้อความต่อได้</p>
          {reviews.length > 0 && (
            <div className="field mt-4">
              <label htmlFor="pj-review" className="field-label">เลือกจากรีวิวลูกค้า</label>
              <select id="pj-review" value={picked} onChange={(e) => pickReview(e.target.value)} className="input">
                <option value="">— เลือกรีวิว ({reviews.length}) —</option>
                {reviews.map((r) => (
                  <option key={r.id} value={r.id}>
                    {"★".repeat(r.rating)} {r.name}{r.plan_code ? ` • ${r.plan_code}` : ""}{r.is_published === false ? " (รอตรวจสอบ)" : ""} — {r.body.slice(0, 60)}{r.body.length > 60 ? "…" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_280px]">
            <div className="field">
              <label htmlFor="pj-quote" className="field-label">คำพูด / รีวิว</label>
              <textarea id="pj-quote" ref={quoteRef} name="quote" defaultValue={project?.quote ?? ""} className="input min-h-[90px]" placeholder="ชอบคอร์ทยาร์ดต้นไม้กลางบ้านมากค่ะ..." />
            </div>
            <div className="field">
              <label htmlFor="pj-quote_by" className="field-label">ชื่อเจ้าของบ้าน</label>
              <input id="pj-quote_by" ref={quoteByRef} name="quote_by" defaultValue={project?.quote_by ?? ""} placeholder="คุณพรรณิภา (อาจารย์)" className="input" />
            </div>
          </div>
        </section>

        <section className="card flex flex-wrap items-center gap-x-6 gap-y-3 p-5">
          <label className="flex items-center gap-2 text-[14px] font-semibold"><input type="checkbox" name="is_published" defaultChecked={project?.is_published ?? true} className="check" /> แสดงบนเว็บไซต์</label>
          <label className="flex items-center gap-2 text-[14px] font-semibold"><input type="checkbox" name="featured" defaultChecked={project?.featured ?? false} className="check" /> ผลงานแนะนำ (แสดงใหญ่ด้านบน)</label>
          <div className="flex items-center gap-2 text-[13px]">
            <label htmlFor="pj-sort" className="text-muted">ลำดับ</label>
            <input id="pj-sort" name="sort_order" type="number" defaultValue={project?.sort_order ?? 100} className="input !w-24 !py-2" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            {state?.error && <p className="text-[13px] text-danger" role="alert">{state.error}</p>}
            {state?.saved && <p className="flex items-center gap-1 text-[13px] text-success" role="status"><Icon name="check_circle" /> บันทึกแล้ว</p>}
            <Link href="/portfolio" target="_blank" className="btn btn-ghost btn-sm"><Icon name="open_in_new" /> ดูหน้าผลงาน</Link>
            <button disabled={pending || !!busy} className="btn btn-primary">{pending ? "กำลังบันทึก..." : project ? "บันทึกการแก้ไข" : "เพิ่มผลงาน"}</button>
          </div>
        </section>
      </form>

      {project && (
        <form action={deleteProject} onSubmit={(e) => { if (!confirm(`ลบผลงาน ${project.code} ถาวร?`)) e.preventDefault(); }}
          className="card flex flex-wrap items-center justify-between gap-3 border-danger/30 p-5">
          <input type="hidden" name="id" value={project.id} />
          <div><p className="font-bold text-danger">ลบผลงานนี้</p><p className="text-[12.5px] text-muted">หากต้องการซ่อนชั่วคราว ให้เอาเครื่องหมาย “แสดงบนเว็บไซต์” ออกแทน</p></div>
          <button className="btn btn-sm border-danger text-danger hover:bg-danger hover:text-white"><Icon name="delete" /> ลบผลงาน</button>
        </form>
      )}
    </div>
  );
}
