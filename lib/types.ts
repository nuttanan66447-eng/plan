export type PlanStyle = "nordic" | "japandi" | "tropical" | "modern" | "minimal";
export type PlanFeature = "tour360" | "dollhouse" | "universal" | "pool" | "narrow";

export interface Plan {
  id: string;
  code: string;
  name_en: string;
  name_th: string;
  series: string | null;
  style: PlanStyle;
  storeys: number;
  area_sqm: number;
  floor_areas: number[];
  bedrooms: number;
  bathrooms: number;
  parking: number;
  land_width: number | null;
  land_depth: number | null;
  min_land_sqwa: number | null;
  build_cost_min: number;
  build_cost_max: number;
  price: number;
  price_original: number | null;
  badge: string | null;
  tagline: string | null;
  description: string | null;
  image: string;
  gallery: string[];
  panorama: string | null;
  features: PlanFeature[];
  pages_arch: number | null;
  pages_struct: number | null;
  pages_mep: number | null;
}

export interface BoqItem {
  id: string;
  section_no: number;
  section_name: string;
  item_no: string;
  description: string;
  spec: string | null;
  qty: number;
  unit: string;
  material_rate: number;
  labor_rate: number;
}

export interface Project {
  id: string;
  code: string;
  title: string;
  style_label: string | null;
  district: string;
  province: string;
  plan_code: string | null;
  area_sqm: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  budget_million: number | null;
  highlight: string | null;
  description: string | null;
  quote: string | null;
  quote_by: string | null;
  handover_on: string | null;
  image: string;
  before_image: string | null;
  featured: boolean;
}

export interface Review {
  id: string;
  name: string;
  role: string | null;
  district: string | null;
  rating: number;
  body: string;
}

export type LeadType = "consult" | "custom_design" | "inspection" | "turnkey" | "boq" | "order" | "callback";
export type LeadStatus = "new" | "contacted" | "quoted" | "won" | "lost";

export interface Lead {
  id: string;
  type: LeadType;
  status: LeadStatus;
  name: string;
  phone: string;
  email: string | null;
  line_id: string | null;
  province: string | null;
  district: string | null;
  plan_code: string | null;
  service_package: string | null;
  land_width: number | null;
  land_depth: number | null;
  area_sqm: number | null;
  budget: string | null;
  estimate_thb: number | null;
  preferred_date: string | null;
  preferred_slot: string | null;
  message: string | null;
  meta: Record<string, unknown>;
  admin_note: string | null;
  created_at: string;
}
