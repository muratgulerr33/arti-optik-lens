"use client";

import { useState, useEffect } from "react";

/**
 * Observes a 1px sentinel (#pdp-inline-cta-sentinel) below the inline CTA row.
 * When sentinel is in view: hide sticky bar. When it scrolls out: show sticky bar.
 * rootMargin bottom -96px so CTA isn't counted "in view" when hidden under the bar.
 * Returns sentinelInView: true = hide sticky bar, false = show sticky bar.
 */
const SENTINEL_ROOT_MARGIN = "0px 0px -96px 0px";

export function useStickyVisibilityBySentinel(selector: string): {
  sentinelInView: boolean;
} {
  const [sentinelInView, setSentinelInView] = useState(true);

  useEffect(() => {
    const el = document.querySelector(selector);
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry) setSentinelInView(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: SENTINEL_ROOT_MARGIN }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [selector]);

  return { sentinelInView };
}
