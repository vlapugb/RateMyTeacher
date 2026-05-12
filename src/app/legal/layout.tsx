import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Правовая информация — StudRadar",
  robots: { index: false, follow: true },
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <nav className="mb-8 flex flex-wrap gap-2">
        <a
          href="/legal/terms"
          className="rounded-lg border border-line px-3 py-1.5 text-xs font800 text-muted hover:border-primary hover:text-primary"
        >
          Пользовательское соглашение
        </a>
        <a
          href="/legal/privacy"
          className="rounded-lg border border-line px-3 py-1.5 text-xs font800 text-muted hover:border-primary hover:text-primary"
        >
          Политика обработки ПД
        </a>
        <a
          href="/legal/personal-data-consent"
          className="rounded-lg border border-line px-3 py-1.5 text-xs font800 text-muted hover:border-primary hover:text-primary"
        >
          Согласие на обработку ПД
        </a>
        <a
          href="/legal/cookies"
          className="rounded-lg border border-line px-3 py-1.5 text-xs font800 text-muted hover:border-primary hover:text-primary"
        >
          Политика cookie
        </a>
        <a
          href="/legal/review-rules"
          className="rounded-lg border border-line px-3 py-1.5 text-xs font800 text-muted hover:border-primary hover:text-primary"
        >
          Правила отзывов
        </a>
        <a
          href="/legal/complaint"
          className="rounded-lg border border-line px-3 py-1.5 text-xs font800 text-muted hover:border-primary hover:text-primary"
        >
          Жалоба на отзыв
        </a>
        <a
          href="/legal/contacts"
          className="rounded-lg border border-line px-3 py-1.5 text-xs font800 text-muted hover:border-primary hover:text-primary"
        >
          Контакты
        </a>
      </nav>
      {children}
    </div>
  );
}
