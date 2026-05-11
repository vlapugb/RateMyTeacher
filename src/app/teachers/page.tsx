import { CatalogView } from "@/components/catalog-view";
import { parseCatalogPageParam } from "@/lib/catalog-navigation";

type TeachersPageProps = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    order?: string;
    page?: string;
  }>;
};

export default async function TeachersPage({ searchParams }: TeachersPageProps) {
  const { q, sort, order, page } = await searchParams;
  const initialPage = parseCatalogPageParam(page);

  return (
    <CatalogView
      initialQuery={q ?? ""}
      initialSort={sort}
      initialOrder={order}
      initialPage={initialPage}
    />
  );
}
