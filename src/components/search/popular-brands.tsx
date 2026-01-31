"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  HOME_BRAND_SLUGS,
  HOME_BRAND_DISPLAY_NAMES,
} from "@/components/home/home-brand-config"

const popularBrands = HOME_BRAND_SLUGS.map((slug) => ({
  slug,
  name: HOME_BRAND_DISPLAY_NAMES[slug],
}))

export function PopularBrands() {
  return (
    <section>
      <h2 className="mb-6 text-2xl font-semibold text-foreground">
        Popüler Markalar
      </h2>
      <div className="flex gap-2 overflow-x-auto whitespace-nowrap px-4 pr-8 py-2 scrollbar-hide snap-x snap-proximity scroll-px-4">
        {popularBrands.length === 0 ? (
          <p className="text-muted-foreground">Henüz marka listesi yok.</p>
        ) : (
          popularBrands.map(({ slug, name }) => (
            <Badge
              key={slug}
              variant="outline"
              asChild
              className="min-h-[44px] shrink-0 cursor-pointer px-6 py-2 text-sm snap-start"
            >
              <Link
                href={`/search?q=${encodeURIComponent(name)}`}
                aria-label={`${name} markası için ara`}
                data-testid={`popular-brand-${slug}`}
              >
                {name}
              </Link>
            </Badge>
          ))
        )}
      </div>
    </section>
  )
}
