import { notFound } from "next/navigation";
import {
  TeacherProfile,
  type TeacherTab,
} from "@/components/teacher-profile";
import { getSafeCatalogHref } from "@/lib/catalog-navigation";
import { teachers } from "@/lib/mock-data";

type TeacherPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; from?: string }>;
};

export default async function TeacherPage({
  params,
  searchParams,
}: TeacherPageProps) {
  const { id } = await params;
  const { tab, from } = await searchParams;
  const teacher = teachers.find((item) => item.id === id);

  if (!teacher) notFound();

  const activeTab: TeacherTab =
    tab === "courses" ? tab : "ratings";
  const catalogHref = getSafeCatalogHref(from);

  return (
    <TeacherProfile
      baseTeacher={teacher}
      activeTab={activeTab}
      baseReviews={[]}
      catalogHref={catalogHref}
    />
  );
}
