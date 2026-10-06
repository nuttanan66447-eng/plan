import type { Metadata } from "next";

export const metadata: Metadata = { title: "ระบบหลังบ้าน", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-wash min-h-[70vh]">{children}</div>;
}
