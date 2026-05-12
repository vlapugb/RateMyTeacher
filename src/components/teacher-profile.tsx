"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Share2 } from "lucide-react";
import { ProfileCommentsSection } from "@/components/teacher-profile/profile-comments-section";
import { ProfileCoursesSection } from "@/components/teacher-profile/profile-courses-section";
import { ProfileHero } from "@/components/teacher-profile/profile-hero";
import { ProfileRatingsSection } from "@/components/teacher-profile/profile-ratings-section";
import { ProfileTabs } from "@/components/teacher-profile/profile-tabs";
import type {
  CommentSortKey,
  TeacherTab,
} from "@/components/teacher-profile/profile-types";
import { metrics } from "@/lib/teacher-catalog";
import {
  formatCommentCount,
  localizeMetrics,
} from "@/lib/i18n";
import { usePreferences, type LanguagePreference } from "@/lib/preferences";
import { APP_ROUTES } from "@/lib/app-routes";
import { REVIEW_CONFIG } from "@/lib/app-config";
import { deleteReview, getReviewsPage, getTeachers } from "@/lib/api-client";
import { useConfirm } from "@/components/confirm-dialog";
import { useSwipeNavigation } from "@/lib/swipe-navigation";
import type { ReviewsPageResponse } from "@/lib/api-contracts";
import type { Review, Teacher } from "@/lib/types";

export type { TeacherTab } from "@/components/teacher-profile/profile-types";

type TeacherProfileProps = {
  baseTeacher: Teacher;
  activeTab: TeacherTab;
  initialReviewsPage: ReviewsPageResponse;
  targetReviewId?: string;
};

const COMMENTS_PAGE_SIZE = REVIEW_CONFIG.defaultPageSize;

const profileCopy: Record<
  LanguagePreference,
  {
    backToCatalog: string;
    share: string;
    shareText: (teacherName: string) => string;
    shareCopied: string;
    deleteConfirm: string;
    editRating: string;
    rateTeacher: string;
    categoryRatings: string;
    categorySubtitle: string;
    overall: string;
    studentComments: string;
    publishedComments: (count: number) => string;
    newest: string;
    highest: string;
    lowest: string;
    noComments: string;
    firstComment: string;
    loadMoreComments: string;
    loadingComments: string;
    teacherCourses: string;
    noCourses: string;
    tabs: {
      ratings: string;
      courses: string;
    };
  }
> = {
  ru: {
    backToCatalog: "Назад к каталогу",
    share: "Поделиться",
    shareText: (teacherName) =>
      `Профиль преподавателя ${teacherName} в StudRadar`,
    shareCopied: "Ссылка скопирована",
    deleteConfirm: "Удалить вашу оценку преподавателя?",
    editRating: "Изменить оценку",
    rateTeacher: "Оставить отзыв",
    categoryRatings: "Оценки по категориям",
    categorySubtitle: "Среднее по опубликованным оценкам студентов.",
    overall: "Общая",
    studentComments: "Комментарии студентов",
    publishedComments: (count) =>
      `${formatCommentCount(count, "ru")} опубликовано`,
    newest: "Сначала новые",
    highest: "С высокой оценкой",
    lowest: "С низкой оценкой",
    noComments: "Комментариев пока нет",
    firstComment: "Оставить первый комментарий",
    loadMoreComments: "Показать ещё",
    loadingComments: "Загружаем комментарии...",
    teacherCourses: "Курсы преподавателя",
    noCourses: "Дисциплины не указаны",
    tabs: {
      ratings: "Оценки",
      courses: "Курсы",
    },
  },
  en: {
    backToCatalog: "Back to catalog",
    share: "Share",
    shareText: (teacherName) => `${teacherName}'s profile on StudRadar`,
    shareCopied: "Link copied",
    deleteConfirm: "Delete your teacher review?",
    editRating: "Edit review",
    rateTeacher: "Leave a review",
    categoryRatings: "Category ratings",
    categorySubtitle: "Average across published student reviews.",
    overall: "Overall",
    studentComments: "Student comments",
    publishedComments: (count) =>
      `${formatCommentCount(count, "en")} published`,
    newest: "Newest first",
    highest: "Highest rated",
    lowest: "Lowest rated",
    noComments: "No comments yet",
    firstComment: "Leave the first comment",
    loadMoreComments: "Load more",
    loadingComments: "Loading comments...",
    teacherCourses: "Teacher courses",
    noCourses: "No courses listed",
    tabs: {
      ratings: "Ratings",
      courses: "Courses",
    },
  },
  zh: {
    backToCatalog: "返回目录",
    share: "分享",
    shareText: (teacherName) => `${teacherName} 在 StudRadar 上的主页`,
    shareCopied: "链接已复制",
    deleteConfirm: "删除你的教师评价？",
    editRating: "编辑评价",
    rateTeacher: "留下评价",
    categoryRatings: "分类评分",
    categorySubtitle: "基于已发布学生评价的平均值。",
    overall: "总体",
    studentComments: "学生评论",
    publishedComments: (count) => `已发布 ${formatCommentCount(count, "zh")}`,
    newest: "最新优先",
    highest: "高分优先",
    lowest: "低分优先",
    noComments: "暂无评论",
    firstComment: "留下第一条评论",
    loadMoreComments: "加载更多",
    loadingComments: "正在加载评论...",
    teacherCourses: "教师课程",
    noCourses: "暂无课程",
    tabs: {
      ratings: "评分",
      courses: "课程",
    },
  },
};

export function TeacherProfile({
  baseTeacher,
  activeTab,
  initialReviewsPage,
  targetReviewId,
}: TeacherProfileProps) {
  const { language } = usePreferences();
  const router = useRouter();
  const confirm = useConfirm();
  const copy = profileCopy[language];
  const [teacher, setTeacher] = useState(baseTeacher);
  const [teacherReviews, setTeacherReviews] = useState<Review[]>(
    initialReviewsPage.reviews,
  );
  const [ownReview, setOwnReview] = useState<Review | null>(
    initialReviewsPage.ownReview,
  );
  const [commentsTotal, setCommentsTotal] = useState(initialReviewsPage.total);
  const [commentsHasMore, setCommentsHasMore] = useState(
    initialReviewsPage.hasMore,
  );
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSort, setCommentSort] = useState<CommentSortKey>("newest");
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const skipInitialCommentLoad = useRef(true);

  const profileSwipe = useSwipeNavigation({
    onPrev: () => router.replace(APP_ROUTES.teachers),
    onNext: () => undefined,
    canGoPrev: true,
    canGoNext: false,
    blockNativeBackSwipe: true,
  });

  useEffect(() => {
    if (skipInitialCommentLoad.current) {
      skipInitialCommentLoad.current = false;
      return;
    }

    let active = true;
    const controller = new AbortController();

    setCommentsLoading(true);
    getReviewsPage({
      teacherId: baseTeacher.id,
      limit: COMMENTS_PAGE_SIZE,
      offset: 0,
      sort: commentSort,
      signal: controller.signal,
    })
      .then((body) => {
        if (!active) return;
        setTeacherReviews(body.reviews);
        setOwnReview(body.ownReview);
        setCommentsTotal(body.total);
        setCommentsHasMore(body.hasMore);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setCommentsLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [baseTeacher.id, commentSort]);
  const comments = teacherReviews;
  const localizedMetrics = useMemo(
    () => localizeMetrics(metrics, language),
    [language],
  );
  const topMetrics = localizedMetrics
    .filter((metric) => metric.key !== "overall")
    .map((metric) => ({
      ...metric,
      value: teacher.scores[metric.key],
    }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 3);

  useEffect(() => {
    if (!targetReviewId || !teacherReviews.length) return;
    const el = document.getElementById(`review-${targetReviewId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("ring-2", "ring-primary", "ring-offset-2");
    const timeout = window.setTimeout(() => {
      el.classList.remove("ring-2", "ring-primary", "ring-offset-2");
    }, 3000);
    return () => window.clearTimeout(timeout);
  }, [targetReviewId, teacherReviews]);

  async function handleShare() {
    const url = `${window.location.origin}${APP_ROUTES.teacher(teacher.id)}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: teacher.fullName,
          text: copy.shareText(teacher.fullName),
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShareStatus(copy.shareCopied);
        window.setTimeout(() => setShareStatus(null), 1800);
      }
    } catch {
      setShareStatus(null);
    }
  }

  async function handleDeleteReview(review: Review) {
    if (!review.canEdit) return;
    const confirmed = await confirm({
      message: copy.deleteConfirm,
      variant: "danger",
      confirmLabel: language === "ru" ? "Удалить" : language === "zh" ? "删除" : "Delete",
      cancelLabel: language === "ru" ? "Отмена" : language === "zh" ? "取消" : "Cancel",
    });
    if (!confirmed) return;

    const deleted = await deleteReview({ teacherId: teacher.id })
      .then(() => true)
      .catch(() => false);

    if (!deleted) return;

    setTeacherReviews((current) =>
      current.filter((item) => item.id !== review.id),
    );
    setCommentsTotal((current) => Math.max(0, current - 1));
    setOwnReview(null);

    getTeachers()
      .then((body) => {
        const nextTeacher = body?.teachers?.find((item) => item.id === teacher.id);
        if (nextTeacher) setTeacher(nextTeacher);
      })
      .catch(() => undefined);
  }

  async function loadMoreComments() {
    setCommentsLoading(true);
    const body = await getReviewsPage({
      teacherId: teacher.id,
      limit: COMMENTS_PAGE_SIZE,
      offset: teacherReviews.length,
      sort: commentSort,
    }).catch(() => null);
    setCommentsLoading(false);

    setTeacherReviews((current) => [...current, ...(body?.reviews ?? [])]);
    setCommentsTotal(body?.total ?? commentsTotal);
    setCommentsHasMore(Boolean(body?.hasMore));
  }

  return (
    <div
      className="page-soft-enter px-5 pb-8 md:px-8"
      style={profileSwipe.containerStyle}
      onTouchStart={profileSwipe.onTouchStart}
      onTouchMove={profileSwipe.onTouchMove}
      onTouchEnd={(event) => profileSwipe.onTouchEnd(event)}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 py-5">
        <Link
          href={APP_ROUTES.teachers}
          className="inline-flex items-center gap-2 text-sm font900 text-slate-600 transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {copy.backToCatalog}
        </Link>
        <div className="flex items-center gap-3">
          {shareStatus && (
            <span className="text-xs font800 text-success">{shareStatus}</span>
          )}
          <button
            type="button"
            onClick={handleShare}
            className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font900 text-slate-600 transition hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-sm"
          >
            <Share2 className="h-4 w-4" />
            {copy.share}
          </button>
        </div>
      </div>

      <ProfileHero
        language={language}
        rateHref={APP_ROUTES.teacherRate(teacher.id)}
        rateLabel={ownReview ? copy.editRating : copy.rateTeacher}
        teacher={teacher}
        topMetrics={topMetrics}
      />

      <div className="mt-6">
        <ProfileTabs
          teacherId={teacher.id}
          activeTab={activeTab}
          courseCount={teacher.courses.length}
          copy={copy.tabs}
        />

        {activeTab === "ratings" && (
          <>
            <ProfileRatingsSection
              categorySubtitle={copy.categorySubtitle}
              categoryTitle={copy.categoryRatings}
              localizedMetrics={localizedMetrics}
              overallLabel={copy.overall}
              teacher={teacher}
            />
            <ProfileCommentsSection
              comments={comments}
              commentsHasMore={commentsHasMore}
              commentsLoading={commentsLoading}
              commentsTotal={commentsTotal}
              copy={copy}
              sort={commentSort}
              teacherId={teacher.id}
              onDelete={handleDeleteReview}
              onLoadMore={loadMoreComments}
              onSortChange={(nextSort) => {
                setCommentsLoading(true);
                setCommentSort(nextSort);
              }}
            />
          </>
        )}

        {activeTab === "courses" && (
          <ProfileCoursesSection
            courses={teacher.courses}
            language={language}
            noCoursesLabel={copy.noCourses}
            title={copy.teacherCourses}
          />
        )}
      </div>
    </div>
  );
}
