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
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  const setViewportRef = useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node;
      emblaRef(node);
    },
    [emblaRef]
  );

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
      <div className="md:hidden">
        <div className="relative overflow-hidden" ref={setViewportRef}>
          <div className="flex">
            {images.map((img, idx) => (
              <div key={idx} className="min-w-0 flex-shrink-0 w-full">
                <div
                  className={cn(
                    "relative aspect-[4/5] overflow-hidden",
                    "bg-[#F9F9F9] dark:bg-[#F9F9F9]",
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
            "bg-[#F9F9F9] dark:bg-[#F9F9F9]",
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
                  "bg-[#F9F9F9] dark:bg-[#F9F9F9]",
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
