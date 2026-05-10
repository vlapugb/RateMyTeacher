"use client";

import { ShieldCheck } from "lucide-react";
import { usePreferences, type LanguagePreference } from "@/lib/preferences";

const aboutCopy: Record<
  LanguagePreference,
  {
    title: string;
    intro: string;
    cards: {
      title: string;
      text: string;
    }[];
  }
> = {
  ru: {
    title: "О проекте",
    intro:
      "StudRadar помогает студентам выбирать курсы и преподавателей на основе структурированных оценок, а не разрозненных сообщений в чатах.",
    cards: [
      ["Оценки", "Общий рейтинг преподавателя не привязан к предмету."],
      [
        "Подтверждение email",
        "Оценки публикуют подтвержденные аккаунты, а комментарии можно оставить анонимно без входа.",
      ],
      [
        "Категории",
        "Оценки разделены по знаниям, нагрузке, пользе и формату сдачи.",
      ],
    ].map(([title, text]) => ({ title, text })),
  },
  en: {
    title: "About",
    intro:
      "StudRadar helps students choose courses and teachers using structured reviews instead of scattered chat messages.",
    cards: [
      ["Ratings", "The teacher's overall rating is not tied to one course."],
      [
        "Email verification",
        "Verified accounts publish ratings, while comments can be posted anonymously without signing in.",
      ],
      [
        "Categories",
        "Ratings are split by knowledge, workload, usefulness and exam format.",
      ],
    ].map(([title, text]) => ({ title, text })),
  },
  zh: {
    title: "关于项目",
    intro: "StudRadar 用结构化评价帮助学生选择课程和教师，而不是依赖聊天记录。",
    cards: [
      ["评分", "教师总体评分不绑定某一门课程。"],
      ["邮箱验证", "已验证账户可以发布评分，评论也可以不登录匿名发布。"],
      ["分类", "评分按知识水平、负担、实用性和考试形式拆分。"],
    ].map(([title, text]) => ({ title, text })),
  },
};

export default function AboutPage() {
  const { language } = usePreferences();
  const copy = aboutCopy[language];

  return (
    <div className="page-soft-enter px-5 pb-8 md:px-8">
      <section className="pt-6">
        <h1 className="text-3xl font900">{copy.title}</h1>
        <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-muted">
          {copy.intro}
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {copy.cards.map(({ title, text }) => (
          <article
            key={title}
            className="interactive-card rounded-lg border border-line bg-white p-5 shadow-sm hover:border-primary/30"
          >
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h2 className="mt-3 text-lg font900">{title}</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-muted">
              {text}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
