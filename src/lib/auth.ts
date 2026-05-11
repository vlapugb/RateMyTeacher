import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { sendAuthEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { pool } from "@/db/client";
import { requireServerEnv } from "@/lib/env";
import {
  APP_NAME,
  STUDENT_IDENTITY,
} from "@/lib/app-config";
import {
  isStudentEmailMatchingLogin,
  isStudentLogin,
  normalizeStudentIdentifier,
} from "@/lib/student-identity";

const authSecret = requireServerEnv("BETTER_AUTH_SECRET");
const authBaseUrl = requireServerEnv("BETTER_AUTH_URL");

if (authSecret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must be at least 32 characters long");
}

const isBuildTime =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.NEXT_PHASE === "phase-development-server";

if (
  process.env.NODE_ENV === "production" &&
  !isBuildTime &&
  authSecret.length < 40
) {
  throw new Error(
    "FATAL: BETTER_AUTH_SECRET is too short for production. " +
    "Generate at least 40 chars: openssl rand -hex 32",
  );
}

export const auth = betterAuth({
  appName: APP_NAME,
  database: pool,
  secret: authSecret,
  baseURL: authBaseUrl,
  user: {
    additionalFields: {
      login: {
        type: "string",
        required: true,
        input: true,
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;

      const body = ctx.body as
        | {
            email?: unknown;
            login?: unknown;
          }
        | undefined;
      const email = normalizeStudentIdentifier(body?.email);
      const login = normalizeStudentIdentifier(body?.login);

      if (!isStudentLogin(login)) {
        throw new APIError("BAD_REQUEST", {
          message: "Логин должен быть в формате stXXXXXX.",
        });
      }

      if (!isStudentEmailMatchingLogin(email, login)) {
        throw new APIError("BAD_REQUEST", {
          message: `Почта должна совпадать с логином и доменом @${STUDENT_IDENTITY.emailDomain}.`,
        });
      }
    }),
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: STUDENT_IDENTITY.passwordMinLength,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: "Восстановление пароля StudRadar",
        text: `Перейдите по ссылке, чтобы задать новый пароль: ${url}`,
        html: `<p>Перейдите по ссылке, чтобы задать новый пароль:</p><p><a href="${url}">${url}</a></p>`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: STUDENT_IDENTITY.emailVerificationTtlSeconds,
    sendVerificationEmail: async ({ user, url }) => {
      logger.info({ userId: user.id }, "Sending verification email");
      await sendAuthEmail({
        to: user.email,
        subject: "Подтвердите почту StudRadar",
        text: `Подтвердите почту по ссылке: ${url}`,
        html: `<p>Подтвердите почту, чтобы публиковать оценки:</p><p><a href="${url}">${url}</a></p>`,
      });
    },
  },
});
