import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";

const PLACES_DIR = path.join(process.cwd(), "content", "places");

export type Continent =
  | "亚洲"
  | "欧洲"
  | "北美洲"
  | "南美洲"
  | "非洲"
  | "大洋洲"
  | "南极洲"
  | "其他";

export const CONTINENT_ORDER: Continent[] = [
  "亚洲",
  "欧洲",
  "北美洲",
  "南美洲",
  "大洋洲",
  "非洲",
  "南极洲",
  "其他",
];

export const CONTINENT_META: Record<
  Continent,
  { en: string; emoji: string; slug: string }
> = {
  亚洲: { en: "Asia", emoji: "🏯", slug: "asia" },
  欧洲: { en: "Europe", emoji: "🏰", slug: "europe" },
  北美洲: { en: "North America", emoji: "🗽", slug: "north-america" },
  南美洲: { en: "South America", emoji: "🦙", slug: "south-america" },
  大洋洲: { en: "Oceania", emoji: "🏝️", slug: "oceania" },
  非洲: { en: "Africa", emoji: "🦁", slug: "africa" },
  南极洲: { en: "Antarctica", emoji: "🧊", slug: "antarctica" },
  其他: { en: "Other", emoji: "🌍", slug: "other" },
};

export const CONTINENT_BY_SLUG: Record<string, Continent> = Object.entries(
  CONTINENT_META,
).reduce<Record<string, Continent>>((acc, [continent, meta]) => {
  acc[meta.slug] = continent as Continent;
  return acc;
}, {});

export interface CountryInfo {
  country: string;
  slug: string;
  en: string;
  flag: string;
}

export interface RegionInfo {
  region: string;
  slug: string;
  en: string;
}

let _registry: {
  countries: Map<string, CountryInfo>;
  regions: Map<string, RegionInfo>;
} | null = null;

let _allPlacesCache: PlaceMeta[] | null = null;

function fallbackSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\s·・]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}


export interface PlaceMeta {
  slug: string;
  title: string;
  continent: Continent;
  country?: string;
  region?: string;
  cover?: string;
  tags?: string[];
  bestSeason?: string;
  duration?: string;
  budget?: string;
  summary?: string;
}

export interface Place extends PlaceMeta {
  contentHtml: string;
}

function ensureDir(): void {
  if (!fs.existsSync(PLACES_DIR)) {
    fs.mkdirSync(PLACES_DIR, { recursive: true });
  }
}

function normalizeContinent(value: unknown): Continent {
  if (typeof value !== "string") return "其他";
  if ((CONTINENT_ORDER as string[]).includes(value)) {
    return value as Continent;
  }
  // 兼容英文写法
  const aliases: Record<string, Continent> = {
    asia: "亚洲",
    europe: "欧洲",
    "north america": "北美洲",
    "south america": "南美洲",
    oceania: "大洋洲",
    africa: "非洲",
    antarctica: "南极洲",
  };
  return aliases[value.toLowerCase()] ?? "其他";
}

function normalizeCountry(value: unknown): { country?: string; region?: string } {
  if (typeof value !== "string" || value.trim().length === 0) {
    return {};
  }
  const trimmed = value.trim();
  // 兼容历史写法 "中国 · 江西" / "中国·浙江" / "中国, 四川" — 自动拆分主国 + 省份
  const match = trimmed.match(/^([^·・,，\s]+)\s*[·・,，]\s*(.+)$/);
  if (match) {
    return { country: match[1].trim(), region: match[2].trim() };
  }
  return { country: trimmed };
}

function readPlaceFile(file: string): {
  meta: PlaceMeta;
  raw: string;
  countryFlag?: string;
  countryEn?: string;
  countrySlug?: string;
  regionEn?: string;
  regionSlug?: string;
} {
  const slug = file.replace(/\.md$/, "");
  const filepath = path.join(PLACES_DIR, file);
  const fileContent = fs.readFileSync(filepath, "utf-8");
  const parsed = matter(fileContent);
  const data = parsed.data as Record<string, unknown>;

  const { country: parsedCountry, region: parsedRegion } = normalizeCountry(
    data.country,
  );
  const region =
    typeof data.region === "string" && data.region.trim().length > 0
      ? data.region.trim()
      : parsedRegion;

  const meta: PlaceMeta = {
    slug: typeof data.slug === "string" && data.slug.length > 0 ? data.slug : slug,
    title: typeof data.title === "string" ? data.title : slug,
    continent: normalizeContinent(data.continent),
    country: parsedCountry,
    region,
    cover: typeof data.cover === "string" ? data.cover : undefined,
    tags: Array.isArray(data.tags) ? data.tags : undefined,
    bestSeason: typeof data.bestSeason === "string" ? data.bestSeason : undefined,
    duration: typeof data.duration === "string" ? data.duration : undefined,
    budget: typeof data.budget === "string" ? data.budget : undefined,
    summary: typeof data.summary === "string" ? data.summary : undefined,
  };

  return {
    meta,
    raw: parsed.content,
    countryFlag: typeof data.countryFlag === "string" ? data.countryFlag : undefined,
    countryEn: typeof data.countryEn === "string" ? data.countryEn : undefined,
    countrySlug: typeof data.countrySlug === "string" ? data.countrySlug : undefined,
    regionEn: typeof data.regionEn === "string" ? data.regionEn : undefined,
    regionSlug: typeof data.regionSlug === "string" ? data.regionSlug : undefined,
  };
}

function buildRegistry(): typeof _registry & {} {
  ensureDir();
  const files = fs
    .readdirSync(PLACES_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

  const countries = new Map<string, CountryInfo>();
  const regions = new Map<string, RegionInfo>();
  const allPlaces: PlaceMeta[] = [];

  for (const file of files) {
    const { meta, countryFlag, countryEn, countrySlug, regionEn, regionSlug } =
      readPlaceFile(file);
    allPlaces.push(meta);

    if (meta.country && !countries.has(meta.country)) {
      const slug =
        countrySlug ||
        (countryEn ? fallbackSlug(countryEn) : "") ||
        fallbackSlug(meta.country) ||
        "unknown";
      countries.set(meta.country, {
        country: meta.country,
        slug,
        en: countryEn || meta.country,
        flag: countryFlag || "🌐",
      });
    }

    if (meta.region && !regions.has(meta.region)) {
      const slug =
        regionSlug ||
        (regionEn ? fallbackSlug(regionEn) : "") ||
        fallbackSlug(meta.region) ||
        "unknown";
      regions.set(meta.region, {
        region: meta.region,
        slug,
        en: regionEn || meta.region,
      });
    }
  }

  _allPlacesCache = allPlaces.sort((a, b) =>
    a.title.localeCompare(b.title, "zh-Hans-CN"),
  );

  return { countries, regions };
}

function getRegistry() {
  if (!_registry) {
    _registry = buildRegistry();
  }
  return _registry;
}

export function getCountryMeta(country: string): CountryInfo {
  const reg = getRegistry();
  return reg.countries.get(country) ?? {
    country,
    slug: fallbackSlug(country) || "unknown",
    en: country,
    flag: "🌐",
  };
}

export function getRegionMeta(region: string): RegionInfo {
  const reg = getRegistry();
  return reg.regions.get(region) ?? {
    region,
    slug: fallbackSlug(region) || "unknown",
    en: region,
  };
}

export function findCountryBySlug(slug: string): string | null {
  const reg = getRegistry();
  for (const [country, info] of reg.countries) {
    if (info.slug === slug) return country;
  }
  return null;
}

export function findRegionBySlug(slug: string): string | null {
  const reg = getRegistry();
  for (const [region, info] of reg.regions) {
    if (info.slug === slug) return region;
  }
  return null;
}

export function getAllPlaces(): PlaceMeta[] {
  getRegistry();
  return _allPlacesCache!;
}

export interface ContinentGroup {
  continent: Continent;
  places: PlaceMeta[];
}

export function getPlacesGroupedByContinent(): ContinentGroup[] {
  const all = getAllPlaces();
  const map = new Map<Continent, PlaceMeta[]>();

  for (const place of all) {
    const list = map.get(place.continent) ?? [];
    list.push(place);
    map.set(place.continent, list);
  }

  return CONTINENT_ORDER.filter((c) => map.has(c)).map((continent) => ({
    continent,
    places: map.get(continent) ?? [],
  }));
}

export function getPlacesByContinent(continent: Continent): PlaceMeta[] {
  return getAllPlaces().filter((p) => p.continent === continent);
}

export interface CountryGroup {
  country: string;
  slug: string;
  en: string;
  flag: string;
  places: PlaceMeta[];
}

export function getCountriesByContinent(continent: Continent): CountryGroup[] {
  const places = getPlacesByContinent(continent);
  const map = new Map<string, PlaceMeta[]>();
  for (const p of places) {
    const key = p.country ?? "未分类";
    const list = map.get(key) ?? [];
    list.push(p);
    map.set(key, list);
  }
  return Array.from(map.entries())
    .map(([country, list]) => {
      const meta = getCountryMeta(country);
      return {
        country,
        slug: meta.slug,
        en: meta.en,
        flag: meta.flag,
        places: list,
      };
    })
    .sort(
      (a, b) =>
        b.places.length - a.places.length ||
        a.country.localeCompare(b.country, "zh-Hans-CN"),
    );
}

export function getPlacesByCountry(country: string): PlaceMeta[] {
  return getAllPlaces().filter((p) => p.country === country);
}

export interface RegionGroup {
  region: string;
  slug: string;
  en: string;
  places: PlaceMeta[];
}

export function getRegionsByCountry(country: string): RegionGroup[] {
  const places = getPlacesByCountry(country).filter((p) => p.region);
  const map = new Map<string, PlaceMeta[]>();
  for (const p of places) {
    const key = p.region!;
    const list = map.get(key) ?? [];
    list.push(p);
    map.set(key, list);
  }
  return Array.from(map.entries())
    .map(([region, list]) => {
      const meta = getRegionMeta(region);
      return {
        region,
        slug: meta.slug,
        en: meta.en,
        places: list,
      };
    })
    .sort(
      (a, b) =>
        b.places.length - a.places.length ||
        a.region.localeCompare(b.region, "zh-Hans-CN"),
    );
}

export function getPlacesByRegion(country: string, region: string): PlaceMeta[] {
  return getAllPlaces().filter(
    (p) => p.country === country && p.region === region,
  );
}

export function findCountryByContinentAndSlug(
  continent: Continent,
  countrySlugParam: string,
): string | null {
  const countries = getCountriesByContinent(continent);
  return countries.find((c) => c.slug === countrySlugParam)?.country ?? null;
}

export function findRegionByCountryAndSlug(
  country: string,
  regionSlugParam: string,
): string | null {
  const regions = getRegionsByCountry(country);
  return regions.find((r) => r.slug === regionSlugParam)?.region ?? null;
}

export function getAllPlaceSlugs(): string[] {
  ensureDir();
  return fs
    .readdirSync(PLACES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export async function getPlaceBySlug(slug: string): Promise<Place | null> {
  ensureDir();
  const file = `${slug}.md`;
  const filepath = path.join(PLACES_DIR, file);
  if (!fs.existsSync(filepath)) {
    return null;
  }

  const { meta, raw } = readPlaceFile(file);

  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(raw);

  return {
    ...meta,
    contentHtml: String(processed),
  };
}
