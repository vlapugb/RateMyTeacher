import { describe, expect, it } from "vitest";
import { API_ROUTES, APP_ROUTES } from "@/lib/app-routes";
import {
  isStudentEmailMatchingLogin,
  isStudentLogin,
  normalizeStudentIdentifier,
} from "@/lib/student-identity";

describe("routes", () => {
  it("encodes teacher identifiers in public routes", () => {
    expect(APP_ROUTES.teacher("a/b c")).toBe("/teachers/a%2Fb%20c");
    expect(APP_ROUTES.teacherRate("a/b c")).toBe(
      "/teachers/a%2Fb%20c/rate",
    );
  });

  it("builds review routes with encoded query params", () => {
    expect(API_ROUTES.reviewForTeacherById("t/1", "r 1")).toBe(
      "/api/reviews?teacherId=t%2F1&reviewId=r%201",
    );
  });
});

describe("student identity", () => {
  it("normalizes identifiers", () => {
    expect(normalizeStudentIdentifier(" ST075512@student.spbu.ru ")).toBe(
      "st075512@student.spbu.ru",
    );
  });

  it("validates matching student login and email", () => {
    expect(isStudentLogin("st075512")).toBe(true);
    expect(
      isStudentEmailMatchingLogin("st075512@student.spbu.ru", "st075512"),
    ).toBe(true);
    expect(
      isStudentEmailMatchingLogin("st000000@student.spbu.ru", "st075512"),
    ).toBe(false);
  });
});
