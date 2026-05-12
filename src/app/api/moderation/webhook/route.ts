import { NextResponse } from "next/server";
import { MODERATION_CONFIG } from "@/lib/app-config";
import { moderateReview, getReviewById, getPendingReviews } from "@/lib/teacher-store";
import { teachers } from "@/lib/teacher-catalog";

export async function POST(request: Request) {
  const secret = request.headers.get("x-telegram-bot-api-secret-token");

  if (
    !MODERATION_CONFIG.webhookSecret ||
    secret !== MODERATION_CONFIG.webhookSecret
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const update = await request.json().catch(() => null);

  if (!update) {
    return NextResponse.json({ ok: true });
  }

  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text?.trim() ?? "";

    if (text === "/start" || text === "/help") {
      return sendTelegramMessage(chatId, [
        "RateMyTeacher Bot — модерация отзывов.",
        "",
        "Команды:",
        "/pending — показать отзывы на модерации",
        "/review <id> — показать детали отзыва",
        "/approve <id> — одобрить",
        "/reject <id> — отклонить",
        "/edit <id> — запросить доработку",
        "/ban <id> — забанить пользователя",
        "/dispute <id> — пометить как спорный (жалоба)",
        "/restore <id> — восстановить отзыв",
      ].join("\n"));
    } else if (text === "/pending") {
      const pending = await getPendingReviews(10);
      if (!pending.length) {
        return sendTelegramMessage(chatId, "Нет отзывов на модерации.");
      }
      const lines = pending.map((r) => {
        const teacher = teachers.find((t) => t.id === r.teacher_id);
        const preview =
          r.comment.slice(0, 80) || "[без комментария]";
        return `/review_${r.id} — ${teacher?.shortName ?? r.teacher_id}: ${preview}`;
      });
      return sendTelegramMessage(chatId, lines.join("\n"));
    }

    return NextResponse.json({ ok: true });
  }

  if (update.callback_query) {
    const callback = update.callback_query;
    const data = callback.data ?? "";
    const fromId = String(callback.from.id);

    if (MODERATION_CONFIG.telegramAdminId && fromId !== MODERATION_CONFIG.telegramAdminId) {
      return sendTelegramCallbackAnswer(callback.id, "Нет доступа.");
    }

    const [action, reviewId] = data.split(":");

    if (!reviewId) {
      return sendTelegramCallbackAnswer(callback.id, "Неверная команда.");
    }

    const review = await getReviewById(reviewId);

    if (!review) {
      return sendTelegramCallbackAnswer(callback.id, "Отзыв не найден.");
    }

    const actionLabels: Record<string, string> = {
      approve: "одобрен",
      reject: "отклонён",
      request_edit: "отправлен на доработку",
      ban_user: "пользователь забанен",
      dispute: "помечен как спорный",
      restore: "восстановлен",
    };

    await moderateReview({
      reviewId,
      adminId: fromId,
      action,
    });

    const label = actionLabels[action] ?? action;
    await sendTelegramCallbackAnswer(callback.id, `Отзыв ${label}.`);

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}

async function sendTelegramMessage(chatId: number | string, text: string) {
  const token = MODERATION_CONFIG.telegramBotToken;
  if (!token) return NextResponse.json({ ok: true });

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  }).catch(() => null);

  return NextResponse.json({ ok: true });
}

async function sendTelegramCallbackAnswer(callbackId: string, text: string) {
  const token = MODERATION_CONFIG.telegramBotToken;
  if (!token) return;

  await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackId,
      text,
      show_alert: false,
    }),
  }).catch(() => null);
}
