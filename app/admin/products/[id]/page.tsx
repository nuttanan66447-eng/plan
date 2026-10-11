import { CatalogEditPage } from "@/components/admin/CatalogAdmin";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <CatalogEditPage kind="product" id={(await params).id} />;
}
