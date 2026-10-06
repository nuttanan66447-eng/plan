import { publicClient } from "./supabase/public";
import type { BoqItem, Plan, PlanStyle, Project, Review } from "./types";

export interface PlanFilters {
  q?: string;
  storeys?: number[];
  style?: PlanStyle;
  areaMax?: number;
  beds?: number; // minimum bedrooms (5 = 5+)
  land?: "s" | "m" | "l"; // < 50, 50-100, > 100 sq.wa
  budget?: "compact" | "popular" | "luxury" | "mansion";
  features?: string[];
  sort?: "popular" | "price_asc" | "price_desc" | "area_asc" | "area_desc" | "newest";
  page?: number;
}

export const PAGE_SIZE = 6;

const BUDGETS = {
  compact: [0, 3],
  popular: [3, 5],
  luxury: [5, 8],
  mansion: [8, 999],
} as const;

export async function listPlans(f: PlanFilters = {}) {
  const sb = publicClient();
  if (!sb) return { plans: [] as Plan[], total: 0 };

  let q = sb.from("plans").select("*", { count: "exact" }).eq("is_published", true);
  if (f.q) {
    const term = f.q.replace(/[%,()]/g, " ").trim();
    if (term) q = q.or(`code.ilike.%${term}%,name_en.ilike.%${term}%,name_th.ilike.%${term}%,series.ilike.%${term}%`);
  }
  if (f.storeys?.length) q = q.in("storeys", f.storeys.map((s) => Math.min(s, 4)).flatMap((s) => (s >= 3 ? [3, 4] : [s])));
  if (f.style) q = q.eq("style", f.style);
  if (f.areaMax) q = q.lte("area_sqm", f.areaMax);
  if (f.beds) q = f.beds >= 5 ? q.gte("bedrooms", 5) : q.eq("bedrooms", f.beds);
  if (f.land === "s") q = q.lt("min_land_sqwa", 50);
  if (f.land === "m") q = q.gte("min_land_sqwa", 50).lte("min_land_sqwa", 100);
  if (f.land === "l") q = q.gt("min_land_sqwa", 100);
  if (f.budget) {
    const [lo, hi] = BUDGETS[f.budget];
    q = q.gte("build_cost_min", lo).lt("build_cost_min", hi);
  }
  if (f.features?.length) q = q.contains("features", f.features);

  switch (f.sort) {
    case "price_asc": q = q.order("price", { ascending: true }); break;
    case "price_desc": q = q.order("price", { ascending: false }); break;
    case "area_asc": q = q.order("area_sqm", { ascending: true }); break;
    case "area_desc": q = q.order("area_sqm", { ascending: false }); break;
    case "newest": q = q.order("created_at", { ascending: false }); break;
    default: q = q.order("sort_order", { ascending: true });
  }
  const page = Math.max(1, f.page ?? 1);
  q = q.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data, count, error } = await q;
  if (error) console.error("listPlans", error.message);
  return { plans: (data ?? []) as Plan[], total: count ?? 0 };
}

export async function featuredPlans(limit = 4) {
  const sb = publicClient();
  if (!sb) return [] as Plan[];
  const { data } = await sb.from("plans").select("*").eq("is_published", true).order("sort_order").limit(limit);
  return (data ?? []) as Plan[];
}

export async function getPlan(code: string) {
  const sb = publicClient();
  if (!sb) return null;
  const { data } = await sb.from("plans").select("*").eq("code", code).eq("is_published", true).maybeSingle();
  return data as Plan | null;
}

export async function getPlans(codes: string[]) {
  const sb = publicClient();
  if (!sb || !codes.length) return [] as Plan[];
  const { data } = await sb.from("plans").select("*").in("code", codes).eq("is_published", true);
  const plans = (data ?? []) as Plan[];
  return codes.map((c) => plans.find((p) => p.code === c)).filter(Boolean) as Plan[];
}

export async function allPlanCodes() {
  const sb = publicClient();
  if (!sb) return [] as { code: string; name_en: string }[];
  const { data } = await sb.from("plans").select("code,name_en").eq("is_published", true).order("sort_order");
  return (data ?? []) as { code: string; name_en: string }[];
}

export async function planStats() {
  const sb = publicClient();
  if (!sb) return { total: 0, byStoreys: {} as Record<number, number>, byStyle: {} as Record<string, number> };
  const { data } = await sb.from("plans").select("storeys,style").eq("is_published", true);
  const rows = data ?? [];
  const byStoreys: Record<number, number> = {};
  const byStyle: Record<string, number> = {};
  for (const r of rows) {
    const s = r.storeys >= 3 ? 3 : r.storeys;
    byStoreys[s] = (byStoreys[s] ?? 0) + 1;
    byStyle[r.style] = (byStyle[r.style] ?? 0) + 1;
  }
  return { total: rows.length, byStoreys, byStyle };
}

export async function getBoq(planCode: string) {
  const sb = publicClient();
  if (!sb) return { plan: null as Plan | null, items: [] as BoqItem[] };
  const plan = await getPlan(planCode);
  if (!plan) return { plan: null, items: [] };
  const { data } = await sb.from("boq_items").select("*").eq("plan_id", plan.id).order("sort_order");
  return { plan, items: (data ?? []) as BoqItem[] };
}

export async function boqPlanCodes() {
  const sb = publicClient();
  if (!sb) return [] as string[];
  const { data } = await sb.from("boq_items").select("plans!inner(code)");
  const codes = new Set<string>();
  for (const r of (data ?? []) as unknown as { plans: { code: string } }[]) codes.add(r.plans.code);
  return [...codes];
}

export async function listProjects() {
  const sb = publicClient();
  if (!sb) return [] as Project[];
  const { data } = await sb.from("projects").select("*").eq("is_published", true).order("sort_order");
  return (data ?? []) as Project[];
}

export async function projectsForPlan(code: string) {
  const sb = publicClient();
  if (!sb) return [] as Project[];
  const { data } = await sb.from("projects").select("*").eq("plan_code", code).eq("is_published", true);
  return (data ?? []) as Project[];
}

export async function listReviews() {
  const sb = publicClient();
  if (!sb) return [] as Review[];
  const { data } = await sb.from("reviews").select("*").eq("is_published", true).order("sort_order");
  return (data ?? []) as Review[];
}
