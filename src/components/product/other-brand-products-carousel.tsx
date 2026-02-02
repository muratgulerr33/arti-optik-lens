"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ProductCard } from "@/components/catalog/product-card"
import type { CategoryProduct } from "@/lib/api/products"

export type OtherBrandProductsCarouselProps = {
  brandName: string
  products: CategoryProduct[]
}

export function OtherBrandProductsCarousel({
  brandName,
  products,
}: OtherBrandProductsCarouselProps) {
  if (!products.length) return null

  return (
    <section
      className="w-full py-8"
      aria-labelledby="other-brand-products-heading"
    >
      <h2
        id="other-brand-products-heading"
        className="mb-6 text-xl font-semibold text-foreground md:text-2xl"
      >
        Diğer {brandName} Modellerine Gözat
      </h2>
      <Carousel
        opts={{ align: "start", loop: false }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {products.map((p) => (
            <CarouselItem
              key={p.id}
              className="pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <ProductCard
                id={p.id}
                title={p.title}
                price={p.price}
                image={p.image}
                slug={p.slug}
                brand={p.brand}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden left-0 md:inline-flex md:-left-2 md:h-10 md:w-10" />
        <CarouselNext className="hidden right-0 md:inline-flex md:-right-2 md:h-10 md:w-10" />
      </Carousel>
    </section>
  )
}
