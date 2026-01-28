"use client";

import { useEffect } from "react";

const MIN_WIDTH = 1200;

/**
 * DEV-only: logs a warning if hero images on the page have naturalWidth < MIN_WIDTH.
 * Renders nothing. Safe to keep in tree; no-op in production.
 */
export function HeroImageDevCheck() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    const check = () => {
      const imgs = document.querySelectorAll<HTMLImageElement>(
        'img[src*="/hero/"]'
      );
      imgs.forEach((img) => {
        const w = img.naturalWidth;
        if (w > 0 && w < MIN_WIDTH) {
          console.warn(
            `[HeroImageDevCheck] Low-res hero asset: "${img.src}" naturalWidth=${w}. Consider 1920x1080 (16:9) for crisp banners.`
          );
        }
      });
    };

    const t = setTimeout(check, 200);
    return () => clearTimeout(t);
  }, []);

  return null;
}
