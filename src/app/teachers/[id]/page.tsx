import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  TeacherProfile,
  type TeacherTab,
} from "@/components/teacher-profile";
<<<<<<< HEAD
import { getSafeCatalogHref } from "@/lib/catalog-navigation";
import { teachers } from "@/lib/mock-data";
=======
import { getInitialTeacherProfile } from "@/lib/server-teacher-data";
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)

type TeacherPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; from?: string }>;
};

export default async function TeacherPage({
  params,
  searchParams,
}: TeacherPageProps) {
  const { id } = await params;
<<<<<<< HEAD
  const { tab, from } = await searchParams;
  const teacher = teachers.find((item) => item.id === id);
=======
  const { tab } = await searchParams;
  const profile = await getInitialTeacherProfile(id, await headers());
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)

  if (!profile) notFound();

  const activeTab: TeacherTab =
    tab === "courses" ? tab : "ratings";
  const catalogHref = getSafeCatalogHref(from);

  return (
    <TeacherProfile
      baseTeacher={profile.teacher}
      activeTab={activeTab}
<<<<<<< HEAD
      baseReviews={[]}
      catalogHref={catalogHref}
=======
      initialReviewsPage={profile.reviewsPage}
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
    />
  );
}
