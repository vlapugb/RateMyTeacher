"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Info,
  LogIn,
  LogOut,
  Star,
  UserRound,
  HelpCircle,
  Shield,
  Palette,
  Languages,
} from "lucide-react";
import { AuthDialog } from "@/components/auth-dialog";
import {
  AuthDialogProvider,
  type AuthDialogMode,
} from "@/components/auth-dialog-context";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import {
  languageOptions,
  themeOptions,
  usePreferences,
  type LanguagePreference,
  type ThemePreference,
} from "@/lib/preferences";
import { cn } from "@/lib/utils";

type ShellCopyKey = "teachers" | "favorites" | "account" | "faq" | "about";

const primaryLinks = [
  { href: "/teachers", labelKey: "teachers", icon: UserRound, authOnly: false },
  { href: "/favorites", labelKey: "favorites", icon: Star, authOnly: true },
  { href: "/account", labelKey: "account", icon: UserRound, authOnly: true },
  { href: "/faq", labelKey: "faq", icon: HelpCircle, authOnly: false },
  { href: "/about", labelKey: "about", icon: Info, authOnly: false },
] as const;

const shellCopy: Record<
  LanguagePreference,
  {
    nav: Record<ShellCopyKey, string>;
    header: string;
    trustTitle: string;
    trustText: string;
    footer: string;
    signIn: string;
    signOut: string;
    theme: string;
    language: string;
  }
> = {
  ru: {
    nav: {
      teachers: "Преподаватели",
      favorites: "Избранное",
      account: "Аккаунт",
      faq: "Помощь и FAQ",
      about: "О проекте",
    },
    header: "Преподаватели математико-механического факультета СПбГУ",
    trustTitle: "Честность и прозрачность",
    trustText: "Оценки доступны после подтверждения почты",
    footer: "Сделано студентами для студентов",
    signIn: "Войти",
    signOut: "Выйти",
    theme: "Тема",
    language: "Язык",
  },
  en: {
    nav: {
      teachers: "Teachers",
      favorites: "Favorites",
      account: "Account",
      faq: "Help & FAQ",
      about: "About",
    },
    header: "Teachers of the SPbU Faculty of Mathematics and Mechanics",
    trustTitle: "Fair and transparent",
    trustText: "Reviews are available after email verification",
    footer: "Built by students for students",
    signIn: "Sign in",
    signOut: "Sign out",
    theme: "Theme",
    language: "Language",
  },
  zh: {
    nav: {
      teachers: "教师",
      favorites: "收藏",
      account: "账户",
      faq: "帮助与 FAQ",
      about: "关于",
    },
    header: "圣彼得堡国立大学数学力学系教师评价",
    trustTitle: "真实透明",
    trustText: "验证邮箱后即可发布评价",
    footer: "由学生为学生制作",
    signIn: "登录",
    signOut: "退出",
    theme: "主题",
    language: "语言",
  },
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = authClient.useSession();
  const user = session.data?.user;
  const { theme, language, setTheme, setLanguage } = usePreferences();
  const copy = shellCopy[language];
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthDialogMode>("signin");

  function openAuthDialog(mode: AuthDialogMode = "signin") {
    setAuthMode(mode);
    setAuthOpen(true);
  }
  const visibleLinks = primaryLinks.filter((link) => !link.authOnly || user);

  return (
    <AuthDialogProvider value={{ openAuthDialog }}>
      <div className="min-h-screen p-0 sm:p-3 md:p-5">
        <div className="mx-auto flex min-h-screen max-w-[1600px] gap-3 sm:min-h-[calc(100vh-24px)] md:min-h-[calc(100vh-40px)]">
          <aside className="hidden w-72 shrink-0 rounded-lg border border-line bg-panel p-7 shadow-sm lg:flex lg:flex-col">
            <Link href="/teachers" className="text-3xl font900 tracking-tight">
              StudRadar
            </Link>

            <nav className="mt-16 space-y-2">
              {visibleLinks.map((link) => (
                <NavLink
                  key={link.href}
                  link={link}
                  pathname={pathname}
                  label={copy.nav[link.labelKey]}
                />
              ))}
            </nav>

            <div className="mt-auto rounded-lg border border-line bg-slate-50 p-5 text-center">
              <Shield className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-3 text-base font900">
                {copy.trustTitle}
              </h2>
              <p className="mt-2 text-sm font-medium text-muted">
                {copy.trustText}
              </p>
            </div>

            <p className="mt-9 text-xs font700 leading-6 text-slate-400">
              StudRadar © 2026
              <br />
              {copy.footer}
            </p>
          </aside>

          <main className="min-w-0 flex-1 overflow-hidden bg-panel shadow-sm sm:rounded-lg sm:border sm:border-line">
            <header className="sticky top-0 z-20 flex min-h-14 items-center justify-between gap-2 border-b border-line bg-white/85 px-3 py-2 backdrop-blur-md sm:min-h-20 sm:gap-4 sm:px-5 sm:py-4 md:px-8">
              <div className="min-w-0 shrink-0">
                <Link href="/teachers" className="text-xl font900 lg:hidden sm:text-2xl">
                  <span className="sm:hidden">SR</span>
                  <span className="hidden sm:inline">StudRadar</span>
                </Link>
                <p className="hidden text-sm font900 text-slate-600 md:block">
                  {copy.header}
                </p>
              </div>

              <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2 md:gap-3">
                <label className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-panel text-xs font900 text-muted sm:w-auto sm:max-w-32 sm:justify-start sm:gap-1 sm:px-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <select
                    value={theme}
                    onChange={(event) =>
                      setTheme(event.target.value as ThemePreference)
                    }
                    className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent text-xs font900 opacity-0 outline-none sm:static sm:h-auto sm:w-auto sm:min-w-0 sm:max-w-none sm:opacity-100"
                    aria-label={copy.theme}
                  >
                    {themeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label[language]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-panel text-xs font900 text-muted sm:w-auto sm:max-w-none sm:justify-start sm:gap-1 sm:px-2">
                  <Languages className="h-4 w-4 text-primary" />
                  <select
                    value={language}
                    onChange={(event) =>
                      setLanguage(event.target.value as LanguagePreference)
                    }
                    className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent text-xs font900 opacity-0 outline-none sm:static sm:h-auto sm:w-auto sm:min-w-0 sm:max-w-none sm:opacity-100"
                    aria-label={copy.language}
                  >
                    {languageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                {user ? (
                  <>
                    <Link
                      href="/account"
                      className="hidden max-w-48 truncate text-sm font900 text-slate-700 hover:text-primary sm:block"
                    >
                      {user.name || user.email}
                    </Link>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-9 shrink-0 px-2 transition-all duration-200 hover:shadow-sm sm:px-3"
                      onClick={async () => {
                        await authClient.signOut();
                        router.refresh();
                        router.push("/teachers");
                      }}
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="hidden sm:inline">{copy.signOut}</span>
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-9 shrink-0 px-2 transition-all duration-200 hover:shadow-sm sm:px-3"
                    onClick={() => openAuthDialog("signin")}
                  >
                    <LogIn className="h-5 w-5" />
                    <span className="hidden sm:inline">{copy.signIn}</span>
                  </Button>
                )}
              </div>
            </header>

            <div className="border-b border-line bg-white px-2 py-1.5 sm:px-3 sm:py-2 lg:hidden">
              <nav className="flex gap-1.5 overflow-x-auto scrollbar-thin sm:gap-2">
                {visibleLinks.map((link) => {
                  const Icon = link.icon;
                  const active = pathname.startsWith(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font800 text-muted sm:gap-2 sm:px-3 sm:text-sm",
                        active && "bg-primary-soft text-primary",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {copy.nav[link.labelKey]}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {children}
          </main>
        </div>

        {authOpen && (
          <AuthDialog initialMode={authMode} onOpenChange={setAuthOpen} />
        )}
      </div>
    </AuthDialogProvider>
  );
}

type NavLinkProps = {
  link: (typeof primaryLinks)[number];
  pathname: string;
  label: string;
};

function NavLink({ link, pathname, label }: NavLinkProps) {
  const Icon = link.icon;
  const active = pathname.startsWith(link.href);

  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font900 text-slate-600 transition-all duration-200 hover:bg-primary-soft hover:text-primary hover:translate-x-1",
        active && "bg-primary-soft text-primary",
      )}
    >
      <Icon className="h-7 w-7" />
      {label}
    </Link>
  );
}
