import { BookOpen } from "lucide-react";
import { courseText } from "@/lib/i18n";
import type { LanguagePreference } from "@/lib/preferences";
import type { Course } from "@/lib/types";

type ProfileCoursesSectionProps = {
  courses: Course[];
  language: LanguagePreference;
  noCoursesLabel: string;
  title: string;
};

export function ProfileCoursesSection({
  courses,
  language,
  noCoursesLabel,
  title,
}: ProfileCoursesSectionProps) {
  return (
    <section className="mt-7">
      <h2 className="text-2xl font900">{title}</h2>
      {courses.length ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {courses.map((course) => (
            <article
              key={course.id}
              className="interactive-card rounded-lg border border-line bg-white p-5 shadow-sm hover:border-primary/30"
            >
              <BookOpen className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-xl font900">{course.title}</h3>
              <p className="mt-2 text-sm font800 text-muted">
                {courseText[language]}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-line bg-white p-6 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-primary" />
          <h3 className="mt-3 text-lg font900">{noCoursesLabel}</h3>
        </div>
      )}
    </section>
  );
}

