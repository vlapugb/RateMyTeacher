"use client";

import { FormEvent, useState } from "react";
import { MessageCircle, Send, ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACT_CONFIG } from "@/lib/app-config";
import { usePreferences, type LanguagePreference } from "@/lib/preferences";

const faqCopy: Record<
  LanguagePreference,
  {
    title: string;
    subtitle: string;
    items: {
      question: string;
      answer: string;
    }[];
    helpTitle: string;
    helpText: string;
    telegram: string;
    feedbackTitle: string;
    feedbackText: string;
    emailLabel: string;
    messageLabel: string;
    messagePlaceholder: string;
    submit: string;
    sent: string;
    rulesTitle: string;
    rulesText: string;
    emailSubject: string;
    emailBodyPrefix: string;
  }
> = {
  ru: {
    title: "Помощь и FAQ",
    subtitle: "Ответы на частые вопросы о публикации оценок и аккаунте.",
    items: [
      {
        question: "Как считаются рейтинги преподавателей?",
        answer:
          "Публичная оценка считается по подтвержденным оценкам с учетом общего балла и выбранных категорий.",
      },
      {
        question: "Можно ли поставить оценку анонимно?",
        answer:
          "Да. Оценка требует входа и подтвержденной почты, но имя можно скрыть. Текстовый комментарий можно оставить без входа, он будет опубликован анонимно.",
      },
      {
        question: "Зачем нужен комментарий к оценке?",
        answer:
          "Комментарий необязателен. Можно отправить только оценки по категориям.",
      },
      {
        question: "Почему нужно подтверждать почту?",
        answer:
          "Подтверждение почты снижает накрутки и помогает держать карту оценок честной для студентов.",
      },
      {
        question: "Можно ли изменить оценку?",
        answer:
          "Да. Один студент может оставить одну оценку на преподавателя, а потом изменить ее или удалить.",
      },
    ],
    helpTitle: "Нужна помощь?",
    helpText: "Если вопрос не нашёлся в списке, напишите — ответим лично.",
    telegram: "Написать в Telegram",
    feedbackTitle: "Форма обратной связи",
    feedbackText: "Укажите почту и опишите проблему или предложение.",
    emailLabel: "Ваша почта",
    messageLabel: "Сообщение",
    messagePlaceholder: "Опишите вопрос, проблему или предложение...",
    submit: "Отправить",
    sent: "Открываем почтовый клиент...",
    rulesTitle: "Правила оценок",
    rulesText:
      "Пишите о курсе, требованиях, нагрузке, формате сдачи и качестве объяснений. Не публикуйте личные данные.",
    emailSubject: "Вопрос/предложение StudRadar",
    emailBodyPrefix: "Сообщение от",
  },
  en: {
    title: "Help & FAQ",
    subtitle: "Answers about publishing reviews and managing your account.",
    items: [
      {
        question: "How are teacher ratings calculated?",
        answer:
          "The public rating is based on verified reviews, the overall score and selected categories.",
      },
      {
        question: "Can I post anonymously?",
        answer:
          "Yes. Ratings require sign-in and verified email, but the public name can be hidden. Text comments can be posted without signing in and are shown anonymously.",
      },
      {
        question: "Why add a comment?",
        answer:
          "A comment is optional. You can submit category scores only.",
      },
      {
        question: "Why verify email?",
        answer:
          "Email verification reduces manipulation and keeps ratings useful for students.",
      },
      {
        question: "Can I change a review?",
        answer:
          "Yes. One student can leave one review per teacher and later edit or delete it.",
      },
    ],
    helpTitle: "Need help?",
    helpText: "If the answer is not listed, send a message and we will reply.",
    telegram: "Message on Telegram",
    feedbackTitle: "Feedback form",
    feedbackText: "Enter your email and describe the issue or suggestion.",
    emailLabel: "Your email",
    messageLabel: "Message",
    messagePlaceholder: "Describe a question, issue or suggestion...",
    submit: "Send",
    sent: "Opening your email client...",
    rulesTitle: "Review rules",
    rulesText:
      "Write about the course, requirements, workload, exam format and explanation quality. Do not publish personal data.",
    emailSubject: "StudRadar question/suggestion",
    emailBodyPrefix: "Message from",
  },
  zh: {
    title: "帮助与 FAQ",
    subtitle: "关于发布评价和账户的常见问题。",
    items: [
      {
        question: "教师评分如何计算？",
        answer: "公开评分基于已验证评价，并结合总体分数和所选分类。",
      },
      {
        question: "可以匿名评价吗？",
        answer:
          "可以。评分需要登录并验证邮箱，但可以隐藏公开姓名。文字评论可以不登录发布，并会匿名显示。",
      },
      {
        question: "为什么要写评论？",
        answer: "评论是可选的，也可以只提交分类评分。",
      },
      {
        question: "为什么需要验证邮箱？",
        answer: "邮箱验证有助于减少刷分，让评价对学生更可靠。",
      },
      {
        question: "可以修改评价吗？",
        answer: "可以。每位学生对每位教师只能留一条评价，之后可以编辑或删除。",
      },
    ],
    helpTitle: "需要帮助？",
    helpText: "如果列表里没有答案，可以发消息给我们。",
    telegram: "在 Telegram 联系",
    feedbackTitle: "反馈表单",
    feedbackText: "填写邮箱，并描述问题或建议。",
    emailLabel: "你的邮箱",
    messageLabel: "消息",
    messagePlaceholder: "描述问题或建议...",
    submit: "发送",
    sent: "正在打开邮件客户端...",
    rulesTitle: "评价规则",
    rulesText: "请描述课程、要求、负担、考试形式和讲解质量。不要发布个人数据。",
    emailSubject: "StudRadar 问题/建议",
    emailBodyPrefix: "消息来自",
  },
};

export default function FaqPage() {
  const { language } = usePreferences();
  const copy = faqCopy[language];
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    if (!email || !message) return;

    const subject = encodeURIComponent(copy.emailSubject);
    const body = encodeURIComponent(
      `${copy.emailBodyPrefix}: ${email}\n\n${message}`,
    );
    window.location.href = `mailto:${CONTACT_CONFIG.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <div className="page-soft-enter px-5 pb-8 md:px-8">
      <section className="pt-6">
        <h1 className="text-3xl font900">{copy.title}</h1>
        <p className="mt-2 text-sm font700 text-muted">
          {copy.subtitle}
        </p>
      </section>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="space-y-3">
          {copy.items.map((item, index) => (
            <details
              key={item.question}
              open={index === 0}
              className="interactive-card group rounded-lg border border-line bg-white p-4 shadow-sm hover:border-primary/30"
            >
              <summary className="cursor-pointer list-none text-base font900">
                {item.question}
              </summary>
              <p className="mt-3 text-sm font-medium leading-6 text-muted">
                {item.answer}
              </p>
            </details>
          ))}
        </section>

        <aside className="h-fit space-y-5">
          <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <ShieldQuestion className="h-10 w-10 text-primary" />
            <h2 className="mt-3 text-xl font900">{copy.helpTitle}</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-muted">
              {copy.helpText}
            </p>
            <div className="mt-5 space-y-3">
              <a
                href={CONTACT_CONFIG.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-line bg-slate-50 p-3 text-sm font800 text-slate-700 transition hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-sm"
              >
                <MessageCircle className="h-5 w-5 text-[#2AABEE]" />
                <span>{copy.telegram}</span>
                <span className="ml-auto text-xs text-muted">
                  {CONTACT_CONFIG.telegramHandle}
                </span>
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <h3 className="text-lg font900">{copy.feedbackTitle}</h3>
            <p className="mt-1 text-xs font-medium text-muted">
              {copy.feedbackText}
            </p>
            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-xs font800 text-slate-600">
                  {copy.emailLabel}
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="st055555@student.spbu.ru"
                  className="focus-ring mt-1 h-11 w-full rounded-lg border border-line px-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font800 text-slate-600">
                  {copy.messageLabel}
                </span>
                <textarea
                  name="message"
                  required
                  rows={4}
                  maxLength={1000}
                  placeholder={copy.messagePlaceholder}
                  className="focus-ring mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm resize-none"
                />
              </label>
              <Button type="submit" className="w-full">
                <Send className="h-4 w-4" />
                {copy.submit}
              </Button>
            </form>
            {sent && (
              <p className="mt-2 text-xs font800 text-success">
                {copy.sent}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-line bg-slate-50 p-4">
            <h3 className="font900 text-sm">{copy.rulesTitle}</h3>
            <p className="mt-2 text-xs font-medium leading-5 text-muted">
              {copy.rulesText}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
