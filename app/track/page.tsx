import type { Metadata } from "next";
import { TrackOrder } from "@/components/TrackOrder";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "ติดตามคำสั่งซื้อ",
  description: "ตรวจสอบสถานะการชำระเงินและการจัดส่งเล่มแบบบ้านด้วยเลขที่คำสั่งซื้อและเบอร์โทรศัพท์",
  robots: { index: false },
};

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return (
    <section className="blueprint min-h-[70vh] py-12">
      <div className="shell max-w-3xl">
        <p className="eyebrow">Order Tracking</p>
        <h1 className="mt-2 text-[30px] font-bold">ติดตามคำสั่งซื้อ</h1>
        <p className="mt-2 text-[14px] text-muted">
          กรอกเลขที่คำสั่งซื้อ (ได้รับหลังกดสั่งซื้อ) และเบอร์โทรที่ใช้สั่งซื้อ เพื่อดูสถานะการชำระเงิน การจัดเตรียมแบบ และเลขพัสดุ •
          ไม่พบเลขที่คำสั่งซื้อ? โทร <a href={SITE.phoneHref} className="font-semibold text-bronze-dark">{SITE.phone}</a> หรือ LINE <a href={SITE.lineHref} className="font-semibold text-bronze-dark">{SITE.line}</a>
        </p>
        <div className="mt-6"><TrackOrder initialOrderNo={order?.toUpperCase().slice(0, 20) ?? ""} /></div>
      </div>
    </section>
  );
}
