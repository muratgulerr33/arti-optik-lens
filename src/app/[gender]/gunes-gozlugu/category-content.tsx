"use client"

import { useSearchParams } from "next/navigation"
import { ProductGrid } from "@/components/catalog/product-grid"
import { ProductCard } from "@/components/catalog/product-card"
import { PLPToolbar } from "@/components/catalog/plp-toolbar"
import { ActiveFiltersBar } from "@/components/catalog/active-filters-bar"
import { EmptyState } from "@/components/empty-state"

export type PLPProduct = {
  id: number
  title: string
  price: number
  image: string
  slug: string
  brand: string
}

const genderLabelMap: Record<string, string> = {
  kadin: "Kadın",
  women: "Kadın",
  erkek: "Erkek",
  men: "Erkek",
  unisex: "Unisex",
  kids: "Çocuk",
}
const getGenderLabel = (gender: string) => genderLabelMap[gender?.toLowerCase() ?? ""] ?? gender
const categoryLabel = "Güneş Gözlükleri"

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
  const genderLabel = getGenderLabel(gender)

  // Client-side filter by URL (minPrice/maxPrice in kuruş)
  let filteredProducts = [...initialProducts]

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

  // Sıralama (sort parametresi)
  const sort = searchParams.get("sort") || "newest"
  if (sort === "price_asc") {
    filteredProducts.sort((a, b) => a.price - b.price)
  } else if (sort === "price_desc") {
    filteredProducts.sort((a, b) => b.price - a.price)
  }
  // newest: sunucudan gelen sıra (değiştirme)

  return (
    <>
      <PLPToolbar totalCount={filteredProducts.length} />
      <ActiveFiltersBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-semibold text-foreground">
          {genderLabel} {categoryLabel}
        </h1>

        {!filteredProducts || filteredProducts.length === 0 ? (
          <div data-testid="catalog-empty-state">
            <EmptyState
              variant={dbError ? "db-error" : "empty"}
              message={dbError ? undefined : "Bu kategoride henüz ürün yok."}
            />
          </div>
        ) : (
          <ProductGrid>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.slug}
                id={product.id}
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
