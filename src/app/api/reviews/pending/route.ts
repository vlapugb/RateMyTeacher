import { NextResponse } from "next/server";
import { MODERATION_CONFIG } from "@/lib/app-config";
import { getPendingReviews } from "@/lib/teacher-store";

export async function GET(request: Request) {
  const secret = request.headers.get("x-moderation-secret");

  if (!MODERATION_CONFIG.webhookSecret || secret !== MODERATION_CONFIG.webhookSecret) {
    return NextResponse.json(
      { message: "Доступ запрещён." },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get("limit") ?? "50") || 50),
  );

  const reviews = await getPendingReviews(limit);

  return NextResponse.json({ reviews });
}
