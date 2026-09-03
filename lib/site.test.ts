import { describe, it, expect, vi, afterEach } from "vitest";
import { getBaseUrl, DEFAULT_SITE_URL } from "./site";

describe("site url configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns SITE_URL from environment when set", () => {
    vi.stubEnv("SITE_URL", "https://yuni-travel.vercel.app");
    expect(getBaseUrl()).toBe("https://yuni-travel.vercel.app");
  });

  it("falls back to default placeholder when SITE_URL is empty string", () => {
    vi.stubEnv("SITE_URL", "");
    expect(getBaseUrl()).toBe(DEFAULT_SITE_URL);
  });

  it("falls back to default placeholder when SITE_URL is unset", () => {
    vi.stubEnv("SITE_URL", "");
    vi.unstubAllEnvs();
    expect(getBaseUrl()).toBe(DEFAULT_SITE_URL);
  });

  it("default placeholder is a valid https url", () => {
    expect(DEFAULT_SITE_URL).toMatch(/^https:\/\//);
  });
});
