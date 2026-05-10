"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthDialog } from "@/components/auth-dialog-context";
import { usePreferences, type LanguagePreference } from "@/lib/preferences";

const resetCopy: Record<
  LanguagePreference,
  {
    expired: string;
    missingToken: string;
    passwordShort: string;
    mismatch: string;
    failed: string;
    success: string;
    back: string;
    title: string;
    subtitle: string;
    signIn: string;
    newPassword: string;
    repeatPassword: string;
    saving: string;
    save: string;
  }
> = {
  ru: {
    expired: "Ссылка устарела или уже была использована.",
    missingToken: "Откройте страницу по ссылке из письма.",
    passwordShort: "Пароль должен быть не короче 8 символов.",
    mismatch: "Пароли не совпадают.",
    failed: "Не удалось сменить пароль. Запросите новую ссылку.",
    success: "Пароль изменен. Теперь можно войти с новым паролем.",
    back: "Назад к преподавателям",
    title: "Смена пароля",
    subtitle: "Задайте новый пароль для аккаунта StudRadar.",
    signIn: "Войти",
    newPassword: "Новый пароль",
    repeatPassword: "Повторите пароль",
    saving: "Сохраняем...",
    save: "Сохранить пароль",
  },
  en: {
    expired: "The link has expired or has already been used.",
    missingToken: "Open this page from the email link.",
    passwordShort: "Password must be at least 8 characters.",
    mismatch: "Passwords do not match.",
    failed: "Could not change the password. Request a new link.",
    success: "Password changed. You can now sign in with the new password.",
    back: "Back to teachers",
    title: "Change password",
    subtitle: "Set a new password for your StudRadar account.",
    signIn: "Sign in",
    newPassword: "New password",
    repeatPassword: "Repeat password",
    saving: "Saving...",
    save: "Save password",
  },
  zh: {
    expired: "链接已过期或已被使用。",
    missingToken: "请通过邮件中的链接打开此页面。",
    passwordShort: "密码至少需要 8 个字符。",
    mismatch: "两次输入的密码不一致。",
    failed: "无法修改密码。请重新请求链接。",
    success: "密码已修改。现在可以用新密码登录。",
    back: "返回教师列表",
    title: "修改密码",
    subtitle: "为 StudRadar 账户设置新密码。",
    signIn: "登录",
    newPassword: "新密码",
    repeatPassword: "重复密码",
    saving: "保存中...",
    save: "保存密码",
  },
};

export function ResetPasswordPanel() {
  const searchParams = useSearchParams();
  const { openAuthDialog } = useAuthDialog();
  const { language } = usePreferences();
  const copy = resetCopy[language];
  const token = searchParams.get("token");
  const error = searchParams.get("error");
  const [status, setStatus] = useState<string | null>(
    error ? copy.expired : null,
  );
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const signInButtonRef = useRef<HTMLButtonElement>(null);
  const statusId = "reset-password-status";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setStatus(copy.missingToken);
      return;
    }

    const form = new FormData(event.currentTarget);
    const newPasswordEntry = form.get("newPassword");
    const confirmPasswordEntry = form.get("confirmPassword");
    const newPassword =
      newPasswordEntry === null ? "" : String(newPasswordEntry);
    const confirmPassword =
      confirmPasswordEntry === null ? "" : String(confirmPasswordEntry);

    if (newPassword.length < 8) {
      setStatus(copy.passwordShort);
      newPasswordRef.current?.focus();
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus(copy.mismatch);
      confirmPasswordRef.current?.focus();
      return;
    }

    setSubmitting(true);
    setStatus(null);

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword, token }),
    }).catch(() => null);

    setSubmitting(false);

    if (!response?.ok) {
      setStatus(copy.failed);
      return;
    }

    setSuccess(true);
    setStatus(copy.success);
    event.currentTarget.reset();
    window.setTimeout(() => signInButtonRef.current?.focus(), 0);
  }

  return (
    <div className="page-soft-enter px-5 pb-8 md:px-8">
      <section className="mx-auto max-w-xl pt-8">
        <Link
          href="/teachers"
          className="text-sm font900 text-slate-600 hover:text-primary"
        >
          {copy.back}
        </Link>

        <div className="mt-5 rounded-lg border border-line bg-white p-6 shadow-sm">
          <KeyRound className="h-10 w-10 text-primary" />
          <h1 className="mt-4 text-3xl font900">{copy.title}</h1>
          <p className="mt-2 text-sm font700 leading-6 text-muted">
            {copy.subtitle}
          </p>

          {success ? (
            <Button
              ref={signInButtonRef}
              className="mt-6 w-full"
              onClick={() => openAuthDialog("signin")}
            >
              {copy.signIn}
            </Button>
          ) : (
            <form
              className="mt-6 space-y-4"
              onSubmit={handleSubmit}
              aria-describedby={status ? statusId : undefined}
            >
              <label className="block">
                <span className="text-xs font800 text-slate-600">
                  {copy.newPassword}
                </span>
                <input
                  ref={newPasswordRef}
                  name="newPassword"
                  required
                  minLength={8}
                  type="password"
                  aria-describedby={status ? statusId : undefined}
                  className="focus-ring mt-1 h-11 w-full rounded-lg border border-line px-3 text-sm"
                />
              </label>

              <label className="block">
                <span className="text-xs font800 text-slate-600">
                  {copy.repeatPassword}
                </span>
                <input
                  ref={confirmPasswordRef}
                  name="confirmPassword"
                  required
                  minLength={8}
                  type="password"
                  aria-describedby={status ? statusId : undefined}
                  className="focus-ring mt-1 h-11 w-full rounded-lg border border-line px-3 text-sm"
                />
              </label>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? copy.saving : copy.save}
              </Button>
            </form>
          )}

          {status && (
            <div
              id={statusId}
              role="alert"
              aria-live="polite"
              className="mt-4 rounded-lg border border-line bg-slate-50 p-3 text-sm font800 text-slate-700"
            >
              {status}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
