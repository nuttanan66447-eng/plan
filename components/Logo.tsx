import Link from "next/link";

export function LogoMark({ className = "h-9 w-9", dark = false }: { className?: string; dark?: boolean }) {
  const stroke = dark ? "#ffffff" : "#1E232A";
  return (
    <svg viewBox="0 0 48 54" className={className} fill="none" aria-hidden="true">
      <path d="M24 2L44 13.5V36.5L24 48L4 36.5V13.5L24 2Z" stroke={stroke} strokeWidth="2.5" />
      <path d="M24 2V48" stroke={stroke} strokeWidth="2" strokeDasharray="2 2" />
      <path d="M24 25L44 13.5M24 25L4 13.5" stroke={stroke} strokeWidth="2" />
      <path d="M8 18C12 10 36 10 40 18" stroke="#C59B27" strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="41,15 44,20 38,20" fill="#C59B27" />
    </svg>
  );
}

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3 shrink-0" aria-label="ArchiPlan Studio หน้าหลัก">
      <LogoMark dark={dark} />
      <span className="leading-none">
        <span className={`block font-display text-[19px] font-extrabold tracking-wide ${dark ? "text-white" : "text-ink"}`}>
          ARCHI<span className="text-bronze">PLAN</span>
        </span>
        <span className={`block text-[9px] font-medium tracking-[0.25em] mt-1 ${dark ? "text-white/60" : "text-muted"}`}>
          STUDIO &amp; BIM HUB
        </span>
      </span>
    </Link>
  );
}
