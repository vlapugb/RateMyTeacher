import { describe, expect, it } from "vitest";
import { REVIEW_CONFIG } from "@/lib/app-config";
import { reviewWriteSchema } from "@/lib/api-contracts";

describe("reviewWriteSchema", () => {
  it("rejects empty reviews", () => {
    const result = reviewWriteSchema.safeParse({
      teacherId: "teacher-1",
      scores: {},
      comment: "",
    });

    expect(result.success).toBe(false);
  });

  it("allows anonymous text-only comments", () => {
    const result = reviewWriteSchema.safeParse({
      teacherId: "teacher-1",
      scores: {},
      comment: "Полезный комментарий",
      anonymous: true,
      publishAnonymously: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects text fields over the configured limit", () => {
    const result = reviewWriteSchema.safeParse({
      teacherId: "teacher-1",
      scores: {},
      comment: "x".repeat(REVIEW_CONFIG.textMaxLength + 1),
    });

    expect(result.success).toBe(false);
  });

  it("accepts a score-only review inside the rating scale", () => {
    const result = reviewWriteSchema.safeParse({
      teacherId: "teacher-1",
      scores: { knowledge: 5 },
      comment: "",
    });

    expect(result.success).toBe(true);
  });
});
