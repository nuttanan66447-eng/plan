"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { browserClient } from "@/lib/supabase/browser";
import type { PlanFileKind } from "@/lib/types";

const KINDS: { key: PlanFileKind; label: string; hint: string; icon: string; accept: string }[] = [
  { key: "blueprint", label: "เล่มแบบก่อสร้างครบชุด (PDF)", hint: "สถาปัตย์ โครงสร้าง ไฟฟ้า สุขาภิบาล", icon: "menu_book", accept: ".pdf" },
  { key: "structural", label: "รายการคำนวณโครงสร้าง (PDF)", hint: "ฉบับลงนามวิศวกร", icon: "assignment_turned_in", accept: ".pdf" },
  { key: "boq", label: "BOQ (Excel / PDF)", hint: "ไฟล์ฉบับเต็มให้ผู้ซื้อดาวน์โหลด (ต่างจากหัวข้อ 4 ที่แสดงบนเว็บ)", icon: "table_view", accept: ".xlsx,.xls,.csv,.pdf" },
  { key: "cad", label: "ไฟล์ดิจิทัล BIM / SketchUp / AutoCAD", hint: ".rvt .skp .dwg หรือ .zip — เฉพาะผู้ซื้อแพ็กเกจไฟล์ดิจิทัล", icon: "deployed_code", accept: ".zip,.rvt,.skp,.dwg,.dxf,.ifc,.rar,.7z" },
  { key: "render", label: "ภาพ 3D Render ความละเอียดสูง", hint: "JPG/PNG หรือ .zip — เฉพาะผู้ซื้อแพ็กเกจไฟล์ดิจิทัล", icon: "photo_camera", accept: ".zip,.jpg,.jpeg,.png" },
  { key: "other", label: "ไฟล์อื่นๆ", hint: "เช่น คู่มือ เอกสารประกอบการยื่น", icon: "attach_file", accept: "*" },
];

interface Row { id: string; kind: PlanFileKind; name: string; path: string; size: number | null }

const mb = (n: number | null) => (n == null ? "" : n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.ceil(n / 1024)} KB`);

/** Private files a paying customer downloads from /track. Stored in the non-public "plan-files" bucket. */
export function DeliverableFiles({ planId }: { planId: string }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await browserClient().from("plan_files").select("id,kind,name,path,size").eq("plan_id", planId).order("created_at");
    if (error) setErr(error.message);
    setRows((data ?? []) as Row[]);
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  const upload = async (kind: PlanFileKind, files: FileList | null) => {
    if (!files?.length) return;
    setErr(null);
    const sb = browserClient();
    try {
      for (const [i, f] of [...files].entries()) {
        if (f.size > 50 * 1024 * 1024) throw new Error(`${f.name} ใหญ่เกิน 50MB — แบ่งไฟล์หรือบีบอัดก่อน`);
        setBusy(`กำลังอัปโหลด ${f.name} (${i + 1}/${files.length})...`);
        const safe = f.name.replace(/[^\w.\-]+/g, "_").slice(-80);
        const path = `${planId}/${kind}/${Date.now()}-${safe}`;
        const up = await sb.storage.from("plan-files").upload(path, f, { contentType: f.type || "application/octet-stream", upsert: false });
        if (up.error) throw new Error(up.error.message);
        const ins = await sb.from("plan_files").insert({ plan_id: planId, kind, name: f.name.slice(0, 200), path, size: f.size });
        if (ins.error) throw new Error(ins.error.message);
      }
      await load();
    } catch (e) {
      setErr(`อัปโหลดไม่สำเร็จ: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };
  const remove = async (r: Row) => {
    if (!confirm(`ลบไฟล์ ${r.name}?`)) return;
    const sb = browserClient();
    await sb.storage.from("plan-files").remove([r.path]);
    await sb.from("plan_files").delete().eq("id", r.id);
    await load();
  };
  const open = async (r: Row) => {
    const { data } = await browserClient().storage.from("plan-files").createSignedUrl(r.path, 300, { download: r.name });
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  return (
    <section className="card p-5">
      <h2 className="flex items-center gap-2 text-[16px] font-bold"><Icon name="lock" className="text-bronze-dark" /> 5. ไฟล์ส่งมอบลูกค้า (เฉพาะผู้ซื้อ)</h2>
      <p className="mt-1 text-[12.5px] text-muted">
        เก็บแบบส่วนตัว ไม่มีใครเปิดได้นอกจากแอดมิน • ลูกค้าดาวน์โหลดได้ที่หน้า <b>ติดตามคำสั่งซื้อ</b> เมื่อคุณเปลี่ยนสถานะคำสั่งซื้อเป็น <b>“ชำระเงินแล้ว”</b> ขึ้นไป (ลิงก์หมดอายุใน 1 ชั่วโมง) •
        ไฟล์ BIM/SketchUp/AutoCAD และภาพ Render ให้เฉพาะคนที่ซื้อแพ็กเกจ “ไฟล์ดิจิทัล” • ไฟล์ละไม่เกิน 50MB
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {KINDS.map((k) => {
          const list = (rows ?? []).filter((r) => r.kind === k.key);
          return (
            <div key={k.key} className="border border-hairline p-3">
              <div className="flex items-start gap-2">
                <Icon name={k.icon} className="mt-0.5 text-[20px] text-bronze-dark" />
                <div className="min-w-0 flex-1"><b className="block text-[13.5px]">{k.label}</b><span className="text-[11.5px] text-muted">{k.hint}</span></div>
                <label className="btn btn-ghost btn-sm shrink-0 cursor-pointer"><Icon name="upload_file" /> อัปโหลด
                  <input type="file" multiple accept={k.accept} className="sr-only" disabled={!!busy} onChange={(e) => { upload(k.key, e.target.files); e.target.value = ""; }} />
                </label>
              </div>
              {list.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {list.map((r) => (
                    <li key={r.id} className="flex items-center gap-2 bg-wash px-2 py-1.5 text-[12.5px]">
                      <button type="button" onClick={() => open(r)} className="min-w-0 flex-1 truncate text-left font-semibold hover:underline" title="ดาวน์โหลด">{r.name}</button>
                      <span className="shrink-0 text-[11px] text-muted">{mb(r.size)}</span>
                      <button type="button" onClick={() => remove(r)} className="grid h-7 w-7 shrink-0 place-items-center text-muted hover:bg-danger hover:text-white" aria-label={`ลบ ${r.name}`}><Icon name="delete" /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      {rows == null && <p className="mt-3 text-[12.5px] text-muted">กำลังโหลดรายการไฟล์...</p>}
      {busy && <p className="mt-3 flex items-center gap-2 text-[13px] text-bronze-dark"><Icon name="progress_activity" className="animate-spin" /> {busy}</p>}
      {err && <p className="mt-3 text-[13px] text-danger">{err}</p>}
    </section>
  );
}
