import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/review-form";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { teachers } from "@/lib/teacher-catalog";
import { getOwnReview } from "@/lib/teacher-store";

type RateTeacherPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RateTeacherPage({ params }: RateTeacherPageProps) {
  const { id } = await params;
  const teacher = teachers.find((item) => item.id === id);

  if (!teacher) notFound();

  const ownReview = await auth.api
    .getSession({ headers: await headers() })
    .then((session) => (session ? getOwnReview(id, session.user.id) : null))
    .catch((error) => {
      logger.error({ err: error, teacherId: id }, "Failed to load own review");
      return null;
    });

  return <ReviewForm teacherId={id} initialOwnReview={ownReview} />;
}
