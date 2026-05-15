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

export const COUNTRY_META: Record<
  string,
  { slug: string; en: string; flag: string }
> = {
  中国: { slug: "china", en: "China", flag: "🇨🇳" },
  日本: { slug: "japan", en: "Japan", flag: "🇯🇵" },
  韩国: { slug: "korea", en: "Korea", flag: "🇰🇷" },
  捷克: { slug: "czech", en: "Czechia", flag: "🇨🇿" },
  澳大利亚: { slug: "australia", en: "Australia", flag: "🇦🇺" },
};

export const COUNTRY_BY_SLUG: Record<string, string> = Object.entries(
  COUNTRY_META,
).reduce<Record<string, string>>((acc, [country, meta]) => {
  acc[meta.slug] = country;
  return acc;
}, {});

export const REGION_META: Record<string, { slug: string; en: string }> = {
  江西: { slug: "jiangxi", en: "Jiangxi" },
  浙江: { slug: "zhejiang", en: "Zhejiang" },
  四川: { slug: "sichuan", en: "Sichuan" },
};

export const REGION_BY_SLUG: Record<string, string> = Object.entries(
  REGION_META,
).reduce<Record<string, string>>((acc, [region, meta]) => {
  acc[meta.slug] = region;
  return acc;
}, {});

function fallbackSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\s·・]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function countrySlug(country: string): string {
  return COUNTRY_META[country]?.slug ?? (fallbackSlug(country) || "unknown");
}

export function regionSlug(region: string): string {
  return REGION_META[region]?.slug ?? (fallbackSlug(region) || "unknown");
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

function readPlaceFile(file: string): { meta: PlaceMeta; raw: string } {
  const slug = file.replace(/\.md$/, "");
  const filepath = path.join(PLACES_DIR, file);
  const fileContent = fs.readFileSync(filepath, "utf-8");
  const parsed = matter(fileContent);
  const data = parsed.data as Partial<PlaceMeta> & { continent?: unknown };

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
    cover: data.cover,
    tags: Array.isArray(data.tags) ? data.tags : undefined,
    bestSeason: data.bestSeason,
    duration: data.duration,
    budget: data.budget,
    summary: data.summary,
  };

  return { meta, raw: parsed.content };
}

export function getAllPlaces(): PlaceMeta[] {
  ensureDir();
  const files = fs
    .readdirSync(PLACES_DIR)
    .filter((f) => f.endsWith(".md"));

  return files
    .map((file) => readPlaceFile(file).meta)
    .sort((a, b) => a.title.localeCompare(b.title, "zh-Hans-CN"));
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
      const meta = COUNTRY_META[country];
      return {
        country,
        slug: meta?.slug ?? countrySlug(country),
        en: meta?.en ?? country,
        flag: meta?.flag ?? "🌐",
        places: list,
      };
    })
    .sort((a, b) => b.places.length - a.places.length || a.country.localeCompare(b.country, "zh-Hans-CN"));
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
      const meta = REGION_META[region];
      return {
        region,
        slug: meta?.slug ?? regionSlug(region),
        en: meta?.en ?? region,
        places: list,
      };
    })
    .sort((a, b) => b.places.length - a.places.length || a.region.localeCompare(b.region, "zh-Hans-CN"));
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
