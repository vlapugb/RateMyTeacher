import Link from "next/link";
import { cn } from "@/lib/utils";
import { APP_ROUTES } from "@/lib/app-routes";
import type { TeacherTab } from "@/components/teacher-profile/profile-types";

type ProfileTabsProps = {
  activeTab: TeacherTab;
  copy: {
    ratings: string;
    courses: string;
  };
  courseCount: number;
  teacherId: string;
};

export function ProfileTabs({
  activeTab,
  copy,
  courseCount,
  teacherId,
}: ProfileTabsProps) {
  const tabs = [
    { id: "ratings", label: copy.ratings, href: APP_ROUTES.teacher(teacherId) },
    {
      id: "courses",
      label: `${copy.courses} (${courseCount})`,
      href: APP_ROUTES.teacherCourses(teacherId),
    },
  ] as const;

  return (
    <nav className="flex gap-8 overflow-x-auto border-b border-line text-sm font900 text-muted">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={cn(
            "shrink-0 border-b-3 border-transparent pb-3 transition hover:text-primary",
            activeTab === tab.id && "border-primary text-primary",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

