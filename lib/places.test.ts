import { describe, it, expect } from "vitest";
import {
  getAllPlaces,
  getPlaceBySlug,
  getCountryMeta,
  getRegionMeta,
  findCountryBySlug,
  findRegionBySlug,
  getPlacesGroupedByContinent,
  getCountriesByContinent,
  getRegionsByCountry,
  getAllPlaceSlugs,
  CONTINENT_META,
  CONTINENT_ORDER,
  CONTINENT_BY_SLUG,
} from "./places";

describe("places data layer", () => {
  describe("getAllPlaces", () => {
    it("returns a non-empty array of places", () => {
      const places = getAllPlaces();
      expect(places.length).toBeGreaterThan(0);
    });

    it("every place has required fields", () => {
      const places = getAllPlaces();
      for (const p of places) {
        expect(p.slug).toBeTruthy();
        expect(p.title).toBeTruthy();
        expect(CONTINENT_ORDER).toContain(p.continent);
      }
    });

    it("returns places sorted by title (zh-Hans-CN locale)", () => {
      const places = getAllPlaces();
      for (let i = 1; i < places.length; i++) {
        const cmp = places[i - 1].title.localeCompare(
          places[i].title,
          "zh-Hans-CN",
        );
        expect(cmp).toBeLessThanOrEqual(0);
      }
    });

    it("slugs are unique", () => {
      const places = getAllPlaces();
      const slugs = places.map((p) => p.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    });
  });

  describe("getAllPlaceSlugs", () => {
    it("returns same slugs as getAllPlaces", () => {
      const fromSlugs = getAllPlaceSlugs().sort();
      const fromPlaces = getAllPlaces()
        .map((p) => p.slug)
        .sort();
      expect(fromSlugs).toEqual(fromPlaces);
    });
  });

  describe("getPlaceBySlug", () => {
    it("returns a place for a valid slug", async () => {
      const slugs = getAllPlaceSlugs();
      const place = await getPlaceBySlug(slugs[0]);
      expect(place).not.toBeNull();
      expect(place!.contentHtml).toBeTruthy();
    });

    it("returns null for unknown slug", async () => {
      const place = await getPlaceBySlug("nonexistent-xyz-123");
      expect(place).toBeNull();
    });

    it("contentHtml contains lazy loading attributes on images", async () => {
      const slugs = getAllPlaceSlugs();
      for (const slug of slugs) {
        const place = await getPlaceBySlug(slug);
        if (place && place.contentHtml.includes("<img")) {
          expect(place.contentHtml).toContain('loading="lazy"');
          expect(place.contentHtml).toContain('decoding="async"');
        }
      }
    });
  });

  describe("country registry", () => {
    it("getCountryMeta returns data for all countries in places", () => {
      const places = getAllPlaces();
      const countries = new Set(
        places.map((p) => p.country).filter(Boolean),
      );
      for (const country of countries) {
        const meta = getCountryMeta(country!);
        expect(meta.slug).toBeTruthy();
        expect(meta.en).toBeTruthy();
        expect(meta.flag).toBeTruthy();
      }
    });

    it("findCountryBySlug round-trips with getCountryMeta", () => {
      const places = getAllPlaces();
      const countries = new Set(
        places.map((p) => p.country).filter(Boolean),
      );
      for (const country of countries) {
        const meta = getCountryMeta(country!);
        const found = findCountryBySlug(meta.slug);
        expect(found).toBe(country);
      }
    });

    it("country slugs are unique across all countries", () => {
      const places = getAllPlaces();
      const countries = [
        ...new Set(places.map((p) => p.country).filter(Boolean)),
      ];
      const slugs = countries.map((c) => getCountryMeta(c!).slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    });
  });

  describe("region registry", () => {
    it("getRegionMeta returns data for all regions in places", () => {
      const places = getAllPlaces();
      const regions = new Set(places.map((p) => p.region).filter(Boolean));
      for (const region of regions) {
        const meta = getRegionMeta(region!);
        expect(meta.slug).toBeTruthy();
        expect(meta.en).toBeTruthy();
      }
    });

    it("findRegionBySlug round-trips with getRegionMeta", () => {
      const places = getAllPlaces();
      const regions = new Set(places.map((p) => p.region).filter(Boolean));
      for (const region of regions) {
        const meta = getRegionMeta(region!);
        const found = findRegionBySlug(meta.slug);
        expect(found).toBe(region);
      }
    });

    it("region slugs are unique across all regions", () => {
      const places = getAllPlaces();
      const regions = [
        ...new Set(places.map((p) => p.region).filter(Boolean)),
      ];
      const slugs = regions.map((r) => getRegionMeta(r!).slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    });
  });

  describe("continent grouping", () => {
    it("getPlacesGroupedByContinent includes all places", () => {
      const groups = getPlacesGroupedByContinent();
      const total = groups.reduce((sum, g) => sum + g.places.length, 0);
      expect(total).toBe(getAllPlaces().length);
    });

    it("CONTINENT_BY_SLUG round-trips with CONTINENT_META", () => {
      for (const continent of CONTINENT_ORDER) {
        const slug = CONTINENT_META[continent].slug;
        expect(CONTINENT_BY_SLUG[slug]).toBe(continent);
      }
    });
  });

  describe("country/region hierarchy", () => {
    it("getCountriesByContinent covers all places in that continent", () => {
      for (const continent of CONTINENT_ORDER) {
        const countries = getCountriesByContinent(continent);
        const totalFromGroups = countries.reduce(
          (sum, c) => sum + c.places.length,
          0,
        );
        const directCount = getAllPlaces().filter(
          (p) => p.continent === continent,
        ).length;
        expect(totalFromGroups).toBe(directCount);
      }
    });

    it("getRegionsByCountry only returns places belonging to that country", () => {
      const places = getAllPlaces();
      const countries = [
        ...new Set(places.map((p) => p.country).filter(Boolean)),
      ];
      for (const country of countries) {
        const regions = getRegionsByCountry(country!);
        for (const rg of regions) {
          for (const p of rg.places) {
            expect(p.country).toBe(country);
            expect(p.region).toBe(rg.region);
          }
        }
      }
    });
  });
});
