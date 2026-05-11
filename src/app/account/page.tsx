"use client";

import { FormEvent, type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  CheckCircle2,
  KeyRound,
  Languages,
  MailCheck,
  MessageSquareText,
  Palette,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthDialog } from "@/components/auth-dialog-context";
import { authClient } from "@/lib/auth-client";
import {
  languageOptions,
  themeOptions,
  usePreferences,
  type LanguagePreference,
} from "@/lib/preferences";
<<<<<<< HEAD
import { APP_ROUTES, API_ROUTES } from "@/lib/app-routes";
import { STUDENT_IDENTITY } from "@/lib/app-config";
=======
import { getAccountSummary } from "@/lib/api-client";
import { STUDENT_IDENTITY } from "@/lib/app-config";
import { API_ROUTES, APP_ROUTES } from "@/lib/app-routes";
import type { AccountSummaryResponse } from "@/lib/api-contracts";
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
import { cn } from "@/lib/utils";

type AccountSummary = AccountSummaryResponse;

const accountCopy: Record<
  LanguagePreference,
  {
    title: string;
    loading: string;
    guestText: string;
    signIn: string;
    profile: string;
    studentProfile: string;
    verified: string;
    notVerified: string;
    verifiedText: string;
    notVerifiedText: string;
    resend: string;
    resendDone: string;
    resendFailed: string;
    security: string;
    securityText: string;
    activity: string;
    reviews: string;
    comments: string;
    favorites: string;
    lastReview: string;
    noReviews: string;
    password: string;
    currentPassword: string;
    newPassword: string;
    repeatPassword: string;
    savePassword: string;
    saving: string;
    passwordSaved: string;
    passwordMismatch: string;
    passwordShort: string;
    passwordFailed: string;
    preferences: string;
    theme: string;
    language: string;
    actions: string;
    openFavorites: string;
    openCatalog: string;
  }
> = {
  ru: {
    title: "Аккаунт",
    loading: "Проверяем вход...",
    guestText:
      "Войдите, чтобы видеть статус почты, избранное и историю своих оценок.",
    signIn: "Войти",
    profile: "Профиль",
    studentProfile: "Профиль студента",
    verified: "Почта подтверждена",
    notVerified: "Почта не подтверждена",
    verifiedText: "Можно публиковать оценки от аккаунта.",
    notVerifiedText: "Проверьте письмо или отправьте ссылку повторно.",
    resend: "Отправить подтверждение",
    resendDone: "Письмо подтверждения отправлено.",
    resendFailed: "Не удалось отправить письмо подтверждения.",
    security: "Безопасный вход",
    securityText: "Сессия хранится в защищенной cookie.",
    activity: "Активность",
    reviews: "оценок",
    comments: "комментариев",
    favorites: "в избранном",
    lastReview: "Последняя оценка",
    noReviews: "Оценок пока нет",
    password: "Смена пароля",
    currentPassword: "Текущий пароль",
    newPassword: "Новый пароль",
    repeatPassword: "Повторите пароль",
    savePassword: "Сохранить пароль",
    saving: "Сохраняем...",
    passwordSaved: "Пароль изменен.",
    passwordMismatch: "Пароли не совпадают.",
    passwordShort: "Пароль должен быть не короче 8 символов.",
    passwordFailed: "Не удалось изменить пароль. Проверьте текущий пароль.",
    preferences: "Интерфейс",
    theme: "Тема",
    language: "Язык",
    actions: "Быстрые действия",
    openFavorites: "Открыть избранное",
    openCatalog: "Открыть каталог",
  },
  en: {
    title: "Account",
    loading: "Checking session...",
    guestText:
      "Sign in to see email status, favorites and your review activity.",
    signIn: "Sign in",
    profile: "Profile",
    studentProfile: "Student profile",
    verified: "Email verified",
    notVerified: "Email is not verified",
    verifiedText: "You can publish reviews from your account.",
    notVerifiedText: "Check your inbox or send a new verification link.",
    resend: "Send verification",
    resendDone: "Verification email sent.",
    resendFailed: "Could not send the verification email.",
    security: "Secure sign in",
    securityText: "The session is stored in a secure cookie.",
    activity: "Activity",
    reviews: "reviews",
    comments: "comments",
    favorites: "favorites",
    lastReview: "Last review",
    noReviews: "No reviews yet",
    password: "Change password",
    currentPassword: "Current password",
    newPassword: "New password",
    repeatPassword: "Repeat password",
    savePassword: "Save password",
    saving: "Saving...",
    passwordSaved: "Password changed.",
    passwordMismatch: "Passwords do not match.",
    passwordShort: "Password must be at least 8 characters.",
    passwordFailed: "Could not change password. Check the current password.",
    preferences: "Interface",
    theme: "Theme",
    language: "Language",
    actions: "Quick actions",
    openFavorites: "Open favorites",
    openCatalog: "Open catalog",
  },
  zh: {
    title: "账户",
    loading: "正在检查登录状态...",
    guestText: "登录后可以查看邮箱状态、收藏和评价记录。",
    signIn: "登录",
    profile: "资料",
    studentProfile: "学生资料",
    verified: "邮箱已验证",
    notVerified: "邮箱未验证",
    verifiedText: "可以使用账户发布评价。",
    notVerifiedText: "请检查邮件，或重新发送验证链接。",
    resend: "发送验证邮件",
    resendDone: "验证邮件已发送。",
    resendFailed: "无法发送验证邮件。",
    security: "安全登录",
    securityText: "会话保存在安全 cookie 中。",
    activity: "活动",
    reviews: "条评价",
    comments: "条评论",
    favorites: "个收藏",
    lastReview: "最近评价",
    noReviews: "暂无评价",
    password: "修改密码",
    currentPassword: "当前密码",
    newPassword: "新密码",
    repeatPassword: "重复密码",
    savePassword: "保存密码",
    saving: "保存中...",
    passwordSaved: "密码已修改。",
    passwordMismatch: "两次输入的密码不一致。",
    passwordShort: "密码至少需要 8 个字符。",
    passwordFailed: "无法修改密码。请检查当前密码。",
    preferences: "界面",
    theme: "主题",
    language: "语言",
    actions: "快捷操作",
    openFavorites: "打开收藏",
    openCatalog: "打开目录",
  },
};

export default function AccountPage() {
  const { openAuthDialog } = useAuthDialog();
  const session = authClient.useSession();
  const user = session.data?.user;
  const { theme, language, setTheme, setLanguage } = usePreferences();
  const copy = accountCopy[language];
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [mailStatus, setMailStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();

<<<<<<< HEAD
    fetch(API_ROUTES.accountSummary, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((body: AccountSummary | null) => setSummary(body))
=======
    getAccountSummary(controller.signal)
      .then((body) => setSummary(body))
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("Failed to load account summary", error);
        setSummary(null);
      });

    return () => controller.abort();
  }, [user]);

  const lastReviewLabel = summary?.lastReviewAt
    ? new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : language, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(summary.lastReviewAt))
    : copy.noReviews;

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (newPassword.length < STUDENT_IDENTITY.passwordMinLength) {
      setPasswordStatus(copy.passwordShort);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus(copy.passwordMismatch);
      return;
    }

    setPasswordSaving(true);
    setPasswordStatus(null);

    const response = await fetch(API_ROUTES.authChangePassword, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      }),
    }).catch(() => null);

    setPasswordSaving(false);

    if (!response?.ok) {
      setPasswordStatus(copy.passwordFailed);
      return;
    }

    event.currentTarget.reset();
    setPasswordStatus(copy.passwordSaved);
  }

  async function resendVerificationEmail() {
    if (!user?.email) return;

<<<<<<< HEAD
    const callbackURL = new URL(APP_ROUTES.account, window.location.origin).toString();
=======
    const callbackURL = new URL("/account", window.location.origin).toString();
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
    const response = await fetch(API_ROUTES.authSendVerificationEmail, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, callbackURL }),
    }).catch(() => null);

    setMailStatus(response?.ok ? copy.resendDone : copy.resendFailed);
  }

  if (session.isPending) {
    return (
      <div className="px-3 pb-6 sm:px-5 sm:pb-8 md:px-8">
        <section className="pt-4 sm:pt-6">
          <h1 className="text-2xl font900 sm:text-3xl">{copy.title}</h1>
          <p className="mt-2 text-sm font700 text-muted">{copy.loading}</p>
        </section>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-3 pb-6 sm:px-5 sm:pb-8 md:px-8">
        <section className="pt-4 sm:pt-6">
          <h1 className="text-2xl font900 sm:text-3xl">{copy.title}</h1>
          <p className="mt-2 max-w-2xl text-sm font700 leading-6 text-muted">
            {copy.guestText}
          </p>
          <Button className="mt-5" onClick={() => openAuthDialog("signin")}>
            {copy.signIn}
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="page-soft-enter px-3 pb-6 sm:px-5 sm:pb-8 md:px-8">
      <section className="pt-4 sm:pt-6">
        <h1 className="text-2xl font900 sm:text-3xl">{copy.title}</h1>
        <p className="mt-1.5 break-all text-sm font700 text-muted sm:mt-2">
          {user.email}
        </p>
      </section>

      <section className="mt-5 grid gap-3 sm:mt-7 sm:gap-4 lg:grid-cols-3">
        <InfoCard
          icon={UserRound}
          title={user.name || copy.profile}
          text={copy.studentProfile}
        />

        <article className="rounded-lg border border-line bg-white p-4 shadow-sm sm:p-5">
          <MailCheck className="h-7 w-7 text-primary sm:h-8 sm:w-8" />
          <h2 className="mt-3 text-base font900 sm:text-lg">
            {user.emailVerified ? copy.verified : copy.notVerified}
          </h2>
          <p className="mt-1.5 text-xs font700 leading-5 text-muted sm:mt-2 sm:text-sm sm:leading-6">
            {user.emailVerified ? copy.verifiedText : copy.notVerifiedText}
          </p>
          {!user.emailVerified && (
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={resendVerificationEmail}
            >
              {copy.resend}
            </Button>
          )}
          {mailStatus && (
            <p className="mt-3 text-xs font800 text-primary">{mailStatus}</p>
          )}
        </article>

        <InfoCard
          icon={ShieldCheck}
          title={copy.security}
          text={copy.securityText}
        />
      </section>

      <section className="mt-4 grid gap-3 sm:mt-5 sm:gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-lg border border-line bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font900 sm:text-xl">{copy.activity}</h2>
              <p className="mt-1 text-xs font700 text-muted sm:text-sm">
                {copy.lastReview}: {lastReviewLabel}
              </p>
            </div>
            <CheckCircle2 className="h-7 w-7 text-success sm:h-8 sm:w-8" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-3">
            <StatCard
              icon={Star}
              value={summary === null ? "..." : summary.reviewCount}
              label={copy.reviews}
            />
            <StatCard
              icon={MessageSquareText}
              value={summary === null ? "..." : summary.commentCount}
              label={copy.comments}
            />
            <StatCard
              icon={Bookmark}
              value={summary === null ? "..." : summary.favoriteCount}
              label={copy.favorites}
            />
          </div>
        </article>

        <article className="rounded-lg border border-line bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font900 sm:text-xl">{copy.actions}</h2>
          <div className="mt-3 grid gap-2 sm:mt-4 sm:gap-3">
            <Link
              href={APP_ROUTES.favorites}
              className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-panel px-3 text-xs font900 text-foreground transition hover:border-primary hover:text-primary sm:h-11 sm:px-4 sm:text-sm"
            >
              <Bookmark className="h-5 w-5" />
              {copy.openFavorites}
            </Link>
            <Link
              href={APP_ROUTES.teachers}
              className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-panel px-3 text-xs font900 text-foreground transition hover:border-primary hover:text-primary sm:h-11 sm:px-4 sm:text-sm"
            >
              <UserRound className="h-5 w-5" />
              {copy.openCatalog}
            </Link>
          </div>
        </article>
      </section>

      <section className="mt-4 grid gap-3 sm:mt-5 sm:gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-line bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3">
            <KeyRound className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
            <h2 className="text-lg font900 sm:text-xl">{copy.password}</h2>
          </div>

          <form className="mt-4 grid gap-3 sm:mt-5 sm:gap-4" onSubmit={handlePasswordSubmit}>
            <PasswordField name="currentPassword" label={copy.currentPassword} />
            <PasswordField name="newPassword" label={copy.newPassword} />
            <PasswordField name="confirmPassword" label={copy.repeatPassword} />
            <Button type="submit" disabled={passwordSaving}>
              {passwordSaving ? copy.saving : copy.savePassword}
            </Button>
          </form>

          {passwordStatus && (
            <div className="mt-4 rounded-lg border border-line bg-slate-50 p-3 text-sm font800 text-slate-700">
              {passwordStatus}
            </div>
          )}
        </article>

        <article className="rounded-lg border border-line bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3">
            <Palette className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
            <h2 className="text-lg font900 sm:text-xl">{copy.preferences}</h2>
          </div>

          <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-5">
            <PreferenceGroup icon={Palette} label={copy.theme}>
              {themeOptions.map((option) => (
                <SegmentButton
                  key={option.value}
                  active={theme === option.value}
                  onClick={() => setTheme(option.value)}
                >
                  {option.label[language]}
                </SegmentButton>
              ))}
            </PreferenceGroup>

            <PreferenceGroup icon={Languages} label={copy.language}>
              {languageOptions.map((option) => (
                <SegmentButton
                  key={option.value}
                  active={language === option.value}
                  onClick={() => setLanguage(option.value)}
                >
                  {option.label}
                </SegmentButton>
              ))}
            </PreferenceGroup>
          </div>
        </article>
      </section>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof UserRound;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-lg border border-line bg-white p-4 shadow-sm sm:p-5">
      <Icon className="h-7 w-7 text-primary sm:h-8 sm:w-8" />
      <h2 className="mt-3 text-base font900 sm:text-lg">{title}</h2>
      <p className="mt-1.5 text-xs font700 leading-5 text-muted sm:mt-2 sm:text-sm sm:leading-6">
        {text}
      </p>
    </article>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Star;
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-slate-50 p-3 sm:p-4">
      <Icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
      <div className="mt-2 text-xl font900 text-foreground tabular-nums sm:mt-3 sm:text-2xl">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] font800 leading-4 text-muted sm:mt-1 sm:text-xs">
        {label}
      </div>
    </div>
  );
}

function PasswordField({ name, label }: { name: string; label: string }) {
  return (
    <label className="block">
      <span className="text-xs font800 text-slate-600">{label}</span>
      <input
        name={name}
        required
        minLength={STUDENT_IDENTITY.passwordMinLength}
        type="password"
        className="focus-ring mt-1 h-10 w-full rounded-lg border border-line px-3 text-sm sm:h-11"
      />
    </label>
  );
}

function PreferenceGroup({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Palette;
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font900 text-slate-700 sm:text-sm">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <div className="grid grid-cols-3 gap-1 rounded-lg border border-line bg-slate-50 p-1 sm:gap-2">
        {children}
      </div>
    </div>
  );
}

function SegmentButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        "focus-ring min-h-9 rounded-md px-2 py-1.5 text-xs font900 transition sm:min-h-10 sm:px-3 sm:py-2 sm:text-sm",
        active
          ? "bg-primary text-white shadow-sm"
          : "text-slate-600 hover:bg-white hover:text-primary",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
