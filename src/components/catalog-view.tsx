"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquareText,
  Search,
  Sparkles,
  Star,
  UsersRound,
  X,
} from "lucide-react";
import { metrics, teachers } from "@/lib/mock-data";
import { TeacherCard } from "@/components/teacher-card";
import { cn } from "@/lib/utils";
import type { MetricKey, Teacher } from "@/lib/types";
import { resetTeachersRuntimeData } from "@/lib/teacher-model";
import { usePreferences, type LanguagePreference } from "@/lib/preferences";
import { localizeMetrics } from "@/lib/i18n";
import {
  getCatalogHref,
  writeStoredCatalogHref,
} from "@/lib/catalog-navigation";
import { API_ROUTES, APP_ROUTES } from "@/lib/app-routes";
import { CATALOG_CONFIG, STORAGE_KEYS } from "@/lib/app-config";
import { useSwipeNavigation } from "@/lib/swipe-navigation";

const TEACHERS_CACHE_KEY = "studradar:catalog-teachers";
const SCROLL_STORAGE_KEY = "studradar:catalog-scroll";

type SortKey = "rating" | "reviewCount" | "commentCount" | MetricKey;
const PAGE_SIZE = CATALOG_CONFIG.pageSize;
const INTRO_STORAGE_KEY = STORAGE_KEYS.catalogIntroDismissed;
const DEFAULT_SORT: SortKey = CATALOG_CONFIG.defaultSort;

type CatalogViewProps = {
  initialQuery?: string;
  initialSort?: string;
  initialPage?: number;
};

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
    loading: string;
    loadFailed: string;
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
    loading: "Обновляем каталог...",
    loadFailed: "Не удалось обновить каталог. Показаны сохраненные данные.",
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
    loading: "Refreshing catalog...",
    loadFailed: "Could not refresh the catalog. Showing cached data.",
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
    loading: "正在刷新目录...",
    loadFailed: "无法刷新目录，正在显示缓存数据。",
  },
};

export function CatalogView({
  initialQuery = "",
  initialSort,
  initialPage = 1,
}: CatalogViewProps) {
  const { language } = usePreferences();
  const copy = catalogCopy[language];
  const localizedMetrics = useMemo(
    () => localizeMetrics(metrics, language),
    [language],
  );
  const [query, setQuery] = useState(initialQuery);
  const [sortKey, setSortKey] = useState<SortKey>(
    () => (isSortKey(initialSort) ? initialSort : DEFAULT_SORT),
  );
  const [currentPage, setCurrentPage] = useState(
    () =>
      Number.isFinite(initialPage) && initialPage > 0
        ? Math.floor(initialPage)
        : 1,
  );
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return false;

    return window.localStorage.getItem(INTRO_STORAGE_KEY) !== "true";
  });
  const [catalogTeachers, setCatalogTeachers] = useState<Teacher[]>(
    resetTeachersRuntimeData(teachers),
  );
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    const cached = readCachedTeachers();
    if (cached) {
      queueMicrotask(() => {
        setCatalogTeachers(cached);
        setIsLoadingCatalog(false);
      });
    }
  }, []);

  useEffect(() => {
    if (!showIntro) return;
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(INTRO_STORAGE_KEY, "true");
      setShowIntro(false);
    }, CATALOG_CONFIG.introDismissDelayMs);
    return () => window.clearTimeout(timer);
  }, [showIntro]);

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
    const savedY = readScrollPosition();
    if (savedY > 0 && catalogTeachers.length > 0) {
      requestAnimationFrame(() => window.scrollTo(0, savedY));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveScrollPosition(window.scrollY);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const saveCurrentScroll = useCallback(() => {
    saveScrollPosition(window.scrollY);
  }, []);

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

  const filteredTeachers = useMemo(() => {
    return catalogTeachers
      .filter((teacher) => {
        const haystack = teacher.fullName.toLowerCase();
        return haystack.includes(query.trim().toLowerCase());
      })
      .sort((left, right) => {
        return getSortValue(right, sortKey) - getSortValue(left, sortKey);
      });
  }, [catalogTeachers, query, sortKey]);
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
    page: visiblePage,
  });

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nextHref = getCatalogHref({
      query,
      sortKey,
      page: visiblePage,
    });

    if (`${window.location.pathname}${window.location.search}` !== nextHref) {
      window.history.replaceState(window.history.state, "", nextHref);
    }
    writeStoredCatalogHref(nextHref);
  }, [query, sortKey, visiblePage]);

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

        <div className="mt-4 grid w-full max-w-md grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
          {([
            { Icon: UsersRound, value: catalogTeachers.length, label: copy.teachers },
            { Icon: Star, value: totalReviews, label: copy.reviews },
            { Icon: MessageSquareText, value: totalComments, label: copy.comments },
          ] as const).map(({ Icon, value, label }) => (
            <div
              key={label}
              className="overflow-hidden rounded-lg border border-line bg-white px-2.5 py-2.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:px-3 sm:py-3"
            >
              <Icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              <div className="mt-1.5 text-lg font900 text-foreground tabular-nums sm:mt-2 sm:text-xl">
                {formatCappedCount(value)}
              </div>
              <div className="mt-0.5 truncate text-[10px] font800 text-slate-500 sm:text-xs">
                {label}
              </div>
            </div>
          ))}
        </div>

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

        <div className="mt-4 flex flex-col items-stretch gap-2 sm:mt-5 sm:flex-row sm:items-center sm:gap-3">
          <button
            type="button"
            className="rounded-lg border border-primary bg-primary px-4 py-2 text-sm font900 text-white shadow-sm"
          >
            {copy.all}
          </button>
          <label className="flex items-center justify-between gap-2 text-sm font900 text-slate-600 sm:ml-auto">
            {copy.sorting}
            <select
              value={sortKey}
              onChange={(event) => {
                setSortKey(event.target.value as SortKey);
                setCurrentPage(1);
              }}
              className="focus-ring h-10 min-w-0 flex-1 rounded-lg border border-line bg-white px-3 text-sm font900 text-slate-700 sm:flex-none"
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
        </div>

        {(isLoadingCatalog || catalogError) && (
          <p className="mt-3 text-xs font800 text-muted">
            {catalogError ?? copy.loading}
          </p>
        )}

        {showIntro && (
          <div className="mt-5 max-w-full animate-slide-in overflow-hidden rounded-lg border border-line bg-primary-soft p-4 shadow-sm sm:mt-7 sm:p-5">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-primary shadow-sm sm:h-14 sm:w-14">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font900 sm:text-lg">{copy.introTitle}</h2>
                <p className="mt-1 max-w-2xl text-xs font-semibold leading-5 text-slate-600 sm:text-sm sm:leading-6">
                  {copy.introText}
                </p>
                <button
                  type="button"
                  className="mt-3 text-xs font800 text-primary underline-offset-4 hover:underline"
                  onClick={() => {
                    window.localStorage.setItem(INTRO_STORAGE_KEY, "true");
                    setShowIntro(false);
                  }}
                >
                  {copy.introDismiss}
                </button>
              </div>
              <button
                type="button"
                className="focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-white hover:text-primary"
                aria-label={copy.introClose}
                title={copy.introClose}
                onClick={() => {
                  window.localStorage.setItem(INTRO_STORAGE_KEY, "true");
                  setShowIntro(false);
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </section>

      <section
        className="mt-5 grid gap-3 stagger-list sm:mt-7 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3"
        onTouchStart={swipe.onTouchStart}
        onTouchMove={swipe.onTouchMove}
        onTouchEnd={swipe.onTouchEnd}
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

      <footer className="mt-8 flex flex-col gap-3 text-xs font800 text-slate-400 sm:mt-12 sm:text-sm md:flex-row md:items-center md:justify-between">
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
    </div>
  );
}

type PaginationItem = number | "gap-left" | "gap-right";

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

function getSortValue(teacher: Teacher, sortKey: SortKey) {
  if (sortKey === "reviewCount") {
    return teacher.reviewCount;
  }

  if (sortKey === "commentCount") {
    return teacher.commentCount ?? 0;
  }

  if (sortKey === "rating") {
    return teacher.rating;
  }

  return teacher.scores[sortKey];
}

function isSortKey(value: string | null | undefined): value is SortKey {
  return (
    value === "rating" ||
    value === "reviewCount" ||
    value === "commentCount" ||
    metrics.some((metric) => metric.key === value)
  );
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
