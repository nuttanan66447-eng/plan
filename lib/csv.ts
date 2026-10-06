/** Minimal RFC-4180 CSV parser (quoted fields, escaped quotes, CRLF, UTF-8 BOM). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const s = text.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}

export const toCsv = (rows: (string | number)[][]) =>
  rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");

/** Column order shared by the BOQ download on /boq and the admin import. */
export const BOQ_HEADER = ["หมวด", "ลำดับ", "รายการ", "สเปก", "ปริมาณ", "หน่วย", "ค่าวัสดุ/หน่วย", "รวมค่าวัสดุ", "ค่าแรง/หน่วย", "รวมค่าแรง", "รวมเป็นเงิน"];
