import { CATALOG_CONFIG, STORAGE_KEYS } from "@/lib/app-config";
import { APP_ROUTES } from "@/lib/app-routes";

export const CATALOG_STATE_STORAGE_KEY = STORAGE_KEYS.catalogState;

export function getSafeCatalogHref(value: string | null | undefined) {
  const href = value?.trim();

  if (!href) return APP_ROUTES.teachers;
  if (
    href === APP_ROUTES.teachers ||
    href === `${APP_ROUTES.teachers}/` ||
    href.startsWith(`${APP_ROUTES.teachers}?`) ||
    href.startsWith(`${APP_ROUTES.teachers}/?`)
  ) {
    return href;
  }

  return APP_ROUTES.teachers;
}

export function readStoredCatalogHref() {
  if (typeof window === "undefined") return APP_ROUTES.teachers;

  try {
    return getSafeCatalogHref(
      window.sessionStorage.getItem(CATALOG_STATE_STORAGE_KEY),
    );
  } catch {
    return APP_ROUTES.teachers;
  }
}

export function writeStoredCatalogHref(value: string) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(
      CATALOG_STATE_STORAGE_KEY,
      getSafeCatalogHref(value),
    );
  } catch {
    // The URL still carries the state; storage is only a fallback.
  }
}

export function parseCatalogPageParam(value: string | null | undefined) {
  const page = value == null ? Number.NaN : Number.parseInt(value, 10);

  if (!Number.isFinite(page) || page < 1) return 1;

  return Math.floor(page);
}

export function getCatalogHref(input: {
  query: string;
  sortKey: string;
  page: number;
}) {
  const searchParams = new URLSearchParams();
  const query = input.query.trim();

  if (query) searchParams.set("q", query);
  if (input.sortKey !== CATALOG_CONFIG.defaultSort) {
    searchParams.set("sort", input.sortKey);
  }
  if (input.page > 1) searchParams.set("page", String(input.page));

  const search = searchParams.toString();
  return search ? `${APP_ROUTES.teachers}?${search}` : APP_ROUTES.teachers;
}
