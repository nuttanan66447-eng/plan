"use client";

import { createContext, useActionState, useContext, useState, type FormEvent, type ReactNode } from "react";
import { submitLead, type LeadState } from "@/app/actions";
import type { LeadType } from "@/lib/types";
import Link from "next/link";
import { Icon } from "./Icon";

const ErrCtx = createContext<Record<string, string> | undefined>(undefined);

interface Props {
  type: LeadType;
  hidden?: Record<string, string | number | null | undefined>;
  submitLabel: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
  consent?: boolean;
  successTitle?: string;
}

export function LeadForm({ type, hidden = {}, submitLabel, children, className = "", dark = false, consent = true, successTitle }: Props) {
  const [state, action, pending] = useActionState<LeadState | null, FormData>(submitLead, null);
  const [clientErrors, setClientErrors] = useState<Record<string, string> | null>(null);

  // Validate in the browser first: React resets the form after a server action, so a round-trip
  // just to report a missing field would wipe everything the visitor typed.
  const precheck = (e: FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const errs: Record<string, string> = {};
    if (!String(fd.get("name") ?? "").trim()) errs.name = "กรุณากรอกชื่อ";
    if (!/^[0-9+\-\s()]{9,20}$/.test(String(fd.get("phone") ?? "").trim())) errs.phone = "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง";
    const email = String(fd.get("email") ?? "").trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "อีเมลไม่ถูกต้อง";
    if (fd.has("consent_required") && fd.get("consent") !== "on") errs.consent = "กรุณายอมรับนโยบายความเป็นส่วนตัว";
    if (Object.keys(errs).length) {
      e.preventDefault();
      setClientErrors(errs);
    } else setClientErrors(null);
  };
  const errors = clientErrors ?? state?.errors;

  if (state?.ok) {
    return (
      <div className={`flex flex-col items-start gap-3 border p-6 animate-fade-up ${dark ? "border-white/20 text-white" : "border-success/40 bg-[#f1f8f3]"}`} role="status">
        <span className="grid h-11 w-11 place-items-center bg-success text-white"><Icon name="check" className="text-[24px]" /></span>
        <h3 className="text-[19px] font-bold">{successTitle ?? "ส่งข้อมูลเรียบร้อยแล้ว"}</h3>
        <p className={`text-[14px] ${dark ? "text-white/70" : "text-muted"}`}>{state.message}</p>
        {state.orderNo && (
          <div className="w-full border border-ink bg-white p-4">
            <p className="text-[12px] text-muted">เลขที่คำสั่งซื้อ — บันทึกไว้เพื่อติดตามสถานะ</p>
            <p className="font-display text-[26px] font-bold tracking-[0.04em]">{state.orderNo}</p>
            <Link href={`/track?order=${state.orderNo}`} className="btn btn-primary btn-sm mt-2"><Icon name="local_shipping" /> ติดตามสถานะคำสั่งซื้อ</Link>
            <p className="mt-2 text-[11.5px] text-muted">ตรวจสอบสถานะการชำระเงินและการจัดส่งได้ตลอดที่หน้า “ติดตามคำสั่งซื้อ” ด้วยเลขที่นี้ + เบอร์โทรที่ใช้สั่งซื้อ</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <form action={action} onSubmit={precheck} className={className} noValidate>
      <input type="hidden" name="type" value={type} />
      {Object.entries(hidden).map(([k, v]) => (v == null ? null : <input key={k} type="hidden" name={k} value={String(v)} />))}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <ErrCtx.Provider value={errors}>
        {children}
        {consent && (
          <>
            <input type="hidden" name="consent_required" value="1" />
            <label className={`mt-5 flex items-start gap-3 text-[12px] ${dark ? "text-white/70" : "text-muted"}`}>
              <input type="checkbox" name="consent" className="check mt-0.5" defaultChecked />
              <span>ยินยอมให้ NATBUILD เก็บและใช้ข้อมูลเพื่อติดต่อกลับตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)</span>
            </label>
            {errors?.consent && <p className="mt-1 text-[12px] text-danger">{errors.consent}</p>}
          </>
        )}
      </ErrCtx.Provider>
      {(clientErrors || (state && !state.ok)) && (
        <p className="mt-4 flex items-center gap-2 border border-danger/30 bg-[#fff1ef] px-3 py-2 text-[13px] text-danger" role="alert">
          <Icon name="error" /> {clientErrors ? "กรุณาตรวจสอบข้อมูลอีกครั้ง" : state?.message}
        </p>
      )}
      <button type="submit" disabled={pending} className={`btn mt-5 w-full ${dark ? "btn-bronze" : "btn-primary"}`}>
        {pending ? <><Icon name="progress_activity" className="animate-spin" /> กำลังส่งข้อมูล...</> : <>{submitLabel} <Icon name="send" /></>}
      </button>
    </form>
  );
}

type FieldProps = {
  name: string;
  label: string;
  required?: boolean;
  className?: string;
  dark?: boolean;
} & (
  | ({ as?: "input" } & React.InputHTMLAttributes<HTMLInputElement>)
  | ({ as: "textarea" } & React.TextareaHTMLAttributes<HTMLTextAreaElement>)
  | ({ as: "select"; options: (string | { value: string; label: string })[] } & React.SelectHTMLAttributes<HTMLSelectElement>)
);

export function Field(props: FieldProps) {
  const errors = useContext(ErrCtx);
  const { name, label, required, className = "", dark, ...rest } = props;
  const err = errors?.[name];
  const id = `f-${name}`;
  const common = { id, name, "aria-invalid": err ? true : undefined, "aria-describedby": err ? `${id}-err` : undefined };
  let control: ReactNode;
  if (rest.as === "textarea") {
    const { as: _as, ...r } = rest;
    control = <textarea {...r} {...common} className="input min-h-[96px] resize-y" />;
  } else if (rest.as === "select") {
    const { as: _as, options, ...r } = rest;
    control = (
      <select {...r} {...common} className="input">
        {options.map((o) => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  } else {
    const { as: _as, ...r } = rest as { as?: "input" } & React.InputHTMLAttributes<HTMLInputElement>;
    control = <input {...r} {...common} className="input" />;
  }
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id} className={`field-label ${dark ? "!text-white/70" : ""}`}>
        {label} {required && <span className="text-bronze-dark">*</span>}
      </label>
      {control}
      {err && <p id={`${id}-err`} className="text-[12px] text-danger">{err}</p>}
    </div>
  );
}
