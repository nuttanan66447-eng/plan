import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CoverImage, PriceTag } from "@/components/CatalogCards";
import { Icon } from "@/components/Icon";
import { ProductOrderForm } from "@/components/ProductOrderForm";
import { getProduct } from "@/lib/data";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  return p ? { title: p.name, description: p.description ?? undefined, openGraph: p.image ? { images: [p.image] } : undefined } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getProduct((await params).slug);
  if (!p) notFound();
  const images = [p.image, ...p.gallery].filter((x): x is string => !!x);

  return (
    <>
      <div className="border-b border-hairline bg-wash">
        <div className="shell py-2.5 text-[12px] text-muted"><Link href="/shop" className="hover:text-ink">ร้านค้า</Link> / <span className="text-ink">{p.name}</span></div>
      </div>
      <section className="py-8">
        <div className="shell grid gap-8 lg:grid-cols-2">
          <div>
            <div className="relative aspect-square overflow-hidden border border-hairline bg-wash-2"><CoverImage src={images[0] ?? null} alt={p.name} icon={p.kind === "digital" ? "description" : "inventory_2"} sizes="(max-width: 1024px) 100vw, 640px" /></div>
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {images.slice(1, 9).map((g) => (
                  <a key={g} href={g} target="_blank" rel="noopener noreferrer" className="relative block aspect-square overflow-hidden border border-hairline bg-wash-2"><CoverImage src={g} alt="" icon="image" sizes="160px" /></a>
                ))}
              </div>
            )}
          </div>
          <div className="min-w-0">
            {p.category && <p className="eyebrow">{p.category}</p>}
            <h1 className="mt-2 text-[28px] font-bold leading-snug">{p.name}</h1>
            <div className="mt-3"><PriceTag price={p.price} original={p.price_original} unit={p.unit} /></div>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-muted">
              {p.kind === "digital" ? <span className="flex items-center gap-1"><Icon name="mail" /> ส่งไฟล์ทาง LINE / อีเมล หลังชำระเงิน</span>
                : <span className="flex items-center gap-1"><Icon name="local_shipping" /> ค่าจัดส่ง {p.shipping_fee ? `${p.shipping_fee} บาท` : "ฟรี"}</span>}
              {p.stock != null && <span className={p.stock === 0 ? "font-semibold text-danger" : ""}>{p.stock === 0 ? "สินค้าหมด" : `คงเหลือ ${p.stock} ${p.unit}`}</span>}
            </p>
            {p.description && <p className="mt-5 whitespace-pre-line text-[14.5px] leading-7 text-ink-3">{p.description}</p>}
            {p.specs.length > 0 && (
              <ul className="mt-5 space-y-1.5 border-t border-hairline pt-4 text-[13.5px]">
                {p.specs.map((s, i) => <li key={i} className="flex items-start gap-2"><Icon name="check" className="mt-0.5 text-bronze-dark" />{s}</li>)}
              </ul>
            )}
            <div className="mt-6"><ProductOrderForm product={p} /></div>
          </div>
        </div>
      </section>
    </>
  );
}
