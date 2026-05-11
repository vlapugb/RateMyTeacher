import "dotenv/config";
import { requireEmailEnv } from "@/lib/email-core";

const command = process.argv[2] ?? "auth-url";
const redirectUri =
  process.env.GMAIL_REDIRECT_URI ?? "http://localhost:3000/oauth2callback";
const scope = "https://www.googleapis.com/auth/gmail.send";

if (command === "auth-url") {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", requireEmailEnv("GMAIL_CLIENT_ID"));
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scope);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  console.log(url.toString());
  process.exit(0);
}

if (command === "exchange") {
  const code = process.argv[3];

  if (!code) {
    console.error("Usage: npx tsx scripts/gmail-oauth.ts exchange -- CODE_FROM_REDIRECT_URL");
    process.exit(1);
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: requireEmailEnv("GMAIL_CLIENT_ID"),
      client_secret: requireEmailEnv("GMAIL_CLIENT_SECRET"),
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    console.error(JSON.stringify(body, null, 2));
    process.exit(1);
  }

  console.log(`GMAIL_REFRESH_TOKEN=${body.refresh_token ?? ""}`);
  console.log(`GMAIL_REDIRECT_URI=${redirectUri}`);
  process.exit(0);
}

console.error("Usage: npx tsx scripts/gmail-oauth.ts auth-url OR npx tsx scripts/gmail-oauth.ts exchange -- CODE");
process.exit(1);
