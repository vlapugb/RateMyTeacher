import { STUDENT_IDENTITY } from "@/lib/app-config";

export const STUDENT_LOGIN_PATTERN = STUDENT_IDENTITY.loginPattern;
export const STUDENT_EMAIL_PATTERN = STUDENT_IDENTITY.emailPattern;

export function normalizeStudentIdentifier(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isStudentLogin(value: string) {
  return STUDENT_IDENTITY.loginPattern.test(value);
}

export function isStudentEmailMatchingLogin(email: string, login: string) {
  return (
    STUDENT_IDENTITY.emailPattern.test(email) &&
    email === `${login}@${STUDENT_IDENTITY.emailDomain}`
  );
}
