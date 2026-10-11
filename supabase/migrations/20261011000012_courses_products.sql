-- Courses (คอร์สเรียน) and shop products (ร้านค้า)
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{2,59}$'),
  title text not null check (char_length(title) between 2 and 160),
  subtitle text,
  category text,
  level text not null default 'beginner' check (level in ('beginner','intermediate','advanced')),
  format text not null default 'online' check (format in ('online','onsite','hybrid')),
  duration text,
  lessons integer check (lessons is null or lessons >= 0),
  price integer not null default 0 check (price >= 0),
  price_original integer check (price_original is null or price_original >= 0),
  image text,
  description text,
  syllabus text[] not null default '{}',
  start_date date,
  location text,
  seats integer check (seats is null or seats >= 0),
  is_published boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{2,59}$'),
  name text not null check (char_length(name) between 2 and 160),
  category text,
  kind text not null default 'physical' check (kind in ('physical','digital')),
  price integer not null default 0 check (price >= 0),
  price_original integer check (price_original is null or price_original >= 0),
  shipping_fee integer not null default 0 check (shipping_fee >= 0),
  unit text not null default 'ชิ้น',
  stock integer check (stock is null or stock >= 0),
  image text,
  gallery text[] not null default '{}',
  description text,
  specs text[] not null default '{}',
  is_published boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

alter table public.courses enable row level security;
alter table public.products enable row level security;
create policy "courses readable" on public.courses for select to anon, authenticated using (is_published or (select public.is_admin()));
create policy "courses admin insert" on public.courses for insert to authenticated with check ((select public.is_admin()));
create policy "courses admin update" on public.courses for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "courses admin delete" on public.courses for delete to authenticated using ((select public.is_admin()));
create policy "products readable" on public.products for select to anon, authenticated using (is_published or (select public.is_admin()));
create policy "products admin insert" on public.products for insert to authenticated with check ((select public.is_admin()));
create policy "products admin update" on public.products for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "products admin delete" on public.products for delete to authenticated using ((select public.is_admin()));

-- course enrolments arrive as leads
alter table public.leads drop constraint leads_type_check;
alter table public.leads add constraint leads_type_check
  check (type in ('consult','custom_design','inspection','turnkey','boq','order','callback','course'));

-- Sample content (edit or delete in /admin)
insert into public.courses (slug, title, subtitle, category, level, format, duration, lessons, price, price_original, image, description, syllabus, location, seats, sort_order) values
('read-blueprints-for-owners', 'อ่านแบบก่อสร้างเป็น ใน 1 วัน (สำหรับเจ้าของบ้าน)', 'เข้าใจแบบสถาปัตย์ โครงสร้าง และระบบ ก่อนจ้างผู้รับเหมา', 'เจ้าของบ้าน', 'beginner', 'onsite', '1 วัน (6 ชั่วโมง)', 6, 1900, 2900, '/images/section-cutaway.jpg',
 'คอร์สสำหรับคนที่กำลังจะสร้างบ้าน อ่านแบบเป็น คุยกับผู้รับเหมารู้เรื่อง ตรวจงานได้ตามแบบ สอนโดยวิศวกรโยธามีใบอนุญาต พร้อมแบบตัวอย่างจริงให้ฝึกอ่าน',
 array['สัญลักษณ์และมาตราส่วนในแบบ','แปลนพื้น รูปด้าน รูปตัด','แบบโครงสร้าง: ฐานราก เสา คาน พื้น','แบบไฟฟ้าและสุขาภิบาล','อ่าน BOQ และเทียบราคาผู้รับเหมา','เช็คลิสต์ตรวจงานตามแบบ'], 'สำนักงาน NATBUILD ร้อยเอ็ด', 20, 10),
('sketchup-house-design', 'ออกแบบบ้านด้วย SketchUp ตั้งแต่ศูนย์', 'ขึ้นโมเดลบ้าน 2 ชั้น จัดแสง ทำภาพนำเสนอ และส่งออก .glb', 'ซอฟต์แวร์ออกแบบ', 'beginner', 'online', '8 ชั่วโมง', 16, 2490, 3900, '/images/nordic-single.jpg',
 'เรียนออนไลน์ดูย้อนหลังได้ตลอด ฝึกขึ้นโมเดลบ้านจริงทีละขั้น ตั้งแต่ผนัง หลังคา ประตูหน้าต่าง จนได้ภาพนำเสนอและไฟล์ 3D ที่นำไปใช้บนเว็บได้',
 array['ติดตั้งและตั้งค่า SketchUp','เครื่องมือพื้นฐานและ Group/Component','ขึ้นผนัง พื้น หลังคา','ประตู หน้าต่าง และวัสดุ','ภาพนำเสนอและ Scene','ส่งออก .glb / ภาพ / แบบ 2D'], null, null, 20),
('boq-excel-estimating', 'ถอดแบบประมาณราคา BOQ ด้วย Excel', 'คำนวณปริมาณวัสดุ ค่าแรง และทำใบเสนอราคาได้เอง', 'ประมาณราคา', 'intermediate', 'hybrid', '2 วัน', 10, 3500, 4900, '/images/engineers-site.jpg',
 'สำหรับช่าง ผู้รับเหมา และเจ้าของบ้านที่อยากคุมงบ ถอดปริมาณงานจากแบบจริง ใช้ราคากลางและราคาตลาด พร้อมเทมเพลต Excel ใช้ต่อได้ทันที',
 array['หลักการถอดแบบและหน่วยวัด','งานฐานราก เสา คาน พื้น','งานผนัง ฉาบ ทาสี','งานหลังคาและฝ้า','งานระบบไฟฟ้า-ประปา','สรุป BOQ และใบเสนอราคา'], 'ออนไลน์ + เวิร์กช็อปที่ร้อยเอ็ด', 15, 30),
('home-inspection-diy', 'ตรวจรับบ้านด้วยตัวเอง 300 จุด', 'ไม่โดนผู้รับเหมาเอาเปรียบ รู้ว่าต้องดูอะไรก่อนรับมอบ', 'เจ้าของบ้าน', 'beginner', 'online', '3 ชั่วโมง', 8, 990, 1490, '/images/inspector.jpg',
 'สอนตรวจบ้านทีละห้องด้วยเครื่องมือพื้นฐาน รอยร้าวแบบไหนอันตราย ตรวจระดับพื้น ความชื้น ไฟรั่ว น้ำรั่ว พร้อมเช็คลิสต์ 300 จุด',
 array['เครื่องมือตรวจบ้านที่ต้องมี','งานโครงสร้างและรอยร้าว','พื้น ผนัง ฝ้า ประตูหน้าต่าง','ระบบไฟฟ้าและประปา','หลังคาและการรั่วซึม','จดข้อบกพร่องและแจ้งแก้'], null, null, 40);

insert into public.products (slug, name, category, kind, price, price_original, shipping_fee, unit, description, specs, sort_order) values
('boq-excel-template', 'เทมเพลต BOQ Excel บ้านพักอาศัย', 'เอกสาร & เทมเพลต', 'digital', 590, 990, 0, 'ไฟล์',
 'ไฟล์ Excel ถอดแบบประมาณราคาบ้านพักอาศัย สูตรคำนวณพร้อมใช้ แยกค่าวัสดุ-ค่าแรง ปรับราคาต่อหน่วยได้ เหมาะทั้งเจ้าของบ้านและผู้รับเหมา',
 array['ไฟล์ .xlsx ใช้กับ Excel / Google Sheets','หมวดงานครบ 12 หมวด','อัปเดตราคาวัสดุ ปี 2569','ส่งไฟล์ทาง LINE / อีเมล'], 10),
('home-inspection-checklist', 'คู่มือ + เช็คลิสต์ตรวจรับบ้าน 300 จุด', 'เอกสาร & เทมเพลต', 'physical', 390, 590, 50, 'เล่ม',
 'เล่มพิมพ์ A5 พกไปหน้างานได้ แบ่งตามห้องและงานระบบ มีช่องจดข้อบกพร่องและถ่ายรูปประกอบ',
 array['ขนาด A5 • 64 หน้า','กระดาษกันน้ำ','เช็คลิสต์ 300 จุด','จัดส่งทั่วประเทศ'], 20),
('architect-scale-ruler', 'ไม้บรรทัดสเกลสถาปนิก 30 ซม.', 'เครื่องมือ', 'physical', 290, null, 50, 'อัน',
 'ไม้บรรทัดสามเหลี่ยม 6 สเกล สำหรับอ่านและวัดแบบก่อสร้าง ตัวเลขชัด ทนทาน',
 array['ยาว 30 ซม.','สเกล 1:20 1:25 1:50 1:75 1:100 1:125','อะลูมิเนียม'], 30),
('house-plan-a3-print', 'พิมพ์เล่มแบบ A3 เพิ่ม (ต่อชุด)', 'บริการพิมพ์', 'physical', 590, null, 80, 'ชุด',
 'สั่งพิมพ์เล่มแบบเพิ่มสำหรับลูกค้าที่ซื้อแบบกับ NATBUILD ใช้ยื่นธนาคาร ผู้รับเหมา หรือเก็บสำรอง',
 array['กระดาษ A3 เข้าเล่มสันกาว','พิมพ์ขาวดำ / สีตามแบบ','ระบุรหัสแบบในหมายเหตุ'], 40);
