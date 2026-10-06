"use client";

import { useState, type ReactNode } from "react";

export function Tabs({ tabs }: { tabs: { label: string; content: ReactNode }[] }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="flex gap-6 overflow-x-auto border-b border-hairline scrollbar-none" role="tablist">
        {tabs.map((t, k) => (
          <button key={t.label} role="tab" aria-selected={i === k} onClick={() => setI(k)}
            className={`-mb-px shrink-0 border-b-2 py-3 text-[14.5px] font-bold ${i === k ? "border-bronze text-ink" : "border-transparent text-muted hover:text-ink"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-6" role="tabpanel">{tabs[i].content}</div>
    </div>
  );
}
