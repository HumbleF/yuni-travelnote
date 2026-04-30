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

export interface PlaceMeta {
  slug: string;
  title: string;
  continent: Continent;
  country?: string;
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

function readPlaceFile(file: string): { meta: PlaceMeta; raw: string } {
  const slug = file.replace(/\.md$/, "");
  const filepath = path.join(PLACES_DIR, file);
  const fileContent = fs.readFileSync(filepath, "utf-8");
  const parsed = matter(fileContent);
  const data = parsed.data as Partial<PlaceMeta> & { continent?: unknown };

  const meta: PlaceMeta = {
    slug: typeof data.slug === "string" && data.slug.length > 0 ? data.slug : slug,
    title: typeof data.title === "string" ? data.title : slug,
    continent: normalizeContinent(data.continent),
    country: data.country,
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
