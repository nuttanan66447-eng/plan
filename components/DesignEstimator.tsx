"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { baht, num } from "@/lib/format";
import { DESIGN_PACKAGES, designFee } from "@/lib/pricing";
import { Icon } from "./Icon";
import { Field, LeadForm } from "./LeadForm";

const PROVINCES = ["กรุงเทพมหานคร และปริมณฑล", "ร้อยเอ็ด", "ขอนแก่น", "มหาสารคาม", "กาฬสินธุ์", "ยโสธร", "อุดรธานี", "นครราชสีมา", "เชียงใหม่", "ภูเก็ต", "จังหวัดอื่นๆ"];
const STYLES = [
  { key: "nordic", label: "Nordic Warmth", th: "นอร์ดิกอบอุ่น", rate: 15500, img: "/images/nordic-single.jpg", note: "หลังคาจั่วชัน กระจกสูง ผนังไม้โทนเข้ม" },
  { key: "japandi", label: "Japandi Zen", th: "แจแปนดิ", rate: 15000, img: "/images/japandi-courtyard.jpg", note: "ไม้ธรรมชาติ คอร์ตยาร์ด สวนหินเซน" },
  { key: "tropical", label: "Modern Tropical", th: "โมเดิร์นทรอปิคอล", rate: 17000, img: "/images/tropical-villa.jpg", note: "ชายคายื่นลึก ระแนงกันแดด สระว่ายน้ำ" },
  { key: "modern", label: "Contemporary", th: "คอนเทมโพรารี่", rate: 16000, img: "/images/built-roiet-modern.jpg", note: "ทรงกล่องหลังคาแบน ผิวผนังขาวตัดไม้" },
  { key: "minimal", label: "Minimal Box", th: "มินิมอล", rate: 13500, img: "/images/built-selaphum-courtyard.jpg", note: "เส้นสายเรียบง่าย ก่อสร้างไว คุมงบง่าย" },
];
const PACKAGES = DESIGN_PACKAGES;
const STEPS = ["ข้อมูลที่ดิน", "สไตล์สถาปัตย์", "ฟังก์ชันพื้นที่", "เตรียมเอกสาร"];

export function DesignEstimator() {
  const [step, setStep] = useState(0);
  const [w, setW] = useState(16);
  const [d, setD] = useState(22);
  const [province, setProvince] = useState(PROVINCES[0]);
  const [timeline, setTimeline] = useState("ภายใน 6 เดือน");
  const [style, setStyle] = useState("nordic");
  const [storeys, setStoreys] = useState(2);
  const [beds, setBeds] = useState(3);
  const [baths, setBaths] = useState(4);
  const [extras, setExtras] = useState<string[]>([]);
  const [pkg, setPkg] = useState("custom");

  const s = STYLES.find((x) => x.key === style)!;
  const p = PACKAGES.find((x) => x.key === pkg)!;
  const calc = useMemo(() => {
    const land = w * d;
    const programme = beds * 26 + baths * 6 + 70 + (storeys > 1 ? 16 : 0) + extras.length * 18;
    const maxGfa = land * 0.6 * storeys;
    const gfa = Math.round(Math.min(Math.max(programme, 80), maxGfa));
    const extraCost = (extras.includes("pool") ? 450000 : 0) + (extras.includes("solar") ? 180000 : 0);
    const build = gfa * s.rate + extraCost;
    const fee = designFee(p, gfa);
    return { land, sqwa: land / 4, gfa, fits: programme <= maxGfa, lo: build * 0.94, hi: build * 1.06, fee };
  }, [w, d, beds, baths, storeys, extras, s, p]);

  const toggleExtra = (k: string) => setExtras((e) => (e.includes(k) ? e.filter((x) => x !== k) : [...e, k]));
  const numberInput = (label: string, v: number, set: (n: number) => void, unit: string, min = 1, max = 200) => (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="flex border border-hairline bg-white">
        <Icon name="straighten" className="ml-3 self-center text-muted" />
        <input type="number" value={v} min={min} max={max} step={0.5} aria-label={label}
          onChange={(e) => set(Math.min(max, Math.max(0, Number(e.target.value) || 0)))} className="w-full px-3 py-2.5 text-[14px] outline-none" />
        <span className="self-center pr-3 text-[12px] text-muted">{unit}</span>
      </div>
    </div>
  );
  const counter = (label: string, v: number, set: (n: number) => void, min: number, max: number) => (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="flex items-center border border-hairline bg-white">
        <button type="button" onClick={() => set(Math.max(min, v - 1))} className="grid h-11 w-11 place-items-center hover:bg-wash" aria-label={`ลด${label}`}><Icon name="remove" /></button>
        <span className="flex-1 text-center text-[16px] font-bold">{v}</span>
        <button type="button" onClick={() => set(Math.min(max, v + 1))} className="grid h-11 w-11 place-items-center hover:bg-wash" aria-label={`เพิ่ม${label}`}><Icon name="add" /></button>
      </div>
    </div>
  );

  return (
    <div className="card p-5 md:p-8">
      <ol className="grid grid-cols-4 border-b border-hairline">
        {STEPS.map((t, i) => (
          <li key={t}>
            <button type="button" onClick={() => setStep(i)} className={`-mb-px w-full border-b-2 pb-3 text-left ${step === i ? "border-bronze" : "border-transparent"}`}>
              <span className={`label-tech block ${step >= i ? "text-bronze-dark" : "text-subtle"}`}>STEP {String(i + 1).padStart(2, "0")}</span>
              <span className={`hidden text-[13px] font-semibold sm:block ${step === i ? "" : "text-muted"}`}>{t}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          {step === 0 && (
            <div className="animate-fade-up">
              <div className="border border-hairline bg-wash p-4">
                <p className="label-tech text-bronze-dark">01 / Land Context &amp; Orientation</p>
                <p className="mt-1 text-[16px] font-bold">ระบุขนาดที่ดินและจังหวัดที่จะก่อสร้าง</p>
                <p className="text-[12.5px] text-muted">ข้อมูลช่วยให้สถาปนิกประเมินระยะร่นและกฎหมายควบคุมอาคารในพื้นที่</p>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {numberInput("หน้ากว้างที่ดิน (เมตร)", w, setW, "ม.")}
                {numberInput("ความลึกที่ดิน (เมตร)", d, setD, "ม.")}
                <div className="field">
                  <label htmlFor="de-prov" className="field-label">จังหวัดที่ก่อสร้าง</label>
                  <select id="de-prov" className="input" value={province} onChange={(e) => setProvince(e.target.value)}>{PROVINCES.map((x) => <option key={x}>{x}</option>)}</select>
                </div>
                <div className="field">
                  <label htmlFor="de-time" className="field-label">กำหนดการก่อสร้าง (วางแผนคร่าวๆ)</label>
                  <select id="de-time" className="input" value={timeline} onChange={(e) => setTimeline(e.target.value)}>{["ทันทีที่ได้แบบ (เร่งด่วน)", "ภายใน 6 เดือน", "6-12 เดือน", "ยังไม่แน่นอน"].map((x) => <option key={x}>{x}</option>)}</select>
                </div>
              </div>
              <p className="mt-4 flex items-center gap-2 text-[13px]"><Icon name="square_foot" className="text-bronze-dark" /> ขนาดเนื้อที่ดินโดยประมาณ <b>{num(calc.land, 1)} ตร.ม. ({num(calc.sqwa, 1)} ตารางวา)</b></p>
            </div>
          )}
          {step === 1 && (
            <div className="grid gap-3 animate-fade-up sm:grid-cols-2 xl:grid-cols-3">
              {STYLES.map((x) => (
                <button key={x.key} type="button" onClick={() => setStyle(x.key)} aria-pressed={style === x.key}
                  className={`group overflow-hidden border text-left transition-shadow ${style === x.key ? "border-ink shadow-[3px_3px_0_0_#c59b27]" : "border-hairline bg-white hover:border-ink"}`}>
                  <span className="relative block aspect-[16/9] overflow-hidden bg-wash-2">
                    <Image src={x.img} alt={`ตัวอย่างบ้านสไตล์${x.th}`} fill sizes="(max-width: 640px) 100vw, 320px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    {style === x.key && <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center bg-bronze text-ink"><Icon name="check" /></span>}
                  </span>
                  <span className={`block p-3.5 ${style === x.key ? "bg-ink text-white" : ""}`}>
                    <span className={`label-tech block ${style === x.key ? "text-bronze-light" : "text-bronze-dark"}`}>{x.label}</span>
                    <span className="text-[15px] font-bold">{x.th}</span>
                    <span className={`mt-0.5 block text-[12px] ${style === x.key ? "text-white/70" : "text-muted"}`}>{x.note}</span>
                    <span className={`mt-1 block text-[11.5px] ${style === x.key ? "text-white/50" : "text-subtle"}`}>ค่าก่อสร้างเฉลี่ย ~{num(x.rate)} บาท/ตร.ม.</span>
                  </span>
                </button>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="animate-fade-up">
              <div className="grid gap-4 sm:grid-cols-3">
                {counter("จำนวนชั้น", storeys, setStoreys, 1, 3)}
                {counter("ห้องนอน", beds, setBeds, 1, 8)}
                {counter("ห้องน้ำ", baths, setBaths, 1, 8)}
              </div>
              <p className="field-label mt-5">พื้นที่พิเศษเพิ่มเติม</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[["pool", "สระว่ายน้ำ"], ["office", "ห้องทำงาน"], ["elder", "ห้องนอนผู้สูงอายุชั้นล่าง"], ["maid", "ห้องแม่บ้าน"], ["solar", "โซลาร์รูฟท็อป"]].map(([k, l]) => (
                  <button key={k} type="button" onClick={() => toggleExtra(k)} className={`chip h-9 cursor-pointer ${extras.includes(k) ? "chip-active" : "hover:border-ink"}`}>{extras.includes(k) && <Icon name="check" />}{l}</button>
                ))}
              </div>
              {!calc.fits && <p className="mt-4 flex items-center gap-2 border border-bronze/40 bg-bronze-wash p-3 text-[12.5px]"><Icon name="warning" className="text-bronze-dark" /> ฟังก์ชันที่เลือกเกินพื้นที่ก่อสร้างที่กฎหมายอนุญาต แนะนำเพิ่มจำนวนชั้นหรือลดจำนวนห้อง</p>}
            </div>
          )}
          {step === 3 && (
            <div className="animate-fade-up">
              <div className="grid gap-2 sm:grid-cols-3">
                {PACKAGES.map((x) => (
                  <button key={x.key} type="button" onClick={() => setPkg(x.key)} className={`border p-3 text-left ${pkg === x.key ? "border-ink bg-ink text-white" : "border-hairline bg-white hover:border-ink"}`}>
                    <span className={`label-tech block ${pkg === x.key ? "text-bronze-light" : "text-bronze-dark"}`}>{x.label}</span>
                    <span className="text-[13px] font-semibold">{x.th}</span>
                  </button>
                ))}
              </div>
              <LeadForm type="custom_design" submitLabel="รับใบเสนอราคาและนัดสถาปนิก" className="mt-5" successTitle="ได้รับข้อมูลโครงการแล้ว"
                hidden={{ land_width: w, land_depth: d, province, area_sqm: calc.gfa, estimate_thb: calc.fee, service_package: p.label, budget: `${num(calc.lo / 1e6, 2)}-${num(calc.hi / 1e6, 2)} ล้าน`, storeys, style: s.label, rooms: `${beds} นอน ${baths} น้ำ`, deliverables: extras.join(","), steps: timeline }}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field name="name" label="ชื่อ-นามสกุล" required autoComplete="name" />
                  <Field name="phone" label="เบอร์โทรศัพท์" type="tel" required autoComplete="tel" />
                  <Field name="line_id" label="LINE ID" />
                  <Field name="email" label="อีเมล" type="email" autoComplete="email" />
                </div>
              </LeadForm>
            </div>
          )}
          <div className="mt-6 flex justify-between border-t border-hairline pt-4">
            <button type="button" onClick={() => setStep((x) => Math.max(0, x - 1))} disabled={step === 0} className="btn btn-ghost btn-sm"><Icon name="arrow_back" /> ย้อนกลับ</button>
            {step < 3 && <button type="button" onClick={() => setStep((x) => x + 1)} className="btn btn-primary btn-sm">ขั้นตอนถัดไป <Icon name="arrow_forward" /></button>}
          </div>
        </div>

        <aside className="flex flex-col gap-3">
          <div className="border border-hairline bg-wash p-4">
            <div className="flex items-center justify-between"><p className="label-tech text-muted">Architectural Spec Sheet</p><Icon name="description" className="text-muted" /></div>
            <dl className="mt-3 space-y-2 text-[13px]">
              {[["พื้นที่ใช้สอยประมาณการ (GFA)", `${num(calc.gfa)} ตร.ม.`], ["จำนวนชั้นที่แนะนำ", `${storeys} ชั้น`], ["สไตล์สถาปัตยกรรม", s.label], ["ฟังก์ชันหลัก", `${beds} นอน / ${baths} น้ำ`], ["ที่ดิน", `${w} x ${d} ม. • ${province}`]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3"><dt className="text-muted">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>
              ))}
            </dl>
            <div className="mt-4 border-t border-hairline pt-3">
              <p className="text-[11.5px] text-muted">ประมาณการงบก่อสร้าง (มาตรฐาน SCG/CPAC)</p>
              <p className="font-display text-[20px] font-bold">{baht(calc.lo)} - {baht(calc.hi)}</p>
              <p className="text-[11px] text-subtle">ค่าเฉลี่ย {num(s.rate * 0.94)} - {num(s.rate * 1.06)} บาท/ตร.ม.</p>
            </div>
          </div>
          <div className="bg-ink p-5 text-white">
            <p className="flex items-center justify-between label-tech text-bronze-light">ค่าบริการออกแบบ ({p.label}) <Icon name="payments" /></p>
            <p className="mt-2 font-display text-[34px] font-bold">{baht(calc.fee)}</p>
            <ul className="mt-3 space-y-1 text-[12px] text-white/70">
              <li>✓ รวม 3D BIM Walkthrough แบบละเอียดทั้งหลัง</li>
              <li>✓ รวมรายการคำนวณโครงสร้างพร้อมลายเซ็น วศ.</li>
              <li>✓ การปรับแก้แบบไม่จำกัด จนกว่าจะพึงพอใจ</li>
            </ul>
          </div>
          {step < 3 && <button type="button" onClick={() => setStep(3)} className="btn btn-bronze">จองคิวสถาปนิก &amp; ดูแบบฟรี</button>}
        </aside>
      </div>
    </div>
  );
}
