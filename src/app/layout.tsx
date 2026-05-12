import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { ANALYTICS_CONFIG, APP_NAME, STORAGE_KEYS } from "@/lib/app-config";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Честная карта преподавателей математико-механического факультета СПбГУ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <Script id="preferences-bootstrap" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var theme = localStorage.getItem('${STORAGE_KEYS.theme}') || 'light';
                var language = localStorage.getItem('${STORAGE_KEYS.language}') || 'ru';
                document.documentElement.dataset.theme = theme;
                document.documentElement.dataset.themePreference = theme;
                document.documentElement.lang = language;
              } catch (error) {}
            })();
          `}
        </Script>
        {ANALYTICS_CONFIG.yandexMetrikaId && (
          <Script id="yandex-metrika" strategy="afterInteractive">
            {`
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {
                if (document.scripts[j].src === r) { return; }
              }
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=${ANALYTICS_CONFIG.yandexMetrikaId}', 'ym');

            ym(${ANALYTICS_CONFIG.yandexMetrikaId}, 'init', {
              ssr: true,
              webvisor: true,
              clickmap: true,
              ecommerce: 'dataLayer',
              referrer: document.referrer,
              url: location.href,
              accurateTrackBounce: true,
              trackLinks: true
            });
          `}
          </Script>
        )}
        {ANALYTICS_CONFIG.yandexMetrikaId && (
          <noscript>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://mc.yandex.ru/watch/${ANALYTICS_CONFIG.yandexMetrikaId}`}
                style={{ position: "absolute", left: "-9999px" }}
                alt=""
              />
            </div>
          </noscript>
        )}
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
