/**
 * RateMyTeacher Moderation Telegram Bot
 *
 * Deployed at: /opt/ratemyteacher-bot/bot.ts on 151.243.173.175
 * Run: npx tsx bot.ts
 */

import * as fs from "fs";

const ENV_FILE = "/opt/ratemyteacher-bot/.env";

function loadEnv(path: string) {
  if (!fs.existsSync(path)) return;
  const lines = fs.readFileSync(path, "utf-8").split("\n");
  for (const line of lines) {
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnv(ENV_FILE);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const MODERATION_API_URL =
  process.env.MODERATION_API_URL ?? "https://ratespbuteacher.ru/api/moderation";
const WEBHOOK_SECRET = process.env.MODERATION_WEBHOOK_SECRET ?? "";

function getAdminId(): string {
  return process.env.TELEGRAM_ADMIN_ID?.trim() ?? "";
}

function setAdminIdEnv(id: string) {
  const existing = fs.existsSync(ENV_FILE)
    ? fs.readFileSync(ENV_FILE, "utf-8")
    : "";
  const newLine = `TELEGRAM_ADMIN_ID=${id}`;
  const updated = existing
    .split("\n")
    .map((line) =>
      line.startsWith("TELEGRAM_ADMIN_ID=") ? newLine : line,
    )
    .join("\n");
  if (!updated.includes("TELEGRAM_ADMIN_ID=")) {
    fs.appendFileSync(ENV_FILE, `\n${newLine}\n`);
  } else {
    fs.writeFileSync(ENV_FILE, updated);
  }
  process.env.TELEGRAM_ADMIN_ID = id;
}

if (!BOT_TOKEN) {
  console.error("FATAL: TELEGRAM_BOT_TOKEN is required");
  process.exit(1);
}

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function telegram(method: string, body: Record<string, unknown>, timeoutMs = 15000) {
  try {
    const response = await fetch(`${TELEGRAM_API}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    return (await response.json()) as { ok: boolean; result?: unknown };
  } catch (error) {
    console.error(`[telegram] ${method} failed:`, error);
    return { ok: false };
  }
}

async function moderateViaApi(
  reviewId: string,
  adminId: string,
  action: string,
  reason?: string,
) {
  try {
    const response = await fetch(MODERATION_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-moderation-secret": WEBHOOK_SECRET,
      },
      body: JSON.stringify({ reviewId, adminId, action, reason }),
      signal: AbortSignal.timeout(15000),
    });
    return response.ok ? ((await response.json()) as { ok: boolean }) : null;
  } catch {
    return null;
  }
}

async function getPendingReviews() {
  try {
    const base = MODERATION_API_URL.replace(/\/api\/moderation\/?$/, "");
    const url = `${base}/api/reviews/pending?limit=20`;
    const response = await fetch(url, {
      headers: { "x-moderation-secret": WEBHOOK_SECRET },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return [];
    const data = (await response.json()) as {
      reviews?: Array<{
        id: string;
        teacher_id: string;
        comment: string;
        knowledge?: string | null;
        communication?: string | null;
        leniency?: string | null;
        fairness?: string | null;
        vibe?: string | null;
        overall?: string | null;
        status: string;
        created_at: string;
        anonymous: boolean;
        author_name?: string | null;
      }>;
    };
    return data.reviews ?? [];
  } catch {
    return [];
  }
}

function formatReview(r: {
  id: string;
  teacher_id: string;
  comment: string;
  knowledge?: string | null;
  communication?: string | null;
  leniency?: string | null;
  fairness?: string | null;
  vibe?: string | null;
  overall?: string | null;
  status: string;
  created_at: string;
  anonymous: boolean;
  author_name?: string | null;
}) {
  const scores = [
    r.knowledge ? `Зн:${r.knowledge}` : "",
    r.communication ? `Комм:${r.communication}` : "",
    r.leniency ? `Снисх:${r.leniency}` : "",
    r.fairness ? `Справ:${r.fairness}` : "",
    r.vibe ? `Вайб:${r.vibe}` : "",
    r.overall ? `Общ:${r.overall}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const comment = r.comment.trim().slice(0, 400) || "[без комментария]";
  const created = new Date(r.created_at).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });
  const author = r.anonymous
    ? "Анонимно"
    : (r.author_name ?? "Студент");

  return [
    `<b>ID:</b> <code>${r.id}</code>`,
    `<b>Преподаватель:</b> ${r.teacher_id}`,
    `<b>Автор:</b> ${author}`,
    scores ? `<b>Оценки:</b> ${scores}` : "",
    `<b>Статус:</b> ${r.status}`,
    `<b>Дата:</b> ${created}`,
    "",
    `<b>Текст:</b>\n${comment}`,
  ]
    .filter(Boolean)
    .join("\n");
}

const ACTION_LABELS: Record<string, string> = {
  approve: "✅ Одобрен",
  reject: "❌ Отклонён",
  request_edit: "✏️ На доработку",
  ban_user: "🚫 Пользователь забанен",
  dispute: "⚠️ Спорный",
  restore: "🔄 Восстановлен",
};

async function handleCallback(c: {
  id: string;
  data?: string;
  from: { id: number };
  message?: { chat: { id: number }; message_id: number; text?: string };
}) {
  const fromId = String(c.from.id);
  const adminId = getAdminId();

  if (!adminId) {
    await telegram("answerCallbackQuery", {
      callback_query_id: c.id,
      text: `Ваш ID: ${fromId}. Администратор ещё не настроен.`,
      show_alert: true,
    });
    return;
  }

  if (fromId !== adminId) {
    await telegram("answerCallbackQuery", {
      callback_query_id: c.id,
      text: "Нет доступа.",
    });
    return;
  }

  if (!c.data) {
    await telegram("answerCallbackQuery", {
      callback_query_id: c.id,
      text: "Пустая команда.",
    });
    return;
  }

  const [action, ...rest] = c.data.split(":");
  const reviewId = rest.join(":");

  if (!reviewId) {
    await telegram("answerCallbackQuery", {
      callback_query_id: c.id,
      text: "Неверный формат.",
    });
    return;
  }

  const result = await moderateViaApi(reviewId, fromId, action);

  if (!result) {
    await telegram("answerCallbackQuery", {
      callback_query_id: c.id,
      text: "Ошибка API. Проверьте логи.",
    });
    return;
  }

  await telegram("answerCallbackQuery", {
    callback_query_id: c.id,
    text: `${ACTION_LABELS[action] ?? action}`,
  });

  if (c.message) {
    const original = c.message.text ?? "";
    await telegram("editMessageText", {
      chat_id: c.message.chat.id,
      message_id: c.message.message_id,
      text: `${original}\n\n${ACTION_LABELS[action] ?? action}`,
      parse_mode: "HTML",
    });
  }
}

async function handleMessage(m: {
  chat: { id: number };
  from: { id: number; username?: string };
  text?: string;
}) {
  const chatId = m.chat.id;
  const fromId = String(m.from.id);
  const username = m.from.username ?? "без username";
  const text = m.text?.trim() ?? "";
  const adminId = getAdminId();

  if (!adminId) {
    console.log(`[bootstrap] Message from ID=${fromId} username=@${username} text="${text}"`);
    if (text === "/claim") {
      setAdminIdEnv(fromId);
      await telegram("sendMessage", {
        chat_id: chatId,
        text: `✅ Вы назначены администратором. ID=${fromId}. Используйте /help для списка команд.`,
      });
      return;
    }
    await telegram("sendMessage", {
      chat_id: chatId,
      text: `Ваш Telegram ID: <code>${fromId}</code>\n\nДля назначения администратором отправьте /claim`,
      parse_mode: "HTML",
    });
    return;
  }

  if (fromId !== adminId) {
    await telegram("sendMessage", {
      chat_id: chatId,
      text: "Доступ запрещён.",
    });
    return;
  }

  if (text === "/start" || text === "/help") {
    await telegram("sendMessage", {
      chat_id: chatId,
      text: [
        "<b>RateMyTeacher Moderation Bot</b>",
        "",
        "Команды:",
        "/pending — отзывы на модерации",
        "/help — эта справка",
      ].join("\n"),
      parse_mode: "HTML",
    });
    return;
  }

  if (text === "/pending") {
    const reviews = await getPendingReviews();
    if (!reviews.length) {
      await telegram("sendMessage", {
        chat_id: chatId,
        text: "Нет отзывов на модерации.",
      });
      return;
    }

    for (const r of reviews) {
      await telegram("sendMessage", {
        chat_id: chatId,
        text: formatReview(r),
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✅ Одобрить", callback_data: `approve:${r.id}` },
              { text: "❌ Отклонить", callback_data: `reject:${r.id}` },
            ],
            [
              { text: "✏️ Доработка", callback_data: `request_edit:${r.id}` },
              { text: "🚫 Бан", callback_data: `ban_user:${r.id}` },
            ],
          ],
        },
      });
      await new Promise((r) => setTimeout(r, 400));
    }
    return;
  }

  await telegram("sendMessage", {
    chat_id: chatId,
    text: "Неизвестная команда. /help — список команд.",
  });
}

async function main() {
  console.log(`[bot] Starting. Bot online. Admin ID: ${getAdminId() || "NOT SET"}`);

  let lastUpdateId = 0;

  while (true) {
    try {
      const result = (await telegram("getUpdates", {
        offset: lastUpdateId + 1,
        timeout: 30,
        allowed_updates: ["message", "callback_query"],
      }, 45000)) as {
        ok: boolean;
        result?: Array<{
          update_id: number;
          message?: { chat: { id: number }; from: { id: number; username?: string }; text?: string };
          callback_query?: {
            id: string;
            data?: string;
            from: { id: number };
            message?: { chat: { id: number }; message_id: number; text?: string };
          };
        }>;
      };

      if (result.ok && result.result) {
        for (const update of result.result) {
          lastUpdateId = Math.max(lastUpdateId, update.update_id);
          if (update.callback_query) {
            await handleCallback(update.callback_query);
          } else if (update.message) {
            await handleMessage(update.message);
          }
        }
      }
    } catch (error) {
      console.error("[bot] Poll error:", error);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

main().catch((error) => {
  console.error("[bot] Fatal:", error);
  process.exit(1);
});
