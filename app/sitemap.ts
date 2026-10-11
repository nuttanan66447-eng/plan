import type { MetadataRoute } from "next";
import { allPlanCodes, listCourses, listProducts } from "@/lib/data";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics = ["", "/plans", "/custom-design", "/boq", "/turnkey", "/portfolio", "/courses", "/shop", "/about"].map((p) => ({
    url: `${SITE.url}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  const plans = (await allPlanCodes()).map((p) => ({ url: `${SITE.url}/plans/${p.code}`, changeFrequency: "monthly" as const, priority: 0.7 }));
  const [courses, products] = await Promise.all([listCourses(), listProducts()]);
  const extra = [
    ...courses.map((c) => ({ url: `${SITE.url}/courses/${c.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...products.map((p) => ({ url: `${SITE.url}/shop/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
  return [...statics, ...plans, ...extra];
}
