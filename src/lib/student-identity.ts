import { STUDENT_IDENTITY } from "@/lib/app-config";

<<<<<<< HEAD
export const STUDENT_EMAIL_SUFFIX = `@${STUDENT_IDENTITY.emailDomain}`;
export const STUDENT_LOGIN_PATTERN = new RegExp(
  `^${STUDENT_IDENTITY.loginPrefix}[0-9]{${STUDENT_IDENTITY.loginDigitCount}}$`,
);
export const STUDENT_EMAIL_PATTERN = new RegExp(
  `^${STUDENT_IDENTITY.loginPrefix}[0-9]{${STUDENT_IDENTITY.loginDigitCount}}@${STUDENT_IDENTITY.emailDomain.replaceAll(
    ".",
    "\\.",
  )}$`,
);
=======
export const STUDENT_LOGIN_PATTERN = STUDENT_IDENTITY.loginPattern;
export const STUDENT_EMAIL_PATTERN = STUDENT_IDENTITY.emailPattern;
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)

export function normalizeStudentIdentifier(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

<<<<<<< HEAD
export function getStudentEmailForLogin(login: string) {
  return `${login}${STUDENT_EMAIL_SUFFIX}`;
}

export function isStudentLogin(value: string) {
  return STUDENT_LOGIN_PATTERN.test(value);
}

export function isStudentEmail(value: string) {
  return STUDENT_EMAIL_PATTERN.test(value);
}

export function isStudentEmailMatchingLogin(email: string, login: string) {
  return isStudentEmail(email) && email === getStudentEmailForLogin(login);
=======
export function isStudentLogin(value: string) {
  return STUDENT_IDENTITY.loginPattern.test(value);
}

export function isStudentEmailMatchingLogin(email: string, login: string) {
  return (
    STUDENT_IDENTITY.emailPattern.test(email) &&
    email === `${login}@${STUDENT_IDENTITY.emailDomain}`
  );
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
}
