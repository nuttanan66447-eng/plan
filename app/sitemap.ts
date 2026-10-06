import type { MetadataRoute } from "next";
import { allPlanCodes } from "@/lib/data";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics = ["", "/plans", "/custom-design", "/boq", "/turnkey", "/portfolio", "/about"].map((p) => ({
    url: `${SITE.url}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  const plans = (await allPlanCodes()).map((p) => ({ url: `${SITE.url}/plans/${p.code}`, changeFrequency: "monthly" as const, priority: 0.7 }));
  return [...statics, ...plans];
}
