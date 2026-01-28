"use client"

import { useSearchParams } from "next/navigation"
import { ProductGrid } from "@/components/catalog/product-grid"
import { ProductCard } from "@/components/catalog/product-card"
import { PLPToolbar } from "@/components/catalog/plp-toolbar"
import { ActiveFiltersBar } from "@/components/catalog/active-filters-bar"
import { EmptyState } from "@/components/empty-state"

export type PLPProduct = {
  title: string
  price: number
  image: string
  slug: string
  brand: string
}

function capitalizeGender(gender: string): string {
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase()
}

export function CategoryContent({
  gender,
  products: initialProducts,
  dbError = false,
}: {
  gender: string
  products: PLPProduct[]
  dbError?: boolean
}) {
  const searchParams = useSearchParams()
  const capitalizedGender = capitalizeGender(gender)

  // Client-side filter by URL (minPrice/maxPrice in kuruş)
  let filteredProducts = initialProducts

  const minPrice = searchParams.get("minPrice")
  const maxPrice = searchParams.get("maxPrice")
  if (minPrice || maxPrice) {
    const min = minPrice ? parseInt(minPrice, 10) : 0
    const max = maxPrice ? parseInt(maxPrice, 10) : Infinity
    filteredProducts = filteredProducts.filter(
      (p) => p.price >= min && p.price <= max
    )
  }

  const inStock = searchParams.get("inStock")
  if (inStock === "1") {
    // V1: no per-variant stock in PLP list; filter is no-op for now
  }

  return (
    <>
      <PLPToolbar totalCount={filteredProducts.length} />
      <ActiveFiltersBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-semibold text-foreground">
          {capitalizedGender} Güneş Gözlükleri
        </h1>

        {!filteredProducts || filteredProducts.length === 0 ? (
          <EmptyState
            variant={dbError ? "db-error" : "empty"}
            message={dbError ? undefined : "Bu kategoride henüz ürün yok."}
          />
        ) : (
          <ProductGrid>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.slug}
                title={product.title}
                price={product.price}
                image={product.image}
                slug={product.slug}
                brand={product.brand}
              />
            ))}
          </ProductGrid>
        )}
      </div>
    </>
  )
}
