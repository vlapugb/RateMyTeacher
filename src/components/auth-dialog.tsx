"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, MailCheck, ShieldCheck, X } from "lucide-react";
import type { AuthDialogMode } from "@/components/auth-dialog-context";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { API_ROUTES, APP_ROUTES } from "@/lib/app-routes";
import { STUDENT_IDENTITY } from "@/lib/app-config";
import { usePreferences, type LanguagePreference } from "@/lib/preferences";
import {
  getStudentEmailForLogin,
  isStudentEmail,
  isStudentEmailMatchingLogin,
  isStudentLogin,
  normalizeStudentIdentifier,
} from "@/lib/student-identity";
import { APP_ROUTES, API_ROUTES } from "@/lib/app-routes";
import { STUDENT_IDENTITY } from "@/lib/app-config";
import { cn } from "@/lib/utils";

<<<<<<< HEAD
=======
const STUDENT_EMAIL_DOMAIN = `@${STUDENT_IDENTITY.emailDomain}`;

>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
type AuthDialogProps = {
  initialMode?: AuthDialogMode;
  onOpenChange: (open: boolean) => void;
};

const authCopy: Record<
  LanguagePreference,
  {
    title: Record<AuthDialogMode, string>;
    description: Record<AuthDialogMode, string>;
    signInTab: string;
    signUpTab: string;
    login: string;
    name: string;
    email: string;
    password: string;
    remember: string;
    forgot: string;
    backToSignIn: string;
    submit: Record<AuthDialogMode, string>;
    submitting: string;
    close: string;
    showPassword: string;
    hidePassword: string;
    securityTitle: string;
    securityText: string;
    emailTitle: string;
    emailText: string;
    resetSent: string;
    accountCreated: string;
    verifyEmail: string;
    loginFormat: string;
    emailFormat: string;
    emailOnlyFormat: string;
    credentialsInvalid: string;
    passwordRequired: string;
    passwordFormat: string;
    requestFailed: string;
    networkFailed: string;
    defaultName: string;
    namePlaceholder: string;
    passwordPlaceholder: string;
  }
> = {
  ru: {
    title: {
      signin: "Вход в StudRadar",
      signup: "Регистрация в StudRadar",
      reset: "Восстановление пароля",
    },
    description: {
      signin:
        "Войдите по почте и паролю, чтобы ставить оценки, лайкать комментарии, сохранять преподавателей в избранное и видеть историю.",
      signup:
        "Создайте аккаунт по студенческой почте СПбГУ. После регистрации нужно подтвердить email.",
      reset:
        "Укажите студенческую почту, и мы отправим ссылку для смены пароля.",
    },
    signInTab: "Вход",
    signUpTab: "Регистрация",
    login: "Логин",
    name: "Имя",
    email: "Почта",
    password: "Пароль",
    remember: "Запомнить меня",
    forgot: "Забыли пароль?",
    backToSignIn: "Вернуться ко входу",
    submit: {
      signin: "Войти",
      signup: "Зарегистрироваться",
      reset: "Отправить ссылку",
    },
    submitting: "Отправляем...",
    close: "Закрыть",
    showPassword: "Показать пароль",
    hidePassword: "Скрыть пароль",
    securityTitle: "Безопасный вход",
    securityText: "Пароль хранится хешированным, оценки можно публиковать анонимно.",
    emailTitle: "Обязательная почта",
    emailText:
      "Оценки требуют подтвержденной почты. Комментарии можно оставить анонимно без входа.",
    resetSent: "Если аккаунт существует, письмо для смены пароля отправлено.",
    accountCreated: "Аккаунт создан. Проверьте почту и подтвердите адрес.",
    verifyEmail: "Подтвердите почту перед входом.",
    loginFormat: "Логин должен быть в формате stXXXXXX, например st055555.",
    emailFormat:
      "Почта должна совпадать с логином: st055555 и st055555@student.spbu.ru.",
    emailOnlyFormat: "Почта должна быть в формате stXXXXXX@student.spbu.ru.",
    credentialsInvalid: "Неверная почта или пароль.",
    passwordRequired: "Введите пароль.",
    passwordFormat: "Пароль должен быть не короче 8 символов.",
    requestFailed: "Не удалось выполнить действие.",
    networkFailed: "Не удалось связаться с сервером.",
    defaultName: "Студент",
    namePlaceholder: "Как вас показывать в личном кабинете",
    passwordPlaceholder: "Минимум 8 символов",
  },
  en: {
    title: {
      signin: "Sign in to StudRadar",
      signup: "Create a StudRadar account",
      reset: "Reset password",
    },
    description: {
      signin:
        "Sign in with email and password to rate teachers, like comments, save favorites and see your activity.",
      signup:
        "Use your SPbU student email. You will need to verify it after registration.",
      reset: "Enter your student email and we will send a password reset link.",
    },
    signInTab: "Sign in",
    signUpTab: "Sign up",
    login: "Login",
    name: "Name",
    email: "Email",
    password: "Password",
    remember: "Remember me",
    forgot: "Forgot password?",
    backToSignIn: "Back to sign in",
    submit: {
      signin: "Sign in",
      signup: "Create account",
      reset: "Send link",
    },
    submitting: "Sending...",
    close: "Close",
    showPassword: "Show password",
    hidePassword: "Hide password",
    securityTitle: "Secure sign in",
    securityText: "Passwords are hashed, and reviews can be posted anonymously.",
    emailTitle: "Verified email",
    emailText:
      "Ratings require verified email. Comments can be posted anonymously without signing in.",
    resetSent: "If the account exists, a password reset email has been sent.",
    accountCreated: "Account created. Check your inbox and verify the address.",
    verifyEmail: "Verify your email before signing in.",
    loginFormat: "Login must look like stXXXXXX, for example st055555.",
    emailFormat:
      "Email must match the login: st055555 and st055555@student.spbu.ru.",
    emailOnlyFormat: "Email must look like stXXXXXX@student.spbu.ru.",
    credentialsInvalid: "Invalid email or password.",
    passwordRequired: "Enter your password.",
    passwordFormat: "Password must be at least 8 characters.",
    requestFailed: "The action could not be completed.",
    networkFailed: "Could not reach the server.",
    defaultName: "Student",
    namePlaceholder: "How to show your name in the account",
    passwordPlaceholder: "At least 8 characters",
  },
  zh: {
    title: {
      signin: "登录 StudRadar",
      signup: "注册 StudRadar",
      reset: "重置密码",
    },
    description: {
      signin: "使用邮箱和密码登录后，可以评分、点赞评论、收藏教师并查看记录。",
      signup: "请使用 SPbU 学生邮箱注册。注册后需要验证邮箱。",
      reset: "输入学生邮箱，我们会发送密码重置链接。",
    },
    signInTab: "登录",
    signUpTab: "注册",
    login: "登录名",
    name: "姓名",
    email: "邮箱",
    password: "密码",
    remember: "记住我",
    forgot: "忘记密码？",
    backToSignIn: "返回登录",
    submit: {
      signin: "登录",
      signup: "创建账户",
      reset: "发送链接",
    },
    submitting: "发送中...",
    close: "关闭",
    showPassword: "显示密码",
    hidePassword: "隐藏密码",
    securityTitle: "安全登录",
    securityText: "密码会被哈希保存，评价也可以匿名发布。",
    emailTitle: "邮箱验证",
    emailText: "评分需要验证邮箱。评论可以不登录匿名发布。",
    resetSent: "如果账户存在，密码重置邮件已经发送。",
    accountCreated: "账户已创建。请检查邮箱并完成验证。",
    verifyEmail: "请先验证邮箱再登录。",
    loginFormat: "登录名格式应为 stXXXXXX，例如 st055555。",
    emailFormat: "邮箱必须与登录名一致：st055555@student.spbu.ru。",
    emailOnlyFormat: "邮箱格式应为 stXXXXXX@student.spbu.ru。",
    credentialsInvalid: "邮箱或密码不正确。",
    passwordRequired: "请输入密码。",
    passwordFormat: "密码至少需要 8 个字符。",
    requestFailed: "操作未完成。",
    networkFailed: "无法连接服务器。",
    defaultName: "学生",
    namePlaceholder: "在账户中显示的名称",
    passwordPlaceholder: "至少 8 个字符",
  },
};

export function AuthDialog({
  initialMode = "signin",
  onOpenChange,
}: AuthDialogProps) {
  const router = useRouter();
  const { language } = usePreferences();
  const copy = authCopy[language];
  const [mode, setMode] = useState<AuthDialogMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const login = normalizeStudentIdentifier(form.get("login"));
    const email = normalizeStudentIdentifier(form.get("email"));
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? copy.defaultName);

    if (mode === "reset") {
      if (!isStudentEmail(email)) {
        setStatus(copy.emailOnlyFormat);
        return;
      }

      setSubmitting(true);
      setStatus(null);

      const redirectTo = new URL(
        APP_ROUTES.resetPassword,
        window.location.origin,
      ).toString();
      const response = await fetch(API_ROUTES.authRequestPasswordReset, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirectTo }),
      }).catch(() => null);

      setSubmitting(false);
      setStatus(
        response === null
          ? copy.networkFailed
          : response.ok
            ? copy.resetSent
            : copy.requestFailed,
      );
      return;
    }

    if (mode === "signup") {
      if (!isStudentLogin(login)) {
        setStatus(copy.loginFormat);
        return;
      }

      if (!isStudentEmailMatchingLogin(email, login)) {
        setStatus(copy.emailFormat);
        return;
      }

      if (password.length < STUDENT_IDENTITY.passwordMinLength) {
        setStatus(copy.passwordFormat);
        return;
      }
    }

    if (mode === "signin") {
      if (!isStudentEmail(email)) {
        setStatus(copy.emailOnlyFormat);
        return;
      }

      if (!password) {
        setStatus(copy.passwordRequired);
        return;
      }
    }

    setSubmitting(true);
    setStatus(null);

    const response = await (mode === "signin"
      ? authClient.signIn.email({
          email,
          password,
          rememberMe: true,
        })
      : authClient.signUp.email({
          name,
          email,
          password,
          login,
          callbackURL: APP_ROUTES.account,
<<<<<<< HEAD
        } as Parameters<typeof authClient.signUp.email>[0] & { login: string })).catch((error: unknown) => ({
=======
        } as Parameters<typeof authClient.signUp.email>[0] & {
          login: string;
        })).catch((error: unknown) => ({
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
      error: {
        status: 0,
        message:
          error instanceof Error
            ? error.message
            : copy.networkFailed,
      },
    }));

    setSubmitting(false);

    if (response.error) {
      setStatus(
        response.error.status === 0
          ? copy.networkFailed
          : response.error.status === 403
          ? copy.verifyEmail
          : mode === "signin"
            ? copy.credentialsInvalid
            : copy.requestFailed,
      );
      return;
    }

    if (mode === "signin") {
      onOpenChange(false);
      router.refresh();
      router.push(APP_ROUTES.account);
      return;
    }

    setStatus(copy.accountCreated);
  }

  return (
    <div className="fixed inset-0 z-50 grid items-start overflow-y-auto overscroll-contain bg-slate-950/25 px-3 py-3 backdrop-blur-sm sm:place-items-center sm:px-4 sm:py-6">
      <div className="max-h-[calc(100dvh-24px)] w-full max-w-2xl overflow-y-auto rounded-lg border border-line bg-panel p-4 shadow-2xl sm:max-h-[calc(100vh-48px)] sm:p-6">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-xl font900 leading-tight text-foreground sm:text-2xl">
              {copy.title[mode]}
            </h2>
            <p className="mt-1.5 max-w-xl text-sm font-medium leading-6 text-muted sm:mt-2">
              {copy.description[mode]}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={copy.close}
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-2 rounded-lg border border-line bg-slate-50 p-1 sm:mt-6">
          <button
            type="button"
            className={cn(
              "rounded-md px-2 py-2 text-sm font800 text-muted transition sm:px-3",
              mode === "signin" && "bg-primary-soft text-primary",
            )}
            onClick={() => {
              setMode("signin");
              setStatus(null);
            }}
          >
            {copy.signInTab}
          </button>
          <button
            type="button"
            className={cn(
              "rounded-md px-2 py-2 text-sm font800 text-muted transition sm:px-3",
              mode === "signup" && "bg-primary-soft text-primary",
            )}
            onClick={() => {
              setMode("signup");
              setStatus(null);
            }}
          >
            {copy.signUpTab}
          </button>
        </div>

        <form className="mt-4 space-y-3 sm:space-y-4" noValidate onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <label className="block">
                <span className="text-xs font800 text-slate-600">
                  {copy.login}
                </span>
                <input
                  name="login"
                  required
                  placeholder={STUDENT_IDENTITY.exampleLogin}
                  className="focus-ring mt-1 h-10 w-full rounded-lg border border-line px-3 text-sm sm:h-11"
                />
              </label>
              <label className="block">
                <span className="text-xs font800 text-slate-600">
                  {copy.name}
                </span>
                <input
                  name="name"
                  required
                  minLength={STUDENT_IDENTITY.nameMinLength}
                  placeholder={copy.namePlaceholder}
                  className="focus-ring mt-1 h-10 w-full rounded-lg border border-line px-3 text-sm sm:h-11"
                />
              </label>
            </div>
          )}

          <label className="block">
            <span className="text-xs font800 text-slate-600">{copy.email}</span>
            <input
              name="email"
              required
              type="email"
              placeholder={getStudentEmailForLogin(STUDENT_IDENTITY.exampleLogin)}
              className="focus-ring mt-1 h-10 w-full rounded-lg border border-line px-3 text-sm sm:h-11"
            />
          </label>

          {mode !== "reset" && (
            <label className="block">
              <span className="text-xs font800 text-slate-600">
                {copy.password}
              </span>
              <div className="mt-1 flex h-10 items-center rounded-lg border border-line bg-white sm:h-11">
                <input
                  name="password"
                  required
                  minLength={STUDENT_IDENTITY.passwordMinLength}
                  type={showPassword ? "text" : "password"}
                  placeholder={copy.passwordPlaceholder}
                  className="focus-ring h-full flex-1 rounded-lg px-3 text-sm outline-none"
                />
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center text-slate-400 hover:text-primary sm:h-10 sm:w-10"
                  aria-label={
                    showPassword ? copy.hidePassword : copy.showPassword
                  }
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </label>
          )}

          {mode === "signin" && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font700 text-muted">
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => {
                  setMode("reset");
                  setStatus(null);
                }}
              >
                {copy.forgot}
              </button>
            </div>
          )}

          {mode === "reset" && (
            <button
              type="button"
              className="text-xs font800 text-primary underline-offset-4 hover:underline"
              onClick={() => {
                setMode("signin");
                setStatus(null);
              }}
            >
              {copy.backToSignIn}
            </button>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? copy.submitting : copy.submit[mode]}
          </Button>
        </form>

        {status && (
          <div className="mt-3 rounded-lg border border-line bg-slate-50 p-3 text-sm font700 text-slate-700 sm:mt-4">
            {status}
          </div>
        )}

        <div className="mt-5 hidden gap-3 sm:grid sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-slate-50 p-4">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <h3 className="mt-2 text-sm font900">{copy.securityTitle}</h3>
            <p className="mt-1 text-xs font-medium text-muted">
              {copy.securityText}
            </p>
          </div>
          <div className="rounded-lg border border-line bg-slate-50 p-4">
            <MailCheck className="h-7 w-7 text-primary-strong" />
            <h3 className="mt-2 text-sm font900">{copy.emailTitle}</h3>
            <p className="mt-1 text-xs font-medium text-muted">
              {copy.emailText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
