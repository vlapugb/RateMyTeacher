import nodemailer from "nodemailer";
import { logger } from "@/lib/logger";

type EmailProvider = "smtp" | "gmail" | "sendgrid" | "brevo" | "mailgun";

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

const EMAIL_FETCH_TIMEOUT_MS = 15_000;

export async function sendAuthEmail(payload: EmailPayload) {
  const provider = getEmailProvider();

  if (provider === "gmail") {
    await sendViaGmail(payload);
    return;
  }

  if (provider === "sendgrid") {
    await sendViaSendGrid(payload);
    return;
  }

  if (provider === "brevo") {
    await sendViaBrevo(payload);
    return;
  }

  if (provider === "mailgun") {
    await sendViaMailgun(payload);
    return;
  }

  await sendViaSmtp(payload);
}

function getEmailProvider(): EmailProvider {
  const provider = process.env.EMAIL_PROVIDER?.toLowerCase();

  if (
    provider === "smtp" ||
    provider === "gmail" ||
    provider === "sendgrid" ||
    provider === "brevo" ||
    provider === "mailgun"
  ) {
    return provider;
  }

  if (process.env.GMAIL_REFRESH_TOKEN) return "gmail";
  if (process.env.SENDGRID_API_KEY) return "sendgrid";
  if (process.env.BREVO_API_KEY) return "brevo";
  if (process.env.MAILGUN_API_KEY) return "mailgun";

  return "smtp";
}

async function sendViaSmtp(payload: EmailPayload) {
  const host = process.env.SMTP_HOST;

  if (!host) {
    throw new Error("SMTP_HOST is not configured");
  }

  if (process.env.SMTP_USER && !process.env.SMTP_PASSWORD) {
    throw new Error("SMTP_PASSWORD is required when SMTP_USER is configured");
  }

  const transporter = nodemailer.createTransport({
    host,
    port: getSmtpPort(),
    secure: process.env.SMTP_SECURE === "true",
    connectionTimeout: EMAIL_FETCH_TIMEOUT_MS,
    greetingTimeout: EMAIL_FETCH_TIMEOUT_MS,
    socketTimeout: EMAIL_FETCH_TIMEOUT_MS,
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        }
      : undefined,
  });

  try {
    const info = await transporter.sendMail({
      from: getEmailFrom(),
      ...payload,
    });
    logger.info(
      { messageId: info.messageId, subject: payload.subject },
      "Auth email sent",
    );
  } catch (error) {
    logger.error({ err: error }, "Failed to send auth email");
    throw error;
  }
}

async function sendViaSendGrid(payload: EmailPayload) {
  const apiKey = requireEnv("SENDGRID_API_KEY");
  const from = parseEmailAddress(getEmailFrom());
  const content = [{ type: "text/plain", value: payload.text }];

  if (payload.html) {
    content.push({ type: "text/html", value: payload.html });
  }

  const response = await fetchWithEmailTimeout("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: payload.to }],
        },
      ],
      from,
      subject: payload.subject,
      content,
    }),
  });

  await assertEmailApiResponse(response, "SendGrid");
}

async function sendViaBrevo(payload: EmailPayload) {
  const apiKey = requireEnv("BREVO_API_KEY");
  const from = parseEmailAddress(getEmailFrom());
  const response = await fetchWithEmailTimeout("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: from,
      to: [{ email: payload.to }],
      subject: payload.subject,
      textContent: payload.text,
      htmlContent: payload.html,
    }),
  });

  await assertEmailApiResponse(response, "Brevo");
}

async function sendViaMailgun(payload: EmailPayload) {
  const apiKey = requireEnv("MAILGUN_API_KEY");
  const domain = requireEnv("MAILGUN_DOMAIN");
  const body = new URLSearchParams({
    from: getEmailFrom(),
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
  });

  if (payload.html) {
    body.set("html", payload.html);
  }

  const response = await fetchWithEmailTimeout(
    `https://api.mailgun.net/v3/${domain}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );

  await assertEmailApiResponse(response, "Mailgun");
}

async function sendViaGmail(payload: EmailPayload) {
  const accessToken = await getGmailAccessToken();
  const response = await fetchWithEmailTimeout(
    `https://gmail.googleapis.com/gmail/v1/users/${encodeURIComponent(
      process.env.GMAIL_USER_ID ?? "me",
    )}/messages/send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        raw: toBase64Url(buildMimeMessage(payload)),
      }),
    },
  );

  await assertEmailApiResponse(response, "Gmail API");
}

async function getGmailAccessToken() {
  const response = await fetchWithEmailTimeout("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: requireEnv("GMAIL_CLIENT_ID"),
      client_secret: requireEnv("GMAIL_CLIENT_SECRET"),
      refresh_token: requireEnv("GMAIL_REFRESH_TOKEN"),
      grant_type: "refresh_token",
    }),
  });
  const body = (await response.json().catch(() => null)) as
    | { access_token?: string; error?: string; error_description?: string }
    | null;

  if (!response.ok || !body?.access_token) {
    logger.error(
      {
        status: response.status,
        error: body?.error,
        description: body?.error_description,
      },
      "Failed to refresh Gmail API access token",
    );
    throw new Error(`Gmail token refresh failed with status ${response.status}`);
  }

  return body.access_token;
}

async function assertEmailApiResponse(
  response: Response,
  provider: string,
) {
  if (!response.ok) {
    const responseText = await response.text();
    logger.error(
      {
        provider,
        status: response.status,
        responseLength: responseText.length,
      },
      "Failed to send auth email via HTTPS provider",
    );
    throw new Error(`${provider} email API failed with status ${response.status}`);
  }

  logger.info(
    {
      provider,
      status: response.status,
    },
    "Auth email sent via HTTPS provider",
  );
}

function getEmailFrom() {
  return (
    process.env.EMAIL_FROM ??
    process.env.SMTP_FROM ??
    "StudRadar <noreply@studradar.local>"
  );
}

function requireEnv(key: string) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is not configured`);
  }

  return value;
}

function getSmtpPort() {
  const rawPort = process.env.SMTP_PORT ?? "587";
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`SMTP_PORT must be an integer from 1 to 65535`);
  }

  return port;
}

async function fetchWithEmailTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
) {
  try {
    return await fetch(input, {
      ...init,
      signal: AbortSignal.timeout(EMAIL_FETCH_TIMEOUT_MS),
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw new Error(
        `Email provider request timed out after ${EMAIL_FETCH_TIMEOUT_MS}ms`,
      );
    }

    throw error;
  }
}

function isAbortError(error: unknown) {
  return (
    error instanceof DOMException && error.name === "TimeoutError"
  ) || (error instanceof Error && error.name === "AbortError");
}

function parseEmailAddress(value: string) {
  const match = value.match(/^(.*?)\s*<([^>]+)>$/);

  if (!match) {
    return { email: value.trim() };
  }

  const name = match[1].trim().replace(/^"|"$/g, "");
  return {
    email: match[2].trim(),
    ...(name ? { name } : {}),
  };
}

function buildMimeMessage(payload: EmailPayload) {
  const baseHeaders = [
    `From: ${sanitizeHeaderValue(getEmailFrom())}`,
    `To: ${sanitizeHeaderValue(payload.to)}`,
    `Subject: ${encodeMimeHeader(payload.subject)}`,
    "MIME-Version: 1.0",
    `Date: ${new Date().toUTCString()}`,
  ];

  if (!payload.html) {
    return [
      ...baseHeaders,
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: base64",
      "",
      toBase64(payload.text),
    ].join("\r\n");
  }

  const boundary = `studradar-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;

  return [
    ...baseHeaders,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    toBase64(payload.text),
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    toBase64(payload.html),
    `--${boundary}--`,
    "",
  ].join("\r\n");
}

function encodeMimeHeader(value: string) {
  const sanitized = sanitizeHeaderValue(value);

  if (/^[\x00-\x7F]*$/.test(sanitized)) {
    return sanitized;
  }

  return `=?UTF-8?B?${toBase64(sanitized)}?=`;
}

function sanitizeHeaderValue(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function toBase64(value: string) {
  return Buffer.from(value, "utf8").toString("base64");
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
