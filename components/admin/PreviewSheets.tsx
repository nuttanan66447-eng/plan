"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { uploadImage, uploadPdf } from "@/lib/upload";
import type { SheetImage } from "@/lib/types";

const PRESETS: [string, string][] = [
  ["ระบบไฟฟ้า-สุขาภิบาล", "EE"],
  ["รูปด้านอาคาร", "A-EL"],
  ["แบบโครงสร้าง / ฐานราก", "S-01"],
  ["รายการคำนวณโครงสร้าง (ตัวอย่าง)", "CAL"],
  ["ตาราง BOQ (ตัวอย่าง)", "BOQ"],
  ["ผังบริเวณ", "SITE"],
];

/** Extra sample sheets for the plan page's Preview Set + an optional public sample PDF. */
export function PreviewSheets({ value, onChange, pdf, onPdf, folder }: {
  value: SheetImage[]; onChange: (v: SheetImage[]) => void; pdf: string; onPdf: (url: string) => void; folder: () => string;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const set = (i: number, patch: Partial<SheetImage>) => onChange(value.map((s, k) => (k === i ? { ...s, ...patch } : s)));

  const addImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setErr(null);
    try {
      const next = [...value];
      for (const [i, f] of [...files].entries()) {
        if (next.length >= 8) break;
        setBusy(`กำลังอัปโหลด ${i + 1}/${files.length}...`);
        const preset = PRESETS.find(([l]) => !next.some((s) => s.label === l)) ?? ["แผ่นงานตัวอย่าง", ""];
        next.push({ url: await uploadImage(f, folder()), label: preset[0], tag: preset[1] || undefined });
        onChange([...next]);
      }
    } catch (e) {
      setErr(`อัปโหลดไม่สำเร็จ: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };
  const addPdf = async (f: File | undefined) => {
    if (!f) return;
    setErr(null);
    setBusy(`กำลังอัปโหลด PDF (${(f.size / 1024 / 1024).toFixed(1)} MB)...`);
    try {
      onPdf(await uploadPdf(f, folder()));
    } catch (e) {
      setErr(`อัปโหลดไม่สำเร็จ: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-5 border-t border-hairline pt-5">
      <p className="flex items-center gap-2 text-[14px] font-bold"><span className="bg-ink px-1.5 text-[11px] text-white">3.7</span><Icon name="collections_bookmark" className="text-bronze-dark" /> แผ่นงานตัวอย่าง (Preview Set) ใต้ภาพ 3D</p>
      <p className="mb-3 mt-1 text-[12px] text-muted">
        ลูกค้าเห็นต่อจาก 01 ทัศนียภาพ • 02 ภาพตัด • แปลนแต่ละชั้น — เช่น ระบบไฟฟ้า-สุขาภิบาล รูปด้าน โครงสร้าง (สูงสุด 8 แผ่น) •
        <b> แนะนำให้ใส่ลายน้ำหรือบังรายละเอียดบางส่วน</b> เพราะเป็นภาพสาธารณะ — ไฟล์ฉบับเต็มให้อัปโหลดในหัวข้อ “ไฟล์ส่งมอบลูกค้า” ด้านล่าง
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {value.map((s, i) => (
          <div key={s.url} className="border border-hairline bg-white">
            <div className="relative aspect-[4/3] bg-white"><Image src={s.url} alt={s.label} fill sizes="240px" className="object-contain p-1" /></div>
            <div className="space-y-1.5 border-t border-hairline p-2">
              <input value={s.label} onChange={(e) => set(i, { label: e.target.value })} maxLength={60} aria-label="ชื่อแผ่นงาน" className="input !py-1.5 text-[12.5px] font-semibold" list="sheet-presets" />
              <div className="flex gap-1.5">
                <input value={s.tag ?? ""} onChange={(e) => set(i, { tag: e.target.value.toUpperCase() })} maxLength={8} placeholder="รหัส เช่น EE-01" aria-label="รหัสแผ่น" className="input !py-1.5 text-[11.5px]" />
                <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} className="grid w-9 shrink-0 place-items-center text-muted hover:bg-danger hover:text-white" aria-label={`ลบ ${s.label}`}><Icon name="delete" /></button>
              </div>
            </div>
          </div>
        ))}
        {value.length < 8 && (
          <label className="grid aspect-[4/3] cursor-pointer place-items-center border-2 border-dashed border-hairline bg-wash text-center text-[12.5px] text-muted hover:border-ink">
            <span><Icon name="add_photo_alternate" className="text-[28px]" /><br />เพิ่มแผ่นงาน (JPG/PNG)</span>
            <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { addImages(e.target.files); e.target.value = ""; }} />
          </label>
        )}
      </div>
      <datalist id="sheet-presets">{PRESETS.map(([l]) => <option key={l} value={l} />)}</datalist>

      <div className="mt-4 flex flex-wrap items-center gap-3 bg-wash p-3 text-[12.5px]">
        <Icon name="picture_as_pdf" className="text-[22px] text-bronze-dark" />
        <span className="flex-1"><b>ตัวอย่างเล่มแบบ (PDF)</b> — แสดงเป็นลิงก์ “ดูตัวอย่างเล่มแบบ” ข้างหัวข้อ Preview Set (ใส่ 3–5 หน้าที่มีลายน้ำ ไม่ใช่เล่มเต็ม)</span>
        {pdf && <a href={pdf} target="_blank" rel="noopener noreferrer" className="font-semibold text-bronze-dark underline">เปิดดูไฟล์</a>}
        <label className="btn btn-ghost btn-sm cursor-pointer"><Icon name="upload_file" /> {pdf ? "เปลี่ยนไฟล์" : "อัปโหลด PDF"}
          <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(e) => { addPdf(e.target.files?.[0]); e.target.value = ""; }} />
        </label>
        {pdf && <button type="button" onClick={() => onPdf("")} className="text-danger hover:underline">ลบ</button>}
      </div>
      {busy && <p className="mt-2 flex items-center gap-2 text-[13px] text-bronze-dark"><Icon name="progress_activity" className="animate-spin" /> {busy}</p>}
      {err && <p className="mt-2 text-[13px] text-danger">{err}</p>}
    </div>
  );
}
