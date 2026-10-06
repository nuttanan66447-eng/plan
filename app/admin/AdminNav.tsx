import Link from "next/link";
import { Icon } from "@/components/Icon";
import { signOut } from "./actions";

export function AdminNav({ email, active }: { email: string; active: "leads" | "plans" }) {
  return (
    <div className="border-b border-hairline bg-white">
      <div className="shell flex flex-wrap items-center gap-4 py-3">
        <p className="label-tech text-bronze-dark">Back Office</p>
        <nav className="flex gap-1">
          <Link href="/admin" className={`px-3 py-1.5 text-[13px] font-semibold ${active === "leads" ? "bg-ink text-white" : "hover:bg-wash"}`}><Icon name="inbox" /> คำขอ / ลูกค้า</Link>
          <Link href="/admin/plans" className={`px-3 py-1.5 text-[13px] font-semibold ${active === "plans" ? "bg-ink text-white" : "hover:bg-wash"}`}><Icon name="home_work" /> แบบบ้าน</Link>
        </nav>
        <form action={signOut} className="ml-auto flex items-center gap-3 text-[12.5px] text-muted">
          {email}
          <button className="btn btn-ghost btn-sm"><Icon name="logout" /> ออกจากระบบ</button>
        </form>
      </div>
    </div>
  );
}
