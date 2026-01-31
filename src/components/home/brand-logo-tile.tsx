"use client";

import Image from "next/image";
import { useRef, useEffect, useState } from "react";

const BRAND_LOGO_TWEAKS: Record<
  string,
  { scale?: number; y?: number }
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
  const containerRef = useRef<HTMLSpanElement>(null);
  const { scale = 1, y = 0 } = BRAND_LOGO_TWEAKS[slug] ?? DEFAULT_TWEAK;
  const hasTweak = scale !== 1 || y !== 0;

  useEffect(() => {
    if (!hasTweak || useFallback) return;
    const container = containerRef.current;
    if (!container) return;
    const img = container.querySelector("img");
    if (!img) return;
    img.style.transform = `translateY(${y}px) scale(${scale})`;
    img.style.transformOrigin = "center center";
    img.style.willChange = "transform";
    return () => {
      img.style.transform = "";
      img.style.transformOrigin = "";
      img.style.willChange = "";
    };
  }, [slug, scale, y, hasTweak, useFallback]);

  if (useFallback) {
    return (
      <span className="line-clamp-2 text-center text-sm font-medium text-[#111111]">
        {name}
      </span>
    );
  }

  return (
    <span
      ref={containerRef}
      className="relative flex h-[72px] w-full items-center justify-center px-3 sm:px-4"
    >
      <span className="relative h-full w-full">
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
