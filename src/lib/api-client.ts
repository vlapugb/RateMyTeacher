import { API_ROUTES } from "@/lib/app-routes";
import {
  type AccountSummaryResponse,
  type ReviewCreateInput,
  type ReviewLikeResponse,
  type ReviewsPageResponse,
  type ReviewSortKey,
  type ReviewUpdateInput,
  type ReviewWriteResponse,
  type TeachersResponse,
} from "@/lib/api-contracts";

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function requestJson<TResponse>(
  input: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const response = await fetch(input, {
    ...options,
    headers: {
      ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
    body:
      options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new ApiRequestError(
      body?.message || `Request failed with status ${response.status}`,
      response.status,
    );
  }

  return response.json() as Promise<TResponse>;
}

export function getTeachers(options: {
  favorite?: boolean;
  signal?: AbortSignal;
} = {}) {
  return requestJson<TeachersResponse>(
    options.favorite ? API_ROUTES.favoriteTeachers : API_ROUTES.teachers,
    { signal: options.signal },
  );
}

export function getReviewsPage(input: {
  teacherId: string;
  limit?: number;
  offset?: number;
  sort?: ReviewSortKey;
  signal?: AbortSignal;
}) {
  const params = new URLSearchParams({
    teacherId: input.teacherId,
  });

  if (input.limit != null) params.set("limit", String(input.limit));
  if (input.offset != null) params.set("offset", String(input.offset));
  if (input.sort) params.set("sort", input.sort);

  return requestJson<ReviewsPageResponse>(`${API_ROUTES.reviews}?${params}`, {
    signal: input.signal,
  });
}

export function createReview(input: ReviewCreateInput) {
  return requestJson<ReviewWriteResponse>(API_ROUTES.reviews, {
    method: "POST",
    body: input,
  });
}

export function updateReview(input: ReviewUpdateInput) {
  return requestJson<ReviewWriteResponse>(API_ROUTES.reviews, {
    method: "PUT",
    body: input,
  });
}

export function deleteReview(input: {
  teacherId: string;
  reviewId?: string;
}) {
  const url = input.reviewId
    ? API_ROUTES.reviewForTeacherById(input.teacherId, input.reviewId)
    : API_ROUTES.reviewsForTeacher(input.teacherId);

  return requestJson<ReviewWriteResponse>(url, {
    method: "DELETE",
  });
}

export function toggleReviewLike(reviewId: string, liked: boolean) {
  return requestJson<ReviewLikeResponse>(API_ROUTES.reviewLike(reviewId), {
    method: "POST",
    body: { liked },
  });
}

export function getAccountSummary(signal?: AbortSignal) {
  return requestJson<AccountSummaryResponse>(API_ROUTES.accountSummary, {
    signal,
  });
}

export function addFavoriteTeacher(teacherId: string) {
  return requestJson<{ saved: true }>(API_ROUTES.favorites, {
    method: "POST",
    body: { teacherId },
  });
}

export function removeFavoriteTeacher(teacherId: string) {
  return requestJson<{ saved: false }>(
    `${API_ROUTES.favorites}?teacherId=${encodeURIComponent(teacherId)}`,
    {
      method: "DELETE",
    },
  );
}
