"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/catalog/product-card"
import { ProductGrid } from "@/components/catalog/product-grid"
import { EmptyState } from "@/components/empty-state"

// Debounce delay (300ms as per plan)
const DEBOUNCE_MS = 300

// TODO: Fetch real data from DB (Prisma/Drizzle)
const popularBrands: string[] = []

// Şekil seçenekleri (same as home page)
const SHAPES = [
  { label: "Damla", value: "aviator" },
  { label: "Yuvarlak", value: "round" },
  { label: "Köşeli", value: "square" },
  { label: "Çekik", value: "cat-eye" },
  { label: "Geometrik", value: "geometric" },
]

interface SearchResult {
  title: string
  price: number
  image: string
  slug: string
  brand: string
}

export default function SearchClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialQ = searchParams.get("q") || ""
  const [query, setQuery] = useState(initialQ)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchError, setSearchError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // URL -> state senkronu (back/forward ile)
  useEffect(() => {
    const q = searchParams.get("q") || ""
    setQuery(q)
    setDebouncedQuery(q)
  }, [searchParams])

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // 300ms debounce ile URL güncelle
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query)

      const params = new URLSearchParams(searchParams.toString())
      const q = query.trim()

      if (!q) {
        params.delete("q")
      } else {
        params.set("q", q)
      }

      router.replace(`/search?${params.toString()}`, { scroll: false })
    }, DEBOUNCE_MS)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // Fetch search results when debouncedQuery changes
  useEffect(() => {
    const fetchResults = async () => {
      const trimmedQuery = debouncedQuery.trim()

      // Don't search if query is too short (as per plan: q.length < 2)
      if (!trimmedQuery || trimmedQuery.length < 2) {
        setResults([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setSearchError(false)
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmedQuery)}&limit=20`
        )
        if (!response.ok) {
          throw new Error("Search failed")
        }
        const data = await response.json()
        setResults(data.items || [])
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
        setSearchError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [debouncedQuery])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  // Handle clear button
  const handleClear = () => {
    setQuery("")
    setDebouncedQuery("")
    setResults([])
    setSearchError(false)
    router.replace("/search", { scroll: false })
    inputRef.current?.focus()
  }

  const hasQuery = debouncedQuery.trim().length >= 2
  const showSuggestions = !hasQuery && !isLoading

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
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
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Marka veya model ara…"
            value={query}
            onChange={handleInputChange}
            className="h-11 pr-10"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2"
              onClick={handleClear}
              aria-label="Temizle"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {isLoading && (
          <div className="text-center text-muted-foreground py-8">
            Aranıyor...
          </div>
        )}

        {!isLoading && hasQuery && results.length === 0 && (
          <div className="space-y-8">
            <div className="text-center text-muted-foreground py-8">
              {searchError ? (
                <EmptyState variant="db-error" className="py-0 text-center text-muted-foreground" />
              ) : (
                <EmptyState
                  variant="empty"
                  message={`"${debouncedQuery}" için sonuç bulunamadı.`}
                  subMessage="Farklı bir arama terimi deneyin."
                  className="py-0 text-center text-muted-foreground"
                />
              )}
            </div>

            {/* Show suggestions even when no results */}
            <div className="space-y-8">
              {/* Popüler Markalar */}
              <section>
                <h2 className="mb-6 text-2xl font-semibold text-foreground">
                  Popüler Markalar
                </h2>
                <div className="flex gap-2 overflow-x-auto whitespace-nowrap px-4 pr-8 py-2 scrollbar-hide snap-x snap-proximity scroll-px-4">
                  {!popularBrands || popularBrands.length === 0 ? (
                    <p className="text-muted-foreground">Henüz marka listesi yok.</p>
                  ) : (
                    popularBrands.map((brand) => (
                      <Badge
                        key={brand}
                        variant="outline"
                        asChild
                        className="min-h-[44px] shrink-0 cursor-pointer px-6 py-2 text-sm snap-start"
                      >
                        <Link
                          href={`/search?q=${encodeURIComponent(brand)}`}
                          aria-label={`${brand} markası için ara`}
                        >
                          {brand}
                        </Link>
                      </Badge>
                    ))
                  )}
                </div>
              </section>

              {/* Şekle Göre */}
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

        {!isLoading && hasQuery && results.length > 0 && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              &quot;{debouncedQuery}&quot; için {results.length} sonuç bulundu
            </div>
            <ProductGrid>
              {results.map((item) => (
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
        )}

        {showSuggestions && (
          <div className="space-y-10">
            {/* Popüler Markalar */}
            <section>
              <h2 className="mb-6 text-2xl font-semibold text-foreground">
                Popüler Markalar
              </h2>
              <div className="flex gap-2 overflow-x-auto whitespace-nowrap px-4 pr-8 py-2 scrollbar-hide snap-x snap-proximity scroll-px-4">
                {!popularBrands || popularBrands.length === 0 ? (
                  <p className="text-muted-foreground">Henüz marka listesi yok.</p>
                ) : (
                  <>
                    {popularBrands.map((brand) => (
                      <Badge
                        key={brand}
                        variant="outline"
                        asChild
                        className="min-h-[44px] shrink-0 cursor-pointer px-6 py-2 text-sm snap-start"
                      >
                        <Link
                          href={`/search?q=${encodeURIComponent(brand)}`}
                          aria-label={`${brand} markası için ara`}
                        >
                          {brand}
                        </Link>
                      </Badge>
                    ))}
                    <Badge
                      variant="outline"
                      asChild
                      className="min-h-[44px] shrink-0 cursor-pointer px-6 py-2 text-sm snap-start bg-transparent border-primary text-primary hover:bg-accent/40"
                    >
                      <Link href="/search" aria-label="Tüm markaları görüntüle">
                        Tümü
                      </Link>
                    </Badge>
                  </>
                )}
              </div>
            </section>

            {/* Şekle Göre */}
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
