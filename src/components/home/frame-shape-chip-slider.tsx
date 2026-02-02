"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SectionHeader } from "@/components/home/section-header";

/**
 * Kesimlere göre chip satırı — mobilde yatay scroll, desktop'ta wrap.
 * DB'de köşeli ağırlık olduğu için Köşeli ilk sırada.
 * Tıklanınca /search?shape=<value> ile arama sayfasına gider (API canonicalize eder).
 */
const SHAPES = [
  { label: "Köşeli", value: "koseli" },
  { label: "Damla", value: "damla" },
  { label: "Pilot", value: "pilot" },
  { label: "Oval", value: "oval" },
  { label: "Yuvarlak", value: "yuvarlak" },
  { label: "Cat Eye", value: "cat-eye" },
  { label: "Geometrik", value: "geometrik" },
  { label: "Dikdörtgen", value: "dikdortgen" },
] as const;

/** URL shape değerini canonical ile eşleştir (aviator: damla, pilot). */
function matchesShape(urlShape: string | null, chipValue: string): boolean {
  if (!urlShape) return false;
  const u = urlShape.toLowerCase();
  if (chipValue === "damla" || chipValue === "pilot") return u === "damla" || u === "pilot" || u === "aviator";
  return u === chipValue;
}

export function FrameShapeChipSlider() {
  const searchParams = useSearchParams();
  const shapeParam = searchParams.get("shape")?.toLowerCase().trim() ?? null;

  return (
    <section aria-label="Kesimlere göre filtrele" className="w-full">
      <SectionHeader
        title="Kesimlere Göre"
        href="/search"
        hrefLabel="Tümünü Gör"
        ariaLabel="Tüm kesimlere göz at"
      />
      <div className="relative -mx-4 px-4 sm:-mx-0 sm:px-0">
        {/* Mobil: fade mask'lar sadece scroll modunda */}
        <div
          className="pointer-events-none absolute left-0 top-0 z-10 hidden h-full w-6 shrink-0 bg-gradient-to-r from-background to-transparent md:hidden"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-0 top-0 z-10 hidden h-full w-6 shrink-0 bg-gradient-to-l from-background to-transparent md:hidden"
          aria-hidden
        />
        <div
          className="flex touch-manipulation select-none items-center gap-2 overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:overflow-visible md:pb-0"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {SHAPES.map(({ label, value }) => {
            const isActive = matchesShape(shapeParam, value);
            return (
              <Link
                key={`${value}-${label}`}
                href={`/search?shape=${encodeURIComponent(value)}`}
                className={`inline-flex min-h-11 shrink-0 snap-start items-center justify-center whitespace-nowrap rounded-2xl border px-4 text-sm font-medium shadow-sm transition-[transform,box-shadow,background-color,color,border-color] duration-150 ease-out active:scale-[0.98] active:translate-y-[1px] active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none md:snap-align-none ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow"
                    : "bg-card text-foreground border-border hover:bg-accent"
                }`}
                aria-current={isActive ? "true" : undefined}
                aria-label={`${label} kesimi için ürünlere git`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
