"use client";

import { useActionState } from "react";
import { trackOrder, type TrackState } from "@/app/actions";
import { baht } from "@/lib/format";
import { CARRIERS, ORDER_STEPS } from "@/lib/orders";
import { Icon } from "./Icon";

const FILE_LABEL: Record<string, string> = {
  blueprint: "เล่มแบบก่อสร้างครบชุด", structural: "รายการคำนวณโครงสร้าง", boq: "BOQ", cad: "ไฟล์ BIM / SketchUp / AutoCAD", render: "ภาพ 3D Render", other: "เอกสารประกอบ",
};
const FILE_ICON: Record<string, string> = {
  blueprint: "menu_book", structural: "assignment_turned_in", boq: "table_view", cad: "deployed_code", render: "photo_camera", other: "attach_file",
};

const date = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" }) : "";

export function TrackOrder({ initialOrderNo }: { initialOrderNo: string }) {
  const [state, action, pending] = useActionState<TrackState | null, FormData>(trackOrder, null);
  const o = state?.order;
  const current = o ? ORDER_STEPS.findIndex((s) => s.key === o.order_status) : -1;
  const carrier = o?.carrier ? CARRIERS[o.carrier] : null;

  return (
    <div className="space-y-5">
      <form action={action} className="card grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="field">
          <span className="field-label">เลขที่คำสั่งซื้อ</span>
          <input name="order_no" defaultValue={initialOrderNo} required placeholder="NB261010-7KQ4" className="input uppercase" autoComplete="off" />
        </label>
        <label className="field">
          <span className="field-label">เบอร์โทรที่ใช้สั่งซื้อ</span>
          <input name="phone" type="tel" required placeholder="08x-xxx-xxxx" className="input" autoComplete="tel" />
        </label>
        <button disabled={pending} className="btn btn-primary">{pending ? <Icon name="progress_activity" className="animate-spin" /> : <Icon name="search" />} ตรวจสอบ</button>
        {state?.error && <p className="text-[13px] text-danger sm:col-span-3" role="alert">{state.error}</p>}
      </form>

      {o && (
        <div className="card p-5 animate-fade-up" role="status">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline pb-4">
            <div>
              <p className="text-[12px] text-muted">คำสั่งซื้อ</p>
              <p className="font-display text-[24px] font-bold">{o.order_no}</p>
              <p className="text-[12.5px] text-muted">สั่งเมื่อ {date(o.created_at)}{o.plan_code && <> • แบบ {o.plan_code}</>}</p>
            </div>
            {o.estimate_thb != null && <p className="text-right"><span className="block text-[12px] text-muted">ยอดรวม</span><b className="font-display text-[22px] text-bronze-dark">{baht(o.estimate_thb)}</b></p>}
          </div>
          {o.service_package && <p className="mt-3 text-[13px] text-ink-3">{o.service_package}</p>}

          {o.order_status === "cancelled" ? (
            <p className="mt-5 flex items-center gap-2 bg-[#fff1ef] p-3 text-[14px] font-semibold text-danger"><Icon name="cancel" /> คำสั่งซื้อนี้ถูกยกเลิก — สอบถามเพิ่มเติมได้ที่ทีมงาน</p>
          ) : (
            <ol className="mt-5 grid gap-3 sm:grid-cols-5">
              {ORDER_STEPS.map((s, i) => {
                const done = i <= current;
                return (
                  <li key={s.key} className={`relative border-t-4 pt-3 ${done ? "border-bronze" : "border-hairline"}`}>
                    <span className={`grid h-9 w-9 place-items-center ${i === current ? "bg-ink text-white" : done ? "bg-bronze text-ink" : "bg-wash-2 text-subtle"}`}><Icon name={s.icon} /></span>
                    <b className={`mt-2 block text-[13.5px] ${done ? "" : "text-subtle"}`}>{s.label}</b>
                    {i === current && <span className="text-[11.5px] text-muted">{s.note}{o.order_updated_at && <> • {date(o.order_updated_at)}</>}</span>}
                  </li>
                );
              })}
            </ol>
          )}

          {state?.files && (
            <div className="mt-5 border border-hairline p-4">
              <p className="flex items-center gap-2 text-[14px] font-bold"><Icon name="download" className="text-bronze-dark" /> ไฟล์ของคุณ</p>
              {state.files.length ? (
                <ul className="mt-3 divide-y divide-hairline border border-hairline">
                  {state.files.map((f) => (
                    <li key={f.url} className="flex items-center gap-3 px-3 py-2.5 text-[13px]">
                      <Icon name={FILE_ICON[f.kind] ?? "draft"} className="text-[20px] text-bronze-dark" />
                      <span className="min-w-0 flex-1"><b className="block truncate">{f.name}</b><span className="text-[11.5px] text-muted">{FILE_LABEL[f.kind] ?? "ไฟล์"}{f.size ? ` • ${(f.size / 1048576).toFixed(1)} MB` : ""}</span></span>
                      <a href={f.url} className="btn btn-primary btn-sm shrink-0"><Icon name="download" /> ดาวน์โหลด</a>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-2 text-[13px] text-muted">ทีมงานกำลังเตรียมไฟล์ จะพร้อมดาวน์โหลดที่นี่เร็วๆ นี้</p>}
              <p className="mt-2 text-[11.5px] text-muted">ลิงก์ดาวน์โหลดใช้ได้ 1 ชั่วโมง — หากหมดอายุ กด “ตรวจสอบ” อีกครั้งเพื่อรับลิงก์ใหม่</p>
              {state.cadLocked && <p className="mt-1 text-[11.5px] text-muted">ไฟล์ BIM / SketchUp / AutoCAD และภาพ Render สั่งเพิ่มได้ — ติดต่อทีมงาน</p>}
            </div>
          )}

          {o.tracking_no && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-ink bg-wash p-4">
              <div>
                <p className="text-[12px] text-muted">{carrier?.label ?? "ขนส่ง"} • เลขพัสดุ</p>
                <p className="font-display text-[20px] font-bold tracking-[0.04em]">{o.tracking_no}</p>
              </div>
              {carrier?.url && (
                <a href={carrier.url(o.tracking_no)} target="_blank" rel="noopener noreferrer" className="btn btn-bronze btn-sm"><Icon name="open_in_new" /> ติดตามพัสดุกับ {carrier.label}</a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
