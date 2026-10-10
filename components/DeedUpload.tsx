"use client";

import { useState } from "react";
import { browserClient } from "@/lib/supabase/browser";
import { Icon } from "./Icon";

const MAX = 3;

/** Land-deed (โฉนด) photos/PDF for site adaptation. Uploaded to a private bucket only admins can open. */
export function DeedUpload({ needed = false }: { needed?: boolean }) {
  const [files, setFiles] = useState<{ name: string; path: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const add = async (list: FileList | null) => {
    if (!list?.length) return;
    setErr(null);
    setBusy(true);
    const sb = browserClient();
    const next = [...files];
    try {
      for (const f of [...list]) {
        if (next.length >= MAX) break;
        if (!/^image\/|^application\/pdf$/.test(f.type) && !/\.(pdf|jpe?g|png|webp|heic)$/i.test(f.name)) throw new Error(`${f.name}: รองรับเฉพาะรูปภาพหรือ PDF`);
        if (f.size > 10 * 1024 * 1024) throw new Error(`${f.name}: ไฟล์ใหญ่เกิน 10MB`);
        const ext = (f.name.match(/\.[a-z0-9]+$/i)?.[0] ?? (f.type === "application/pdf" ? ".pdf" : ".jpg")).toLowerCase();
        const path = `deeds/${crypto.randomUUID()}/deed-${next.length + 1}${ext}`;
        const { error } = await sb.storage.from("lead-files").upload(path, f, { contentType: f.type || undefined, upsert: false });
        if (error) throw new Error(error.message);
        next.push({ name: f.name, path });
        setFiles([...next]);
      }
    } catch (e) {
      setErr(`อัปโหลดไม่สำเร็จ — ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`mt-3 border border-dashed bg-white p-3 ${needed ? "border-ink" : "border-hairline"}`}>
      <input type="hidden" name="deed_files" value={files.map((f) => f.path).join("|")} />
      <p className="flex items-center gap-2 text-[13px] font-semibold"><Icon name="description" className="text-bronze-dark" /> แนบโฉนดที่ดิน (รูปถ่ายหรือ PDF) <span className={`text-[11px] ${needed ? "text-bronze-dark" : "font-normal text-muted"}`}>{needed ? "— ใช้เขียนผังบริเวณ" : "— ไม่บังคับ"}</span></p>
      <p className="mt-0.5 text-[11.5px] text-muted">ใช้หมุนทิศ/กลับด้านผังให้เข้ากับแปลงที่ดิน{needed ? " และเขียนผังบริเวณ" : ""} • ถ่ายให้เห็นเลขที่โฉนด ขนาด และรูปแปลงชัดเจน (ด้านหน้า-หลัง) • สูงสุด {MAX} ไฟล์ ไฟล์ละไม่เกิน 10MB • เห็นได้เฉพาะเจ้าหน้าที่ • ยังไม่สะดวก แนบภายหลังทาง LINE ได้</p>
      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((f) => (
            <li key={f.path} className="flex items-center gap-2 bg-[#f1f8f3] px-2 py-1.5 text-[12.5px] text-success">
              <Icon name="check_circle" /> <span className="min-w-0 flex-1 truncate">{f.name}</span>
              <button type="button" onClick={() => setFiles((x) => x.filter((y) => y.path !== f.path))} className="text-muted hover:text-danger" aria-label={`เอา ${f.name} ออก`}><Icon name="close" /></button>
            </li>
          ))}
        </ul>
      )}
      {files.length < MAX && (
        <label className={`btn btn-ghost btn-sm mt-2 cursor-pointer ${busy ? "pointer-events-none opacity-60" : ""}`}>
          {busy ? <Icon name="progress_activity" className="animate-spin" /> : <Icon name="upload_file" />} {busy ? "กำลังอัปโหลด..." : files.length ? "เพิ่มไฟล์" : "เลือกไฟล์โฉนด"}
          <input type="file" accept="image/*,application/pdf" multiple className="sr-only" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
        </label>
      )}
      {err && <p className="mt-1 text-[12px] text-danger" role="alert">{err}</p>}
    </div>
  );
}
