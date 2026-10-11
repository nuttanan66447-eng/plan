import type { Metadata } from "next";
import { CategoryChips, ProductCard } from "@/components/CatalogCards";
import { Icon } from "@/components/Icon";
import { listProducts } from "@/lib/data";
import { SITE } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "ร้านค้า — เอกสาร เทมเพลต และอุปกรณ์สำหรับสร้างบ้าน",
  description: "เทมเพลต BOQ Excel คู่มือตรวจรับบ้าน เครื่องมืออ่านแบบ และบริการพิมพ์เล่มแบบ จาก NATBUILD จัดส่งทั่วประเทศ",
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const products = await listProducts();
  const cats = [...new Set(products.map((p) => p.category).filter((c): c is string => !!c))];
  const shown = cat ? products.filter((p) => p.category === cat) : products;

  return (
    <>
      <section className="blueprint border-b border-hairline py-12">
        <div className="shell">
          <span className="chip chip-dot bg-white">NATBUILD STORE</span>
          <h1 className="mt-5 text-[32px] font-bold leading-snug md:text-[44px]">ร้านค้า NATBUILD</h1>
          <p className="mt-3 max-w-2xl text-muted">เอกสาร เทมเพลต และอุปกรณ์ที่เราใช้จริงหน้างาน คัดมาให้เจ้าของบ้านและช่าง</p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-ink-3">
            {[["local_shipping", "จัดส่งทั่วประเทศ"], ["description", "ไฟล์ดิจิทัลส่งทาง LINE / อีเมล"], ["receipt_long", "ติดตามคำสั่งซื้อได้ที่หน้า “ติดตามคำสั่งซื้อ”"], ["call", `สอบถาม ${SITE.phone}`]].map(([i, t]) => (
              <span key={t} className="flex items-center gap-1.5"><Icon name={i} className="text-bronze-dark" />{t}</span>
            ))}
          </div>
        </div>
      </section>
      <section className="py-10">
        <div className="shell">
          <CategoryChips base="/shop" cats={cats} active={cat} />
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
          {!shown.length && <p className="card mt-6 p-10 text-center text-muted">ยังไม่มีสินค้าในหมวดนี้</p>}
        </div>
      </section>
    </>
  );
}
