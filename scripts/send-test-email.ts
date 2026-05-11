import "dotenv/config";
import {
  getEmailProvider,
  sendEmail,
  type EmailPayload,
} from "@/lib/email-core";

const to = process.argv[2] ?? process.env.EMAIL_TO;

if (!to) {
  console.error("Usage: npx tsx scripts/send-test-email.ts recipient@example.com");
  process.exit(1);
}

const provider = getEmailProvider();
const payload: EmailPayload = {
  to,
  subject: "Проверка почты StudRadar",
  text: `Почтовая отправка настроена. Provider: ${provider}. App URL: ${process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "not set"}`,
  html: `<p>Почтовая отправка настроена.</p><p>Provider: <b>${provider}</b></p><p>App URL: <b>${process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "not set"}</b></p>`,
};

await sendEmail(payload);

console.log(`Email sent to ${to} via ${provider}`);
