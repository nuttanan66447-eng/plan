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
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [pathname]);
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
              <Icon name="verified" className="text-bronze" /> วิศวกรโยธา ใบอนุญาต {SITE.license}
            </span>
            <a href={SITE.phoneHref} className="flex items-center gap-1.5 hover:text-white">
              <Icon name="call" className="text-bronze" /> HOTLINE: {SITE.phone}
            </a>
          </div>
        </div>
      </div>

      <div className="relative border-b border-hairline bg-white/95 backdrop-blur-md">
        <div className="shell flex h-[72px] items-center gap-6">
          <Logo />
          <nav className="ml-auto hidden items-center gap-0.5 xl:flex" aria-label="เมนูหลัก">
            {NAV.filter((n) => n.href !== "/").map((n) => (
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
          <div className="ml-auto flex shrink-0 items-center gap-2 xl:ml-2">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-expanded={searchOpen}
              aria-label="ค้นหาแบบบ้าน"
              className={`hidden h-10 w-10 place-items-center border xl:grid ${searchOpen ? "border-ink bg-ink text-white" : "border-hairline hover:border-ink"}`}
            >
              <Icon name={searchOpen ? "close" : "search"} className="text-[20px]" />
            </button>
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
        {searchOpen && (
          <div className="absolute inset-x-0 top-full hidden border-b border-hairline bg-white shadow-[0_4px_0_0_rgba(30,35,42,.06)] xl:block">
            <form onSubmit={search} className="shell flex items-center gap-3 py-3" role="search">
              <Icon name="search" className="text-[20px] text-muted" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ค้นหารหัสแบบ ชื่อแบบ หรือสไตล์ เช่น AP-NORDIC, มินิมอล, 2 ชั้น"
                aria-label="ค้นหาแบบบ้าน"
                className="flex-1 bg-transparent py-2 text-[15px] outline-none"
              />
              <button className="btn btn-primary btn-sm">ค้นหาแบบ</button>
            </form>
          </div>
        )}
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
