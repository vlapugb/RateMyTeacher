"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MessageSquareText,
  Star,
  UsersRound,
  X,
} from "lucide-react";
import { metrics } from "@/lib/teacher-catalog";
import { CatalogControls } from "@/components/catalog/catalog-controls";
import type { SortDirection } from "@/components/catalog/catalog-controls";
import { CatalogIntro } from "@/components/catalog/catalog-intro";
import {
  CatalogPagination,
  type PaginationItem,
} from "@/components/catalog/catalog-pagination";
import { CatalogSummary } from "@/components/catalog/catalog-summary";
import type { CatalogSortKey } from "@/components/catalog/catalog-types";
import { TeacherGrid } from "@/components/catalog/teacher-grid";
import type { Review, Teacher } from "@/lib/types";
import { usePreferences, type LanguagePreference } from "@/lib/preferences";
import { formatRelativeTime, localizeMetrics } from "@/lib/i18n";
import { APP_ROUTES } from "@/lib/app-routes";
import { STORAGE_KEYS } from "@/lib/app-config";
import { useSwipeNavigation } from "@/lib/swipe-navigation";

const PAGE_SIZE = 6;
const STATE_STORAGE_KEY = "studradar:catalog-state";

type CatalogState = {
  query: string;
  sortKey: CatalogSortKey;
  sortDirection: SortDirection;
  page: number;
};

function readSavedState(): CatalogState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STATE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CatalogState;
  } catch {
    return null;
  }
}

function saveState(state: CatalogState) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

const catalogCopy: Record<
  LanguagePreference,
  {
    title: string;
    subtitle: string;
    teachers: string;
    reviews: string;
    comments: string;
    search: string;
    all: string;
    sorting: string;
    byRating: string;
    byComments: string;
    byReviews: string;
    introTitle: string;
    introText: string;
    introDismiss: string;
    introClose: string;
    shown: string;
    of: string;
    previousPage: string;
    nextPage: string;
    recentTitle: string;
    recentLoading: string;
    recentEmpty: string;
    recentClose: string;
    ratingOnly: string;
    unknownTeacher: string;
  }
> = {
  ru: {
    title: "Найдите преподавателя",
    subtitle: "математико-механического факультета СПбГУ",
    teachers: "преподавателей",
    reviews: "оценок",
    comments: "комментариев",
    search: "Поиск преподавателя",
    all: "Все преподаватели",
    sorting: "Сортировка",
    byRating: "По рейтингу",
    byComments: "По комментариям",
    byReviews: "По оценкам",
    introTitle: "Зачем нужен StudRadar?",
    introText:
      "Студенты делятся реальным опытом о преподавателях, чтобы вместо слухов из чатов была прозрачная и честная карта качества образования.",
    introDismiss: "Понятно, больше не показывать",
    introClose: "Закрыть подсказку",
    shown: "Показано",
    of: "из",
    previousPage: "Предыдущая страница",
    nextPage: "Следующая страница",
    recentTitle: "Последние {what}",
    recentLoading: "Загружаем...",
    recentEmpty: "Пока ничего нет",
    recentClose: "Закрыть",
    ratingOnly: "Оценка без комментария",
    unknownTeacher: "Преподаватель",
  },
  en: {
    title: "Find a teacher",
    subtitle: "from the SPbU Faculty of Mathematics and Mechanics",
    teachers: "teachers",
    reviews: "reviews",
    comments: "comments",
    search: "Search teacher",
    all: "All teachers",
    sorting: "Sort",
    byRating: "By rating",
    byComments: "By comments",
    byReviews: "By reviews",
    introTitle: "Why StudRadar?",
    introText:
      "Students share real teacher experience, so course choices are based on a transparent map instead of chat rumors.",
    introDismiss: "Got it, do not show again",
    introClose: "Close hint",
    shown: "Showing",
    of: "of",
    previousPage: "Previous page",
    nextPage: "Next page",
    recentTitle: "Latest {what}",
    recentLoading: "Loading...",
    recentEmpty: "Nothing here yet",
    recentClose: "Close",
    ratingOnly: "Rating without a comment",
    unknownTeacher: "Teacher",
  },
  zh: {
    title: "查找教师",
    subtitle: "圣彼得堡国立大学数学力学系",
    teachers: "位教师",
    reviews: "条评分",
    comments: "条评论",
    search: "搜索教师",
    all: "全部教师",
    sorting: "排序",
    byRating: "按评分",
    byComments: "按评论",
    byReviews: "按评价数",
    introTitle: "为什么使用 StudRadar？",
    introText: "学生分享真实的教师体验，让选课不再依赖聊天传闻。",
    introDismiss: "知道了，不再显示",
    introClose: "关闭提示",
    shown: "显示",
    of: "共",
    previousPage: "上一页",
    nextPage: "下一页",
    recentTitle: "最新{what}",
    recentLoading: "加载中...",
    recentEmpty: "暂无内容",
    recentClose: "关闭",
    ratingOnly: "无评论评分",
    unknownTeacher: "教师",
  },
};

type CatalogViewProps = {
  initialTeachers: Teacher[];
};

type RecentKind = "reviews" | "comments";

export function CatalogView({ initialTeachers }: CatalogViewProps) {
  const { language } = usePreferences();
  const copy = catalogCopy[language];
  const localizedMetrics = useMemo(
    () => localizeMetrics(metrics, language),
    [language],
  );
  const savedState = readSavedState();
  const [query, setQuery] = useState(savedState?.query ?? "");
  const [sortKey, setSortKey] = useState<CatalogSortKey>(
    savedState?.sortKey ?? "rating",
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    savedState?.sortDirection ?? "desc",
  );
  const [currentPage, setCurrentPage] = useState(savedState?.page ?? 1);
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEYS.introDismissed) !== "true";
  });
  const [catalogTeachers, setCatalogTeachers] =
    useState<Teacher[]>(initialTeachers);
  const [recentKind, setRecentKind] = useState<RecentKind | null>(null);
  const [recentItems, setRecentItems] = useState<Review[] | null>(null);

  useEffect(() => {
    if (!showIntro) return;
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEYS.introDismissed, "true");
      setShowIntro(false);
    }, 12000);
    return () => window.clearTimeout(timer);
  }, [showIntro]);

  useEffect(() => {
    saveState({ query, sortKey, sortDirection, page: currentPage });
  }, [query, sortKey, sortDirection, currentPage]);

  useEffect(() => {
    if (!recentKind) return;
    const controller = new AbortController();
    fetch(`/api/reviews/recent?kind=${recentKind}&limit=10`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => setRecentItems(data.reviews ?? []))
      .catch(() => setRecentItems([]));
    return () => controller.abort();
  }, [recentKind]);

  const teacherMap = useMemo(
    () => new Map(catalogTeachers.map((t) => [t.id, t])),
    [catalogTeachers],
  );

  const totalReviews = useMemo(
    () => catalogTeachers.reduce((sum, t) => sum + t.reviewCount, 0),
    [catalogTeachers],
  );
  const totalComments = useMemo(
    () => catalogTeachers.reduce((sum, t) => sum + (t.commentCount ?? 0), 0),
    [catalogTeachers],
  );

  const filteredTeachers = useMemo(() => {
    const filtered = catalogTeachers.filter((teacher) => {
      const haystack = teacher.fullName.toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    });

    const scored = filtered.filter((t) => getSortValue(t, sortKey) > 0);
    const unscored = filtered.filter((t) => getSortValue(t, sortKey) === 0);

    const sorted = scored.sort((left, right) => {
      const diff = getSortValue(right, sortKey) - getSortValue(left, sortKey);
      return sortDirection === "desc" ? diff : -diff;
    });

    return [...sorted, ...unscored];
  }, [catalogTeachers, query, sortKey, sortDirection]);
  const pageCount = Math.max(1, Math.ceil(filteredTeachers.length / PAGE_SIZE));
  const swipe = useSwipeNavigation({
    onPrev: () => setCurrentPage((page) => Math.max(1, page - 1)),
    onNext: () => setCurrentPage((page) => Math.min(pageCount, page + 1)),
    canGoPrev: currentPage > 1,
    canGoNext: currentPage < pageCount,
  });
  const visibleTeachers = filteredTeachers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const start = filteredTeachers.length
    ? (currentPage - 1) * PAGE_SIZE + 1
    : 0;
  const end = Math.min(currentPage * PAGE_SIZE, filteredTeachers.length);
  const paginationItems = getPaginationItems(currentPage, pageCount);

  function dismissIntro() {
    window.localStorage.setItem(STORAGE_KEYS.introDismissed, "true");
    setShowIntro(false);
  }

  function openRecent(kind: RecentKind) {
    setRecentKind(kind);
    setRecentItems(null);
  }

  function closeRecent() {
    setRecentKind(null);
    setRecentItems(null);
  }

  const recentWhat =
    recentKind === "reviews"
      ? copy.reviews
      : copy.comments;

  return (
    <div className="page-soft-enter px-3 pb-6 sm:px-5 sm:pb-8 md:px-8">
      <section className="pt-4 sm:pt-6">
        <div className="max-w-3xl">
          <h1 className="text-2xl font900 tracking-tight text-foreground sm:text-4xl">
            {copy.title}
            <span className="block text-slate-400">
              {copy.subtitle}
            </span>
          </h1>
        </div>

        <CatalogSummary
          items={[
            { Icon: UsersRound, value: catalogTeachers.length, label: copy.teachers },
            {
              Icon: Star,
              value: totalReviews,
              label: copy.reviews,
              onClick: () => openRecent("reviews"),
            },
            {
              Icon: MessageSquareText,
              value: totalComments,
              label: copy.comments,
              onClick: () => openRecent("comments"),
            },
          ]}
        />

        <CatalogControls
          allLabel={copy.all}
          byCommentsLabel={copy.byComments}
          byRatingLabel={copy.byRating}
          byReviewsLabel={copy.byReviews}
          localizedMetrics={localizedMetrics}
          query={query}
          searchLabel={copy.search}
          sortingLabel={copy.sorting}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onQueryChange={(nextQuery) => {
            setQuery(nextQuery);
            setCurrentPage(1);
          }}
          onSortChange={(nextSortKey) => {
            setSortKey(nextSortKey);
            setCurrentPage(1);
          }}
          onSortDirectionToggle={() =>
            setSortDirection((d) => (d === "desc" ? "asc" : "desc"))
          }
        />

        {showIntro && (
          <CatalogIntro
            closeLabel={copy.introClose}
            dismissLabel={copy.introDismiss}
            text={copy.introText}
            title={copy.introTitle}
            onDismiss={dismissIntro}
          />
        )}
      </section>

      <TeacherGrid
        teachers={visibleTeachers}
        onFavoriteChange={(teacherId, saved) => {
          setCatalogTeachers((current) =>
            current.map((item) =>
              item.id === teacherId ? { ...item, saved } : item,
            ),
          );
        }}
        swipeStyle={swipe.containerStyle}
        onTouchStart={swipe.onTouchStart}
        onTouchMove={swipe.onTouchMove}
        onTouchEnd={(event) => swipe.onTouchEnd(event)}
      />

      <CatalogPagination
        currentPage={currentPage}
        end={end}
        itemLabel={copy.teachers}
        items={paginationItems}
        nextLabel={copy.nextPage}
        pageCount={pageCount}
        previousLabel={copy.previousPage}
        shownLabel={copy.shown}
        start={start}
        total={filteredTeachers.length}
        totalLabel={copy.of}
        onPageChange={setCurrentPage}
      />

      {recentKind && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-2 sm:items-center sm:p-4"
          onClick={closeRecent}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-xl bg-white shadow-xl sm:rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="text-lg font900">
                {copy.recentTitle.replace("{what}", recentWhat)}
              </h2>
              <button
                type="button"
                onClick={closeRecent}
                className="focus-ring rounded-lg p-1.5 text-slate-400 hover:text-slate-600"
                aria-label={copy.recentClose}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              {recentItems === null ? (
                <p className="py-8 text-center text-sm font700 text-muted">
                  {copy.recentLoading}
                </p>
              ) : recentItems.length === 0 ? (
                <p className="py-8 text-center text-sm font800 text-muted">
                  {copy.recentEmpty}
                </p>
              ) : (
                <div className="space-y-3">
                  {recentItems.map((review) => {
                    const teacher = teacherMap.get(review.teacherId);
                    const teacherName =
                      teacher?.fullName ?? copy.unknownTeacher;
                    const timeAgo = formatRelativeTime(
                      review.createdAt,
                      language,
                    );
                    const snippet =
                      review.body.length > 100
                        ? review.body.slice(0, 100) + "…"
                        : review.body || copy.ratingOnly;

                    return (
                      <Link
                        key={review.id}
                        href={APP_ROUTES.teacher(review.teacherId)}
                        onClick={closeRecent}
                        className="block rounded-lg border border-line bg-slate-50 p-3 transition hover:border-primary/30 hover:bg-white"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="truncate text-sm font900 text-foreground">
                            {teacherName}
                          </span>
                          <span className="shrink-0 text-xs font700 text-muted">
                            {timeAgo}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                          {snippet}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getPaginationItems(currentPage: number, pageCount: number) {
  const windowRadius = 2;
  const windowStart = Math.max(1, currentPage - windowRadius);
  const windowEnd = Math.min(pageCount, currentPage + windowRadius);
  const pages: PaginationItem[] = [];

  if (windowStart > 1) {
    pages.push(1);
    if (windowStart > 2) pages.push("gap-left");
  }

  for (let page = windowStart; page <= windowEnd; page += 1) {
    pages.push(page);
  }

  if (windowEnd < pageCount) {
    if (windowEnd < pageCount - 1) pages.push("gap-right");
    pages.push(pageCount);
  }

  return pages;
}

function getSortValue(teacher: Teacher, sortKey: CatalogSortKey) {
  if (sortKey === "reviewCount") return teacher.reviewCount;
  if (sortKey === "commentCount") return teacher.commentCount ?? 0;
  if (sortKey === "rating") return teacher.rating;
  return teacher.scores[sortKey];
}
