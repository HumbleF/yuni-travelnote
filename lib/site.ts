export const DEFAULT_SITE_URL = "https://travel.example.com";

export function getBaseUrl(): string {
  const fromEnv = process.env.SITE_URL;
  return fromEnv && fromEnv.trim().length > 0 ? fromEnv.trim() : DEFAULT_SITE_URL;
}
