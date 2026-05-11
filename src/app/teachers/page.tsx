import { headers } from "next/headers";
import { CatalogView } from "@/components/catalog-view";
<<<<<<< HEAD
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
=======
import { getInitialTeachers } from "@/lib/server-teacher-data";

export default async function TeachersPage() {
  const initialTeachers = await getInitialTeachers(await headers());

  return <CatalogView initialTeachers={initialTeachers} />;
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
}
