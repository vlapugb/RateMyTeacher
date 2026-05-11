import {
  sendEmail,
  type EmailPayload,
} from "@/lib/email-core";

export type { EmailPayload };

export async function sendAuthEmail(payload: EmailPayload) {
  await sendEmail(payload);
}
