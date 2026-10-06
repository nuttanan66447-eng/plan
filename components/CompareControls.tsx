"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMPARE_MAX, useCompare } from "@/lib/compare";
import { Icon } from "./Icon";

export function CompareToggle({ code, area, className = "" }: { code: string; area: number; className?: string }) {
  const { has, toggle } = useCompare();
  const on = has(code);
  return (
    <button
      type="button"
      onClick={() => toggle({ code, area })}
      aria-pressed={on}
      className={`btn btn-sm ${on ? "btn-primary" : "btn-ghost"} ${className}`}
    >
      <Icon name={on ? "check" : "compare_arrows"} /> {on ? "เลือกแล้ว" : "เทียบ"}
    </button>
  );
}

export function CompareBar() {
  const { items, remove, clear } = useCompare();
  const pathname = usePathname();
  if (!items.length || pathname.startsWith("/compare") || pathname.startsWith("/admin")) return null;
  const href = `/compare?codes=${items.map((i) => i.code).join(",")}`;
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 border border-ink bg-ink text-white shadow-[4px_4px_0_0_rgba(197,155,39,.6)] sm:left-auto sm:right-6 sm:bottom-6 sm:w-[560px] animate-fade-up">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <p className="flex items-center gap-2 text-[13px] font-semibold">
          <Icon name="compare_arrows" className="text-bronze" /> ตารางเปรียบเทียบแบบบ้าน ({items.length}/{COMPARE_MAX})
        </p>
        <button onClick={clear} className="text-[12px] text-white/60 hover:text-white">ล้างทั้งหมด</button>
      </div>
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        {items.map((i) => (
          <span key={i.code} className="flex items-center gap-2 border border-white/20 px-2.5 py-1 text-[12px]">
            <span className="h-1.5 w-1.5 bg-bronze" />
            {i.code} <span className="text-white/50">{i.area} ตร.ม.</span>
            <button onClick={() => remove(i.code)} aria-label={`นำ ${i.code} ออก`} className="text-white/60 hover:text-white">
              <Icon name="close" />
            </button>
          </span>
        ))}
        <Link
          href={href}
          className={`btn btn-bronze btn-sm ml-auto ${items.length < 2 ? "pointer-events-none opacity-50" : ""}`}
          aria-disabled={items.length < 2}
        >
          เปิดตารางเทียบแบบ <Icon name="arrow_forward" />
        </Link>
      </div>
      {items.length < 2 && <p className="px-4 pb-3 text-[11px] text-white/50">เลือกอีกอย่างน้อย 1 แบบเพื่อเปรียบเทียบสเปก</p>}
    </div>
  );
}
