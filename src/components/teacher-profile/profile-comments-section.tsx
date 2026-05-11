import Link from "next/link";
import { MessageSquareText, SlidersHorizontal } from "lucide-react";
import { ReviewCard } from "@/components/review-card";
import { CommentListSkeleton } from "@/components/ui/skeleton";
import { APP_ROUTES } from "@/lib/app-routes";
import type { Review } from "@/lib/types";
import type { CommentSortKey } from "@/components/teacher-profile/profile-types";

type CommentsCopy = {
  firstComment: string;
  highest: string;
  loadMoreComments: string;
  loadingComments: string;
  lowest: string;
  newest: string;
  noComments: string;
  publishedComments: (count: number) => string;
  studentComments: string;
};

type ProfileCommentsSectionProps = {
  comments: Review[];
  commentsHasMore: boolean;
  commentsLoading: boolean;
  commentsTotal: number;
  copy: CommentsCopy;
  sort: CommentSortKey;
  teacherId: string;
  onDelete: (review: Review) => void;
  onLoadMore: () => void;
  onSortChange: (sort: CommentSortKey) => void;
};

export function ProfileCommentsSection({
  comments,
  commentsHasMore,
  commentsLoading,
  commentsTotal,
  copy,
  sort,
  teacherId,
  onDelete,
  onLoadMore,
  onSortChange,
}: ProfileCommentsSectionProps) {
  return (
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
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value as CommentSortKey)
            }
            className="border-0 bg-transparent text-sm font900 outline-none"
          >
            <option value="newest">{copy.newest}</option>
            <option value="highest">{copy.highest}</option>
            <option value="lowest">{copy.lowest}</option>
          </select>
        </label>
      </div>
      {commentsLoading && !comments.length ? (
        <CommentListSkeleton count={3} />
      ) : comments.length ? (
        <div className="mt-5 space-y-4 stagger-list">
          {comments.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              editHref={APP_ROUTES.teacherRate(teacherId)}
              onDelete={onDelete}
            />
          ))}
          {commentsHasMore && (
            <button
              type="button"
              className="focus-ring inline-flex h-10 w-full items-center justify-center rounded-lg border border-line bg-white px-4 text-sm font900 text-slate-600 transition hover:border-primary hover:text-primary disabled:opacity-60 sm:w-auto"
              disabled={commentsLoading}
              onClick={onLoadMore}
            >
              {commentsLoading ? copy.loadingComments : copy.loadMoreComments}
            </button>
          )}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-line bg-white p-6 text-center">
          <MessageSquareText className="mx-auto h-10 w-10 text-primary" />
          <h3 className="mt-3 text-lg font900">{copy.noComments}</h3>
          <Link
            href={APP_ROUTES.teacherRate(teacherId)}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-primary-strong px-4 text-sm font900 text-white shadow-sm shadow-blue-200 transition hover:-translate-y-0.5 hover:brightness-105"
          >
            {copy.firstComment}
          </Link>
        </div>
      )}
    </div>
  );
}

