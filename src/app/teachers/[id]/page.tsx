import { notFound } from "next/navigation";
import {
  TeacherProfile,
  type TeacherTab,
} from "@/components/teacher-profile";
import { teachers } from "@/lib/mock-data";

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
  const teacher = teachers.find((item) => item.id === id);

  if (!teacher) notFound();

  const activeTab: TeacherTab =
    tab === "courses" ? tab : "ratings";

  return (
    <TeacherProfile
      baseTeacher={teacher}
      activeTab={activeTab}
      baseReviews={[]}
    />
  );
}
