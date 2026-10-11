import Image from "next/image";
import Link from "next/link";
import { baht, COURSE_FORMAT_LABEL, COURSE_LEVEL_LABEL, thaiDate } from "@/lib/format";
import type { Course, Product } from "@/lib/types";
import { Icon } from "./Icon";

/** Image or a blueprint placeholder when none was uploaded. */
export function CoverImage({ src, alt, icon, sizes = "400px", className = "" }: { src: string | null; alt: string; icon: string; sizes?: string; className?: string }) {
  return src ? (
    <Image src={src} alt={alt} fill sizes={sizes} className={`object-cover ${className}`} />
  ) : (
    <div className="blueprint grid h-full place-items-center"><Icon name={icon} className="text-[52px] text-subtle" /></div>
  );
}

export function PriceTag({ price, original, unit }: { price: number; original: number | null; unit?: string }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className="font-display text-[22px] font-bold text-bronze-dark">{price ? baht(price) : "ฟรี"}</span>
      {unit && <span className="text-[12px] text-muted">/ {unit}</span>}
      {original != null && original > price && <span className="text-[12.5px] text-subtle line-through">{baht(original)}</span>}
    </p>
  );
}

export function CourseCard({ c }: { c: Course }) {
  const f = COURSE_FORMAT_LABEL[c.format];
  return (
    <Link href={`/courses/${c.slug}`} className="card card-hover group flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden bg-wash-2">
        <CoverImage src={c.image} alt={c.title} icon="school" className="transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 flex items-center gap-1 bg-ink px-2 py-1 text-[11px] font-semibold text-white"><Icon name={f.icon} className="text-bronze" /> {f.label}</span>
        {c.price_original != null && c.price_original > c.price && <span className="absolute right-3 top-3 bg-bronze px-2 py-1 text-[11px] font-bold text-ink">-{Math.round((1 - c.price / c.price_original) * 100)}%</span>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {c.category && <p className="label-tech text-bronze-dark">{c.category}</p>}
        <h3 className="mt-1 text-[17px] font-bold leading-snug">{c.title}</h3>
        {c.subtitle && <p className="mt-1 text-[13px] text-muted">{c.subtitle}</p>}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-3">
          {c.duration && <span className="flex items-center gap-1"><Icon name="schedule" className="text-muted" />{c.duration}</span>}
          {c.lessons != null && <span className="flex items-center gap-1"><Icon name="menu_book" className="text-muted" />{c.lessons} บทเรียน</span>}
          <span className="flex items-center gap-1"><Icon name="signal_cellular_alt" className="text-muted" />{COURSE_LEVEL_LABEL[c.level]}</span>
          {c.start_date && <span className="flex items-center gap-1"><Icon name="event" className="text-muted" />เริ่ม {thaiDate(c.start_date, { day: "numeric", month: "short", year: "numeric" })}</span>}
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <PriceTag price={c.price} original={c.price_original} />
          <span className="btn btn-primary btn-sm">ดูรายละเอียด</span>
        </div>
      </div>
    </Link>
  );
}

export function ProductCard({ p }: { p: Product }) {
  const soldOut = p.stock === 0;
  return (
    <Link href={`/shop/${p.slug}`} className="card card-hover group flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-wash-2">
        <CoverImage src={p.image} alt={p.name} icon={p.kind === "digital" ? "description" : "inventory_2"} sizes="300px" className="transition-transform duration-500 group-hover:scale-105" />
        {p.kind === "digital" && <span className="absolute left-3 top-3 bg-ink px-2 py-1 text-[11px] font-semibold text-white">ไฟล์ดิจิทัล</span>}
        {soldOut && <span className="absolute inset-x-0 bottom-0 bg-danger py-1.5 text-center text-[12px] font-bold text-white">สินค้าหมด</span>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {p.category && <p className="label-tech text-bronze-dark">{p.category}</p>}
        <h3 className="mt-1 text-[15px] font-bold leading-snug">{p.name}</h3>
        <div className="mt-auto pt-3"><PriceTag price={p.price} original={p.price_original} /></div>
      </div>
    </Link>
  );
}

/** Category chips that link with ?cat= */
export function CategoryChips({ base, cats, active }: { base: string; cats: string[]; active?: string }) {
  if (cats.length < 2) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <Link href={base} className={`chip h-9 ${!active ? "chip-active" : "hover:border-ink"}`}>ทั้งหมด</Link>
      {cats.map((c) => (
        <Link key={c} href={`${base}?cat=${encodeURIComponent(c)}`} className={`chip h-9 ${active === c ? "chip-active" : "hover:border-ink"}`}>{c}</Link>
      ))}
    </div>
  );
}
