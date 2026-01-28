"use client";

import Image from "next/image";
import { useState } from "react";

const BRAND_LOGO_TWEAKS: Record<
  string,
  { scale?: number; y?: number; brightness?: number; contrast?: number }
> = {
  "dolce-gabbana": { scale: 1.55, y: 0 },
  "emperio-armani": { scale: 1.6, y: 1 },
  "michael-kors": { scale: 1.3, y: 0 },
};

type BrandLogoTileProps = {
  slug: string;
  name: string;
};

const DEFAULT_TWEAK = { scale: 1, y: 0 };

export function BrandLogoTile({ slug, name }: BrandLogoTileProps) {
  const [useFallback, setUseFallback] = useState(false);
  const { scale = 1, y = 0 } = BRAND_LOGO_TWEAKS[slug] ?? DEFAULT_TWEAK;

  if (useFallback) {
    return (
      <span className="line-clamp-2 text-center text-sm font-medium text-[#111111]">
        {name}
      </span>
    );
  }

  return (
    <span className="relative flex h-[72px] w-full items-center justify-center px-3 sm:px-4">
      <span
        className="relative h-full w-full transform-gpu"
        style={{ transform: `translateY(${y}px) scale(${scale})` }}
      >
        <Image
          src={`/brands/${slug}.webp`}
          alt={name}
          fill
          className="object-contain object-center"
          sizes="(max-width: 640px) 45vw, 280px"
          priority={false}
          onError={() => setUseFallback(true)}
        />
      </span>
    </span>
  );
}
