import type { TouchEvent } from "react";
import { TeacherCard } from "@/components/teacher-card";
import type { Teacher } from "@/lib/types";

type TeacherGridProps = {
  teachers: Teacher[];
  onFavoriteChange: (teacherId: string, saved: boolean) => void;
  swipeStyle?: React.CSSProperties;
  onTouchStart?: (event: TouchEvent) => void;
  onTouchMove?: (event: TouchEvent) => void;
  onTouchEnd?: (event: TouchEvent) => void;
};

export function TeacherGrid({
  teachers,
  onFavoriteChange,
  swipeStyle,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: TeacherGridProps) {
  return (
    <section
      className="mt-5 grid gap-3 stagger-list sm:mt-7 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3"
      style={swipeStyle}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {teachers.map((teacher) => (
        <TeacherCard
          key={teacher.id}
          teacher={teacher}
          onFavoriteChange={onFavoriteChange}
        />
      ))}
    </section>
  );
}
