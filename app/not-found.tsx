import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function NotFound() {
  return (
    <section className="blueprint grid min-h-[60vh] place-items-center py-20">
      <div className="card max-w-lg p-10 text-center">
        <p className="label-tech text-bronze-dark">Error 404 • Sheet not found</p>
        <h1 className="mt-3 text-[28px] font-bold">ไม่พบหน้าที่คุณต้องการ</h1>
        <p className="mt-2 text-muted">แบบแปลนหรือหน้านี้อาจถูกย้ายหรือยกเลิกการเผยแพร่แล้ว</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="btn btn-outline btn-sm">หน้าหลัก</Link>
          <Link href="/plans" className="btn btn-primary btn-sm"><Icon name="home_work" /> คลังแบบบ้าน</Link>
        </div>
      </div>
    </section>
  );
}
