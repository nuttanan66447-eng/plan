import Link from "next/link";

/** NATBUILD mark: an "N" drafted inside an isometric cube with construction lines. */
export function LogoMark({ className = "h-10 w-10", dark = false }: { className?: string; dark?: boolean }) {
  const line = dark ? "#ffffff" : "#1E232A";
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      {/* cube outline with drafting overshoot */}
      <path d="M32 6 54.5 19v26L32 58 9.5 45V19Z" stroke={line} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M9.5 13v6M9.5 45v6M54.5 13v6M54.5 45v6M4 22l5.5-3M60 22l-5.5-3M4 42l5.5 3M60 42l-5.5 3M32 1v5M32 58v5" stroke={line} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9.5 19 32 31l22.5-12" stroke={line} strokeWidth="1.6" />
      <path d="M32 31v27" stroke={line} strokeWidth="1.4" strokeDasharray="2.5 2.5" />
      {/* the N */}
      <path d="M19 25h6v24h-6z" fill="#C59B27" />
      <path d="M19 25h6l20 24h-6z" fill="#C59B27" />
      <path d="M39 22h6v27h-6z" fill={line} />
      <path d="M25 31.2V25l14 16.8v6.2z" fill="#A47F1C" opacity=".55" />
    </svg>
  );
}

export function Logo({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="NATBUILD หน้าหลัก">
      <LogoMark dark={dark} className="h-10 w-10" />
      <span className="leading-none">
        <span className={`block font-display text-[22px] font-extrabold tracking-[0.01em] ${dark ? "text-white" : "text-ink"}`}>
          NAT<span className="text-bronze">BUILD</span>
        </span>
        {!compact && (
          <span className={`mt-1 flex items-center gap-1.5 text-[8.5px] font-semibold tracking-[0.24em] ${dark ? "text-white/70" : "text-ink-3"}`}>
            DESIGN<span className="h-1 w-1 rounded-full bg-bronze" />BUILD<span className="h-1 w-1 rounded-full bg-bronze" />INSPECT
          </span>
        )}
      </span>
    </Link>
  );
}
