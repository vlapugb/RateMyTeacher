export function requireServerEnv(key: string) {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`${key} environment variable is required`);
  }

  return value;
}
