"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV, SITE } from "@/lib/site";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const search = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(q.trim() ? `/plans?q=${encodeURIComponent(q.trim())}` : "/plans");
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-ink text-on-ink">
        <div className="shell flex h-9 items-center justify-between gap-4 text-[11px] tracking-wide">
          <p className="flex min-w-0 items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 shrink-0 bg-bronze" />
            <span className="truncate">
              บริการเขียนแบบยื่นขออนุญาตก่อสร้างครบวงจร พร้อมรายการคำนวณโครงสร้างวิศวกร และภาพ 3D Interactive
            </span>
          </p>
          <div className="hidden items-center gap-6 text-white/70 md:flex">
            <span className="flex items-center gap-1.5">
              <Icon name="verified" className="text-bronze" /> สภาสถาปนิก เลขที่ใบอนุญาต {SITE.license}
            </span>
            <a href={SITE.phoneHref} className="flex items-center gap-1.5 hover:text-white">
              <Icon name="call" className="text-bronze" /> HOTLINE: {SITE.phone}
            </a>
          </div>
        </div>
      </div>

      <div className="border-b border-hairline bg-white/95 backdrop-blur-md">
        <div className="shell flex h-[72px] items-center gap-6">
          <Logo />
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex" aria-label="เมนูหลัก">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`relative px-2 py-2 text-[13px] font-medium whitespace-nowrap transition-colors ${
                  isActive(n.href) ? "text-bronze-dark" : "text-ink hover:text-bronze-dark"
                }`}
              >
                {n.label}
                {isActive(n.href) && <span className="absolute inset-x-2 -bottom-[17px] h-0.5 bg-bronze" />}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 xl:ml-0">
            <form onSubmit={search} className="hidden items-center border border-hairline bg-wash 2xl:flex" role="search">
              <Icon name="search" className="ml-3 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ค้นหารหัสแบบ เช่น AP-NORDIC"
                aria-label="ค้นหาแบบบ้าน"
                className="w-48 bg-transparent px-2 py-2 text-[13px] outline-none"
              />
            </form>
            <Link href="/custom-design#booking" className="btn btn-bronze btn-sm hidden sm:inline-flex">
              ปรึกษาสถาปนิกฟรี
            </Link>
            <button
              className="grid h-10 w-10 place-items-center border border-hairline xl:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
            >
              <Icon name={open ? "close" : "menu"} className="text-[22px]" />
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-x-0 top-[109px] bottom-0 z-40 overflow-y-auto bg-white xl:hidden">
          <form onSubmit={search} className="shell mt-4 flex border border-hairline bg-wash" role="search">
            <Icon name="search" className="ml-3 self-center text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ค้นหารหัสแบบ ชื่อแบบ"
              aria-label="ค้นหาแบบบ้าน"
              className="w-full bg-transparent px-2 py-3 text-[15px] outline-none"
            />
          </form>
          <nav className="shell mt-2 flex flex-col" aria-label="เมนูมือถือ">
            {NAV.map((n, i) => (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center justify-between border-b border-hairline py-4 text-[17px] font-medium ${
                  isActive(n.href) ? "text-bronze-dark" : ""
                }`}
              >
                <span>
                  <span className="mr-3 font-mono text-[11px] text-subtle">{String(i + 1).padStart(2, "0")}</span>
                  {n.label}
                </span>
                <Icon name="arrow_forward" />
              </Link>
            ))}
          </nav>
          <div className="shell my-6 grid gap-3">
            <Link href="/custom-design#booking" className="btn btn-bronze">ปรึกษาสถาปนิกฟรี</Link>
            <a href={SITE.phoneHref} className="btn btn-outline"><Icon name="call" /> โทร {SITE.phone}</a>
          </div>
        </div>
      )}
    </header>
  );
}
