"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isDraggingRef = useRef(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: false,
    containScroll: "trimSnaps",
    skipSnaps: true,
  });

  const setViewportRef = useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node;
      if (typeof emblaRef === "function") emblaRef(node);
    },
    [emblaRef]
  );

  // Swipe sırasında viewport resize olursa reInit (yarım snap önlemi); drag sırasında reInit yapma
  useEffect(() => {
    if (!emblaApi) return;

    const reinit = () => {
      if (isDraggingRef.current) return;
      requestAnimationFrame(() => {
        if (emblaApi) emblaApi.reInit();
      });
    };

    const vv = window.visualViewport;
    vv?.addEventListener("resize", reinit);
    window.addEventListener("orientationchange", reinit);
    window.addEventListener("resize", reinit);
    return () => {
      vv?.removeEventListener("resize", reinit);
      window.removeEventListener("orientationchange", reinit);
      window.removeEventListener("resize", reinit);
    };
  }, [emblaApi]);

  // Debug: viewport ölçümü — yalnızca development + ?debug (production’da asla çalışmaz)
  useEffect(() => {
    const isDebug =
      process.env.NODE_ENV !== "production" &&
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("debug");
    if (!isDebug || !emblaApi || !viewportRef.current) return;

    const viewport = viewportRef.current;

    const ro = new ResizeObserver(() => {
      const rect = viewport.getBoundingClientRect();
      console.log("[PDP debug] viewport resize", { width: rect.width, height: rect.height });
    });
    ro.observe(viewport);

    const logPointer = () => {
      const rect = viewport.getBoundingClientRect();
      const barH = typeof document !== "undefined" ? document.documentElement.style.getPropertyValue("--pdp-bar-h") : "";
      console.log("[PDP debug] pointer", {
        viewportWidth: rect.width,
        innerHeight: window.innerHeight,
        visualViewportHeight: window.visualViewport?.height,
        pdpBarH: barH || "(none)",
      });
    };

    viewport.addEventListener("pointerdown", logPointer);
    viewport.addEventListener("pointerup", logPointer);

    return () => {
      ro.disconnect();
      viewport.removeEventListener("pointerdown", logPointer);
      viewport.removeEventListener("pointerup", logPointer);
    };
  }, [emblaApi]);

  // Embla API'den seçili index'i al
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect(); // Initial call

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = () => {
    emblaApi?.scrollPrev();
  };

  const scrollNext = () => {
    emblaApi?.scrollNext();
  };

  const scrollTo = (index: number) => {
    emblaApi?.scrollTo(index);
  };

  const mainImage = images[selectedIndex] || images[0];

  return (
    <div className="space-y-4">
      {/* Mobile: Carousel */}
      <div className="md:hidden touch-pan-y overscroll-x-contain">
        <div
          className="relative overflow-hidden touch-pan-y overscroll-x-contain"
          ref={setViewportRef}
          onPointerDown={() => (isDraggingRef.current = true)}
          onPointerUp={() => (isDraggingRef.current = false)}
          onPointerLeave={() => (isDraggingRef.current = false)}
        >
          <div className="flex will-change-transform">
            {images.map((img, idx) => (
              <div key={idx} className="min-w-0 flex-shrink-0 w-full">
                <div
                  className={cn(
                    "relative aspect-[4/5] overflow-hidden",
                    "bg-media-surface",
                    "border border-border/10 rounded-lg"
                  )}
                >
                  <Image
                    src={img}
                    alt={`${productName} - Görsel ${idx + 1}`}
                    fill
                    className="object-contain p-4"
                    sizes="100vw"
                    priority={idx === 0}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Navigation Buttons */}
        {images.length > 1 && (
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              className="h-10 w-10"
              aria-label="Önceki görsel"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Dots Indicator */}
            <div className="flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollTo(idx)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    idx === selectedIndex
                      ? "w-8 bg-foreground"
                      : "w-2 bg-muted-foreground/30"
                  )}
                  aria-label={`Görsel ${idx + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              className="h-10 w-10"
              aria-label="Sonraki görsel"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Desktop: Main Image + Thumbnails */}
      <div className="hidden md:block">
        {/* Main Image */}
        <div
          className={cn(
            "relative aspect-[4/5] overflow-hidden mb-4",
            "bg-media-surface",
            "border border-border/10 rounded-lg",
            "group"
          )}
        >
          <Image
            src={mainImage}
            alt={productName}
            fill
            className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority
          />
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-md border-2 transition-all",
                  "bg-media-surface",
                  idx === selectedIndex
                    ? "border-foreground"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
                aria-label={`Görsel ${idx + 1} seç`}
              >
                <Image
                  src={img}
                  alt={`${productName} - Thumbnail ${idx + 1}`}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 768px) 25vw, 15vw"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
