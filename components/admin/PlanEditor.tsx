"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useActionState, useRef, useState } from "react";
import { deletePlan, importBoq, savePlan, type BoqImportState, type PlanFormState } from "@/app/admin/actions";
import { Icon } from "@/components/Icon";
import { browserClient } from "@/lib/supabase/browser";
import type { Plan } from "@/lib/types";

const STYLES = [
  ["nordic", "นอร์ดิก (Nordic)"],
  ["japandi", "แจแปนดิ (Japandi)"],
  ["tropical", "ทรอปิคอล (Tropical)"],
  ["modern", "โมเดิร์น (Modern)"],
  ["minimal", "มินิมอล (Minimal)"],
];
const FEATURES = [
  ["tour360", "มีทัวร์ 360° / โมเดล 3D"],
  ["dollhouse", "มีภาพตัด 3D Dollhouse"],
  ["universal", "Universal Design ผู้สูงอายุ"],
  ["pool", "มีสระว่ายน้ำ"],
  ["narrow", "เหมาะที่ดินหน้าแคบ"],
];

/** Downscale to ≤1800px JPEG in the browser so uploads stay small and fast. */
async function compress(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const max = 1800;
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * k);
  canvas.height = Math.round(bmp.height * k);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), "image/jpeg", 0.85));
}

async function upload(file: File, folder: string) {
  const sb = browserClient();
  const blob = await compress(file);
  const path = `${folder || "plan"}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await sb.storage.from("plan-images").upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw new Error(error.message);
  return sb.storage.from("plan-images").getPublicUrl(path).data.publicUrl;
}

async function uploadModel(file: File, folder: string) {
  if (!/\.glb$/i.test(file.name)) throw new Error("รองรับเฉพาะไฟล์ .glb");
  if (file.size > 50 * 1024 * 1024) throw new Error("ไฟล์ใหญ่เกิน 50MB — ลดรายละเอียดหรือบีบอัดด้วย Draco ก่อน");
  const sb = browserClient();
  const path = `${folder || "plan"}/model-${Date.now()}.glb`;
  const { error } = await sb.storage.from("plan-images").upload(path, file, { contentType: "model/gltf-binary", upsert: false });
  if (error) throw new Error(error.message);
  return sb.storage.from("plan-images").getPublicUrl(path).data.publicUrl;
}

function Num({ name, label, value, step = "1", required, hint }: { name: string; label: string; value?: number | null; step?: string; required?: boolean; hint?: string }) {
  return (
    <div className="field">
      <label htmlFor={`p-${name}`} className="field-label">{label} {required && <span className="text-bronze-dark">*</span>}</label>
      <input id={`p-${name}`} name={name} type="number" min="0" step={step} defaultValue={value ?? ""} className="input" required={required} />
      {hint && <span className="text-[11px] text-subtle">{hint}</span>}
    </div>
  );
}

function Text({ name, label, value, required, placeholder, hint }: { name: string; label: string; value?: string | null; required?: boolean; placeholder?: string; hint?: string }) {
  return (
    <div className="field">
      <label htmlFor={`p-${name}`} className="field-label">{label} {required && <span className="text-bronze-dark">*</span>}</label>
      <input id={`p-${name}`} name={name} defaultValue={value ?? ""} placeholder={placeholder} className="input" required={required} />
      {hint && <span className="text-[11px] text-subtle">{hint}</span>}
    </div>
  );
}

export function PlanEditor({ plan }: { plan?: Plan & { is_published?: boolean; sort_order?: number } }) {
  const [state, action, pending] = useActionState<PlanFormState | null, FormData>(savePlan, null);
  const [gallery, setGallery] = useState<string[]>(plan ? plan.gallery.filter((g) => g !== plan.panorama) : []);
  const [cover, setCover] = useState<string>(plan?.image ?? "");
  const [panorama, setPanorama] = useState<string>(plan?.panorama ?? "");
  const [modelUrl, setModelUrl] = useState<string>(plan?.model_url ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  const onFiles = async (files: FileList | null, kind: "gallery" | "panorama") => {
    if (!files?.length) return;
    setUploadErr(null);
    const folder = (codeRef.current?.value || "new").toUpperCase().replace(/[^A-Z0-9-]/g, "");
    try {
      for (const [i, f] of [...files].entries()) {
        if (!f.type.startsWith("image/")) continue;
        setBusy(`กำลังอัปโหลด ${i + 1}/${files.length}...`);
        const url = await upload(f, folder);
        if (kind === "panorama") setPanorama(url);
        else {
          setGallery((g) => [...g, url]);
          setCover((c) => c || url);
        }
      }
    } catch (e) {
      setUploadErr(`อัปโหลดไม่สำเร็จ: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };
  const onModel = async (file: File | undefined) => {
    if (!file) return;
    setUploadErr(null);
    setBusy(`กำลังอัปโหลดโมเดล 3D (${(file.size / 1024 / 1024).toFixed(1)} MB)...`);
    try {
      setModelUrl(await uploadModel(file, (codeRef.current?.value || "new").toUpperCase().replace(/[^A-Z0-9-]/g, "")));
    } catch (e) {
      setUploadErr(`อัปโหลดโมเดลไม่สำเร็จ: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };
  const remove = (url: string) => {
    setGallery((g) => g.filter((x) => x !== url));
    if (cover === url) setCover(gallery.find((x) => x !== url) ?? "");
  };
  const move = (i: number, d: -1 | 1) =>
    setGallery((g) => {
      const n = [...g];
      const j = i + d;
      if (j < 0 || j >= n.length) return g;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  return (
    <div className="space-y-6">
      <form
        className="space-y-6"
        onSubmit={(e) => {
          // submit through a transition so a validation error doesn't reset the whole form
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(() => action(fd));
        }}
      >
        {plan && <input type="hidden" name="id" value={plan.id} />}
        <input type="hidden" name="image" value={cover} />
        <input type="hidden" name="gallery" value={JSON.stringify(gallery)} />
        <input type="hidden" name="panorama" value={panorama} />
        <input type="hidden" name="model_url" value={modelUrl} />

        <section className="card p-5">
          <h2 className="text-[16px] font-bold">1. ข้อมูลหลัก</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="field">
              <label htmlFor="p-code" className="field-label">รหัสแบบ <span className="text-bronze-dark">*</span></label>
              <input id="p-code" ref={codeRef} name="code" defaultValue={plan?.code} placeholder="AP-MODERN-05" required className="input uppercase" />
              <span className="text-[11px] text-subtle">ใช้เป็นลิงก์หน้าแบบ /plans/รหัส</span>
            </div>
            <Text name="name_en" label="ชื่อแบบ (อังกฤษ)" value={plan?.name_en} required placeholder="Nordic Family Villa" />
            <Text name="name_th" label="ชื่อแบบ (ไทย)" value={plan?.name_th} required placeholder="บ้านนอร์ดิกสองชั้น" />
            <div className="field">
              <label htmlFor="p-style" className="field-label">สไตล์ <span className="text-bronze-dark">*</span></label>
              <select id="p-style" name="style" defaultValue={plan?.style ?? "modern"} className="input">
                {STYLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <Text name="series" label="ซีรีส์ / คอลเลกชัน" value={plan?.series} placeholder="Nordic Modern Series" />
            <Text name="badge" label="ป้ายบนรูป" value={plan?.badge} placeholder="BEST SELLER / NEW" />
            <div className="field md:col-span-3">
              <label htmlFor="p-tagline" className="field-label">คำโปรยสั้น</label>
              <input id="p-tagline" name="tagline" defaultValue={plan?.tagline ?? ""} className="input" placeholder="หลังคาจั่วองศาชัน หน้าต่างกระจกสูงสองชั้น..." />
            </div>
            <div className="field md:col-span-3">
              <label htmlFor="p-description" className="field-label">รายละเอียดแบบ</label>
              <textarea id="p-description" name="description" defaultValue={plan?.description ?? ""} className="input min-h-[110px]" />
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-[16px] font-bold">2. สเปกอาคาร &amp; ราคา</h2>
          <p className="text-[12px] text-muted">ตัวเลขเหล่านี้ใช้ทั้งในตัวกรอง ตารางเทียบ และการสร้างโมเดล 3D อัตโนมัติ</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Num name="storeys" label="จำนวนชั้น" value={plan?.storeys ?? 2} required />
            <Num name="area_sqm" label="พื้นที่ใช้สอยรวม (ตร.ม.)" value={plan?.area_sqm} step="0.1" required />
            <Text name="floor_areas" label="พื้นที่แต่ละชั้น (ตร.ม.)" value={plan?.floor_areas.join(", ")} placeholder="185, 135" hint="คั่นด้วยจุลภาค ชั้น 1, ชั้น 2" />
            <Num name="parking" label="ที่จอดรถ (คัน)" value={plan?.parking ?? 2} />
            <Num name="bedrooms" label="ห้องนอน" value={plan?.bedrooms} required />
            <Num name="bathrooms" label="ห้องน้ำ" value={plan?.bathrooms} required />
            <Num name="land_width" label="หน้ากว้างที่ดินขั้นต่ำ (ม.)" value={plan?.land_width} step="0.1" />
            <Num name="land_depth" label="ความลึกที่ดินขั้นต่ำ (ม.)" value={plan?.land_depth} step="0.1" />
            <Num name="min_land_sqwa" label="ที่ดินขั้นต่ำ (ตร.ว.)" value={plan?.min_land_sqwa} step="0.1" hint="เว้นว่างเพื่อคำนวณจากกว้าง x ลึก" />
            <Num name="build_cost_min" label="งบก่อสร้างต่ำสุด (ล้านบาท)" value={plan?.build_cost_min} step="0.01" required />
            <Num name="build_cost_max" label="งบก่อสร้างสูงสุด (ล้านบาท)" value={plan?.build_cost_max} step="0.01" required />
            <Num name="price" label="ราคาชุดแบบ (บาท)" value={plan?.price} required />
            <Num name="price_original" label="ราคาปกติ (ขีดฆ่า)" value={plan?.price_original} />
            <Num name="pages_arch" label="แผ่นงานสถาปัตย์" value={plan?.pages_arch ?? 36} />
            <Num name="pages_struct" label="แผ่นงานโครงสร้าง" value={plan?.pages_struct ?? 22} />
            <Num name="pages_mep" label="แผ่นงานระบบ" value={plan?.pages_mep ?? 16} />
          </div>
          <fieldset className="mt-5">
            <legend className="field-label">คุณสมบัติพิเศษ</legend>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
              {FEATURES.map(([v, l]) => (
                <label key={v} className="flex items-center gap-2 text-[13.5px]">
                  <input type="checkbox" name="features" value={v} defaultChecked={plan?.features.includes(v as never)} className="check" /> {l}
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="card p-5">
          <h2 className="text-[16px] font-bold">3. รูปภาพ</h2>
          <p className="text-[12px] text-muted">อัปโหลดได้หลายรูป (JPG/PNG/WebP) ระบบย่อขนาดให้อัตโนมัติ — คลิกที่รูปเพื่อตั้งเป็นรูปหลักบนการ์ด</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {gallery.map((g, i) => (
              <div key={g} className={`relative border-2 ${cover === g ? "border-bronze" : "border-transparent"}`}>
                <button type="button" onClick={() => setCover(g)} className="relative block aspect-[16/10] w-full bg-wash-2" aria-label="ตั้งเป็นรูปหลัก">
                  <Image src={g} alt="" fill sizes="240px" className="object-cover" />
                </button>
                {cover === g && <span className="absolute left-1 top-1 bg-bronze px-1.5 text-[10px] font-bold text-ink">รูปหลัก</span>}
                <div className="absolute right-1 top-1 flex bg-ink/85 text-white">
                  <button type="button" onClick={() => move(i, -1)} className="grid h-7 w-7 place-items-center hover:bg-white/10" aria-label="เลื่อนซ้าย"><Icon name="chevron_left" /></button>
                  <button type="button" onClick={() => move(i, 1)} className="grid h-7 w-7 place-items-center hover:bg-white/10" aria-label="เลื่อนขวา"><Icon name="chevron_right" /></button>
                  <button type="button" onClick={() => remove(g)} className="grid h-7 w-7 place-items-center hover:bg-danger" aria-label="ลบรูป"><Icon name="delete" /></button>
                </div>
              </div>
            ))}
            <label className="grid aspect-[16/10] cursor-pointer place-items-center border-2 border-dashed border-hairline bg-wash text-center text-[12.5px] text-muted hover:border-ink">
              <span><Icon name="add_photo_alternate" className="text-[28px]" /><br />เพิ่มรูปภาพ</span>
              <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { onFiles(e.target.files, "gallery"); e.target.value = ""; }} />
            </label>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div className="field">
              <span className="field-label">ภาพ 360° ภายในบ้าน (ภาพพาโนรามาแนวกว้าง ไม่บังคับ)</span>
              <div className="flex items-center gap-3">
                {panorama ? (
                  <div className="relative h-16 w-40 shrink-0 bg-wash-2"><Image src={panorama} alt="" fill sizes="160px" className="object-cover" /></div>
                ) : <span className="text-[12.5px] text-subtle">ยังไม่มีภาพ 360°</span>}
                <label className="btn btn-ghost btn-sm cursor-pointer"><Icon name="360" /> {panorama ? "เปลี่ยนภาพ" : "อัปโหลด"}
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => { onFiles(e.target.files, "panorama"); e.target.value = ""; }} />
                </label>
                {panorama && <button type="button" onClick={() => setPanorama("")} className="text-[12px] text-danger hover:underline">ลบ</button>}
              </div>
            </div>
          </div>
          <div className="mt-5 border-t border-hairline pt-5">
            <span className="field-label">โมเดล 3 มิติ (.glb) — ไม่บังคับ</span>
            <p className="mt-1 text-[12px] text-muted">
              ถ้าไม่อัปโหลด เว็บจะสร้างโมเดลจำลองจากข้อมูลแบบให้อัตโนมัติ • ไฟล์ .glb ขนาดไม่เกิน 50MB • หน่วย มม./ซม./ม. ได้ ระบบแปลงให้เอง
            </p>
            <details className="group mt-3 border border-hairline bg-wash" open={!modelUrl}>
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 text-[13px] font-semibold">
                <span className="flex items-center gap-2"><Icon name="help" className="text-bronze-dark" /> วิธีส่งออกไฟล์ .glb จากโปรแกรมต่างๆ</span>
                <Icon name="expand_more" className="transition-transform group-open:rotate-180" />
              </summary>
              <div className="overflow-x-auto border-t border-hairline bg-white">
                <table className="w-full min-w-[560px] text-[12.5px]">
                  <thead className="bg-wash text-left text-[11.5px] text-muted">
                    <tr><th className="w-40 px-4 py-2">โปรแกรม</th><th className="px-4 py-2">วิธีส่งออก</th></tr>
                  </thead>
                  <tbody>
                    {[
                      ["SketchUp 2023 ขึ้นไป", <>File → Export → 3D Model → เลือกชนิดไฟล์ <b>glTF Binary (*.glb)</b> → Export</>],
                      ["SketchUp รุ่นเก่า", <>ติดตั้งส่วนขยาย <b>glTF Export</b> จาก Extension Warehouse แล้ว Extensions → glTF Export → Export Binary (.glb)</>],
                      ["Revit", <>File → Export → <b>FBX</b> → เปิดไฟล์ FBX ใน Blender (File → Import → FBX) → File → Export → <b>glTF 2.0</b> → Format: <b>glTF Binary (.glb)</b> · หรือเปิดใน Twinmotion แล้ว Export → glTF</>],
                      ["Blender", <>File → Export → <b>glTF 2.0 (.glb/.gltf)</b> → Format: <b>glTF Binary</b> → ติ๊ก <b>Compression (Draco)</b> เพื่อลดขนาดไฟล์</>],
                      ["3ds Max", <>File → Export → เลือก <b>glTF Binary (*.glb)</b> (3ds Max 2023+) หรือส่งออก FBX แล้วแปลงใน Blender</>],
                      ["ArchiCAD", <>File → Save As → <b>FBX</b> (หรือ OBJ) → แปลงเป็น .glb ใน Blender เหมือน Revit</>],
                    ].map(([app, how]) => (
                      <tr key={app as string} className="border-t border-hairline align-top">
                        <td className="px-4 py-2.5 font-semibold">{app}</td>
                        <td className="px-4 py-2.5 text-ink-3">{how}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <ul className="space-y-1 border-t border-hairline px-4 py-3 text-[12px] text-muted">
                  <li>• ไฟล์ใหญ่เกิน 50MB: ลบเฟอร์นิเจอร์/ต้นไม้ที่ไม่จำเป็น ลดขนาด texture หรือเปิด Draco compression</li>
                  <li>• แนะนำให้หน้าบ้านหันไปทางแกน +Z (ด้านหน้าในโปรแกรม) เพื่อให้มุมกล้องเริ่มต้นเห็นหน้าบ้าน</li>
                  <li>• ตรวจไฟล์ก่อนอัปโหลดได้ที่ gltf-viewer.donmccurdy.com (ลากไฟล์วางเพื่อดูตัวอย่าง)</li>
                </ul>
              </div>
            </details>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {modelUrl ? (
                <span className="flex items-center gap-2 bg-[#e9f5ee] px-3 py-1.5 text-[12.5px] text-success"><Icon name="deployed_code" /> มีโมเดล 3D แล้ว ({decodeURIComponent(modelUrl.split("/").pop() ?? "")})</span>
              ) : <span className="text-[12.5px] text-subtle">ใช้โมเดลจำลองอัตโนมัติ</span>}
              <label className="btn btn-ghost btn-sm cursor-pointer"><Icon name="upload_file" /> {modelUrl ? "เปลี่ยนไฟล์" : "อัปโหลด .glb"}
                <input type="file" accept=".glb,model/gltf-binary" className="sr-only" onChange={(e) => { onModel(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
              {modelUrl && <button type="button" onClick={() => setModelUrl("")} className="text-[12px] text-danger hover:underline">ลบโมเดล (กลับไปใช้แบบจำลอง)</button>}
            </div>
          </div>
          {busy && <p className="mt-3 flex items-center gap-2 text-[13px] text-bronze-dark"><Icon name="progress_activity" className="animate-spin" /> {busy}</p>}
          {uploadErr && <p className="mt-3 text-[13px] text-danger">{uploadErr}</p>}
        </section>

        <section className="card flex flex-wrap items-center gap-4 p-5">
          <label className="flex items-center gap-2 text-[14px] font-semibold">
            <input type="checkbox" name="is_published" defaultChecked={plan?.is_published ?? true} className="check" /> แสดงบนเว็บไซต์
          </label>
          <div className="flex items-center gap-2 text-[13px]">
            <label htmlFor="p-sort_order" className="text-muted">ลำดับการแสดง</label>
            <input id="p-sort_order" name="sort_order" type="number" defaultValue={plan?.sort_order ?? 100} className="input !w-24 !py-2" />
            <span className="text-[11px] text-subtle">(น้อย = แสดงก่อน)</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {state?.error && <p className="text-[13px] text-danger" role="alert">{state.error}</p>}
            {state?.saved && <p className="flex items-center gap-1 text-[13px] text-success" role="status"><Icon name="check_circle" /> บันทึกแล้ว</p>}
            {plan && <Link href={`/plans/${plan.code}`} target="_blank" className="btn btn-ghost btn-sm"><Icon name="open_in_new" /> ดูหน้าแบบ</Link>}
            <button disabled={pending || !!busy} className="btn btn-primary">{pending ? "กำลังบันทึก..." : plan ? "บันทึกการแก้ไข" : "เพิ่มแบบบ้าน"}</button>
          </div>
        </section>
      </form>

      {plan && <BoqImport planId={plan.id} code={plan.code} />}

      {plan && (
        <form action={deletePlan} onSubmit={(e) => { if (!confirm(`ลบแบบ ${plan.code} ถาวร? รายการ BOQ ของแบบนี้จะถูกลบด้วย`)) e.preventDefault(); }}
          className="card flex flex-wrap items-center justify-between gap-3 border-danger/30 p-5">
          <input type="hidden" name="id" value={plan.id} />
          <div><p className="font-bold text-danger">ลบแบบบ้านนี้</p><p className="text-[12.5px] text-muted">หากต้องการซ่อนชั่วคราว ให้เอาเครื่องหมาย “แสดงบนเว็บไซต์” ออกแทน</p></div>
          <button className="btn btn-sm border-danger text-danger hover:bg-danger hover:text-white"><Icon name="delete" /> ลบแบบ</button>
        </form>
      )}
    </div>
  );
}

function BoqImport({ planId, code }: { planId: string; code: string }) {
  const [state, action, pending] = useActionState<BoqImportState | null, FormData>(importBoq, null);
  return (
    <form action={action} className="card p-5">
      <input type="hidden" name="plan_id" value={planId} />
      <h2 className="text-[16px] font-bold">4. รายการ BOQ (ไม่บังคับ)</h2>
      <p className="mt-1 text-[12.5px] text-muted">
        นำเข้าไฟล์ CSV เพื่อแสดงตาราง BOQ ของแบบนี้ในหน้า <Link href={`/boq?plan=${code}`} className="text-bronze-dark underline" target="_blank">/boq</Link> — รายการเดิมจะถูกแทนที่ทั้งหมด.
        วิธีที่ง่ายที่สุด: ดาวน์โหลดไฟล์ตัวอย่างจากหน้า BOQ แล้วแก้ใน Excel / Google Sheets แล้วบันทึกเป็น CSV (UTF-8)
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input type="file" name="file" accept=".csv,text/csv" required className="text-[13px]" />
        <button disabled={pending} className="btn btn-outline btn-sm"><Icon name="upload_file" /> {pending ? "กำลังนำเข้า..." : "นำเข้า BOQ"}</button>
        {state?.error && <p className="text-[13px] text-danger" role="alert">{state.error}</p>}
        {state?.imported != null && <p className="flex items-center gap-1 text-[13px] text-success" role="status"><Icon name="check_circle" /> นำเข้า {state.imported} รายการแล้ว</p>}
      </div>
    </form>
  );
}
