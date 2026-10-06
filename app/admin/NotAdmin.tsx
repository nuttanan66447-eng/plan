export function NotAdmin({ userId }: { userId: string }) {
  return (
    <section className="shell py-16">
      <div className="card max-w-2xl p-8">
        <h1 className="text-[22px] font-bold">บัญชีนี้ยังไม่มีสิทธิ์ผู้ดูแลระบบ</h1>
        <p className="mt-2 text-muted">ให้ผู้ดูแลฐานข้อมูลเพิ่มสิทธิ์ใน Supabase SQL Editor ด้วยคำสั่ง:</p>
        <pre className="mt-4 overflow-x-auto bg-ink p-4 text-[12.5px] text-white">insert into public.admins (user_id) values (&apos;{userId}&apos;);</pre>
      </div>
    </section>
  );
}
