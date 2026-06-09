# Phase 2: Image Optimization + SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace raw `<img>` tags with Next.js `<Image>` for automatic optimization, add sitemap/robots/OG/JSON-LD for search engine visibility.

**Architecture:** PlaceCard and detail page use `next/image` with `fill` mode for cover images. Markdown body images get `loading="lazy"` via a custom rehype plugin. SEO files use Next.js Metadata API (`sitemap.ts`, `robots.ts`). Structured data is injected as JSON-LD `<script>` in the place detail page.

**Tech Stack:** Next.js 15 (built-in Image, Metadata API), rehype (custom plugin). No new dependencies.

**Verification:** `npx next build` (strict TypeScript + SSG page generation).

---

## File Structure

| File | Responsibility | Action |
|------|---------------|--------|
| `components/PlaceCard.tsx` | Card component with cover image | Replace `<img>` with `<Image>` |
| `app/places/[slug]/page.tsx` | Place detail page | Replace header `<img>` with `<Image>`, add OG metadata, add JSON-LD |
| `lib/rehype-lazy-images.ts` | Rehype plugin to add lazy loading to `<img>` | Create |
| `lib/places.ts` | Data layer — rehype pipeline | Add `rehype-lazy-images` plugin |
| `app/sitemap.ts` | Dynamic sitemap generation | Create |
| `app/robots.ts` | robots.txt generation | Create |

---

## Task 1: Replace `<img>` with `<Image>` in PlaceCard

**Files:**
- Modify: `components/PlaceCard.tsx`

- [ ] **Step 1: Update imports**

Add `Image` import at the top of the file:
```tsx
import Image from "next/image";
import Link from "next/link";
import type { PlaceMeta } from "@/lib/places";
```

- [ ] **Step 2: Replace the `<img>` element**

In the `PlaceCard` component, replace:
```tsx
{place.cover ? (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={place.cover}
    alt={place.title}
    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
  />
) : (
```

With:
```tsx
{place.cover ? (
  <Image
    src={place.cover}
    alt={place.title}
    fill
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    className="object-cover transition-transform duration-500 group-hover:scale-105"
  />
) : (
```

Note: The parent `<div className="relative aspect-[4/3] ...">` already has `relative` positioning, which is required for `fill` mode.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add components/PlaceCard.tsx
git commit -m "perf(PlaceCard): use next/image for cover optimization"
```

---

## Task 2: Replace `<img>` with `<Image>` in place detail page header

**Files:**
- Modify: `app/places/[slug]/page.tsx`

- [ ] **Step 1: Add Image import**

Add to existing imports:
```tsx
import Image from "next/image";
```

- [ ] **Step 2: Replace the header cover image**

In `PlaceDetailPage`, find the header section (around line 57-65):
```tsx
{place.cover && (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={place.cover}
    alt={place.title}
    className="absolute inset-0 h-full w-full object-cover"
  />
)}
```

Replace with:
```tsx
{place.cover && (
  <Image
    src={place.cover}
    alt={place.title}
    fill
    priority
    sizes="100vw"
    className="object-cover"
  />
)}
```

The `priority` prop ensures this LCP image is preloaded. The parent div already has `relative` + `overflow-hidden`.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add app/places/[slug]/page.tsx
git commit -m "perf(place-detail): use next/image with priority for hero cover"
```

---

## Task 3: Create rehype lazy-images plugin + integrate into pipeline

**Files:**
- Create: `lib/rehype-lazy-images.ts`
- Modify: `lib/places.ts` (import + add to pipeline)

- [ ] **Step 1: Create the rehype plugin**

Create `lib/rehype-lazy-images.ts`:
```ts
import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";

export function rehypeLazyImages() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "img") {
        node.properties = node.properties || {};
        node.properties.loading = "lazy";
        node.properties.decoding = "async";
      }
    });
  };
}
```

- [ ] **Step 2: Install `unist-util-visit` (check if already available)**

`unist-util-visit` is a dependency of `unified` ecosystem packages already in node_modules. Check:
```bash
ls node_modules/unist-util-visit/package.json
```

If it exists, it's available as a transitive dep. However, for proper TypeScript resolution, we need it as a direct dependency along with `@types/hast`:
```bash
npm install unist-util-visit @types/hast
```

Note: `@types/hast` provides the `Root` and `Element` types. If `hast` types are already available from rehype packages, skip the `@types/hast` install — check by running `npx tsc --noEmit` first.

- [ ] **Step 3: Add plugin to rehype pipeline in `lib/places.ts`**

In `lib/places.ts`, add the import at the top (after other imports):
```ts
import { rehypeLazyImages } from "./rehype-lazy-images";
```

In the `getPlaceBySlug()` function, add `.use(rehypeLazyImages)` to the pipeline before `rehypeStringify`:
```ts
const processed = await unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeLazyImages)
  .use(rehypeStringify)
  .process(raw);
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors. If `@types/hast` is needed, install it and retry.

- [ ] **Step 5: Commit**

```bash
git add lib/rehype-lazy-images.ts lib/places.ts package.json package-lock.json
git commit -m "perf(markdown): add rehype plugin for lazy loading body images"
```

---

## Task 4: Create `app/sitemap.ts`

**Files:**
- Create: `app/sitemap.ts`

- [ ] **Step 1: Create the sitemap file**

Create `app/sitemap.ts`:
```ts
import type { MetadataRoute } from "next";
import {
  CONTINENT_META,
  CONTINENT_ORDER,
  getAllPlaces,
  getCountriesByContinent,
  getRegionsByCountry,
} from "@/lib/places";

const BASE_URL = process.env.SITE_URL || "https://travel.example.com";

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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/sitemap.ts
git commit -m "seo: add dynamic sitemap covering all routes"
```

---

## Task 5: Create `app/robots.ts`

**Files:**
- Create: `app/robots.ts`

- [ ] **Step 1: Create the robots file**

Create `app/robots.ts`:
```ts
import type { MetadataRoute } from "next";

const BASE_URL = process.env.SITE_URL || "https://travel.example.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/robots.ts
git commit -m "seo: add robots.txt with sitemap reference"
```

---

## Task 6: Add Open Graph metadata + JSON-LD to place detail page

**Files:**
- Modify: `app/places/[slug]/page.tsx`

- [ ] **Step 1: Enhance `generateMetadata` with Open Graph fields**

Replace the current `generateMetadata` function with:
```tsx
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);
  if (!place) {
    return { title: "未找到目的地" };
  }
  const description = place.summary ?? `${place.title} 旅行攻略`;
  return {
    title: place.title,
    description,
    openGraph: {
      title: `${place.title} · 芋泥今天去哪里`,
      description,
      ...(place.cover ? { images: [{ url: place.cover }] } : {}),
    },
  };
}
```

- [ ] **Step 2: Add JSON-LD structured data component**

Add a helper function before the main page component:
```tsx
function PlaceJsonLd({ place }: { place: Place }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: place.title,
    description: place.summary ?? `${place.title} 旅行攻略`,
    ...(place.cover ? { image: place.cover } : {}),
    author: { "@type": "Person", name: "芋泥" },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

- [ ] **Step 3: Add the `Place` type to imports**

Make sure `Place` is imported (it's the return type of `getPlaceBySlug`):
```tsx
import {
  CONTINENT_META,
  getCountryMeta,
  getRegionMeta,
  getAllPlaceSlugs,
  getPlaceBySlug,
  type Place,
} from "@/lib/places";
```

- [ ] **Step 4: Insert `<PlaceJsonLd>` into the page component**

At the top of the `<article>` returned by `PlaceDetailPage`, add:
```tsx
<article>
  <PlaceJsonLd place={place} />
  <header className="relative">
  ...
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add app/places/[slug]/page.tsx
git commit -m "seo(place-detail): add Open Graph metadata + JSON-LD structured data"
```

---

## Task 7: Full build verification

**Files:** None (verification only)

- [ ] **Step 1: Run full Next.js build**

Run: `npx next build`
Expected: Build succeeds. All 26 static pages generated without errors.

- [ ] **Step 2: Verify sitemap is generated**

After build, check the output includes `/sitemap.xml` route. The build output should show a sitemap-related route or the file should be in `.next/server/app/sitemap.xml`.

- [ ] **Step 3: Verify robots.txt is generated**

Similarly check for `/robots.txt` in the build output.
