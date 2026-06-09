# Phase 1: Frontmatter-Driven Metadata Architecture

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove hardcoded `COUNTRY_META` / `REGION_META` from `lib/places.ts`; derive all country/region metadata from markdown frontmatter so adding a new country never requires a code change.

**Architecture:** Each content `.md` file can declare optional `countryFlag`, `countryEn`, `countrySlug`, `regionEn`, `regionSlug` fields. On first access, `lib/places.ts` scans all files, collects unique countries/regions into a module-level cached registry, and exposes them via functions instead of constant maps.

**Tech Stack:** Next.js 15 App Router, TypeScript (strict), gray-matter, unified/remark/rehype. No new dependencies.

**Verification:** This project has no test framework. All verification uses `npx next build` which runs strict TypeScript checking + static page generation (every route is pre-rendered, so any runtime error during SSG will fail the build).

---

## File Structure

| File | Responsibility | Action |
|------|---------------|--------|
| `lib/places.ts` | Data layer: read content, build registries, expose queries | Major rewrite |
| `app/page.tsx` | Homepage | Update imports (remove `COUNTRY_META`) |
| `app/places/[slug]/page.tsx` | Place detail page | Update imports (remove `COUNTRY_META`, `REGION_META`) |
| `app/continents/[slug]/page.tsx` | Continent listing | Update imports |
| `app/continents/[slug]/[country]/page.tsx` | Country listing | Update imports |
| `app/continents/[slug]/[country]/[region]/page.tsx` | Region listing | Update imports |
| `content/places/chengdu.md` | Canonical source for 中国 metadata | Add countryFlag/countryEn/countrySlug/regionEn/regionSlug |
| `content/places/tokyo.md` | Canonical source for 日本 metadata | Add countryFlag/countryEn/countrySlug |
| `content/places/seoul.md` | Canonical source for 韩国 metadata | Add countryFlag/countryEn/countrySlug |
| `content/places/prague.md` | Canonical source for 捷克 metadata | Add countryFlag/countryEn/countrySlug |
| `content/places/melbourne.md` | Canonical source for 澳大利亚 metadata | Add countryFlag/countryEn/countrySlug |
| `content/places/jingdezhen.md` | Canonical source for 江西 metadata | Add regionEn/regionSlug |
| `content/places/moganshan.md` | Canonical source for 浙江 metadata | Add regionEn/regionSlug |

---

## Task 1: Migrate frontmatter — add metadata fields to content files

**Files:**
- Modify: `content/places/chengdu.md:1-12`
- Modify: `content/places/tokyo.md:1-10`
- Modify: `content/places/seoul.md:1-11`
- Modify: `content/places/prague.md:1-10`
- Modify: `content/places/melbourne.md:1-11`
- Modify: `content/places/jingdezhen.md:1-12`
- Modify: `content/places/moganshan.md:1-12`
- Modify: `content/places/shaoxing.md:1-12`

Each country needs flag/en/slug declared in at least one file. The "canonical" file per country is alphabetically first by filename. Regions need en/slug declared in at least one file per region.

- [ ] **Step 1: Add country metadata to `content/places/chengdu.md`**

This is the canonical file for 中国 (alphabetically first among Chinese cities) AND for 四川.

Replace the frontmatter (lines 1-12) with:
```yaml
---
title: 成都
slug: chengdu
continent: 亚洲
country: 中国
countryFlag: 🇨🇳
countryEn: China
countrySlug: china
region: 四川
regionEn: Sichuan
regionSlug: sichuan
cover: /covers/chengdu/cover.jpg
tags: [美食, 慢生活, 熊猫, 茶馆]
bestSeason: 春 (3-5 月) / 秋 (9-11 月)
duration: 3-5 天
summary: 一座来了就不想走的城市。火锅、串串、盖碗茶，外加全世界最圆滚滚的大熊猫。
---
```

- [ ] **Step 2: Add country metadata to `content/places/tokyo.md`**

Canonical file for 日本.

Replace the frontmatter (lines 1-10) with:
```yaml
---
title: 东京
slug: tokyo
continent: 亚洲
country: 日本
countryFlag: 🇯🇵
countryEn: Japan
countrySlug: japan
cover: /covers/tokyo/cover.jpg
tags: [都市, 美食, 购物, 文化]
bestSeason: 春樱 (3 月底-4 月初) / 秋叶 (11 月)
duration: 5-7 天
summary: 现代都市与传统文化交织的大都会。从涩谷的霓虹到浅草的钟声，每一个街区都是一种生活方式。
---
```

- [ ] **Step 3: Add country metadata to `content/places/seoul.md`**

Canonical file for 韩国.

Replace the frontmatter (lines 1-11) with:
```yaml
---
title: 首尔
slug: seoul
continent: 亚洲
country: 韩国
countryFlag: 🇰🇷
countryEn: Korea
countrySlug: korea
cover: /covers/seoul/cover.jpg
tags: [秋枫, 银杏, 都市, 美食, 古宫, 韩屋]
bestSeason: 10 月 25 日-11 月 10 日秋枫银杏黄金期 / 3 月底-4 月初樱花（避开 10/3 开天节、10/9 韩文节连休）
duration: 4 天 3 夜
budget: 4500-5500 元 / 人（上海出发，含往返机票、3 晚明洞中端、所有餐食）
summary: 2.5 小时飞抵的"亚洲秋色都市"。德寿宫银杏 + 昌庆宫枫红 + 北村韩屋 + 广藏市场，把"古宫秋色 + 街头美食 + 韩屋慢生活" 4 天打包带走。
---
```

- [ ] **Step 4: Add country metadata to `content/places/prague.md`**

Canonical file for 捷克.

Replace the frontmatter (lines 1-10) with:
```yaml
---
title: 布拉格
slug: prague
continent: 欧洲
country: 捷克
countryFlag: 🇨🇿
countryEn: Czechia
countrySlug: czech
cover: /covers/prague/cover.jpg
tags: [古城, 摄影, 黑啤, 千塔之都, 世界遗产, 中欧]
bestSeason: 5 月底-6 月底初夏 / 9 月底-10 月中金秋 / 12 月初圣诞市集（避开 7-8 月旺季 + 12 月最后两周人挤）
duration: 4 天 3 夜
budget: 9000-11000 元 / 人（北京/上海出发，含转机往返机票、3 晚老城四星、所有餐食 + 5 杯黑啤）
summary: 中欧"千塔之都"。10 世纪起在伏尔塔瓦河两岸堆出 800 年从罗马式到新艺术的红顶城市天际线，是欧洲唯一未被二战炸毁的中世纪首都，4 天能把老城 + 城堡 + 查理大桥 + 黑啤 + 烤猪肘一次性收完。
---
```

- [ ] **Step 5: Add country metadata to `content/places/melbourne.md`**

Canonical file for 澳大利亚.

Replace the frontmatter (lines 1-11) with:
```yaml
---
title: 墨尔本
slug: melbourne
continent: 大洋洲
country: 澳大利亚
countryFlag: 🇦🇺
countryEn: Australia
countrySlug: australia
cover: /covers/melbourne/cover.jpg
tags: [咖啡, 涂鸦巷, 文艺, 美术馆, 维多利亚拱廊, 城市游]
bestSeason: 9 月底-11 月底春季 / 3 月初-5 月初秋季（澳网 1 月 + 圣诞 12/26 节礼日避开）
duration: 4 天 3 夜
budget: 8000-11000 元 / 人（上海出发，含直飞往返机票、3 晚 CBD 中端、所有餐食 + 10 杯精品咖啡）
summary: 南半球"咖啡之都"。CBD 一平方公里里塞着 800 家精品咖啡馆、Hosier Lane 涂鸦巷、维多利亚州立图书馆 La Trobe 圆顶、Flinders Street 站，是大洋洲最有"欧洲老城气质"的城市，4 天能把咖啡 + 涂鸦 + 文艺一次性收完。
---
```

- [ ] **Step 6: Add region metadata to `content/places/jingdezhen.md`**

Canonical file for 江西.

Replace the frontmatter (lines 1-12) with:
```yaml
---
title: 景德镇
slug: jingdezhen
continent: 亚洲
country: 中国
region: 江西
regionEn: Jiangxi
regionSlug: jiangxi
cover: /covers/jingdezhen/cover.jpg
tags: [陶瓷, 文化, 周末游, 拉坯DIY, 老厂房, 公共交通]
bestSeason: 4 月中-5 月底春末 / 9 月中-11 月初秋高气爽（10 月中旬国际陶瓷博览会避开）
duration: 2 天 1 夜
budget: 1700-2200 元 / 人（杭州出发，含高铁、1 晚陶溪川附近民宿、1 次拉坯 DIY）
summary: 杭州 2.5 小时高铁直达的"瓷都"。御窑厂遗址 + 中国陶瓷博物馆 + 陶溪川老厂房 + 拉坯 DIY，一个周末把 1700 年陶瓷史从地上看到手上。
---
```

- [ ] **Step 7: Add region metadata to `content/places/moganshan.md`**

Canonical file for 浙江 (alphabetically before shaoxing).

Replace the frontmatter (lines 1-12) with:
```yaml
---
title: 莫干山
slug: moganshan
continent: 亚洲
country: 中国
region: 浙江
regionEn: Zhejiang
regionSlug: zhejiang
cover: /covers/moganshan/cover.jpg
tags: [山林, 民宿, 周末游, 避暑, 骑行, 星空]
bestSeason: 4 月底-6 月初春末初夏 / 9 月中-10 月底秋高气爽
duration: 2 天 1 夜 / 3 天 2 夜
budget: 1500-2800 元 / 人（杭州出发，含高铁、1 晚精品民宿）
summary: 杭州周末出逃首选。1.5 小时高铁直达，民国老别墅与新派民宿叠层在 700 米的竹林山脊上，是江浙沪最成熟的避暑山林。
---
```

- [ ] **Step 8: Verify `content/places/shaoxing.md` needs no changes**

shaoxing.md already has `country: 中国` and `region: 浙江`. Since moganshan.md is the canonical source for 浙江 metadata and chengdu.md is canonical for 中国, shaoxing.md does NOT need countryFlag/countryEn/regionEn fields. No changes needed.

- [ ] **Step 9: Commit frontmatter migration**

```bash
git add content/places/chengdu.md content/places/tokyo.md content/places/seoul.md content/places/prague.md content/places/melbourne.md content/places/jingdezhen.md content/places/moganshan.md
git commit -m "content: add countryFlag/countryEn/regionEn fields to frontmatter"
```

---

## Task 2: Rewrite `lib/places.ts` — registry-based metadata

**Files:**
- Modify: `lib/places.ts` (full rewrite of lines 55-101, modification of surrounding code)

The goal: replace the hardcoded `COUNTRY_META`, `COUNTRY_BY_SLUG`, `REGION_META`, `REGION_BY_SLUG` constants and their associated exported functions `countrySlug()` / `regionSlug()` with a lazily-built registry derived from frontmatter.

- [ ] **Step 1: Define new types and interfaces**

At the top of `lib/places.ts` (after the existing `CONTINENT_*` constants around line 53), replace lines 55-101 (the old `COUNTRY_META` through `REGION_BY_SLUG` section) with:

```ts
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

interface RawPlaceData {
  meta: PlaceMeta;
  countryFlag?: string;
  countryEn?: string;
  countrySlug?: string;
  regionEn?: string;
  regionSlug?: string;
}

let _registry: {
  countries: Map<string, CountryInfo>;
  regions: Map<string, RegionInfo>;
} | null = null;

let _allPlacesCache: PlaceMeta[] | null = null;
```

- [ ] **Step 2: Update `readPlaceFile` to extract new frontmatter fields**

Change the return type from `{ meta: PlaceMeta; raw: string }` to `{ meta: PlaceMeta; raw: string; countryFlag?: string; countryEn?: string; countrySlug?: string; regionEn?: string; regionSlug?: string }`.

Replace the `readPlaceFile` function (currently lines 158-188) with:

```ts
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
```

- [ ] **Step 3: Implement `buildRegistry()` and `getRegistry()`**

Add these functions after `readPlaceFile`:

```ts
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
```

- [ ] **Step 4: Implement public API functions for country/region metadata**

Replace the old exported `countrySlug()`, `regionSlug()` functions and add the new getter functions:

```ts
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
```

- [ ] **Step 5: Update `getAllPlaces()` to use the cache from registry**

Replace the current `getAllPlaces()` function with:

```ts
export function getAllPlaces(): PlaceMeta[] {
  getRegistry();
  return _allPlacesCache!;
}
```

- [ ] **Step 6: Update `getCountriesByContinent()` to use `getCountryMeta()`**

Replace the current `getCountriesByContinent()` function (currently lines 234-255) with:

```ts
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
```

- [ ] **Step 7: Update `getRegionsByCountry()` to use `getRegionMeta()`**

Replace the current `getRegionsByCountry()` function (currently lines 268-288) with:

```ts
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
```

- [ ] **Step 8: Update `findCountryByContinentAndSlug()` and `findRegionByCountryAndSlug()`**

These functions currently use the old `getCountriesByContinent` / `getRegionsByCountry` which return objects with `.slug`. They should still work as-is because we kept the same return shape for `CountryGroup` and `RegionGroup`. Verify they compile without changes.

Current implementations (keep unchanged):
```ts
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
```

- [ ] **Step 9: Remove all dead code**

Delete the following from `lib/places.ts`:
- The old `COUNTRY_META` constant (was lines 55-64)
- The old `COUNTRY_BY_SLUG` constant (was lines 66-71)
- The old `REGION_META` constant (was lines 73-77)
- The old `REGION_BY_SLUG` constant (was lines 79-84)
- The old `countrySlug()` function (was lines 95-97)
- The old `regionSlug()` function (was lines 99-101)

- [ ] **Step 10: Verify `lib/places.ts` compiles**

Run: `npx tsc --noEmit`
Expected: No errors (exit code 0).

- [ ] **Step 11: Commit lib/places.ts rewrite**

```bash
git add lib/places.ts
git commit -m "refactor(places): replace hardcoded COUNTRY/REGION_META with frontmatter registry"
```

---

## Task 3: Update `app/places/[slug]/page.tsx` imports

**Files:**
- Modify: `app/places/[slug]/page.tsx:5-11`

This file currently imports `CONTINENT_META`, `COUNTRY_META`, `REGION_META` from `@/lib/places`. After the refactor, `COUNTRY_META` and `REGION_META` no longer exist as exports. Replace with the new functions.

- [ ] **Step 1: Update imports**

Replace:
```ts
import {
  CONTINENT_META,
  COUNTRY_META,
  REGION_META,
  getAllPlaceSlugs,
  getPlaceBySlug,
} from "@/lib/places";
```

With:
```ts
import {
  CONTINENT_META,
  getCountryMeta,
  getRegionMeta,
  getAllPlaceSlugs,
  getPlaceBySlug,
} from "@/lib/places";
```

- [ ] **Step 2: Update breadcrumb logic in `PlaceDetailPage`**

In the component body (around line 70-76), replace:
```ts
const countryMeta = place.country
  ? COUNTRY_META[place.country]
  : undefined;
const regionMeta = place.region
  ? REGION_META[place.region]
  : undefined;
```

With:
```ts
const countryMeta = place.country
  ? getCountryMeta(place.country)
  : undefined;
const regionMeta = place.region
  ? getRegionMeta(place.region)
  : undefined;
```

- [ ] **Step 3: Verify build compiles this page**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add app/places/[slug]/page.tsx
git commit -m "refactor(places/[slug]): use getCountryMeta/getRegionMeta"
```

---

## Task 4: Update `app/continents/[slug]/page.tsx` imports

**Files:**
- Modify: `app/continents/[slug]/page.tsx:1-12`

This file imports `CONTINENT_BY_SLUG`, `CONTINENT_META`, `CONTINENT_ORDER`, `getCountriesByContinent`, `getPlacesByContinent`. Check if it uses `COUNTRY_META` or `REGION_META` anywhere.

Current imports (line 5-12):
```ts
import {
  CONTINENT_BY_SLUG,
  CONTINENT_META,
  CONTINENT_ORDER,
  getCountriesByContinent,
  getPlacesByContinent,
} from "@/lib/places";
```

- [ ] **Step 1: Verify no changes needed**

This file does NOT import `COUNTRY_META` or `REGION_META`. It uses `getCountriesByContinent()` which returns `CountryGroup[]` (same interface shape as before). The `CONTINENT_BY_SLUG` is still exported from the refactored `lib/places.ts`.

**No code changes needed for this file.** Verify with `npx tsc --noEmit`.

---

## Task 5: Update `app/continents/[slug]/[country]/page.tsx` imports

**Files:**
- Modify: `app/continents/[slug]/[country]/page.tsx:5-13`

Current imports:
```ts
import {
  CONTINENT_BY_SLUG,
  CONTINENT_META,
  CONTINENT_ORDER,
  findCountryByContinentAndSlug,
  getCountriesByContinent,
  getPlacesByCountry,
  getRegionsByCountry,
} from "@/lib/places";
```

- [ ] **Step 1: Verify no changes needed**

This file does NOT import `COUNTRY_META` or `REGION_META` directly. It uses `getCountriesByContinent()` and `getRegionsByCountry()` which still return the same `CountryGroup[]` / `RegionGroup[]` shapes. All these functions are still exported from the refactored code.

**No code changes needed.** Verify with `npx tsc --noEmit`.

---

## Task 6: Update `app/continents/[slug]/[country]/[region]/page.tsx` imports

**Files:**
- Modify: `app/continents/[slug]/[country]/[region]/page.tsx:5-14`

Current imports:
```ts
import {
  CONTINENT_BY_SLUG,
  CONTINENT_META,
  CONTINENT_ORDER,
  findCountryByContinentAndSlug,
  findRegionByCountryAndSlug,
  getCountriesByContinent,
  getPlacesByRegion,
  getRegionsByCountry,
} from "@/lib/places";
```

- [ ] **Step 1: Verify no changes needed**

Same as above — no direct use of `COUNTRY_META` or `REGION_META`. All used functions retain their signatures.

**No code changes needed.** Verify with `npx tsc --noEmit`.

---

## Task 7: Update `app/page.tsx` imports

**Files:**
- Modify: `app/page.tsx:3-8`

Current imports:
```ts
import {
  CONTINENT_META,
  CONTINENT_ORDER,
  getAllPlaces,
  getPlacesGroupedByContinent,
} from "@/lib/places";
```

- [ ] **Step 1: Verify no changes needed**

This file does NOT import `COUNTRY_META` or `REGION_META`. It only uses `CONTINENT_META`, `CONTINENT_ORDER`, `getAllPlaces`, `getPlacesGroupedByContinent` — all still exported unchanged.

**No code changes needed.** Verify with `npx tsc --noEmit`.

---

## Task 8: Full build verification

**Files:** None (verification only)

- [ ] **Step 1: Run full Next.js build**

Run: `npx next build`

Expected: Build succeeds. All static pages are generated without errors. Output shows all routes pre-rendered:
- `/` (homepage)
- `/places/tokyo`, `/places/seoul`, `/places/chengdu`, etc.
- `/continents/asia`, `/continents/europe`, `/continents/oceania`
- `/continents/asia/japan`, `/continents/asia/korea`, `/continents/asia/china`
- `/continents/asia/china/sichuan`, `/continents/asia/china/jiangxi`, `/continents/asia/china/zhejiang`
- `/continents/europe/czech`
- `/continents/oceania/australia`

If build fails, fix the error before proceeding.

- [ ] **Step 2: Spot-check that slugs resolve correctly**

Run: `npx next build` output should show all routes without 404 errors during SSG. Specifically verify:
- Countries with explicit `countrySlug` (japan, korea, czech, china, australia) produce the same URL slugs as before
- Regions (sichuan, jiangxi, zhejiang) produce the same URL slugs as before

- [ ] **Step 3: Commit build verification pass (no file changes)**

No commit needed — this is verification only. If everything passes, proceed to the final commit.

---

## Task 9: Final integration commit + cleanup

**Files:** None new — this ensures everything is committed.

- [ ] **Step 1: Run `git status` to verify clean working tree**

Run: `git status`
Expected: `nothing to commit, working tree clean` (or only untracked files unrelated to this work).

- [ ] **Step 2: Verify the old COUNTRY_META / REGION_META exports are truly gone**

Run: `grep -rn "COUNTRY_META\|REGION_META\|COUNTRY_BY_SLUG\|REGION_BY_SLUG" lib/ app/ components/`
Expected: No matches (these symbols should no longer exist in the codebase).

- [ ] **Step 3: Run dev server and manually verify homepage loads**

Run: `npx next dev`
Open `http://localhost:3000` in a browser. Verify:
- Homepage renders all 8 destinations
- Country flags display correctly (🇨🇳 🇯🇵 🇰🇷 🇨🇿 🇦🇺)
- Clicking a continent card navigates to the continent page
- Clicking a country card navigates to the country page
- Place detail page breadcrumbs show correct country/region labels

Stop dev server after verification.
