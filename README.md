# ArchiPlan Studio — 3D House Plans Marketplace

เว็บไซต์ขายแบบบ้าน 3D พร้อมยื่นขออนุญาต, บริการออกแบบ, BOQ, รับเหมา & ตรวจบ้าน และผลงานสร้างจริง
พัฒนาต่อจากดีไซน์ Stitch ("Nordic Architectural Ledger") ด้วย **Next.js 16 + Tailwind CSS v4 + Supabase** และ deploy บน **Vercel**

## หน้าเว็บ

| Route | รายละเอียด |
| --- | --- |
| `/` | หน้าหลัก: hero โมเดล, แบบแนะนำ, ขั้นตอน, เครื่องคำนวณค่าเขียนแบบ (บันทึก lead) |
| `/plans` | คลังแบบบ้าน: ค้นหา, กรอง (ชั้น/พื้นที่/ห้องนอน/ที่ดิน/งบ/คุณสมบัติ/สไตล์), เรียงลำดับ, แบ่งหน้า |
| `/plans/[code]` | รายละเอียดแบบ: viewer (ภายนอก+hotspot, ภาพตัด, แปลน 2D, ทิศแดด-ลม), ทัวร์ 360°, สั่งซื้อ + add-on, นัดปรึกษา, บ้านที่สร้างจริงจากแบบนี้ |
| `/compare?codes=` | ตารางเทียบแบบสูงสุด 3 แบบ (เลือกจากปุ่ม "เทียบ" — จำใน localStorage) |
| `/boq` | ตาราง BOQ แบบ interactive (ค้นหา/ย่อหมวด/ดาวน์โหลด CSV), ขั้นตอน อ.1, ฟอร์มขอถอด BOQ |
| `/custom-design` | ตัวประเมินงบ 4 ขั้นตอน + ตารางแพ็กเกจ + นัดสถาปนิก |
| `/turnkey` | รับเหมา Turnkey & ตรวจบ้าน, พื้นที่บริการ, แพ็กเกจราคา, ฟอร์มนัดตรวจ |
| `/portfolio` | ผลงานสร้างจริง, สไลด์ก่อน-หลัง, รีวิว, ทัวร์ 360° |
| `/about` | เกี่ยวกับเรา, ลิขสิทธิ์แบบ, PDPA |
| `/admin` | หลังบ้าน (Supabase Auth): จัดการ lead/คำสั่งซื้อ (สถานะ + บันทึก), แก้ราคา/เผยแพร่แบบ |

## ฐานข้อมูล (Supabase)

- `plans`, `boq_items`, `projects`, `reviews` — เนื้อหาเว็บ (อ่านได้แบบสาธารณะเฉพาะที่ `is_published`)
- `leads` — ทุกฟอร์มบนเว็บ (สั่งซื้อ, ปรึกษา, ออกแบบ, ตรวจบ้าน, BOQ, โทรกลับ) — ผู้เยี่ยมชม **insert ได้อย่างเดียว**
- `admins` — รายชื่อผู้ดูแล; ฟังก์ชัน `is_admin()` ใช้ใน RLS

Schema: `supabase/migrations/`, ข้อมูลตั้งต้น: `supabase/seed.sql`

### เพิ่มผู้ดูแลระบบ
1. Supabase Dashboard → Authentication → Users → **Add user** (อีเมล + รหัสผ่าน)
2. SQL Editor: `insert into public.admins (user_id) values ('<user-id>');`
3. เข้าสู่ระบบที่ `/admin/login`

## พัฒนาในเครื่อง

```bash
cp .env.example .env.local   # ใส่ URL และ publishable key ของโปรเจกต์ Supabase
npm install
npm run dev
```

## Deploy (Vercel)
ตั้ง Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL` แล้ว import repo นี้ (Framework: Next.js)
