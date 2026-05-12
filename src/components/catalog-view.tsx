"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MessageSquareText,
  Star,
  UsersRound,
} from "lucide-react";
import { metrics } from "@/lib/teacher-catalog";
import { CatalogControls } from "@/components/catalog/catalog-controls";
import type { SortDirection } from "@/components/catalog/catalog-controls";
import { CatalogIntro } from "@/components/catalog/catalog-intro";
import {
  CatalogPagination,
  type PaginationItem,
} from "@/components/catalog/catalog-pagination";
import type { CatalogSortKey } from "@/components/catalog/catalog-types";
import { TeacherGrid } from "@/components/catalog/teacher-grid";
import type { Teacher } from "@/lib/types";
import { usePreferences, type LanguagePreference } from "@/lib/preferences";
import { localizeMetrics } from "@/lib/i18n";
import { STORAGE_KEYS } from "@/lib/app-config";
import { cn } from "@/lib/utils";
import { useSwipeNavigation } from "@/lib/swipe-navigation";
import { RecentActivityExpansion } from "@/components/catalog/recent-activity-expansion";

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
  },
};

type CatalogViewProps = {
  initialTeachers: Teacher[];
};

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
  const [activeActivity, setActiveActivity] = useState<"reviews" | "comments" | null>(null);

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

  return (
    <div className="page-soft-enter px-3 pb-24 sm:px-5 sm:pb-8 md:px-8">
      <section className="pt-4 sm:pt-6">
        <div className="max-w-3xl">
          <h1 className="text-2xl font900 tracking-tight text-foreground sm:text-4xl">
            {copy.title}
            <span className="block text-slate-400">
              {copy.subtitle}
            </span>
          </h1>
        </div>

        {/* Stats grid — expandable cards */}
        <div className="mt-4 grid w-full max-w-md grid-cols-3 gap-2 sm:mt-6 sm:flex sm:gap-3 sm:items-start">
          <button
            type="button"
            disabled
            className="cursor-default overflow-hidden rounded-lg border border-line bg-white px-2.5 py-2.5 shadow-sm text-left sm:px-3 sm:py-3"
          >
            <UsersRound className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
            <div className="mt-1.5 text-lg font900 text-foreground tabular-nums sm:mt-2 sm:text-xl">
              {catalogTeachers.length}
            </div>
            <div className="mt-0.5 truncate text-[10px] font800 text-slate-500 sm:text-xs">
              {copy.teachers}
            </div>
          </button>

          {/* Ratings expandable */}
          <div className="contents sm:block sm:relative">
            <button
              type="button"
              onClick={() =>
                setActiveActivity((c) =>
                  c === "reviews" ? null : "reviews",
                )
              }
              aria-expanded={activeActivity === "reviews"}
              aria-controls="recent-activity-panel"
              className={cn(
                "overflow-hidden rounded-lg border px-2.5 py-2.5 shadow-sm text-left transition-[border-color,box-shadow,background-color,transform] duration-200",
                "sm:px-3 sm:py-3 cursor-pointer hover:-translate-y-0.5 hover:shadow-md",
                activeActivity === "reviews"
                  ? "border-primary bg-primary-soft shadow-[0_0_0_3px_rgba(108,93,211,0.15)] rounded-b-[6px]"
                  : "border-line bg-white",
              )}
            >
              <Star
                className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5",
                  activeActivity === "reviews"
                    ? "text-primary"
                    : "text-primary",
                )}
              />
              <div className="mt-1.5 text-lg font900 text-foreground tabular-nums sm:mt-2 sm:text-xl">
                {totalReviews}
              </div>
              <div className="mt-0.5 truncate text-[10px] font800 text-slate-500 sm:text-xs">
                {copy.reviews}
              </div>
            </button>
            {activeActivity === "reviews" && (
              <div className="hidden sm:block">
                <RecentActivityExpansion
                  kind="reviews"
                  teachers={catalogTeachers}
                  variant="popover"
                  onClose={() => setActiveActivity(null)}
                />
              </div>
            )}
          </div>

          {/* Comments expandable — right-aligned popover on desktop */}
          <div className="contents sm:block sm:relative">
            <button
              type="button"
              onClick={() =>
                setActiveActivity((c) =>
                  c === "comments" ? null : "comments",
                )
              }
              aria-expanded={activeActivity === "comments"}
              aria-controls="recent-activity-panel"
              className={cn(
                "overflow-hidden rounded-lg border px-2.5 py-2.5 shadow-sm text-left transition-[border-color,box-shadow,background-color,transform] duration-200",
                "sm:px-3 sm:py-3 cursor-pointer hover:-translate-y-0.5 hover:shadow-md",
                activeActivity === "comments"
                  ? "border-primary bg-primary-soft shadow-[0_0_0_3px_rgba(108,93,211,0.15)] rounded-b-[6px]"
                  : "border-line bg-white",
              )}
            >
              <MessageSquareText
                className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5",
                  activeActivity === "comments"
                    ? "text-primary"
                    : "text-primary",
                )}
              />
              <div className="mt-1.5 text-lg font900 text-foreground tabular-nums sm:mt-2 sm:text-xl">
                {totalComments}
              </div>
              <div className="mt-0.5 truncate text-[10px] font800 text-slate-500 sm:text-xs">
                {copy.comments}
              </div>
            </button>
            {activeActivity === "comments" && (
              <div className="hidden sm:block">
                <RecentActivityExpansion
                  kind="comments"
                  teachers={catalogTeachers}
                  variant="popover"
                  align="right"
                  onClose={() => setActiveActivity(null)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile inline expansion — separate row below grid */}
        {activeActivity === "reviews" && (
          <div className="sm:hidden">
            <RecentActivityExpansion
              kind="reviews"
              teachers={catalogTeachers}
              variant="inline"
              onClose={() => setActiveActivity(null)}
            />
          </div>
        )}
        {activeActivity === "comments" && (
          <div className="sm:hidden">
            <RecentActivityExpansion
              kind="comments"
              teachers={catalogTeachers}
              variant="inline"
              onClose={() => setActiveActivity(null)}
            />
          </div>
        )}

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
