import { CatalogView } from "@/components/catalog-view";
import { parseCatalogPageParam } from "@/lib/catalog-navigation";

type TeachersPageProps = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function TeachersPage({ searchParams }: TeachersPageProps) {
  const { q, sort, page } = await searchParams;
  const initialPage = parseCatalogPageParam(page);

  return (
    <CatalogView
      initialQuery={q ?? ""}
      initialSort={sort}
      initialPage={initialPage}
    />
  );
}
