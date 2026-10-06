"use client";

import { useActionState } from "react";
import { Icon } from "@/components/Icon";
import { signIn } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, null);
  return (
    <form action={action} className="mt-6 space-y-4">
      <div className="field"><label htmlFor="email" className="field-label">อีเมล</label><input id="email" name="email" type="email" autoComplete="email" required className="input" /></div>
      <div className="field"><label htmlFor="password" className="field-label">รหัสผ่าน</label><input id="password" name="password" type="password" autoComplete="current-password" required className="input" /></div>
      {state?.error && <p className="flex items-center gap-2 text-[13px] text-danger" role="alert"><Icon name="error" />{state.error}</p>}
      <button disabled={pending} className="btn btn-primary w-full">{pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</button>
    </form>
  );
}
