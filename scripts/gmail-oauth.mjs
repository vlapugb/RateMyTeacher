import "dotenv/config";

const command = process.argv[2] ?? "auth-url";
const redirectUri =
  process.env.GMAIL_REDIRECT_URI ?? "http://localhost:3000/oauth2callback";
const scope = "https://www.googleapis.com/auth/gmail.send";

if (command === "auth-url") {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", requireEnv("GMAIL_CLIENT_ID"));
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scope);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  console.log(url.toString());
} else if (command === "exchange") {
  const code = process.argv[3];

  if (!code) {
    console.error("Usage: npm run gmail:exchange -- CODE_FROM_REDIRECT_URL");
    process.exit(1);
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: requireEnv("GMAIL_CLIENT_ID"),
      client_secret: requireEnv("GMAIL_CLIENT_SECRET"),
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
} else {
  console.error("Usage: npm run gmail:auth-url OR npm run gmail:exchange -- CODE");
  process.exit(1);
}

function requireEnv(key) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is not configured`);
  }

  return value;
}
