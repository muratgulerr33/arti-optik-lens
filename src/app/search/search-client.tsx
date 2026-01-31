"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/catalog/product-card"
import { ProductGrid } from "@/components/catalog/product-grid"
import { PLPToolbar } from "@/components/catalog/plp-toolbar"
import { ActiveFiltersBar } from "@/components/catalog/active-filters-bar"
import { EmptyState } from "@/components/empty-state"
import { SearchInput } from "@/components/search/search-input"
import { PopularBrands } from "@/components/search/popular-brands"

type SearchApiItem = {
  title: string
  price: number
  image: string
  slug: string
  brand: string
}

type SearchApiResponse = {
  items: SearchApiItem[]
  fallbackItems?: SearchApiItem[]
  fallbackCategory?: string | null
}

const SHAPES = [
  { label: "Damla", value: "aviator" },
  { label: "Yuvarlak", value: "round" },
  { label: "Köşeli", value: "square" },
  { label: "Çekik", value: "cat-eye" },
  { label: "Geometrik", value: "geometric" },
]

interface SearchClientProps {
  initialQuery: string
}

export default function SearchClient({ initialQuery }: SearchClientProps) {
  const searchParams = useSearchParams()
  const q = (searchParams.get("q") ?? searchParams.get("brand") ?? "").trim() || initialQuery

  const [items, setItems] = useState<SearchApiItem[]>([])
  const [fallbackItems, setFallbackItems] = useState<SearchApiItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSearch = useCallback(async (query: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      params.set('limit', query ? '100' : '24')
      const res = await fetch(`/api/search?${params.toString()}`)
      const data: SearchApiResponse = await res.json()
      setItems(Array.isArray(data.items) ? data.items : [])
      setFallbackItems(Array.isArray(data.fallbackItems) ? data.fallbackItems : [])
    } catch {
      setItems([])
      setFallbackItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSearch(q)
  }, [q, fetchSearch])

  const hasQuery = q.length >= 2
  const showSuggestions = !hasQuery

  const minPrice = searchParams.get("minPrice")
  const maxPrice = searchParams.get("maxPrice")
  const sort = searchParams.get("sort") || "newest"
  let filteredResults = [...items]
  if (minPrice || maxPrice) {
    const min = minPrice ? parseInt(minPrice, 10) : 0
    const max = maxPrice ? parseInt(maxPrice, 10) : Infinity
    filteredResults = filteredResults.filter((p) => p.price >= min && p.price <= max)
  }
  if (sort === "price_asc") {
    filteredResults.sort((a, b) => a.price - b.price)
  } else if (sort === "price_desc") {
    filteredResults.sort((a, b) => b.price - a.price)
  }

  const isEmptyWithQuery = hasQuery && !loading && items.length === 0

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 flex h-16 items-center gap-2 border-b bg-background/80 backdrop-blur-md px-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11"
          asChild
        >
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Geri</span>
          </Link>
        </Button>
        <SearchInput />
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        {loading && (
          <div className="text-muted-foreground text-center py-8">
            Yükleniyor...
          </div>
        )}

        {!loading && isEmptyWithQuery && (
          <div className="space-y-8" data-testid="search-empty-state">
            <div className="text-center text-muted-foreground py-8">
              <EmptyState
                variant="empty"
                message={`"${q}" için sonuç bulunamadı.`}
                subMessage="Farklı bir arama terimi deneyin."
                className="py-0 text-center text-muted-foreground"
              />
            </div>
            <div className="space-y-8">
              <PopularBrands />
              <section>
                <h2 className="mb-6 text-2xl font-semibold text-foreground">
                  Şekle Göre
                </h2>
                <div className="flex gap-2 overflow-x-auto whitespace-nowrap px-4 pr-8 py-2 scrollbar-hide snap-x snap-proximity scroll-px-4">
                  {SHAPES.map((shape) => (
                    <Badge
                      key={shape.value}
                      variant="outline"
                      asChild
                      className="min-h-[44px] shrink-0 cursor-pointer px-6 py-2 text-sm snap-start"
                    >
                      <Link
                        href={`/unisex/gunes-gozlugu?shape=${encodeURIComponent(shape.value)}`}
                        aria-label={`${shape.label} şekli için ara`}
                      >
                        {shape.label}
                      </Link>
                    </Badge>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {!loading && hasQuery && items.length > 0 && (
          <div className="space-y-0">
            <PLPToolbar totalCount={filteredResults.length} />
            <ActiveFiltersBar />
            <div className="space-y-4 pt-4">
              <div className="text-sm text-muted-foreground">
                &quot;{q}&quot; — {filteredResults.length} sonuç
              </div>
              <ProductGrid>
                {filteredResults.map((item) => (
                  <ProductCard
                    key={item.slug}
                    title={item.title}
                    price={item.price}
                    image={item.image}
                    slug={item.slug}
                    brand={item.brand}
                  />
                ))}
              </ProductGrid>
            </div>
          </div>
        )}

        {!loading && !hasQuery && items.length > 0 && (
          <div className="space-y-0">
            <PLPToolbar totalCount={filteredResults.length} />
            <ActiveFiltersBar />
            <div className="space-y-4 pt-4">
              <div className="text-sm text-muted-foreground">
                Güneş gözlükleri — {filteredResults.length} ürün
              </div>
              <ProductGrid>
                {filteredResults.map((item) => (
                  <ProductCard
                    key={item.slug}
                    title={item.title}
                    price={item.price}
                    image={item.image}
                    slug={item.slug}
                    brand={item.brand}
                  />
                ))}
              </ProductGrid>
            </div>
          </div>
        )}

        {!loading && hasQuery && items.length > 0 && fallbackItems.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-6 text-2xl font-semibold text-foreground">
              Bunlar hoşuna gidebilir
            </h2>
            <ProductGrid>
              {fallbackItems.slice(0, 8).map((item) => (
                <ProductCard
                  key={item.slug}
                  title={item.title}
                  price={item.price}
                  image={item.image}
                  slug={item.slug}
                  brand={item.brand}
                />
              ))}
            </ProductGrid>
          </section>
        )}

        {!loading && showSuggestions && (
          <div className="space-y-10">
            <PopularBrands />
            <section>
              <h2 className="mb-6 text-2xl font-semibold text-foreground">
                Şekle Göre
              </h2>
              <div className="flex gap-2 overflow-x-auto whitespace-nowrap px-4 pr-8 py-2 scrollbar-hide snap-x snap-proximity scroll-px-4">
                {SHAPES.map((shape) => (
                  <Badge
                    key={shape.value}
                    variant="outline"
                    asChild
                    className="min-h-[44px] shrink-0 cursor-pointer px-6 py-2 text-sm snap-start"
                  >
                    <Link
                      href={`/unisex/gunes-gozlugu?shape=${encodeURIComponent(shape.value)}`}
                      aria-label={`${shape.label} şekli için ara`}
                    >
                      {shape.label}
                    </Link>
                  </Badge>
                ))}
                <Badge
                  variant="outline"
                  asChild
                  className="min-h-[44px] shrink-0 cursor-pointer px-6 py-2 text-sm snap-start bg-transparent border-primary text-primary hover:bg-accent/40"
                >
                  <Link href="/search" aria-label="Tüm şekilleri görüntüle">
                    Tümü
                  </Link>
                </Badge>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
