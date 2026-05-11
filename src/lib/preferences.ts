"use client";

import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/app-config";

export type ThemePreference = "system" | "light" | "dark";
export type LanguagePreference = "ru" | "en" | "zh";

type Preferences = {
  theme: ThemePreference;
  language: LanguagePreference;
};

<<<<<<< HEAD
const THEME_KEY = STORAGE_KEYS.theme;
const LANGUAGE_KEY = STORAGE_KEYS.language;
const PREFERENCES_EVENT = STORAGE_KEYS.preferencesEvent;

=======
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
const defaultPreferences: Preferences = {
  theme: "system",
  language: "ru",
};

export const themeOptions: {
  value: ThemePreference;
  label: Record<LanguagePreference, string>;
}[] = [
  { value: "system", label: { ru: "Системная", en: "System", zh: "跟随系统" } },
  { value: "light", label: { ru: "Светлая", en: "Light", zh: "浅色" } },
  { value: "dark", label: { ru: "Темная", en: "Dark", zh: "深色" } },
];

export const languageOptions: {
  value: LanguagePreference;
  label: string;
}[] = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
];

export function usePreferences() {
  const [preferences, setPreferencesState] =
    useState<Preferences>(defaultPreferences);

  useEffect(() => {
    const sync = () => {
      const nextPreferences = readPreferences();
      setPreferencesState(nextPreferences);
      applyPreferences(nextPreferences);
    };

<<<<<<< HEAD
    sync();
    window.addEventListener(PREFERENCES_EVENT, sync);
=======
    queueMicrotask(sync);
    window.addEventListener(STORAGE_KEYS.preferencesEvent, sync);
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
    window.addEventListener("storage", sync);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", sync);

    return () => {
      window.removeEventListener(STORAGE_KEYS.preferencesEvent, sync);
      window.removeEventListener("storage", sync);
      media.removeEventListener("change", sync);
    };
  }, []);

  const setTheme = useCallback((theme: ThemePreference) => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.theme, theme);
    } catch (error) {
      console.error("Failed to save theme preference", error);
    }
    notifyPreferencesChanged();
  }, []);

  const setLanguage = useCallback((language: LanguagePreference) => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.language, language);
    } catch (error) {
      console.error("Failed to save language preference", error);
    }
    notifyPreferencesChanged();
  }, []);

  return {
    ...preferences,
    setTheme,
    setLanguage,
  };
}

function readPreferences(): Preferences {
  if (typeof window === "undefined") return defaultPreferences;

  let theme: string | null = null;
  let language: string | null = null;

  try {
    theme = window.localStorage.getItem(STORAGE_KEYS.theme);
    language = window.localStorage.getItem(STORAGE_KEYS.language);
  } catch {
    return defaultPreferences;
  }

  return {
    theme: isThemePreference(theme) ? theme : defaultPreferences.theme,
    language: isLanguagePreference(language)
      ? language
      : defaultPreferences.language,
  };
}

function applyPreferences(preferences: Preferences) {
  const resolvedTheme =
    preferences.theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : preferences.theme;

  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.dataset.themePreference = preferences.theme;
  document.documentElement.lang = preferences.language;
}

function notifyPreferencesChanged() {
  window.dispatchEvent(new Event(STORAGE_KEYS.preferencesEvent));
}

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

function isLanguagePreference(value: string | null): value is LanguagePreference {
  return value === "ru" || value === "en" || value === "zh";
}
