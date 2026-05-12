"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { API_ROUTES } from "@/lib/app-routes";
import { ANALYTICS_CONFIG } from "@/lib/app-config";

type CookieConsent = "all" | "necessary" | "custom";
type CookieCategory = "analytics" | "marketing";

const COOKIE_STORAGE_KEY = "studradar:cookie-consent";

const cookieBannerCopy = {
  ru: {
    title: "Файлы cookie",
    description:
      "Мы используем необходимые cookie для работы сайта. Аналитические cookie помогают нам понять, как используется сайт. Вы можете принять все, только необходимые или настроить выбор.",
    acceptAll: "Принять все",
    necessary: "Только необходимые",
    customize: "Настроить",
    analytics: "Аналитические cookie (Яндекс.Метрика)",
    marketing: "Маркетинговые cookie",
    save: "Сохранить выбор",
    policy: "Политика cookie",
  },
};

export function CookieBanner() {
  const copy = cookieBannerCopy.ru;
  const [visible, setVisible] = useState(
    () =>
      typeof window !== "undefined" &&
      !localStorage.getItem(COOKIE_STORAGE_KEY),
  );
  const [showCustomize, setShowCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  function saveConsent(consent: CookieConsent) {
    const categories: CookieCategory[] = [];
    if (consent === "all") {
      categories.push("analytics", "marketing");
    } else if (consent === "custom") {
      if (analytics) categories.push("analytics");
      if (marketing) categories.push("marketing");
    }

    localStorage.setItem(
      COOKIE_STORAGE_KEY,
      JSON.stringify({ consent, categories, timestamp: Date.now() }),
    );

    for (const category of categories) {
      fetch(API_ROUTES.consent, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consentType:
            category === "analytics"
              ? "cookies_analytics"
              : "cookies_marketing",
        }),
      }).catch(() => {});
    }

    if (categories.includes("analytics")) {
      loadYandexMetrika();
    }

    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-primary/30 bg-panel p-4 shadow-2xl sm:p-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex-1">
          <h3 className="text-base font900 text-foreground">{copy.title}</h3>
          <p className="mt-1 text-sm font-medium text-muted">
            {copy.description}{" "}
            <a
              href="/legal/cookies"
              className="text-primary underline underline-offset-4 hover:no-underline"
            >
              {copy.policy}
            </a>
          </p>

          {showCustomize && (
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-3 text-sm font700">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="h-4 w-4 rounded border-line"
                />
                {copy.analytics}
              </label>
              <label className="flex items-center gap-3 text-sm font700">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="h-4 w-4 rounded border-line"
                />
                {copy.marketing}
              </label>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:min-w-52">
          {showCustomize ? (
            <Button
              onClick={() => saveConsent("custom")}
              className="w-full"
            >
              {copy.save}
            </Button>
          ) : (
            <>
              <Button
                onClick={() => saveConsent("all")}
                className="w-full"
              >
                {copy.acceptAll}
              </Button>
              <Button
                variant="secondary"
                onClick={() => saveConsent("necessary")}
                className="w-full"
              >
                {copy.necessary}
              </Button>
              <button
                type="button"
                onClick={() => setShowCustomize(true)}
                className="text-center text-xs font800 text-primary underline-offset-4 hover:underline"
              >
                {copy.customize}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function loadYandexMetrika() {
  if (typeof window === "undefined") return;
  if (!ANALYTICS_CONFIG.yandexMetrikaId) return;

  const script = document.createElement("script");
  script.innerHTML = `
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === k) { return; }}
    a=e.createElement(t),k=e.getElementsByTagName(t)[0];a.async=1;a.src=k;a.onload=function(){try{ym(${ANALYTICS_CONFIG.yandexMetrikaId}, "init", {clickmap:true,trackLinks:true,accurateTrackBounce:true});}catch(e){}};k.parentNode.insertBefore(a,k);})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
  `;
  document.head.appendChild(script);
}
