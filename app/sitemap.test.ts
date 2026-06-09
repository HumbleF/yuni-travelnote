import { describe, it, expect } from "vitest";
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
