export type CourseType = "math-mech";

export type MetricKey =
  | "knowledge"
  | "communication"
  | "leniency"
  | "fairness"
  | "vibe"
  | "overall";

export type Metric = {
  key: MetricKey;
  label: string;
  inverse?: boolean;
};

export type Course = {
  id: string;
  title: string;
  type: CourseType;
  semester: number;
  examFormat: string;
  rating: number;
  reviewCount: number;
  commentCount?: number;
};

export type Teacher = {
  id: string;
  fullName: string;
  shortName: string;
  courseTitle: string;
  type: CourseType;
  year: string;
  rating: number;
  reviewCount: number;
  commentCount: number;
  recommendedPercent: number;
  scores: Record<MetricKey, number>;
  courses: Course[];
  tags: string[];
  bio: string;
  saved?: boolean;
};

export type Review = {
  id: string;
  teacherId: string;
  author: string;
  initial: string;
  course: string;
  year: string;
  createdAt: string;
  createdAgo: string;
  rating: number;
  hasRating?: boolean;
  body: string;
  tags: string[];
  scores?: Partial<Record<MetricKey, number>>;
  comment?: string;
  liked?: string;
  difficult?: string;
  examProcess?: string;
  advice?: string;
  anonymous?: boolean;
  anonymousNumber?: number;
  likeCount?: number;
  likedByMe?: boolean;
  canEdit?: boolean;
};
