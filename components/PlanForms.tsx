"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

type Which = "order" | "consult";

/**
 * Order and free-consultation forms for a plan, shown one at a time so visitors don't fill in the wrong one.
 * The "สั่งซื้อ" / "นัดปรึกษา" buttons link to #order / #consult and open the matching form.
 */
export function PlanForms({ order, consult }: { order: ReactNode; consult: ReactNode }) {
  const [which, setWhich] = useState<Which>("order");

  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.slice(1);
      if (h === "order" || h === "consult") setWhich(h);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const pick = (w: Which) => {
    setWhich(w);
    history.replaceState(null, "", `#${w}`);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="grid grid-cols-2 border border-ink" role="tablist" aria-label="เลือกรายการ">
        {([["order", "shopping_bag", "สั่งซื้อชุดแบบ"], ["consult", "support_agent", "นัดปรึกษาสถาปนิกฟรี"]] as const).map(([k, icon, label]) => (
          <button key={k} type="button" role="tab" aria-selected={which === k} onClick={() => pick(k)}
            className={`flex items-center justify-center gap-2 px-3 py-3 text-[14px] font-semibold ${which === k ? "bg-ink text-white" : "bg-white text-ink hover:bg-wash"}`}>
            <Icon name={icon} /> {label}
          </button>
        ))}
      </div>
      {/* both stay mounted so switching tabs never loses what was typed, but only one is ever visible */}
      <div className={which === "order" ? "mt-8" : "hidden"} role="tabpanel">{order}</div>
      <div className={which === "consult" ? "mt-8" : "hidden"} role="tabpanel">{consult}</div>
    </div>
  );
}
