import type { MetadataRoute } from "next";
import {
  CONTINENT_META,
  CONTINENT_ORDER,
  getAllPlaces,
  getCountriesByContinent,
  getRegionsByCountry,
} from "@/lib/places";
import { getBaseUrl } from "@/lib/site";

const BASE_URL = getBaseUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  entries.push({ url: BASE_URL, changeFrequency: "weekly", priority: 1 });

  const activeContinents = CONTINENT_ORDER.filter(
    (c) => c !== "其他" && c !== "南极洲",
  );

  for (const continent of activeContinents) {
    const meta = CONTINENT_META[continent];
    entries.push({
      url: `${BASE_URL}/continents/${meta.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    });

    const countries = getCountriesByContinent(continent);
    for (const country of countries) {
      entries.push({
        url: `${BASE_URL}/continents/${meta.slug}/${country.slug}`,
        changeFrequency: "weekly",
        priority: 0.7,
      });

      const regions = getRegionsByCountry(country.country);
      for (const region of regions) {
        entries.push({
          url: `${BASE_URL}/continents/${meta.slug}/${country.slug}/${region.slug}`,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
  }

  const places = getAllPlaces();
  for (const place of places) {
    entries.push({
      url: `${BASE_URL}/places/${place.slug}`,
      changeFrequency: "monthly",
      priority: 0.9,
    });
  }

  return entries;
}
