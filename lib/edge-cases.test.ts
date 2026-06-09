import { describe, it, expect } from "vitest";
import {
  getAllPlaces,
  getPlaceBySlug,
  getCountryMeta,
  getRegionMeta,
  getCountriesByContinent,
  getRegionsByCountry,
} from "./places";

describe("edge cases", () => {
  describe("fallback behavior", () => {
    it("getCountryMeta returns fallback for unknown country", () => {
      const meta = getCountryMeta("不存在的国家");
      expect(meta.flag).toBe("🌐");
      expect(meta.slug).toBeTruthy();
      expect(meta.slug.length).toBeGreaterThan(0);
    });

    it("different unknown CJK countries produce different slugs", () => {
      const a = getCountryMeta("虚构国");
      const b = getCountryMeta("幻想国");
      expect(a.slug).not.toBe(b.slug);
    });

    it("getRegionMeta returns fallback for unknown region", () => {
      const meta = getRegionMeta("不存在的省份");
      expect(meta.slug).toBeTruthy();
    });
  });

  describe("content integrity", () => {
    it("all places with country have valid countryMeta slug (no empty slug)", () => {
      const places = getAllPlaces();
      for (const p of places) {
        if (p.country) {
          const meta = getCountryMeta(p.country);
          expect(meta.slug.length).toBeGreaterThan(0);
          expect(meta.slug).not.toBe("");
        }
      }
    });

    it("all places with region have valid regionMeta slug", () => {
      const places = getAllPlaces();
      for (const p of places) {
        if (p.region) {
          const meta = getRegionMeta(p.region);
          expect(meta.slug.length).toBeGreaterThan(0);
        }
      }
    });

    it("no place has empty tags array", () => {
      const places = getAllPlaces();
      for (const p of places) {
        if (p.tags) {
          expect(p.tags.length).toBeGreaterThan(0);
        }
      }
    });

    it("getPlaceBySlug returns contentHtml without broken HTML", async () => {
      const places = getAllPlaces();
      for (const p of places) {
        const full = await getPlaceBySlug(p.slug);
        expect(full).not.toBeNull();
        const html = full!.contentHtml;
        const openTags = (html.match(/<[a-z][^/>]*>/gi) || []).length;
        const closeTags = (html.match(/<\/[a-z]+>/gi) || []).length;
        // Self-closing tags (img, br, hr) don't need close tags
        // Rough sanity: close tags shouldn't exceed open tags significantly
        expect(closeTags).toBeLessThanOrEqual(openTags + 10);
      }
    });
  });

  describe("hierarchy consistency", () => {
    it("every country group has at least one place", () => {
      const places = getAllPlaces();
      const continents = [...new Set(places.map((p) => p.continent))];
      for (const c of continents) {
        const groups = getCountriesByContinent(c);
        for (const g of groups) {
          expect(g.places.length).toBeGreaterThan(0);
        }
      }
    });

    it("every region group has at least one place", () => {
      const places = getAllPlaces();
      const countries = [...new Set(places.map((p) => p.country).filter(Boolean))];
      for (const country of countries) {
        const regions = getRegionsByCountry(country!);
        for (const r of regions) {
          expect(r.places.length).toBeGreaterThan(0);
        }
      }
    });

    it("place.country field matches its continent group", () => {
      const places = getAllPlaces();
      for (const p of places) {
        if (p.country) {
          const countries = getCountriesByContinent(p.continent);
          const found = countries.find((c) => c.country === p.country);
          expect(found).toBeDefined();
        }
      }
    });
  });
});
