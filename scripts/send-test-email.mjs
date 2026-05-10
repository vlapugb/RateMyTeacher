import "dotenv/config";
import nodemailer from "nodemailer";

const to = process.argv[2] ?? process.env.EMAIL_TO;

if (!to) {
  console.error("Usage: npm run email:test -- recipient@example.com");
  process.exit(1);
}

const provider = getEmailProvider();
const payload = {
  to,
  subject: "Проверка почты StudRadar",
  text: `Почтовая отправка настроена. Provider: ${provider}. App URL: ${process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "not set"}`,
  html: `<p>Почтовая отправка настроена.</p><p>Provider: <b>${provider}</b></p><p>App URL: <b>${process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "not set"}</b></p>`,
};

if (provider === "gmail") {
  await sendViaGmail(payload);
} else if (provider === "sendgrid") {
  await sendViaSendGrid(payload);
} else if (provider === "brevo") {
  await sendViaBrevo(payload);
} else if (provider === "mailgun") {
  await sendViaMailgun(payload);
} else {
  await sendViaSmtp(payload);
}

console.log(`Email sent to ${to} via ${provider}`);

function getEmailProvider() {
  const provider = process.env.EMAIL_PROVIDER?.toLowerCase();

  if (["smtp", "gmail", "sendgrid", "brevo", "mailgun"].includes(provider)) {
    return provider;
  }

  if (process.env.GMAIL_REFRESH_TOKEN) return "gmail";
  if (process.env.SENDGRID_API_KEY) return "sendgrid";
  if (process.env.BREVO_API_KEY) return "brevo";
  if (process.env.MAILGUN_API_KEY) return "mailgun";

  return "smtp";
}

async function sendViaSmtp(payload) {
  const transporter = nodemailer.createTransport({
    host: requireEnv("SMTP_HOST"),
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: requireEnv("SMTP_PASSWORD"),
        }
      : undefined,
  });

  await transporter.verify();
  await transporter.sendMail({
    from: getEmailFrom(),
    ...payload,
  });
}

async function sendViaGmail(payload) {
  const accessToken = await getGmailAccessToken();
  const response = await fetch(
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

  await assertOk(response, "Gmail API");
}

async function getGmailAccessToken() {
  const response = await fetch("https://oauth2.googleapis.com/token", {
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
  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.access_token) {
    throw new Error(
      `Gmail token refresh failed with status ${response.status}: ${JSON.stringify(
        body,
      )}`,
    );
  }

  return body.access_token;
}

async function sendViaSendGrid(payload) {
  const content = [{ type: "text/plain", value: payload.text }];

  if (payload.html) {
    content.push({ type: "text/html", value: payload.html });
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requireEnv("SENDGRID_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: payload.to }] }],
      from: parseEmailAddress(getEmailFrom()),
      subject: payload.subject,
      content,
    }),
  });

  await assertOk(response, "SendGrid");
}

async function sendViaBrevo(payload) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": requireEnv("BREVO_API_KEY"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: parseEmailAddress(getEmailFrom()),
      to: [{ email: payload.to }],
      subject: payload.subject,
      textContent: payload.text,
      htmlContent: payload.html,
    }),
  });

  await assertOk(response, "Brevo");
}

async function sendViaMailgun(payload) {
  const body = new URLSearchParams({
    from: getEmailFrom(),
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
  });

  if (payload.html) {
    body.set("html", payload.html);
  }

  const response = await fetch(
    `https://api.mailgun.net/v3/${requireEnv("MAILGUN_DOMAIN")}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${requireEnv("MAILGUN_API_KEY")}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );

  await assertOk(response, "Mailgun");
}

async function assertOk(response, provider) {
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`${provider} failed with status ${response.status}: ${text}`);
  }
}

function getEmailFrom() {
  return (
    process.env.EMAIL_FROM ??
    process.env.SMTP_FROM ??
    "StudRadar <noreply@studradar.local>"
  );
}

function requireEnv(key) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is not configured`);
  }

  return value;
}

function parseEmailAddress(value) {
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

function buildMimeMessage(payload) {
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

function encodeMimeHeader(value) {
  const sanitized = sanitizeHeaderValue(value);

  if (/^[\x00-\x7F]*$/.test(sanitized)) {
    return sanitized;
  }

  return `=?UTF-8?B?${toBase64(sanitized)}?=`;
}

function sanitizeHeaderValue(value) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function toBase64(value) {
  return Buffer.from(value, "utf8").toString("base64");
}

function toBase64Url(value) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
