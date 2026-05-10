"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemePreference = "system" | "light" | "dark";
export type LanguagePreference = "ru" | "en" | "zh";

type Preferences = {
  theme: ThemePreference;
  language: LanguagePreference;
};

const THEME_KEY = "studradar:theme";
const LANGUAGE_KEY = "studradar:language";
const PREFERENCES_EVENT = "studradar:preferences";

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

    queueMicrotask(sync);
    window.addEventListener(PREFERENCES_EVENT, sync);
    window.addEventListener("storage", sync);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", sync);

    return () => {
      window.removeEventListener(PREFERENCES_EVENT, sync);
      window.removeEventListener("storage", sync);
      media.removeEventListener("change", sync);
    };
  }, []);

  const setTheme = useCallback((theme: ThemePreference) => {
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.error("Failed to save theme preference", error);
    }
    notifyPreferencesChanged();
  }, []);

  const setLanguage = useCallback((language: LanguagePreference) => {
    try {
      window.localStorage.setItem(LANGUAGE_KEY, language);
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
    theme = window.localStorage.getItem(THEME_KEY);
    language = window.localStorage.getItem(LANGUAGE_KEY);
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
  window.dispatchEvent(new Event(PREFERENCES_EVENT));
}

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

function isLanguagePreference(value: string | null): value is LanguagePreference {
  return value === "ru" || value === "en" || value === "zh";
}
