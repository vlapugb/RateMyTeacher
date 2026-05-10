import type { LanguagePreference } from "@/lib/preferences";
import type { Metric, MetricKey } from "@/lib/types";

export const metricLabels: Record<
  MetricKey,
  Record<LanguagePreference, string>
> = {
  knowledge: {
    ru: "Знания",
    en: "Knowledge",
    zh: "知识水平",
  },
  communication: {
    ru: "В общении",
    en: "Communication",
    zh: "沟通",
  },
  leniency: {
    ru: "Халявность",
    en: "Leniency",
    zh: "宽松度",
  },
  fairness: {
    ru: "Справедливость оценивания",
    en: "Grading fairness",
    zh: "评分公平性",
  },
  vibe: {
    ru: "Вайбовость / мемность",
    en: "Vibe",
    zh: "课堂氛围",
  },
  overall: {
    ru: "Общая оценка",
    en: "Overall rating",
    zh: "总体评分",
  },
};

export const facultyText: Record<LanguagePreference, string> = {
  ru: "преподаватель математико-механического факультета СПбГУ",
  en: "teacher at the SPbU Faculty of Mathematics and Mechanics",
  zh: "圣彼得堡国立大学数学力学系教师",
};

export const courseText: Record<LanguagePreference, string> = {
  ru: "Дисциплина математико-механического факультета СПбГУ",
  en: "Course at the SPbU Faculty of Mathematics and Mechanics",
  zh: "圣彼得堡国立大学数学力学系课程",
};

export const genericReviewText: Record<
  LanguagePreference,
  {
    anonymous: string;
    anonymousTag: string;
    publishedReview: string;
    generalCourse: string;
    student: string;
  }
> = {
  ru: {
    anonymous: "Анонимно",
    anonymousTag: "анонимно",
    publishedReview: "Опубликованный отзыв",
    generalCourse: "Общая оценка преподавателя",
    student: "Студент",
  },
  en: {
    anonymous: "Anonymous",
    anonymousTag: "anonymous",
    publishedReview: "Published review",
    generalCourse: "General teacher review",
    student: "Student",
  },
  zh: {
    anonymous: "匿名",
    anonymousTag: "匿名",
    publishedReview: "已发布评价",
    generalCourse: "教师总体评价",
    student: "学生",
  },
};

export function localizeMetrics(
  metrics: Metric[],
  language: LanguagePreference,
) {
  return metrics.map((metric) => ({
    ...metric,
    label:
      metricLabels[metric.key]?.[language] ??
      metric.label ??
      metric.key,
  }));
}

export function formatReviewCount(value: number, language: LanguagePreference) {
  if (language === "en") return `${value} ${value === 1 ? "review" : "reviews"}`;
  if (language === "zh") return `${value} 条评价`;

  return `${value} ${getRussianPlural(value, ["оценка", "оценки", "оценок"])}`;
}

export function formatCommentCount(
  value: number,
  language: LanguagePreference,
) {
  if (language === "en") {
    return `${value} ${value === 1 ? "comment" : "comments"}`;
  }
  if (language === "zh") return `${value} 条评论`;

  return `${value} ${getRussianPlural(value, [
    "комментарий",
    "комментария",
    "комментариев",
  ])}`;
}

export function formatRelativeTime(
  createdAt: string,
  language: LanguagePreference,
) {
  const timestamp = new Date(createdAt).getTime();

  if (!Number.isFinite(timestamp)) {
    return {
      ru: "неизвестно",
      en: "unknown",
      zh: "未知",
    }[language];
  }

  const diff = Date.now() - timestamp;
  const minutes = Math.max(0, Math.floor(diff / 60000));

  if (minutes < 1) {
    return {
      ru: "только что",
      en: "just now",
      zh: "刚刚",
    }[language];
  }

  const locale = language === "zh" ? "zh-CN" : language;
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (minutes < 60) return formatter.format(-minutes, "minute");

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return formatter.format(-hours, "hour");

  const days = Math.floor(hours / 24);
  return formatter.format(-days, "day");
}

function getRussianPlural(value: number, forms: [string, string, string]) {
  const mod10 = Math.abs(value) % 10;
  const mod100 = Math.abs(value) % 100;

  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return forms[1];
  }

  return forms[2];
}
