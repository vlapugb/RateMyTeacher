import type { Metric } from "@/lib/types";

export type TeacherTab = "ratings" | "courses";

export type CommentSortKey = "newest" | "highest" | "lowest";

export type TopTeacherMetric = Metric & {
  value: number;
};

