import { NextResponse } from "next/server";
import { MODERATION_CONFIG } from "@/lib/app-config";
import { moderateReview } from "@/lib/teacher-store";

export async function POST(request: Request) {
  const secret = request.headers.get("x-moderation-secret");

  if (!MODERATION_CONFIG.webhookSecret || secret !== MODERATION_CONFIG.webhookSecret) {
    return NextResponse.json(
      { message: "Доступ запрещён." },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.reviewId !== "string" ||
    typeof body.adminId !== "string" ||
    typeof body.action !== "string"
  ) {
    return NextResponse.json(
      { message: "reviewId, adminId и action обязательны." },
      { status: 400 },
    );
  }

  const validActions = ["approve", "reject", "request_edit", "ban_user", "dispute", "restore"];
  if (!validActions.includes(body.action)) {
    return NextResponse.json(
      { message: `action должен быть одним из: ${validActions.join(", ")}` },
      { status: 400 },
    );
  }

  const result = await moderateReview({
    reviewId: body.reviewId,
    adminId: body.adminId,
    action: body.action,
    reason: typeof body.reason === "string" ? body.reason : undefined,
  });

  if (!result) {
    return NextResponse.json(
      { message: "Отзыв не найден." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, ...result });
}
