import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/review-form";
import { teachers } from "@/lib/mock-data";

type RateTeacherPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RateTeacherPage({ params }: RateTeacherPageProps) {
  const { id } = await params;
  const teacher = teachers.find((item) => item.id === id);

  if (!teacher) notFound();

  return <ReviewForm teacherId={id} />;
}
