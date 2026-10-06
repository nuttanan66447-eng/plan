import type { Review } from "@/lib/types";
import { Icon } from "./Icon";

export function Stars({ n, className = "" }: { n: number; className?: string }) {
  return (
    <span className={`inline-flex text-bronze ${className}`} aria-label={`${n} จาก 5 ดาว`}>
      {[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" fill={i <= Math.round(n)} />)}
    </span>
  );
}

export function RatingSummary({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return (
    <div className="flex items-center gap-3">
      <span className="font-display text-[34px] font-bold leading-none">{avg.toFixed(1)}</span>
      <span><Stars n={avg} /><span className="block text-[12px] text-muted">จาก {reviews.length} รีวิว</span></span>
    </div>
  );
}

export function ReviewCards({ reviews }: { reviews: Review[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {reviews.map((r) => (
        <figure key={r.id} className="card flex flex-col p-5">
          <div className="flex items-center justify-between gap-2"><Stars n={r.rating} /><span className="text-[11px] text-muted">{r.district}</span></div>
          <blockquote className="mt-3 flex-1 whitespace-pre-line text-[13px] text-ink-3">“{r.body}”</blockquote>
          <figcaption className="mt-4 flex items-center gap-3 border-t border-hairline pt-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center bg-wash-2 text-[12px] font-bold text-bronze-dark">{r.name.replace(/^(คุณ|พ\.ต\.ท\.)\s*/, "").slice(0, 2)}</span>
            <span className="min-w-0">
              <b className="block text-[13px]">{r.name}</b>
              <span className="text-[11px] text-muted">{[r.role, r.project_type, r.plan_code].filter(Boolean).join(" • ")}</span>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
