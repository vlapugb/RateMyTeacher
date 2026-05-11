"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
<<<<<<< HEAD
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  ChevronLeft,
  ChevronRight,
=======
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
  MessageSquareText,
  Star,
  UsersRound,
} from "lucide-react";
<<<<<<< HEAD
import { metrics, teachers } from "@/lib/mock-data";
import { TeacherCard } from "@/components/teacher-card";
import { cn } from "@/lib/utils";
import type { MetricKey, Review, Teacher } from "@/lib/types";
import { resetTeachersRuntimeData } from "@/lib/teacher-model";
import { usePreferences, type LanguagePreference } from "@/lib/preferences";
import { formatRelativeTime, localizeMetrics } from "@/lib/i18n";
import {
  getCatalogHref,
  readSavedCatalogState,
  writeStoredCatalogHref,
  writeSavedCatalogState,
} from "@/lib/catalog-navigation";
import { API_ROUTES, APP_ROUTES } from "@/lib/app-routes";
import { CATALOG_CONFIG, STORAGE_KEYS } from "@/lib/app-config";
import { useSwipeNavigation } from "@/lib/swipe-navigation";

const TEACHERS_CACHE_KEY = "studradar:catalog-teachers";
const SCROLL_STORAGE_KEY = "studradar:catalog-scroll";

type SortKey = "rating" | "reviewCount" | "commentCount" | MetricKey;
type SortDirection = "desc" | "asc";
type RecentActivityKind = "reviews" | "comments";
const PAGE_SIZE = CATALOG_CONFIG.pageSize;
const INTRO_STORAGE_KEY = STORAGE_KEYS.catalogIntroDismissed;
const DEFAULT_SORT: SortKey = CATALOG_CONFIG.defaultSort;
const DEFAULT_SORT_DIRECTION: SortDirection = CATALOG_CONFIG.defaultSortDirection;

type CatalogViewProps = {
  initialQuery?: string;
  initialSort?: string;
  initialOrder?: string;
  initialPage?: number;
};
=======
import { metrics } from "@/lib/teacher-catalog";
import { CatalogControls } from "@/components/catalog/catalog-controls";
import { CatalogIntro } from "@/components/catalog/catalog-intro";
import {
  CatalogPagination,
  type PaginationItem,
} from "@/components/catalog/catalog-pagination";
import { CatalogSummary } from "@/components/catalog/catalog-summary";
import type { CatalogSortKey } from "@/components/catalog/catalog-types";
import { TeacherGrid } from "@/components/catalog/teacher-grid";
import type { Teacher } from "@/lib/types";
import { usePreferences, type LanguagePreference } from "@/lib/preferences";
import { localizeMetrics } from "@/lib/i18n";
import { STORAGE_KEYS } from "@/lib/app-config";

const PAGE_SIZE = 6;
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)

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
    descending: string;
    ascending: string;
    teachersAction: string;
    reviewsAction: string;
    commentsAction: string;
    recentReviewsTitle: string;
    recentCommentsTitle: string;
    recentSubtitle: string;
    hideRecent: string;
    recentLoading: string;
    recentEmpty: string;
    recentFailed: string;
    ratingOnly: string;
    unknownTeacher: string;
    activityForTeacher: (teacherName: string) => string;
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
    descending: "По убыванию",
    ascending: "По возрастанию",
    teachersAction: "Перейти к списку преподавателей",
    reviewsAction: "Показать последние оценки",
    commentsAction: "Показать последние комментарии",
    recentReviewsTitle: "Последние оценки",
    recentCommentsTitle: "Последние комментарии",
    recentSubtitle: "10 свежих публикаций по всем преподавателям",
    hideRecent: "Скрыть",
    recentLoading: "Загружаем последние публикации...",
    recentEmpty: "Пока ничего нет",
    recentFailed: "Не удалось загрузить последние публикации.",
    ratingOnly: "Оценка без комментария",
    unknownTeacher: "Преподаватель",
    activityForTeacher: (teacherName) => `Кому: ${teacherName}`,
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
    descending: "Descending",
    ascending: "Ascending",
    teachersAction: "Go to teacher list",
    reviewsAction: "Show latest ratings",
    commentsAction: "Show latest comments",
    recentReviewsTitle: "Latest ratings",
    recentCommentsTitle: "Latest comments",
    recentSubtitle: "10 fresh posts across all teachers",
    hideRecent: "Hide",
    recentLoading: "Loading latest posts...",
    recentEmpty: "Nothing here yet",
    recentFailed: "Could not load latest posts.",
    ratingOnly: "Rating without a comment",
    unknownTeacher: "Teacher",
    activityForTeacher: (teacherName) => `For: ${teacherName}`,
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
    descending: "降序",
    ascending: "升序",
    teachersAction: "前往教师列表",
    reviewsAction: "显示最新评分",
    commentsAction: "显示最新评论",
    recentReviewsTitle: "最新评分",
    recentCommentsTitle: "最新评论",
    recentSubtitle: "所有教师的 10 条最新发布",
    hideRecent: "隐藏",
    recentLoading: "正在加载最新发布...",
    recentEmpty: "暂无内容",
    recentFailed: "无法加载最新发布。",
    ratingOnly: "无评论评分",
    unknownTeacher: "教师",
    activityForTeacher: (teacherName) => `对象：${teacherName}`,
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

<<<<<<< HEAD
export function CatalogView({
  initialQuery = "",
  initialSort,
  initialOrder,
  initialPage = 1,
}: CatalogViewProps) {
=======
type CatalogViewProps = {
  initialTeachers: Teacher[];
};

export function CatalogView({ initialTeachers }: CatalogViewProps) {
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
  const { language } = usePreferences();
  const copy = catalogCopy[language];
  const localizedMetrics = useMemo(
    () => localizeMetrics(metrics, language),
    [language],
  );
<<<<<<< HEAD
  const savedState = typeof window === "undefined" ? null : readSavedCatalogState();
  const effectiveQuery = initialQuery || savedState?.query || "";
  const effectiveSort = initialSort || savedState?.sort || undefined;
  const effectiveOrder = initialOrder || savedState?.order || undefined;
  const effectivePage = initialPage > 1 ? initialPage : (savedState?.page ?? 1);

  const [query, setQuery] = useState(effectiveQuery);
  const [sortKey, setSortKey] = useState<SortKey>(
    () => (isSortKey(effectiveSort) ? effectiveSort : DEFAULT_SORT),
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    () =>
      isSortDirection(effectiveOrder) ? effectiveOrder : DEFAULT_SORT_DIRECTION,
  );
  const [currentPage, setCurrentPage] = useState(
    () =>
      Number.isFinite(effectivePage) && effectivePage > 0
        ? Math.floor(effectivePage)
        : 1,
  );
=======
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<CatalogSortKey>("rating");
  const [currentPage, setCurrentPage] = useState(1);
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return false;

    return window.localStorage.getItem(STORAGE_KEYS.introDismissed) !== "true";
  });
<<<<<<< HEAD
  const [initialCachedTeachers] = useState(() => readCachedTeachers());
  const [catalogTeachers, setCatalogTeachers] = useState<Teacher[]>(
    () => initialCachedTeachers ?? resetTeachersRuntimeData(teachers),
  );
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(
    () => !initialCachedTeachers,
  );
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [activeActivity, setActiveActivity] =
    useState<RecentActivityKind | null>(null);
  const [recentActivity, setRecentActivity] = useState<
    Record<RecentActivityKind, Review[]>
  >({
    reviews: [],
    comments: [],
  });
  const [recentActivityStatus, setRecentActivityStatus] = useState<
    Record<RecentActivityKind, "idle" | "loading" | "ready" | "error">
  >({
    reviews: "idle",
    comments: "idle",
  });
  const teacherListRef = useRef<HTMLElement | null>(null);
  const recentActivityStatusRef = useRef(recentActivityStatus);

  useEffect(() => {
    recentActivityStatusRef.current = recentActivityStatus;
  }, [recentActivityStatus]);

  useEffect(() => {
    if (initialCachedTeachers) return;

    const cached = readCachedTeachers();
    if (cached) {
      queueMicrotask(() => {
        setCatalogTeachers(cached);
        setIsLoadingCatalog(false);
      });
    }
  }, [initialCachedTeachers]);
=======
  const [catalogTeachers, setCatalogTeachers] =
    useState<Teacher[]>(initialTeachers);
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)

  useEffect(() => {
    if (!showIntro) return;
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEYS.introDismissed, "true");
      setShowIntro(false);
    }, CATALOG_CONFIG.introDismissDelayMs);
    return () => window.clearTimeout(timer);
  }, [showIntro]);

<<<<<<< HEAD
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    fetch(API_ROUTES.teachers, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          if (active) setCatalogError(copy.loadFailed);
          return null;
        }
        return response.json();
      })
      .then((body: { teachers?: Teacher[] } | null) => {
        if (active && body?.teachers) {
          setCatalogError(null);
          setCatalogTeachers(body.teachers);
          cacheTeachers(body.teachers);
        }
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.warn("Failed to load teachers", error);
        if (active) setCatalogError(copy.loadFailed);
      })
      .finally(() => {
        if (active) {
          setIsLoadingCatalog(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [copy.loadFailed]);

  useEffect(() => {
    if (!activeActivity) return;
    if (recentActivityStatusRef.current[activeActivity] !== "idle") return;

    let active = true;
    const controller = new AbortController();
    const params = new URLSearchParams({
      kind: activeActivity,
      limit: "10",
    });

    setRecentActivityStatus((current) => ({
      ...current,
      [activeActivity]: "loading",
    }));

    fetch(`${API_ROUTES.recentReviews}?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { reviews?: Review[] } | null) => {
        if (!active) return;

        if (!body?.reviews) {
          setRecentActivityStatus((current) => ({
            ...current,
            [activeActivity]: "error",
          }));
          return;
        }

        setRecentActivity((current) => ({
          ...current,
          [activeActivity]: body.reviews ?? [],
        }));
        setRecentActivityStatus((current) => ({
          ...current,
          [activeActivity]: "ready",
        }));
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.warn("Failed to load recent reviews", error);
        if (active) {
          setRecentActivityStatus((current) => ({
            ...current,
            [activeActivity]: "error",
          }));
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [activeActivity]);

  useEffect(() => {
    const handlePageHide = () => {
      saveScrollPosition(window.scrollY);
    };
    const handleBeforeUnload = () => {
      saveScrollPosition(window.scrollY);
    };
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const restoredScrollRef = useRef(false);

  useLayoutEffect(() => {
    if (restoredScrollRef.current) return;

    restoredScrollRef.current = true;
    const savedY = readScrollPosition();
    if (savedY > 0) {
      jumpToScrollPosition(savedY);
      const frame = window.requestAnimationFrame(() => {
        jumpToScrollPosition(savedY);
        clearScrollPosition();
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, []);

=======
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
  const totalReviews = useMemo(
    () => catalogTeachers.reduce((sum, teacher) => sum + teacher.reviewCount, 0),
    [catalogTeachers],
  );
  const totalComments = useMemo(
    () =>
      catalogTeachers.reduce(
        (sum, teacher) => sum + (teacher.commentCount ?? 0),
        0,
      ),
    [catalogTeachers],
  );
  const teacherLookup = useMemo(
    () => new Map(catalogTeachers.map((teacher) => [teacher.id, teacher])),
    [catalogTeachers],
  );

  const filteredTeachers = useMemo(() => {
    return catalogTeachers
      .filter((teacher) => {
        const haystack = teacher.fullName.toLowerCase();
        return haystack.includes(query.trim().toLowerCase());
      })
      .sort((left, right) => {
        const valueDiff = getSortValue(left, sortKey) - getSortValue(right, sortKey);
        if (valueDiff !== 0) {
          return sortDirection === "asc" ? valueDiff : -valueDiff;
        }

        return left.fullName.localeCompare(right.fullName);
      });
  }, [catalogTeachers, query, sortDirection, sortKey]);
  const pageCount = Math.max(1, Math.ceil(filteredTeachers.length / PAGE_SIZE));
  const visiblePage = Math.min(currentPage, pageCount);
  const visibleTeachers = filteredTeachers.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE,
  );
  const start = filteredTeachers.length
    ? (visiblePage - 1) * PAGE_SIZE + 1
    : 0;
  const end = Math.min(visiblePage * PAGE_SIZE, filteredTeachers.length);
  const paginationItems = getPaginationItems(visiblePage, pageCount);
  const catalogHref = getCatalogHref({
    query,
    sortKey,
    sortDirection,
    page: visiblePage,
  });

  const saveCurrentScroll = useCallback(() => {
    saveScrollPosition(window.scrollY);
    writeStoredCatalogHref(catalogHref);
    writeSavedCatalogState({
      query,
      sort: sortKey,
      order: sortDirection,
      page: visiblePage,
    });
    window.history.replaceState(window.history.state, "", catalogHref);
  }, [catalogHref, query, sortDirection, sortKey, visiblePage]);

  const canGoPrev = visiblePage > 1;
  const canGoNext = visiblePage < pageCount;

  const handlePrevPage = useCallback(() => {
    if (canGoPrev) {
      saveScrollPosition(window.scrollY);
      setCurrentPage(visiblePage - 1);
    }
  }, [canGoPrev, visiblePage]);

  const handleNextPage = useCallback(() => {
    if (canGoNext) {
      saveScrollPosition(window.scrollY);
      setCurrentPage(visiblePage + 1);
    }
  }, [canGoNext, visiblePage]);

  const swipe = useSwipeNavigation({
    onPrev: handlePrevPage,
    onNext: handleNextPage,
    canGoPrev,
    canGoNext,
  });

  const scrollToTeacherList = useCallback(() => {
    setActiveActivity(null);
    teacherListRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const toggleRecentActivity = useCallback((kind: RecentActivityKind) => {
    setRecentActivityStatus((current) =>
      current[kind] === "error" ? { ...current, [kind]: "idle" } : current,
    );
    setActiveActivity((current) => (current === kind ? null : kind));
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const nextHref = getCatalogHref({
      query,
      sortKey,
      sortDirection,
      page: visiblePage,
    });

    if (`${window.location.pathname}${window.location.search}` !== nextHref) {
      window.history.replaceState(window.history.state, "", nextHref);
    }
    writeStoredCatalogHref(nextHref);
    writeSavedCatalogState({
      query,
      sort: sortKey,
      order: sortDirection,
      page: visiblePage,
    });
  }, [query, sortDirection, sortKey, visiblePage]);

  function dismissIntro() {
    window.localStorage.setItem(STORAGE_KEYS.introDismissed, "true");
    setShowIntro(false);
  }

  return (
    <div className="px-3 pb-6 sm:px-5 sm:pb-8 md:px-8">
      <section className="pt-4 sm:pt-6">
        <div className="max-w-3xl">
          <h1 className="text-2xl font900 tracking-tight text-foreground sm:text-4xl">
            {copy.title}
            <span className="block text-slate-400">
              {copy.subtitle}
            </span>
          </h1>
        </div>

<<<<<<< HEAD
        <div className="mt-4 grid w-full max-w-3xl grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
          <SummaryButton
            Icon={UsersRound}
            value={catalogTeachers.length}
            label={copy.teachers}
            action={copy.teachersAction}
            onClick={scrollToTeacherList}
          />
          <SummaryButton
            Icon={Star}
            value={totalReviews}
            label={copy.reviews}
            action={copy.reviewsAction}
            active={activeActivity === "reviews"}
            onClick={() => toggleRecentActivity("reviews")}
          />
          <SummaryButton
            Icon={MessageSquareText}
            value={totalComments}
            label={copy.comments}
            action={copy.commentsAction}
            active={activeActivity === "comments"}
            onClick={() => toggleRecentActivity("comments")}
          />
        </div>

        {activeActivity && (
          <section
            key={activeActivity}
            className="mt-3 max-w-3xl animate-soft-reveal overflow-hidden rounded-lg border border-line bg-white shadow-sm sm:mt-4"
          >
            <div className="flex items-start justify-between gap-3 border-b border-line px-3 py-3 sm:px-4">
              <div className="min-w-0">
                <h2 className="text-sm font900 text-foreground sm:text-base">
                  {activeActivity === "reviews"
                    ? copy.recentReviewsTitle
                    : copy.recentCommentsTitle}
                </h2>
                <p className="mt-0.5 text-xs font700 text-muted">
                  {copy.recentSubtitle}
                </p>
              </div>
              <button
                type="button"
                className="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-primary-soft hover:text-primary"
                aria-label={copy.hideRecent}
                title={copy.hideRecent}
                onClick={() => setActiveActivity(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <RecentActivityList
              activity={activeActivity}
              items={recentActivity[activeActivity]}
              status={recentActivityStatus[activeActivity]}
              teacherLookup={teacherLookup}
              catalogHref={catalogHref}
              copy={copy}
              language={language}
              onLinkClick={saveCurrentScroll}
            />
          </section>
        )}

        <div className="mt-5 flex max-w-3xl items-center gap-2 rounded-lg border border-line bg-white px-3 py-2.5 shadow-sm sm:mt-8 sm:gap-3 sm:px-4 sm:py-3">
          <Search className="h-5 w-5 shrink-0 text-slate-400 sm:h-6 sm:w-6" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCurrentPage(1);
            }}
            placeholder={copy.search}
            className="focus-ring min-w-0 flex-1 border-0 bg-transparent text-sm font700 text-foreground outline-none placeholder:text-slate-400 sm:text-base"
          />
        </div>

        <div className="mt-4 flex flex-col items-stretch gap-2 sm:mt-5 lg:flex-row lg:items-center lg:gap-3">
          <button
            type="button"
            className="rounded-lg border border-primary bg-primary px-4 py-2 text-sm font900 text-white shadow-sm lg:w-auto"
          >
            {copy.all}
          </button>
          <div className="flex min-w-0 items-center gap-2 lg:ml-auto">
            <label className="flex min-w-0 flex-1 items-center justify-between gap-2 text-sm font900 text-slate-600">
              <span className="shrink-0">{copy.sorting}</span>
              <select
                value={sortKey}
                onChange={(event) => {
                  setSortKey(event.target.value as SortKey);
                  setCurrentPage(1);
                }}
                className="focus-ring h-10 min-w-0 flex-1 rounded-lg border border-line bg-white px-3 text-sm font900 text-slate-700 sm:w-56 sm:flex-none"
              >
                <option value="rating">{copy.byRating}</option>
                <option value="commentCount">{copy.byComments}</option>
                <option value="reviewCount">{copy.byReviews}</option>
                {localizedMetrics.map((metric) => (
                  <option key={metric.key} value={metric.key}>
                    {metric.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              aria-label={
                sortDirection === "desc" ? copy.descending : copy.ascending
              }
              title={sortDirection === "desc" ? copy.descending : copy.ascending}
              onClick={() => {
                setSortDirection((current) =>
                  current === "desc" ? "asc" : "desc",
                );
                setCurrentPage(1);
              }}
              className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line bg-white text-primary shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary-soft"
            >
              {sortDirection === "desc" ? (
                <ArrowDownWideNarrow className="h-5 w-5" />
              ) : (
                <ArrowUpWideNarrow className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {(isLoadingCatalog || catalogError) && (
          <p className="mt-3 text-xs font800 text-muted">
            {catalogError ?? copy.loading}
          </p>
        )}
=======
        <CatalogSummary
          items={[
            { Icon: UsersRound, value: catalogTeachers.length, label: copy.teachers },
            { Icon: Star, value: totalReviews, label: copy.reviews },
            { Icon: MessageSquareText, value: totalComments, label: copy.comments },
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
          onQueryChange={(nextQuery) => {
            setQuery(nextQuery);
            setCurrentPage(1);
          }}
          onSortChange={(nextSortKey) => {
            setSortKey(nextSortKey);
            setCurrentPage(1);
          }}
        />
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)

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

<<<<<<< HEAD
      <section
        id="teacher-list"
        ref={teacherListRef}
        className="mt-5 grid scroll-mt-24 gap-3 stagger-list sm:mt-7 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3"
        style={swipe.containerStyle}
        onTouchStart={swipe.onTouchStart}
        onTouchMove={swipe.onTouchMove}
        onTouchEnd={(event) => swipe.onTouchEnd(event)}
      >
        {visibleTeachers.map((teacher) => (
          <TeacherCard
            key={teacher.id}
            teacher={teacher}
            href={APP_ROUTES.teacherWithCatalog(teacher.id, catalogHref)}
            onLinkClick={saveCurrentScroll}
            onFavoriteChange={(teacherId, saved) => {
              setCatalogTeachers((current) =>
                current.map((item) =>
                  item.id === teacherId ? { ...item, saved } : item,
                ),
              );
            }}
          />
        ))}
      </section>

      <footer className="mt-8 flex flex-col gap-3 pb-[calc(5rem+env(safe-area-inset-bottom))] text-xs font800 text-slate-400 sm:mt-12 sm:pb-1 sm:text-sm md:flex-row md:items-center md:justify-between">
        <span>
          {copy.shown} {start}–{end} {copy.of} {filteredTeachers.length}{" "}
          {copy.teachers}
        </span>
        <div className="flex max-w-full items-center gap-1.5 overflow-x-auto pb-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage(Math.max(1, visiblePage - 1))}
            disabled={visiblePage === 1}
            aria-label={copy.previousPage}
            title={copy.previousPage}
            className="focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-white text-slate-600 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-45 sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          {paginationItems.map((item) =>
            typeof item === "number" ? (
              <button
                key={item}
                type="button"
                onClick={() => setCurrentPage(item)}
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line font900 transition sm:h-10 sm:w-10",
                  item === visiblePage
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white text-slate-600 hover:border-primary hover:-translate-y-0.5",
                )}
              >
                {item}
              </button>
            ) : (
              <span
                key={item}
                className="grid h-9 w-6 shrink-0 place-items-center text-sm font900 text-muted sm:h-10 sm:w-7"
                aria-hidden
              >
                ...
              </span>
            ),
          )}
          <button
            type="button"
            onClick={() => setCurrentPage(Math.min(pageCount, visiblePage + 1))}
            disabled={visiblePage === pageCount}
            aria-label={copy.nextPage}
            title={copy.nextPage}
            className="focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-white text-slate-600 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-45 sm:h-10 sm:w-10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </footer>
=======
      <TeacherGrid
        teachers={visibleTeachers}
        onFavoriteChange={(teacherId, saved) => {
          setCatalogTeachers((current) =>
            current.map((item) =>
              item.id === teacherId ? { ...item, saved } : item,
            ),
          );
        }}
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
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
    </div>
  );
}

<<<<<<< HEAD
function SummaryButton({
  Icon,
  value,
  label,
  action,
  active = false,
  onClick,
}: {
  Icon: typeof UsersRound;
  value: number;
  label: string;
  action: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={action}
      title={action}
      aria-expanded={active || undefined}
      onClick={onClick}
      className={cn(
        "focus-ring min-w-0 overflow-hidden rounded-lg border border-line bg-white px-2.5 py-2.5 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-md sm:px-3 sm:py-3",
        active && "border-primary bg-primary-soft shadow-md",
      )}
    >
      <Icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
      <div className="mt-1.5 text-lg font900 text-foreground tabular-nums sm:mt-2 sm:text-xl">
        {formatCappedCount(value)}
      </div>
      <div className="mt-0.5 truncate text-[10px] font800 text-slate-500 sm:text-xs">
        {label}
      </div>
    </button>
  );
}

function RecentActivityList({
  activity,
  items,
  status,
  teacherLookup,
  catalogHref,
  copy,
  language,
  onLinkClick,
}: {
  activity: RecentActivityKind;
  items: Review[];
  status: "idle" | "loading" | "ready" | "error";
  teacherLookup: Map<string, Teacher>;
  catalogHref: string;
  copy: (typeof catalogCopy)[LanguagePreference];
  language: LanguagePreference;
  onLinkClick: () => void;
}) {
  if (status === "loading" || status === "idle") {
    return (
      <div className="animate-soft-reveal px-3 py-4 text-sm font800 text-muted sm:px-4">
        {copy.recentLoading}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="animate-soft-reveal px-3 py-4 text-sm font800 text-danger sm:px-4">
        {copy.recentFailed}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="animate-soft-reveal px-3 py-4 text-sm font800 text-muted sm:px-4">
        {copy.recentEmpty}
      </div>
    );
  }

  return (
    <div className="grid gap-2 p-3 stagger-list-slow sm:grid-cols-2 sm:p-4">
      {items.map((review) => {
        const teacher = teacherLookup.get(review.teacherId);
        const teacherName = teacher?.shortName ?? copy.unknownTeacher;
        const body = review.body.trim() || copy.ratingOnly;

        return (
          <Link
            key={review.id}
            href={APP_ROUTES.teacherWithCatalog(review.teacherId, catalogHref)}
            onClick={onLinkClick}
            className="interactive-card block min-w-0 rounded-lg border border-line bg-panel p-3 transition hover:border-primary"
          >
            <div className="flex min-w-0 items-start justify-between gap-2">
              <span className="line-clamp-2 text-xs font900 leading-4 text-primary">
                {copy.activityForTeacher(teacherName)}
              </span>
              <span className="shrink-0 text-[10px] font800 text-slate-400">
                {formatRelativeTime(review.createdAt, language)}
              </span>
            </div>
            <div className="mt-2 flex min-w-0 items-start gap-2">
              {review.hasRating === true && (
                <span className="shrink-0 rounded-md bg-amber-50 px-2 py-1 text-xs font900 text-warning">
                  ★ {review.rating}
                </span>
              )}
              <p className="line-clamp-3 min-w-0 text-sm font700 leading-5 text-slate-700">
                {body}
              </p>
            </div>
            {activity === "comments" && review.hasRating === true && (
              <div className="mt-2 text-[11px] font800 text-muted">
                {copy.byRating}: {review.rating}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}

type PaginationItem = number | "gap-left" | "gap-right";

=======
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
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
  if (sortKey === "reviewCount") {
    return teacher.reviewCount;
  }

  if (sortKey === "commentCount") {
    return teacher.commentCount ?? 0;
  }

  if (sortKey === "rating") {
    return teacher.rating;
  }

  return teacher.scores[sortKey] ?? 0;
}

function isSortKey(value: string | null | undefined): value is SortKey {
  return (
    value === "rating" ||
    value === "reviewCount" ||
    value === "commentCount" ||
    metrics.some((metric) => metric.key === value)
  );
}

function isSortDirection(
  value: string | null | undefined,
): value is SortDirection {
  return value === "asc" || value === "desc";
}

function formatCappedCount(value: number) {
  return value > CATALOG_CONFIG.countDisplayLimit
    ? `${CATALOG_CONFIG.countDisplayLimit}+`
    : value;
}

function readCachedTeachers(): Teacher[] | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(TEACHERS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function cacheTeachers(data: Teacher[]) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(TEACHERS_CACHE_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage may be full or unavailable
  }
}

function saveScrollPosition(y: number) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SCROLL_STORAGE_KEY, String(Math.round(y)));
  } catch {
    // ignore
  }
}

function readScrollPosition(): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number.parseInt(
      window.sessionStorage.getItem(SCROLL_STORAGE_KEY) ?? "0",
      10,
    );
  } catch {
    return 0;
  }
}

function jumpToScrollPosition(y: number) {
  const root = document.documentElement;
  const body = document.body;
  const previousRootBehavior = root.style.scrollBehavior;
  const previousBodyBehavior = body.style.scrollBehavior;

  root.style.scrollBehavior = "auto";
  body.style.scrollBehavior = "auto";
  window.scrollTo({ left: 0, top: y, behavior: "auto" });
  root.style.scrollBehavior = previousRootBehavior;
  body.style.scrollBehavior = previousBodyBehavior;
}

function clearScrollPosition() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(SCROLL_STORAGE_KEY);
  } catch {
    // ignore
  }
}
