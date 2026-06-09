import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MarkdownContent } from "@/components/MarkdownContent";
import {
  CONTINENT_META,
  getCountryMeta,
  getRegionMeta,
  getAllPlaceSlugs,
  getPlaceBySlug,
  type Place,
} from "@/lib/places";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPlaceSlugs().map((slug) => ({ slug }));
}

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

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wider text-muted">
        {label}
      </span>
      <span className="mt-0.5 text-sm font-medium">{value}</span>
    </div>
  );
}

export default async function PlaceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);

  if (!place) {
    notFound();
  }

  return (
    <article>
      <PlaceJsonLd place={place} />
      <header className="relative">
        <div className="relative h-[42vh] min-h-[280px] w-full overflow-hidden bg-gradient-to-br from-brand-400 to-brand-700">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-3xl px-6 pb-8 text-white">
              {(() => {
                const continentMeta = CONTINENT_META[place.continent];
                const countryMeta = place.country
                  ? getCountryMeta(place.country)
                  : undefined;
                const regionMeta = place.region
                  ? getRegionMeta(place.region)
                  : undefined;
                const crumbs: { label: string; href?: string }[] = [
                  { label: place.continent, href: `/continents/${continentMeta.slug}` },
                ];
                if (place.country) {
                  crumbs.push({
                    label: place.country,
                    href: countryMeta
                      ? `/continents/${continentMeta.slug}/${countryMeta.slug}`
                      : undefined,
                  });
                }
                if (place.country && place.region) {
                  crumbs.push({
                    label: place.region,
                    href: countryMeta && regionMeta
                      ? `/continents/${continentMeta.slug}/${countryMeta.slug}/${regionMeta.slug}`
                      : undefined,
                  });
                }
                return (
                  <nav
                    aria-label="面包屑导航"
                    className="flex flex-wrap items-center gap-1.5 text-xs font-medium"
                  >
                    {crumbs.map((c, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        {c.href ? (
                          <Link
                            href={c.href}
                            className="rounded-full bg-white/20 px-2.5 py-1 backdrop-blur transition-colors hover:bg-white/30"
                          >
                            {c.label}
                          </Link>
                        ) : (
                          <span className="rounded-full bg-white/20 px-2.5 py-1 backdrop-blur">
                            {c.label}
                          </span>
                        )}
                        {i < crumbs.length - 1 && (
                          <span className="text-white/60" aria-hidden>
                            ›
                          </span>
                        )}
                      </span>
                    ))}
                  </nav>
                );
              })()}
              <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">
                {place.title}
              </h1>
              {place.summary && (
                <p className="mt-3 max-w-2xl text-base sm:text-lg text-white/85 leading-relaxed">
                  {place.summary}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-[rgb(var(--foreground))] transition-colors"
        >
          <span aria-hidden>←</span> 返回目的地
        </Link>

        {(place.bestSeason ||
          place.duration ||
          place.budget ||
          place.country ||
          (place.tags && place.tags.length > 0)) && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl border border-card bg-card p-5">
            {place.bestSeason && (
              <MetaItem label="最佳季节" value={place.bestSeason} />
            )}
            {place.duration && (
              <MetaItem label="建议天数" value={place.duration} />
            )}
            {place.budget && (
              <MetaItem label="人均预算" value={place.budget} />
            )}
            {place.country && (
              <MetaItem label="所在地" value={place.country} />
            )}
            {place.tags && place.tags.length > 0 && (
              <div className="flex flex-col col-span-2 sm:col-span-4">
                <span className="text-xs uppercase tracking-wider text-muted">
                  标签
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {place.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-card px-2 py-0.5 text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-10">
          <MarkdownContent html={place.contentHtml} />
        </div>

        <div className="mt-16 border-t border-card pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-[rgb(var(--foreground))] transition-colors"
          >
            <span aria-hidden>←</span> 返回所有目的地
          </Link>
        </div>
      </div>
    </article>
  );
}
