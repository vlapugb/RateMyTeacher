import { headers } from "next/headers";
import { CatalogView } from "@/components/catalog-view";
import { getInitialTeachers } from "@/lib/server-teacher-data";

export default async function TeachersPage() {
  const initialTeachers = await getInitialTeachers(await headers());

  return <CatalogView initialTeachers={initialTeachers} />;
}
