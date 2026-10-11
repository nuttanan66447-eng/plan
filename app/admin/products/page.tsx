import { CatalogListPage } from "@/components/admin/CatalogAdmin";

export const dynamic = "force-dynamic";

export default function Page({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  return <CatalogListPage kind="product" searchParams={searchParams} />;
}
