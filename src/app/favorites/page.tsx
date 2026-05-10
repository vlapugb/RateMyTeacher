"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { TeacherCard } from "@/components/teacher-card";
import { Button } from "@/components/ui/button";
import { useAuthDialog } from "@/components/auth-dialog-context";
import { authClient } from "@/lib/auth-client";
import { usePreferences, type LanguagePreference } from "@/lib/preferences";
import type { Teacher } from "@/lib/types";

const favoritesCopy: Record<
  LanguagePreference,
  {
    title: string;
    guestText: string;
    signIn: string;
    intro: string;
    loading: string;
    loadFailed: string;
    emptyTitle: string;
    emptyText: string;
  }
> = {
  ru: {
    title: "Избранное",
    guestText:
      "Войдите, чтобы сохранять преподавателей и быстро возвращаться к ним.",
    signIn: "Войти",
    intro: "Сохраненные преподаватели, к которым вы хотите быстро вернуться.",
    loading: "Загружаем...",
    loadFailed: "Не удалось загрузить избранное.",
    emptyTitle: "Пока пусто",
    emptyText:
      "Нажмите на флажок в карточке преподавателя, чтобы добавить его сюда.",
  },
  en: {
    title: "Favorites",
    guestText: "Sign in to save teachers and return to them quickly.",
    signIn: "Sign in",
    intro: "Saved teachers you want to return to quickly.",
    loading: "Loading...",
    loadFailed: "Could not load favorites.",
    emptyTitle: "Nothing here yet",
    emptyText: "Click the bookmark on a teacher card to add it here.",
  },
  zh: {
    title: "收藏",
    guestText: "登录后可以收藏教师并快速返回。",
    signIn: "登录",
    intro: "这里是你保存的教师。",
    loading: "加载中...",
    loadFailed: "无法加载收藏。",
    emptyTitle: "暂无内容",
    emptyText: "点击教师卡片上的书签即可添加到这里。",
  },
};

export default function FavoritesPage() {
  const { openAuthDialog } = useAuthDialog();
  const session = authClient.useSession();
  const { language } = usePreferences();
  const copy = favoritesCopy[language];
  const [savedTeachers, setSavedTeachers] = useState<Teacher[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!session.data?.user) return;
    const controller = new AbortController();

    fetch("/api/teachers?favorite=true", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((body: { teachers?: Teacher[] } | null) => {
        setLoadError(null);
        setSavedTeachers(body?.teachers ?? []);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("Failed to load favorites", error);
        setLoadError(copy.loadFailed);
        setSavedTeachers([]);
      });

    return () => controller.abort();
  }, [copy.loadFailed, session.data?.user]);

  if (!session.data?.user) {
    return (
      <div className="page-soft-enter px-5 pb-8 md:px-8">
        <section className="pt-6">
          <h1 className="text-3xl font900">{copy.title}</h1>
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
    <div className="page-soft-enter px-5 pb-8 md:px-8">
      <section className="pt-6">
        <h1 className="text-3xl font900">{copy.title}</h1>
        <p className="mt-2 text-sm font700 text-muted">
          {copy.intro}
        </p>
      </section>

      {loadError ? (
        <p className="mt-6 text-sm font800 text-danger">{loadError}</p>
      ) : savedTeachers === null ? (
        <p className="mt-6 text-sm font800 text-muted">{copy.loading}</p>
      ) : savedTeachers.length ? (
        <section className="mt-6 grid gap-4 stagger-list md:grid-cols-2 xl:grid-cols-3">
          {savedTeachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              compact
              onFavoriteChange={(teacherId, saved) => {
                if (!saved) {
                  setSavedTeachers((current) =>
                    (current ?? []).filter(
                      (teacher) => teacher.id !== teacherId,
                    ),
                  );
                }
              }}
            />
          ))}
        </section>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-line bg-white p-8 text-center">
          <Star className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-3 text-lg font900">{copy.emptyTitle}</h2>
          <p className="mt-2 text-sm font700 text-muted">
            {copy.emptyText}
          </p>
        </div>
      )}
    </div>
  );
}
