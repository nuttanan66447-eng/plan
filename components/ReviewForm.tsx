"use client";

import { startTransition, useActionState, useState } from "react";
import { submitReview, type ReviewState } from "@/app/actions";
import { Icon } from "./Icon";

const TYPES = ["สั่งซื้อแบบบ้าน", "ออกแบบเฉพาะ", "รับเหมาก่อสร้าง", "ตรวจบ้าน"];

export function ReviewForm({ planCode, plans = [] }: { planCode?: string; plans?: { code: string; name_en: string }[] }) {
  const [state, action, pending] = useActionState<ReviewState | null, FormData>(submitReview, null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const err = state?.errors;

  if (state?.ok) {
    return (
      <div className="flex flex-col items-start gap-3 border border-success/40 bg-[#f1f8f3] p-6 animate-fade-up" role="status">
        <span className="grid h-11 w-11 place-items-center bg-success text-white"><Icon name="favorite" className="text-[22px]" /></span>
        <h3 className="text-[18px] font-bold">ส่งรีวิวเรียบร้อย</h3>
        <p className="text-[14px] text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        // a transition keeps what the customer typed if validation fails
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="space-y-4"
    >
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><input name="website" tabIndex={-1} autoComplete="off" /></div>
      <input type="hidden" name="rating" value={rating || ""} />
      {planCode && <input type="hidden" name="plan_code" value={planCode} />}

      <div>
        <p className="field-label">ให้คะแนนความพึงพอใจ <span className="text-bronze-dark">*</span></p>
        <div className="mt-1.5 flex items-center gap-1" role="radiogroup" aria-label="คะแนน" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} ดาว`}
              onClick={() => setRating(n)} onMouseEnter={() => setHover(n)}
              className="grid h-10 w-10 place-items-center text-[30px] leading-none text-bronze transition-transform hover:scale-110">
              <Icon name="star" fill={(hover || rating) >= n} />
            </button>
          ))}
          <span className="ml-2 text-[13px] text-muted">{["", "ควรปรับปรุง", "พอใช้", "ดี", "ดีมาก", "ประทับใจมาก"][hover || rating]}</span>
        </div>
        {err?.rating && <p className="text-[12px] text-danger">{err.rating}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="rv-name" className="field-label">ชื่อที่จะแสดง <span className="text-bronze-dark">*</span></label>
          <input id="rv-name" name="name" className="input" placeholder="เช่น คุณสมชาย ใจดี" aria-invalid={!!err?.name} />
          {err?.name && <p className="text-[12px] text-danger">{err.name}</p>}
        </div>
        <div className="field">
          <label htmlFor="rv-role" className="field-label">อาชีพ / ประเภทบ้าน</label>
          <input id="rv-role" name="role" className="input" placeholder="เช่น ครู (บ้านชั้นเดียว 160 ตร.ม.)" />
        </div>
        <div className="field">
          <label htmlFor="rv-district" className="field-label">อำเภอ / จังหวัด</label>
          <input id="rv-district" name="district" className="input" placeholder="เช่น อ.เสลภูมิ" />
        </div>
        <div className="field">
          <label htmlFor="rv-type" className="field-label">ใช้บริการด้าน</label>
          <select id="rv-type" name="project_type" className="input" defaultValue="">
            <option value="">ไม่ระบุ</option>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        {!planCode && plans.length > 0 && (
          <div className="field sm:col-span-2">
            <label htmlFor="rv-plan" className="field-label">แบบบ้านที่ใช้ (ถ้ามี)</label>
            <select id="rv-plan" name="plan_code" className="input" defaultValue="">
              <option value="">ไม่ระบุ</option>
              {plans.map((p) => <option key={p.code} value={p.code}>{p.code} — {p.name_en}</option>)}
            </select>
          </div>
        )}
        <div className="field sm:col-span-2">
          <label htmlFor="rv-body" className="field-label">รีวิวของคุณ <span className="text-bronze-dark">*</span></label>
          <textarea id="rv-body" name="body" maxLength={1500} className="input min-h-[120px]" aria-invalid={!!err?.body}
            placeholder="เล่าประสบการณ์ เช่น ความตรงปกของแบบ การคุมงบ การประสานงาน หรือสิ่งที่ประทับใจ" />
          {err?.body && <p className="text-[12px] text-danger">{err.body}</p>}
        </div>
      </div>

      {state && !state.ok && <p className="flex items-center gap-2 text-[13px] text-danger" role="alert"><Icon name="error" /> {state.message}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11.5px] text-subtle">รีวิวจะแสดงหลังทีมงานตรวจสอบ เพื่อป้องกันสแปม</p>
        <button disabled={pending} className="btn btn-primary">{pending ? "กำลังส่ง..." : <>ส่งรีวิว <Icon name="send" /></>}</button>
      </div>
    </form>
  );
}
