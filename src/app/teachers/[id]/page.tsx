import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  TeacherProfile,
  type TeacherTab,
} from "@/components/teacher-profile";
import { getInitialTeacherProfile } from "@/lib/server-teacher-data";

type TeacherPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function TeacherPage({
  params,
  searchParams,
}: TeacherPageProps) {
  const { id } = await params;
  const { tab } = await searchParams;
  const profile = await getInitialTeacherProfile(id, await headers());

  if (!profile) notFound();

  const activeTab: TeacherTab =
    tab === "courses" ? tab : "ratings";

  return (
    <TeacherProfile
      baseTeacher={profile.teacher}
      activeTab={activeTab}
      initialReviewsPage={profile.reviewsPage}
    />
  );
}
