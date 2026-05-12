import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PlaceCard } from "@/components/PlaceCard";
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

interface PageProps {
  params: Promise<{ slug: string; country: string; region: string }>;
}

export function generateStaticParams() {
  const params: { slug: string; country: string; region: string }[] = [];
  for (const continent of CONTINENT_ORDER) {
    if (continent === "其他" || continent === "南极洲") continue;
    const meta = CONTINENT_META[continent];
    const countries = getCountriesByContinent(continent);
    for (const c of countries) {
      const regions = getRegionsByCountry(c.country);
      for (const r of regions) {
        params.push({ slug: meta.slug, country: c.slug, region: r.slug });
      }
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, country: countrySlugParam, region: regionSlugParam } =
    await params;
  const continent = CONTINENT_BY_SLUG[slug];
  if (!continent) return { title: "未知地区" };
  const country = findCountryByContinentAndSlug(continent, countrySlugParam);
  if (!country) return { title: "未知地区" };
  const region = findRegionByCountryAndSlug(country, regionSlugParam);
  if (!region) return { title: "未知地区" };
  return {
    title: `${region} · ${country}`,
    description: `${country} ${region} 下芋泥到访过的目的地。`,
  };
}

export default async function RegionPage({ params }: PageProps) {
  const { slug, country: countrySlugParam, region: regionSlugParam } =
    await params;
  const continent = CONTINENT_BY_SLUG[slug];
  if (!continent) notFound();
  const country = findCountryByContinentAndSlug(continent, countrySlugParam);
  if (!country) notFound();
  const region = findRegionByCountryAndSlug(country, regionSlugParam);
  if (!region) notFound();

  const continentMeta = CONTINENT_META[continent];
  const countries = getCountriesByContinent(continent);
  const currentCountry = countries.find((c) => c.country === country)!;
  const regions = getRegionsByCountry(country);
  const currentRegion = regions.find((r) => r.region === region)!;
  const places = getPlacesByRegion(country, region);

  return (
    <div>
      <section className="gradient-hero">
        <div className="mx-auto max-w-6xl px-6 pt-12 pb-10 sm:pt-16 sm:pb-12">
          <nav
            aria-label="面包屑导航"
            className="flex flex-wrap items-center gap-1.5 text-sm text-muted"
          >
            <Link
              href="/"
              className="hover:text-[rgb(var(--foreground))] transition-colors"
            >
              首页
            </Link>
            <span aria-hidden>›</span>
            <Link
              href={`/continents/${continentMeta.slug}`}
              className="hover:text-[rgb(var(--foreground))] transition-colors"
            >
              {continent}
            </Link>
            <span aria-hidden>›</span>
            <Link
              href={`/continents/${continentMeta.slug}/${currentCountry.slug}`}
              className="hover:text-[rgb(var(--foreground))] transition-colors"
            >
              {country}
            </Link>
            <span aria-hidden>›</span>
            <span className="text-[rgb(var(--foreground))] font-medium">
              {region}
            </span>
          </nav>

          <div className="mt-4 flex items-center gap-4">
            <div className="text-5xl sm:text-6xl">📍</div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">
                {currentRegion.en} · {currentCountry.en}
              </p>
              <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight">
                {region}
              </h1>
              <p className="mt-1 text-sm text-muted">
                {country} · {places.length} 个目的地
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        {places.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-card p-12 text-center text-muted">
            <p className="text-base">{region} 还没有攻略，敬请期待。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <PlaceCard key={place.slug} place={place} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
