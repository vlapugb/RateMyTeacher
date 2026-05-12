"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { API_ROUTES } from "@/lib/app-routes";

export default function ComplaintPage() {
  return (
    <Suspense
      fallback={<div className="text-sm text-muted">Загрузка...</div>}
    >
      <ComplaintForm />
    </Suspense>
  );
}

function ComplaintForm() {
  const searchParams = useSearchParams();
  const initialReviewId = searchParams.get("reviewId") ?? "";

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const reviewId = String(form.get("reviewId") ?? "").trim();
    const complainantName = String(form.get("complainantName") ?? "").trim();
    const complainantEmail = String(form.get("complainantEmail") ?? "").trim();
    const reason = String(form.get("reason") ?? "").trim();
    const details = String(form.get("details") ?? "").trim();

    if (!reviewId) {
      setStatus("Укажите ссылку или ID отзыва.");
      return;
    }

    if (reason.length < 5) {
      setStatus("Опишите причину жалобы (минимум 5 символов).");
      return;
    }

    setSubmitting(true);
    setStatus(null);

    const response = await fetch(API_ROUTES.complaints, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviewId,
        complainantName: complainantName || undefined,
        complainantEmail: complainantEmail || undefined,
        reason,
        details: details || undefined,
      }),
    }).catch(() => null);

    setSubmitting(false);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setStatus(
        body?.message ?? "Не удалось отправить жалобу. Попробуйте позже.",
      );
      return;
    }

    setSuccess(true);
    setStatus(
      "Жалоба принята. Отзыв временно скрыт до проверки. Мы рассмотрим обращение и свяжемся с вами, если указан контакт.",
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font900">Жалоба на отзыв</h1>
      <p className="mt-2 text-sm font700 text-muted">
        Если опубликованный отзыв нарушает Правила публикации отзывов,
        законодательство РФ, содержит клевету, оскорбления, персональные данные
        или иную недопустимую информацию, заполните форму ниже. Отзыв будет
        временно скрыт до проверки.
      </p>

      {success ? (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm font800 text-emerald-800">
          {status}
        </div>
      ) : (
        <form className="mt-6 space-y-4" noValidate onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-xs font800 text-slate-600">
              Ссылка на отзыв или ID отзыва *
            </span>
            <input
              name="reviewId"
              required
              defaultValue={initialReviewId}
              placeholder="https://ratespbuteacher.ru/teachers/... или ID отзыва"
              className="focus-ring mt-1 h-10 w-full rounded-lg border border-line px-3 text-sm"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font800 text-slate-600">
                Ваше имя (необязательно)
              </span>
              <input
                name="complainantName"
                placeholder="Иван Иванов"
                className="focus-ring mt-1 h-10 w-full rounded-lg border border-line px-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font800 text-slate-600">
                Email для связи (необязательно)
              </span>
              <input
                name="complainantEmail"
                type="email"
                placeholder="email@example.com"
                className="focus-ring mt-1 h-10 w-full rounded-lg border border-line px-3 text-sm"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font800 text-slate-600">
              Причина жалобы *
            </span>
            <select
              name="reason"
              required
              defaultValue=""
              className="focus-ring mt-1 h-10 w-full rounded-lg border border-line px-3 text-sm"
            >
              <option value="" disabled>
                Выберите причину
              </option>
              <option value="Клевета, заведомо ложные сведения">
                Клевета, заведомо ложные сведения
              </option>
              <option value="Оскорбления, унижение чести и достоинства">
                Оскорбления, унижение чести и достоинства
              </option>
              <option value="Персональные данные (ФИО, адреса, телефоны)">
                Персональные данные (ФИО, адреса, телефоны)
              </option>
              <option value="Сведения о здоровье, личной жизни">
                Сведения о здоровье, личной жизни
              </option>
              <option value="Политические, религиозные, национальные признаки">
                Политические, религиозные, национальные признаки
              </option>
              <option value="Ненормативная лексика">
                Ненормативная лексика
              </option>
              <option value="Призывы к травле, бойкоту">
                Призывы к травле, бойкоту
              </option>
              <option value="Обвинения в преступлениях без приговора суда">
                Обвинения в преступлениях без приговора суда
              </option>
              <option value="Я преподаватель, отзыв затрагивает мою репутацию">
                Я преподаватель, отзыв затрагивает мою репутацию
              </option>
              <option value="Другое">Другое</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font800 text-slate-600">
              Подробности (необязательно)
            </span>
            <textarea
              name="details"
              rows={4}
              placeholder="Опишите, что именно нарушает отзыв..."
              className="focus-ring mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              required
              className="mt-0.5 h-4 w-4 rounded border-line"
            />
            <span className="text-xs font700 text-muted">
              Я подтверждаю достоверность указанных сведений и осознаю
              ответственность за заведомо ложное обращение в соответствии со
              ст. 306 УК РФ.
            </span>
          </label>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Отправляем..." : "Отправить жалобу"}
          </Button>
        </form>
      )}

      {status && !success && (
        <div className="mt-4 rounded-lg border border-line bg-slate-50 p-4 text-sm font800 text-slate-700">
          {status}
        </div>
      )}
    </div>
  );
}
