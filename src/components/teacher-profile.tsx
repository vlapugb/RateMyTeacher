"use client";

import Link from "next/link";
<<<<<<< HEAD
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
=======
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
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
import {
  formatCommentCount,
  localizeMetrics,
} from "@/lib/i18n";
import { usePreferences, type LanguagePreference } from "@/lib/preferences";
import { APP_ROUTES } from "@/lib/app-routes";
import { REVIEW_CONFIG } from "@/lib/app-config";
import { deleteReview, getReviewsPage, getTeachers } from "@/lib/api-client";
import { useConfirm } from "@/components/confirm-dialog";
import type { ReviewsPageResponse } from "@/lib/api-contracts";
import type { Review, Teacher } from "@/lib/types";
import { readStoredCatalogHref } from "@/lib/catalog-navigation";
import { API_ROUTES, APP_ROUTES } from "@/lib/app-routes";
import { REVIEW_CONFIG, SHARE_COPIED_DISPLAY_MS } from "@/lib/app-config";
import { useSwipeNavigation } from "@/lib/swipe-navigation";

export type { TeacherTab } from "@/components/teacher-profile/profile-types";

type TeacherProfileProps = {
  baseTeacher: Teacher;
  activeTab: TeacherTab;
<<<<<<< HEAD
  baseReviews: Review[];
  catalogHref?: string;
=======
  initialReviewsPage: ReviewsPageResponse;
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
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
<<<<<<< HEAD
  baseReviews,
  catalogHref = APP_ROUTES.teachers,
=======
  initialReviewsPage,
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
}: TeacherProfileProps) {
  const router = useRouter();
  const { language } = usePreferences();
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
<<<<<<< HEAD
  const [backHref, setBackHref] = useState(catalogHref);
  const goBackToCatalog = useCallback(() => {
    router.replace(backHref, { scroll: false });
  }, [backHref, router]);
  const profileSwipe = useSwipeNavigation({
    onPrev: goBackToCatalog,
    onNext: () => undefined,
    canGoPrev: true,
    canGoNext: false,
    blockNativeBackSwipe: true,
  });

  useEffect(() => {
    queueMicrotask(() =>
      setBackHref(
        catalogHref === APP_ROUTES.teachers
          ? readStoredCatalogHref()
          : catalogHref,
      ),
    );
  }, [catalogHref]);
=======
  const skipInitialCommentLoad = useRef(true);
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)

  useEffect(() => {
    if (skipInitialCommentLoad.current) {
      skipInitialCommentLoad.current = false;
      return;
    }

    let active = true;
    const controller = new AbortController();

<<<<<<< HEAD
    fetch(API_ROUTES.teachers)
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { teachers?: Teacher[] } | null) => {
        const nextTeacher = body?.teachers?.find((item) => item.id === baseTeacher.id);
        if (active && nextTeacher) setTeacher(nextTeacher);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [baseTeacher.id]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
=======
    setCommentsLoading(true);
    getReviewsPage({
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
      teacherId: baseTeacher.id,
      limit: COMMENTS_PAGE_SIZE,
      offset: 0,
      sort: commentSort,
<<<<<<< HEAD
    });

    fetch(`${API_ROUTES.reviews}?${params.toString()}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((body: {
        reviews?: Review[];
        ownReview?: Review | null;
        total?: number;
        hasMore?: boolean;
      } | null) => {
=======
      signal: controller.signal,
    })
      .then((body) => {
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
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
        window.setTimeout(() => setShareStatus(null), SHARE_COPIED_DISPLAY_MS);
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

<<<<<<< HEAD
    const response = await fetch(
      API_ROUTES.reviewForTeacherById(teacher.id, review.id),
      {
        method: "DELETE",
      },
    ).catch(() => null);
=======
    const deleted = await deleteReview({ teacherId: teacher.id })
      .then(() => true)
      .catch(() => false);
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)

    if (!deleted) return;

    setTeacherReviews((current) =>
      current.filter((item) => item.id !== review.id),
    );
    setCommentsTotal((current) => Math.max(0, current - 1));
    setOwnReview((current) => (current?.id === review.id ? null : current));

<<<<<<< HEAD
    fetch(API_ROUTES.teachers)
      .then((teachersResponse) =>
        teachersResponse.ok ? teachersResponse.json() : null,
      )
      .then((body: { teachers?: Teacher[] } | null) => {
=======
    getTeachers()
      .then((body) => {
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
        const nextTeacher = body?.teachers?.find((item) => item.id === teacher.id);
        if (nextTeacher) setTeacher(nextTeacher);
      })
      .catch(() => undefined);
  }

  async function loadMoreComments() {
    setCommentsLoading(true);
<<<<<<< HEAD
    const body = (await fetch(`${API_ROUTES.reviews}?${params.toString()}`)
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null)) as {
      reviews?: Review[];
      total?: number;
      hasMore?: boolean;
    } | null;
=======
    const body = await getReviewsPage({
      teacherId: teacher.id,
      limit: COMMENTS_PAGE_SIZE,
      offset: teacherReviews.length,
      sort: commentSort,
    }).catch(() => null);
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
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
<<<<<<< HEAD
          href={backHref}
          onClick={(event) => {
            event.preventDefault();
            goBackToCatalog();
          }}
=======
          href={APP_ROUTES.teachers}
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
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

<<<<<<< HEAD
      <section className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="grid gap-6 p-5 md:p-6 xl:grid-cols-[1fr_340px] xl:items-end">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <TeacherAvatar name={teacher.fullName} size="lg" />
            <div className="min-w-0">
              <h1 className="text-3xl font900 tracking-tight text-foreground">
                {teacher.fullName}
              </h1>
              <p className="mt-2 text-sm font800 text-muted">
                {facultyText[language]}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <span className="text-4xl font900 text-foreground">
                  ★ {teacher.rating}
                </span>
                <RatingStars value={teacher.rating} size="lg" />
                <span className="text-sm font900 text-muted">
                  {formatReviewCount(teacher.reviewCount, language)}
                </span>
                <span className="text-sm font900 text-muted">
                  {formatCommentCount(teacher.commentCount, language)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <Link
              href={APP_ROUTES.teacherRate(teacher.id)}
              className="focus-ring inline-flex h-11 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-primary-strong px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:-translate-y-0.5 hover:brightness-105"
            >
              {ownReview ? copy.editRating : copy.rateTeacher}
            </Link>
            <div className="grid grid-cols-3 gap-2">
              {topMetrics.map((metric) => (
                <div
                  key={metric.key}
                  className="rounded-lg border border-line bg-slate-50 px-3 py-2 text-center"
                >
                  <div className="text-lg font900 text-primary">
                    {metric.value}
                  </div>
                  <div className="mt-1 line-clamp-2 text-[10px] font800 leading-3 text-muted">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
=======
      <ProfileHero
        language={language}
        rateHref={APP_ROUTES.teacherRate(teacher.id)}
        rateLabel={ownReview ? copy.editRating : copy.rateTeacher}
        teacher={teacher}
        topMetrics={topMetrics}
      />
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)

      <div className="mt-6">
        <ProfileTabs
          teacherId={teacher.id}
          activeTab={activeTab}
          courseCount={teacher.courses.length}
          copy={copy.tabs}
        />

        {activeTab === "ratings" && (
<<<<<<< HEAD
          <section className="mt-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font900">{copy.categoryRatings}</h2>
                <p className="mt-1 text-sm font700 text-muted">
                  {copy.categorySubtitle}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font900 text-slate-600">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {copy.overall} {teacher.scores.overall}
              </div>
            </div>
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {localizedMetrics.map((metric) => (
                <article
                  key={metric.key}
                  className="interactive-card rounded-lg border border-line bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h3 className="text-lg font900 text-slate-800">
                      {metric.label}
                    </h3>
                    <span className="text-3xl font900 text-primary">
                      {teacher.scores[metric.key]}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-primary-strong transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, teacher.scores[metric.key] * 20),
                        )}%`,
                      }}
                    />
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font900">{copy.studentComments}</h2>
                  <p className="mt-1 text-sm font700 text-muted">
                    {copy.publishedComments(commentsTotal)}
                  </p>
                </div>
                <label className="focus-within:ring-2 focus-within:ring-primary-strong inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font900 text-slate-600">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <select
                    value={commentSort}
                    onChange={(event) => {
                      setCommentsLoading(true);
                      setCommentSort(event.target.value as CommentSortKey);
                    }}
                    className="border-0 bg-transparent text-sm font900 outline-none"
                  >
                    <option value="newest">{copy.newest}</option>
                    <option value="highest">{copy.highest}</option>
                    <option value="lowest">{copy.lowest}</option>
                  </select>
                </label>
              </div>
              {commentsLoading && !comments.length ? (
                <div className="mt-5 rounded-lg border border-line bg-white p-5 text-sm font900 text-muted">
                  {copy.loadingComments}
                </div>
              ) : comments.length ? (
                <div className="mt-5 space-y-4 stagger-list">
                  {comments.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      editHref={APP_ROUTES.teacherRate(teacher.id)}
                      onDelete={handleDeleteReview}
                    />
                  ))}
                  {commentsHasMore && (
                    <button
                      type="button"
                      className="focus-ring inline-flex h-10 w-full items-center justify-center rounded-lg border border-line bg-white px-4 text-sm font900 text-slate-600 transition hover:border-primary hover:text-primary disabled:opacity-60 sm:w-auto"
                      disabled={commentsLoading}
                      onClick={loadMoreComments}
                    >
                      {commentsLoading
                        ? copy.loadingComments
                        : copy.loadMoreComments}
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-dashed border-line bg-white p-6 text-center">
                  <MessageSquareText className="mx-auto h-10 w-10 text-primary" />
                  <h3 className="mt-3 text-lg font900">
                    {copy.noComments}
                  </h3>
                  <Link
                    href={APP_ROUTES.teacherRate(teacher.id)}
                    className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-primary-strong px-4 text-sm font900 text-white shadow-sm shadow-blue-200 transition hover:-translate-y-0.5 hover:brightness-105"
                  >
                    {copy.firstComment}
                  </Link>
                </div>
              )}
            </div>
          </section>
=======
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
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
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
<<<<<<< HEAD

function TeacherTabs({
  teacherId,
  activeTab,
  courseCount,
  copy,
}: {
  teacherId: string;
  activeTab: TeacherTab;
  courseCount: number;
  copy: {
    ratings: string;
    courses: string;
  };
}) {
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
=======
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
