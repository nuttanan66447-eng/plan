import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, IBM_Plex_Sans_Thai, Manrope } from "next/font/google";
import { CompareBar } from "@/components/CompareControls";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SITE } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const vietnam = Be_Vietnam_Pro({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-vietnam", display: "swap" });
const thai = IBM_Plex_Sans_Thai({ subsets: ["thai", "latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-thai", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "NATBUILD — แบบบ้าน 3D พร้อมยื่นขออนุญาตก่อสร้าง",
    template: "%s | NATBUILD",
  },
  description:
    "คลังแบบบ้านโมเดิร์น นอร์ดิก แจแปนดิ ทรอปิคอล พร้อมไฟล์ 3D BIM, เล่ม BOQ และรายการคำนวณวิศวกรรม ยื่นขออนุญาตก่อสร้างได้ทันที บริการออกแบบ รับเหมา และตรวจบ้านโดยวิศวกร",
  openGraph: { type: "website", locale: "th_TH", siteName: SITE.name, images: ["/images/nordic-villa.jpg"] },
};

export const viewport: Viewport = { themeColor: "#1e232a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${manrope.variable} ${vietnam.variable} ${thai.variable}`}>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="flex min-h-dvh flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CompareBar />
      </body>
    </html>
  );
}
