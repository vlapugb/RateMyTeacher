import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recordUserConsent } from "@/lib/teacher-store";

const VALID_CONSENT_TYPES = new Set<string>([
  "terms_of_service",
  "personal_data",
  "cookies_analytics",
  "cookies_marketing",
]);

export async function POST(request: Request) {
  const session = await auth.api
    .getSession({ headers: request.headers })
    .catch(() => null);

  const body = await request.json().catch(() => null);

  if (!body || typeof body.consentType !== "string") {
    return NextResponse.json(
      { message: "Укажите тип согласия." },
      { status: 400 },
    );
  }

  if (!VALID_CONSENT_TYPES.has(body.consentType)) {
    return NextResponse.json(
      { message: "Недопустимый тип согласия." },
      { status: 400 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous";
  const ua = request.headers.get("user-agent") ?? "unknown";

  const result = await recordUserConsent({
    userId: session?.user.id ?? null,
    consentType: body.consentType,
    documentVersion: body.documentVersion ?? "1.0",
    ip,
    userAgent: ua,
  });

  return NextResponse.json(result, { status: 201 });
}
