import { NextResponse } from "next/server";
import { createComplaint } from "@/lib/teacher-store";
import { z } from "zod";

const complaintSchema = z.object({
  reviewId: z.string().min(1, "Укажите ID отзыва"),
  complainantName: z.string().optional(),
  complainantEmail: z.string().email("Некорректный email").optional().or(z.literal("")),
  reason: z.string().min(5, "Опишите причину жалобы (минимум 5 символов)"),
  details: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { message: "Неверный формат данных." },
      { status: 400 },
    );
  }

  const parsed = complaintSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Проверьте поля формы." },
      { status: 400 },
    );
  }

  const result = await createComplaint({
    reviewId: parsed.data.reviewId,
    complainantName: parsed.data.complainantName?.trim() || undefined,
    complainantEmail: parsed.data.complainantEmail?.trim() || undefined,
    reason: parsed.data.reason,
    details: parsed.data.details?.trim() || undefined,
  });

  if (!result) {
    return NextResponse.json(
      { message: "Отзыв не найден." },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      message:
        "Жалоба принята. Отзыв временно скрыт до проверки администратором.",
    },
    { status: 201 },
  );
}
