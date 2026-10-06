import type { Plan } from "@/lib/types";

interface Room { x: number; y: number; w: number; h: number; label: string; sub?: string; accent?: boolean }

// Schematic (not-to-scale) floor plan generated from a plan's programme, used for the 2D preview tab.
function layout(plan: Plan, floor: number): Room[] {
  const beds = plan.bedrooms;
  const two = plan.storeys > 1;
  if (!two || floor === 0) {
    const groundBeds = two ? Math.max(1, beds - 3) : beds;
    const rooms: Room[] = [
      { x: 0, y: 0, w: 56, h: 42, label: "LIVING", sub: "ห้องนั่งเล่น", accent: true },
      { x: 56, y: 0, w: 24, h: 24, label: "DINING", sub: "รับประทานอาหาร" },
      { x: 80, y: 0, w: 20, h: 24, label: "KITCHEN", sub: "ครัว" },
      { x: 56, y: 24, w: 14, h: 18, label: "WC", sub: "ห้องน้ำ" },
      { x: 70, y: 24, w: 30, h: 18, label: two ? "STAIR" : "HALL", sub: two ? "บันได" : "โถง" },
    ];
    const bw = 100 / groundBeds;
    for (let i = 0; i < groundBeds; i++) rooms.push({ x: i * bw, y: 42, w: bw, h: 34, label: i === 0 && !two ? "MASTER BED" : `BED ${i + 1}`, sub: "ห้องนอน" });
    rooms.push({ x: 0, y: 76, w: 64, h: 24, label: plan.features.includes("pool") ? "POOL DECK" : "TERRACE", sub: plan.features.includes("pool") ? "สระว่ายน้ำ" : "ระเบียง" });
    rooms.push({ x: 64, y: 76, w: 36, h: 24, label: "CARPORT", sub: `จอดรถ ${plan.parking} คัน` });
    return rooms;
  }
  const upperBeds = Math.min(beds, 3);
  const rooms: Room[] = [{ x: 0, y: 0, w: 52, h: 46, label: "MASTER BED", sub: "ห้องนอนใหญ่", accent: true }, { x: 52, y: 0, w: 22, h: 22, label: "W.I.C", sub: "ห้องแต่งตัว" }, { x: 74, y: 0, w: 26, h: 22, label: "BATH", sub: "ห้องน้ำ" }, { x: 52, y: 22, w: 48, h: 24, label: "STAIR / VOID", sub: "โถงสูง Double Volume" }];
  const bw = 100 / Math.max(1, upperBeds - 1);
  for (let i = 0; i < upperBeds - 1; i++) rooms.push({ x: i * bw, y: 46, w: bw, h: 34, label: `BED ${i + 2}`, sub: "ห้องนอน" });
  rooms.push({ x: 0, y: 80, w: 100, h: 20, label: "BALCONY", sub: "ระเบียงชั้นบน" });
  return rooms;
}

export function FloorPlan({ plan, floor }: { plan: Plan; floor: number }) {
  const W = 760, H = 470, P = 40;
  const sx = (W - P * 2) / 100, sy = (H - P * 2) / 100;
  const rooms = layout(plan, floor);
  const area = plan.floor_areas[floor] ?? plan.area_sqm;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label={`แปลนพื้นชั้น ${floor + 1} ของ ${plan.code}`}>
      <defs>
        <pattern id="grid" width="19" height="19" patternUnits="userSpaceOnUse"><path d="M19 0H0V19" fill="none" stroke="#1e232a" strokeOpacity=".06" /></pattern>
      </defs>
      <rect width={W} height={H} fill="#f8f9ff" />
      <rect width={W} height={H} fill="url(#grid)" />
      {rooms.map((r, i) => {
        const x = P + r.x * sx, y = P + r.y * sy, w = r.w * sx, h = r.h * sy;
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill={r.accent ? "#fff6dd" : "#ffffff"} stroke="#1e232a" strokeWidth="3" />
            <text x={x + w / 2} y={y + h / 2 - 3} textAnchor="middle" fontSize="12" fontWeight="700" fill="#1e232a" letterSpacing="1.2">{r.label}</text>
            {r.sub && <text x={x + w / 2} y={y + h / 2 + 13} textAnchor="middle" fontSize="10.5" fill="#5a5f67">{r.sub}</text>}
          </g>
        );
      })}
      {/* dimension line */}
      <line x1={P} y1={H - 14} x2={W - P} y2={H - 14} stroke="#8c733e" />
      <line x1={P} y1={H - 20} x2={P} y2={H - 8} stroke="#8c733e" />
      <line x1={W - P} y1={H - 20} x2={W - P} y2={H - 8} stroke="#8c733e" />
      <text x={W / 2} y={H - 18} textAnchor="middle" fontSize="10" fill="#8c733e" letterSpacing="1">{plan.land_width ? `SITE WIDTH ${plan.land_width} M.` : "SCHEMATIC"} • FL {floor + 1}: {area} SQ.M.</text>
      <text x={W - P} y={24} textAnchor="end" fontSize="10" fill="#807663" letterSpacing="1.4">SCALE 1:100 • {plan.code}</text>
      <g transform={`translate(${P + 10}, 20)`}><path d="M0 8 L6 -6 L12 8 L6 4 Z" fill="#c59b27" /><text x="18" y="6" fontSize="10" fill="#1e232a" fontWeight="700">N</text></g>
    </svg>
  );
}

export function SunPath({ plan }: { plan: Plan }) {
  return (
    <svg viewBox="0 0 760 470" className="h-full w-full" role="img" aria-label="แผนภาพทิศทางแดดและลม">
      <rect width="760" height="470" fill="#1e232a" />
      <circle cx="380" cy="250" r="180" fill="none" stroke="#ffffff" strokeOpacity=".12" />
      <circle cx="380" cy="250" r="120" fill="none" stroke="#ffffff" strokeOpacity=".08" strokeDasharray="4 6" />
      {[["N", 380, 58], ["S", 380, 450], ["E", 578, 255], ["W", 176, 255]].map(([t, x, y]) => (
        <text key={t as string} x={x as number} y={y as number} textAnchor="middle" fontSize="14" fontWeight="700" fill="#eec14b">{t}</text>
      ))}
      {/* summer and winter sun arcs (sun runs south of zenith in Thailand most of the year) */}
      <path d="M200 260 Q380 120 560 260" fill="none" stroke="#c59b27" strokeWidth="2.5" strokeDasharray="6 5" />
      <path d="M200 270 Q380 330 560 270" fill="none" stroke="#c59b27" strokeOpacity=".5" strokeWidth="2" strokeDasharray="3 5" />
      <circle cx="470" cy="200" r="13" fill="#eec14b" />
      <text x="490" y="190" fontSize="11" fill="#ffffff" fillOpacity=".75">SUN 14:30 • ด้านตะวันตกเฉียงใต้</text>
      <rect x="330" y="215" width="100" height="70" fill="#ffffff" fillOpacity=".08" stroke="#ffffff" strokeWidth="2" />
      <text x="380" y="255" textAnchor="middle" fontSize="11" fill="#ffffff" letterSpacing="1">{plan.code}</text>
      {/* prevailing winds */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${470 + i * 24}, ${380 - i * 10}) rotate(-140)`}>
          <path d="M0 0 H46 M38 -6 L46 0 L38 6" stroke="#9fc3e8" strokeWidth="2" fill="none" />
        </g>
      ))}
      <text x="560" y="420" fontSize="11" fill="#9fc3e8">ลมมรสุมตะวันตกเฉียงใต้ (พ.ค. - ต.ค.)</text>
      <text x="40" y="40" fontSize="11" fill="#ffffff" fillOpacity=".55" letterSpacing="1.4">SUN PATH &amp; WIND STUDY • LAT 16.05°N</text>
      <text x="40" y="440" fontSize="11" fill="#ffffff" fillOpacity=".55">วางห้องนอนทิศเหนือ-ตะวันออก • ชายคา/ระแนงบังแดดทิศตะวันตก</text>
    </svg>
  );
}
