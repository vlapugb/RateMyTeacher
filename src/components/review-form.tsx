"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { useAuthDialog } from "@/components/auth-dialog-context";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { metrics, teachers } from "@/lib/teacher-catalog";
import { facultyText, localizeMetrics } from "@/lib/i18n";
import { usePreferences, type LanguagePreference } from "@/lib/preferences";
import {
  ApiRequestError,
  createReview,
  deleteReview,
  updateReview,
} from "@/lib/api-client";
import { useConfirm } from "@/components/confirm-dialog";
import { APP_ROUTES } from "@/lib/app-routes";
import type { MetricKey, Review } from "@/lib/types";
import { cn } from "@/lib/utils";

type ReviewFormProps = {
  teacherId?: string;
  initialOwnReview?: Review | null;
};

const defaultScores = (): Partial<Record<MetricKey, number>> => ({});
const defaultDraft = {
  comment: "",
};

const reviewFormCopy: Record<
  LanguagePreference,
  {
    back: string;
    editTitle: string;
    createTitle: string;
    existingReview: string;
    categoriesTitle: string;
    inverseHint: string;
    commentTitle: string;
    commentPlaceholder: string;
    anonymous: string;
    guestNotice: string;
    delete: string;
    saving: string;
    saveChanges: string;
    publish: string;
    signIn: string;
    signInSuffix: string;
    emptyForm: string;
    submitFailed: string;
    deleteConfirm: string;
    deleteFailed: string;
    publishedAnonymous: string;
    published: string;
    pending: string;
    contentPledge: string;
    contentPledgeRequired: string;
    verifyEmail: string;
    alreadyReviewed: string;
    editMissing: string;
    setScore: (score: number) => string;
    notRated: string;
  }
> = {
  ru: {
    back: "Назад к преподавателю",
    editTitle: "Изменить оценку",
    createTitle: "Оставить отзыв",
    existingReview:
      "Вы уже оценили этого преподавателя. Здесь можно изменить отдельные пункты, обновить комментарий или удалить оценку.",
    categoriesTitle: "Оцените по категориям",
    inverseHint: " (чем ниже, тем лучше)",
    commentTitle: "Комментарий к оценке",
    commentPlaceholder: "Необязательно, до 500 символов",
    anonymous: "Показать отзыв анонимно",
    guestNotice:
      "Без входа можно оставить комментарий. Он будет опубликован анонимно.",
    delete: "Удалить оценку",
    saving: "Сохраняем...",
    saveChanges: "Сохранить изменения",
    publish: "Отправить на модерацию",
    signIn: "Войдите",
    signInSuffix:
      "чтобы поставить оценку. Комментарий можно оставить анонимно без входа.",
    emptyForm: "Поставьте хотя бы одну оценку или заполните комментарий.",
    submitFailed: "Не удалось отправить оценку.",
    deleteConfirm: "Удалить вашу оценку преподавателя?",
    deleteFailed: "Не удалось удалить оценку.",
    publishedAnonymous: "Оценка опубликована анонимно.",
    published: "Оценка отправлена.",
    pending: "Отзыв отправлен на модерацию и появится на сайте после проверки.",
    contentPledge:
      "Я подтверждаю, что отзыв основан на моем личном учебном опыте, не содержит заведомо ложных сведений, оскорблений, персональных данных третьих лиц, сведений о здоровье, личной жизни, адресах, телефонах, политических взглядах, национальности, религии и другой чувствительной информации.",
    contentPledgeRequired:
      "Перед отправкой подтвердите, что отзыв соответствует Правилам публикации.",
    verifyEmail: "Подтвердите почту перед публикацией оценки.",
    alreadyReviewed:
      "Вы уже оценили этого преподавателя. Измените существующий отзыв.",
    editMissing: "Сначала оставьте оценку.",
    setScore: (score) => `Поставить ${score}`,
    notRated: "Не оценено",
  },
  en: {
    back: "Back to teacher",
    editTitle: "Edit review",
    createTitle: "Leave a review",
    existingReview:
      "You have already reviewed this teacher. You can adjust scores, update the comment or delete the review.",
    categoriesTitle: "Rate by category",
    inverseHint: " (lower is better)",
    commentTitle: "Review comment",
    commentPlaceholder: "Optional, up to 500 characters",
    anonymous: "Publish anonymously",
    guestNotice:
      "Without signing in, you can leave a comment. It will be published anonymously.",
    delete: "Delete review",
    saving: "Saving...",
    saveChanges: "Save changes",
    publish: "Send for moderation",
    signIn: "Sign in",
    signInSuffix:
      "to submit a rating. You can leave an anonymous comment without signing in.",
    emptyForm: "Add at least one score or write a comment.",
    submitFailed: "Could not submit the review.",
    deleteConfirm: "Delete your teacher review?",
    deleteFailed: "Could not delete the review.",
    publishedAnonymous: "Review published anonymously.",
    published: "Review submitted.",
    pending: "Review sent for moderation and will appear after verification.",
    contentPledge:
      "I confirm this review is based on my personal academic experience, contains no false information, insults, third-party personal data, health information, private life details, addresses, phone numbers, political views, nationality, religion, or other sensitive information.",
    contentPledgeRequired:
      "Please confirm that your review complies with the Review Rules before submitting.",
    verifyEmail: "Verify your email before publishing a review.",
    alreadyReviewed:
      "You have already reviewed this teacher. Edit the existing review.",
    editMissing: "Leave a review first.",
    setScore: (score) => `Set ${score}`,
    notRated: "Not rated",
  },
  zh: {
    back: "返回教师页",
    editTitle: "编辑评价",
    createTitle: "留下评价",
    existingReview: "你已经评价过这位教师。可以修改评分、更新评论或删除评价。",
    categoriesTitle: "按类别评分",
    inverseHint: "（越低越好）",
    commentTitle: "评价评论",
    commentPlaceholder: "可选，最多 500 个字符",
    anonymous: "匿名发布评价",
    guestNotice: "未登录也可以发表评论；评论会匿名发布。",
    delete: "删除评价",
    saving: "保存中...",
    saveChanges: "保存修改",
    publish: "提交审核",
    signIn: "登录",
    signInSuffix: "后即可评分。未登录也可以匿名发表评论。",
    emptyForm: "请至少选择一个评分或填写评论。",
    submitFailed: "无法提交评价。",
    deleteConfirm: "删除你的教师评价？",
    deleteFailed: "无法删除评价。",
    publishedAnonymous: "评价已匿名发布。",
    published: "评价已提交。",
    pending: "评价已提交审核，审核通过后将显示。",
    contentPledge:
      "我确认此评价基于我的个人学术经验，不含虚假信息、侮辱、第三方个人数据、健康信息、私人生活细节、地址、电话、政治观点、民族、宗教或其他敏感信息。",
    contentPledgeRequired: "提交前请确认您的评价符合评价规则。",
    verifyEmail: "发布评价前请先验证邮箱。",
    alreadyReviewed: "你已经评价过这位教师。请编辑现有评价。",
    editMissing: "请先留下评价。",
    setScore: (score) => `设置 ${score} 分`,
    notRated: "未评分",
  },
};

export function ReviewForm({
  teacherId,
  initialOwnReview = null,
}: ReviewFormProps) {
  const router = useRouter();
  const { openAuthDialog } = useAuthDialog();
  const session = authClient.useSession();
  const user = session.data?.user;
  const { language } = usePreferences();
  const confirm = useConfirm();
  const copy = reviewFormCopy[language];
  const localizedMetrics = useMemo(
    () => localizeMetrics(metrics, language),
    [language],
  );
  const teacher = useMemo(
    () => teachers.find((item) => item.id === teacherId) ?? teachers[0],
    [teacherId],
  );
  const [scores, setScores] = useState<Partial<Record<MetricKey, number>>>(
    () => initialOwnReview?.scores ?? defaultScores(),
  );
  const [draft, setDraft] = useState(() =>
    initialOwnReview
      ? { comment: getReviewComment(initialOwnReview) }
      : defaultDraft,
  );
  const [ownReview, setOwnReview] = useState<Review | null>(initialOwnReview);
  const [publishAnonymously, setPublishAnonymously] = useState(
    Boolean(initialOwnReview?.anonymous),
  );
  const [status, setStatus] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [contentPledgeAccepted, setContentPledgeAccepted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setStatus(null);
    setAuthRequired(false);

    const comment = draft.comment.trim();
    const hasComment = comment.length > 0;
    const hasScore = Object.values(scores).some(
      (value) => typeof value === "number",
    );

    if (!hasComment && !hasScore) {
      setSubmitting(false);
      setStatus(copy.emptyForm);
      return;
    }

    if (!user && hasScore) {
      setSubmitting(false);
      setAuthRequired(true);
      setStatus(copy.signInSuffix);
      return;
    }

    if (!contentPledgeAccepted) {
      setSubmitting(false);
      setStatus(copy.contentPledgeRequired);
      return;
    }

    const payload = {
      teacherId: teacher.id,
      scores,
      comment,
      liked: ownReview?.liked ?? "",
      difficult: ownReview?.difficult ?? "",
      examProcess: ownReview?.examProcess ?? "",
      advice: ownReview?.advice ?? "",
      anonymous: !user || publishAnonymously,
      publishAnonymously: !user || publishAnonymously,
    };

    const response = await (ownReview
      ? updateReview(payload)
      : createReview(payload)
    )
      .then(() => ({ ok: true, status: 200 }))
      .catch((error) => ({
        ok: false,
        status: error instanceof ApiRequestError ? error.status : 0,
      }));

    setSubmitting(false);

    if (!response.ok) {
      if (response.status === 0) {
        setStatus(copy.submitFailed);
        return;
      }
      setAuthRequired(response.status === 401);
      setStatus(getSubmitErrorMessage(response.status, copy));
      return;
    }

    setStatus(copy.pending);
    router.push(
      hasComment
        ? APP_ROUTES.teacherComments(teacher.id)
        : APP_ROUTES.teacher(teacher.id),
    );
    router.refresh();
  }

  async function handleDelete() {
    if (!ownReview) return;
    const confirmed = await confirm({
      message: copy.deleteConfirm,
      variant: "danger",
      confirmLabel: language === "ru" ? "Удалить" : language === "zh" ? "删除" : "Delete",
      cancelLabel: language === "ru" ? "Отмена" : language === "zh" ? "取消" : "Cancel",
    });
    if (!confirmed) return;

    setSubmitting(true);
    setStatus(null);

    const deleted = await deleteReview({ teacherId: teacher.id })
      .then(() => true)
      .catch(() => false);

    setSubmitting(false);

    if (!deleted) {
      setStatus(copy.deleteFailed);
      return;
    }

    setOwnReview(null);
    setScores(defaultScores());
    setDraft(defaultDraft);
    setPublishAnonymously(false);
    router.push(APP_ROUTES.teacher(teacher.id));
    router.refresh();
  }

  return (
    <form className="page-soft-enter px-5 pb-8 md:px-8" onSubmit={handleSubmit}>
      <section className="mt-6">
        <Link
          href={APP_ROUTES.teacher(teacher.id)}
          className="mb-5 inline-flex items-center gap-2 text-sm font900 text-slate-600 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {copy.back}
        </Link>
        <h1 className="text-3xl font900">
          {ownReview ? copy.editTitle : copy.createTitle}
        </h1>
        <p className="mt-2 text-sm font700 text-muted">
          {teacher.fullName} · {facultyText[language]}
        </p>
        {ownReview && (
          <div className="mt-4 rounded-lg border border-primary/30 bg-primary-soft p-4 text-sm font800 text-slate-700">
            {copy.existingReview}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font900">{copy.categoriesTitle}</h2>
        <div className="mt-4 grid gap-3">
          {localizedMetrics.map((metric) => (
            <div
              key={metric.key}
              className="grid gap-3 rounded-lg border border-line bg-white p-3 md:grid-cols-[260px_1fr]"
            >
              <span
                className={cn(
                  "text-sm font900 text-slate-700",
                  metric.inverse && "text-danger",
                )}
              >
                {metric.label}
                {metric.inverse && copy.inverseHint}
              </span>
              <RatingInput
                value={scores[metric.key]}
                danger={metric.inverse}
                notRatedLabel={copy.notRated}
                getScoreLabel={copy.setScore}
                onChange={(value) =>
                  setScores((current) => {
                    const next = { ...current };

                    if (current[metric.key] === value) {
                      delete next[metric.key];
                      return next;
                    }

                    next[metric.key] = value;
                    return next;
                  })
                }
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font900">{copy.commentTitle}</h2>
        <TextArea
          ariaLabel={copy.commentTitle}
          placeholder={copy.commentPlaceholder}
          value={draft.comment}
          onChange={(value) =>
            setDraft((current) => ({ ...current, comment: value }))
          }
        />
      </section>

      <section className="mt-8 rounded-lg border border-line bg-slate-50 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={contentPledgeAccepted}
            onChange={(e) => setContentPledgeAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-line"
          />
          <span className="text-xs font700 leading-5 text-slate-600">
            {copy.contentPledge}{" "}
            <a
              href="/legal/review-rules"
              target="_blank"
              className="text-primary underline underline-offset-4 hover:no-underline"
            >
              {language === "ru"
                ? "Правила публикации"
                : language === "zh"
                  ? "评价规则"
                  : "Review Rules"}
            </a>
          </span>
        </label>
      </section>

      <div className="mt-7 flex flex-col gap-3 rounded-lg border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex items-center gap-3 text-sm font900 text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-line"
            checked={!user || publishAnonymously}
            disabled={!user}
            onChange={(event) => setPublishAnonymously(event.target.checked)}
          />
          {copy.anonymous}
        </label>
        {!user && (
          <p className="text-xs font800 leading-5 text-muted sm:max-w-sm">
            {copy.guestNotice}
          </p>
        )}
        <div className="flex flex-col gap-3 sm:flex-row">
          {ownReview && (
            <Button
              type="button"
              variant="danger"
              disabled={submitting}
              onClick={handleDelete}
            >
              {copy.delete}
            </Button>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting
              ? copy.saving
              : ownReview
                ? copy.saveChanges
                : copy.publish}
          </Button>
        </div>
      </div>

      {status && (
        <div className="mt-5 rounded-lg border border-line bg-slate-50 p-4 text-sm font800 text-slate-700">
          {authRequired ? (
            <>
              <button
                type="button"
                className="font900 text-primary underline-offset-4 hover:underline"
                onClick={() => openAuthDialog("signin")}
              >
                {copy.signIn}
              </button>{" "}
              {copy.signInSuffix}
            </>
          ) : (
            status
          )}
        </div>
      )}
    </form>
  );
}

function RatingInput({
  value,
  onChange,
  danger,
  notRatedLabel,
  getScoreLabel,
}: {
  value?: number;
  onChange: (value: number) => void;
  danger?: boolean;
  notRatedLabel: string;
  getScoreLabel: (score: number) => string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            className="focus-ring rounded-md p-0.5"
            onClick={() => onChange(score)}
            aria-label={getScoreLabel(score)}
          >
            <Star
              className={cn(
                "h-7 w-7",
                typeof value === "number" && score <= value
                  ? danger
                    ? "fill-danger text-danger"
                    : "fill-primary text-primary"
                  : "text-slate-300",
              )}
            />
          </button>
        ))}
      </div>
      <span className="min-w-20 text-right text-xs font800 text-muted">
        {typeof value === "number" ? `${value} / 5` : notRatedLabel}
      </span>
    </div>
  );
}

function TextArea({
  ariaLabel,
  placeholder,
  value,
  onChange,
}: {
  ariaLabel: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mt-4">
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={500}
        aria-label={ariaLabel}
        placeholder={placeholder}
        className="focus-ring min-h-32 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm font700 leading-6 text-foreground placeholder:text-slate-400"
      />
    </div>
  );
}

function getReviewComment(review: Review) {
  return review.comment?.trim() || review.body;
}

function getSubmitErrorMessage(
  status: number,
  copy: (typeof reviewFormCopy)[LanguagePreference],
) {
  if (status === 403) return copy.verifyEmail;
  if (status === 409) return copy.alreadyReviewed;
  if (status === 404) return copy.editMissing;

  return copy.submitFailed;
}
