import { describe, expect, it } from "vitest";
import { applyStatsToTeacher } from "@/lib/teacher-model";
import type { Teacher } from "@/lib/types";

const teacher: Teacher = {
  id: "teacher-1",
  fullName: "Иванов Иван Иванович",
  shortName: "Иванов И. И.",
  courseTitle: "Общая оценка преподавателя",
  type: "math-mech",
  year: "2026",
  rating: 0,
  reviewCount: 0,
  commentCount: 0,
  recommendedPercent: 0,
  scores: {
    knowledge: 0,
    communication: 0,
    leniency: 0,
    fairness: 0,
    vibe: 0,
    overall: 0,
  },
  courses: [],
  tags: [],
  bio: "",
};

describe("applyStatsToTeacher", () => {
  it("uses the category average when overall is absent", () => {
    const result = applyStatsToTeacher(
      teacher,
      {
        teacherId: teacher.id,
        reviewCount: 2,
        commentCount: 1,
        scores: {
          knowledge: 5,
          communication: 3,
        },
      },
      false,
    );

    expect(result.rating).toBe(4);
    expect(result.scores.overall).toBe(0);
  });

  it("prefers explicit overall score", () => {
    const result = applyStatsToTeacher(
      teacher,
      {
        teacherId: teacher.id,
        reviewCount: 1,
        commentCount: 1,
        scores: {
          knowledge: 5,
          overall: 2,
        },
      },
      true,
    );

    expect(result.rating).toBe(2);
    expect(result.saved).toBe(true);
  });
});
