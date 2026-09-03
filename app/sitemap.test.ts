import { describe, it, expect, vi } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("returns a non-empty array", () => {
    const entries = sitemap();
    expect(entries.length).toBeGreaterThan(0);
  });

  it("first entry is the homepage with priority 1", () => {
    const entries = sitemap();
    expect(entries[0].priority).toBe(1);
    expect(entries[0].url).toMatch(/https?:\/\//);
  });

  it("all entries have valid URLs", () => {
    const entries = sitemap();
    for (const entry of entries) {
      expect(entry.url).toMatch(/^https?:\/\//);
      expect(entry.url).not.toContain("undefined");
      expect(entry.url).not.toContain("null");
    }
  });

  it("includes place detail pages", () => {
    const entries = sitemap();
    const placeEntries = entries.filter((e) => e.url.includes("/places/"));
    expect(placeEntries.length).toBeGreaterThan(0);
  });

  it("includes continent pages", () => {
    const entries = sitemap();
    const continentEntries = entries.filter((e) =>
      e.url.includes("/continents/"),
    );
    expect(continentEntries.length).toBeGreaterThan(0);
  });

  it("no duplicate URLs", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe("sitemap env configuration", () => {
  it("uses SITE_URL when set, never the placeholder", async () => {
    vi.stubEnv("SITE_URL", "https://env-set.example.com");
    vi.resetModules();
    try {
      const { default: freshSitemap } = await import("./sitemap");
      const entries = freshSitemap();
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].url.startsWith("https://env-set.example.com")).toBe(true);
      for (const e of entries) {
        expect(e.url).not.toContain("travel.example.com");
      }
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});
