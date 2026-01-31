import Link from "next/link";
import Image from "next/image";
import { HeroImageDevCheck } from "./hero-image-dev-check";

const BANNERS = [
  {
    href: "/kadin/gunes-gozlugu",
    ariaLabel: "Kadın güneş gözlüğü keşfet",
    title: "Kadın",
    caption: "Yeni sezon kadın güneş gözlükleri",
    image: "/hero/kadin-hero.webp",
    textAlign: "left" as const,
  },
  {
    href: "/erkek/gunes-gozlugu",
    ariaLabel: "Erkek güneş gözlüğü keşfet",
    title: "Erkek",
    caption: "Yeni sezon erkek güneş gözlükleri",
    image: "/hero/erkek-hero.webp",
    textAlign: "right" as const,
  },
] as const;

const BANNER_TEST_IDS: Record<string, string> = {
  "/kadin/gunes-gozlugu": "home-banner-kadin",
  "/erkek/gunes-gozlugu": "home-banner-erkek",
};

export function HomeHeroBanners() {
  return (
    <section className="space-y-3 sm:space-y-4" data-testid="home-hero">
      <HeroImageDevCheck />
      {BANNERS.map((b) => (
        <Link
          key={b.href}
          href={b.href}
          aria-label={b.ariaLabel}
          data-testid={BANNER_TEST_IDS[b.href]}
          className="block rounded-3xl border border-border bg-card shadow-sm transition-transform active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl">
            <Image
              src={b.image}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 640px"
              priority
            />
            <div
              className={`absolute inset-0 pointer-events-none ${
                b.textAlign === "left"
                  ? "bg-gradient-to-r from-black/75 via-black/25 to-transparent"
                  : "bg-gradient-to-l from-black/75 via-black/25 to-transparent"
              }`}
              aria-hidden
            />
            <div
              className={`absolute inset-0 flex items-center ${
                b.textAlign === "left" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`flex flex-col px-5 py-5 ${
                  b.textAlign === "left"
                    ? "w-[240px] sm:w-[320px] items-start text-left"
                    : "ml-auto flex flex-col w-[240px] sm:w-[320px] max-w-[70%] items-end text-right pr-5"
                }`}
              >
                <h2 className="text-xl font-semibold text-white drop-shadow-sm sm:text-2xl">
                  {b.title}
                </h2>
                <p
                  className={`mt-0.5 text-sm leading-snug text-white/85 sm:text-base drop-shadow-sm ${
                    b.textAlign === "right" ? "text-right" : ""
                  }`}
                >
                  {b.caption}
                </p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}
