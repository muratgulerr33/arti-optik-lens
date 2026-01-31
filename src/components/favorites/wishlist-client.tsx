"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
import { useWishlist } from "@/store/favorites-store"
import { ProductCard } from "@/components/catalog/product-card"
import { Button } from "@/components/ui/button"
import type { ProductListEntry } from "@/lib/products"

export function WishlistClient() {
  const { wishlistProductIds } = useWishlist()
  const [products, setProducts] = useState<ProductListEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [dbError, setDbError] = useState(false)

  const idsKey = wishlistProductIds.length > 0 ? wishlistProductIds.join(",") : ""

  useEffect(() => {
    if (wishlistProductIds.length === 0) return
    const tid = setTimeout(() => setLoading(true), 0)
    const ids = wishlistProductIds.join(",")
    fetch(`/api/wishlist-products?ids=${encodeURIComponent(ids)}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products ?? [])
        setDbError(Boolean(data.dbError))
      })
      .catch(() => {
        setProducts([])
        setDbError(true)
      })
      .finally(() => setLoading(false))
    return () => clearTimeout(tid)
  }, [idsKey, wishlistProductIds])

  if (loading) {
    return (
      <div className="py-8 text-muted-foreground" aria-live="polite">
        Yükleniyor...
      </div>
    )
  }

  if (wishlistProductIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-12 text-center">
        <Heart
          className="mb-4 size-12 text-muted-foreground"
          aria-hidden
        />
        <p className="mb-2 text-base font-medium text-foreground">
          Henüz favorin yok
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          Beğendiğiniz ürünleri favorilere ekleyerek burada görebilirsiniz.
        </p>
        <Button asChild>
          <Link href="/">Kategorilere Git</Link>
        </Button>
      </div>
    )
  }

  if (dbError) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p className="text-base">Veritabanına bağlanılamadı. Lütfen daha sonra tekrar deneyin.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/">Kategorilere Git</Link>
        </Button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-12 text-center">
        <Heart
          className="mb-4 size-12 text-muted-foreground"
          aria-hidden
        />
        <p className="mb-2 text-base font-medium text-foreground">
          Henüz favorin yok
        </p>
        <Button asChild className="mt-2">
          <Link href="/">Kategorilere Git</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard
          key={p.slug}
          title={p.title}
          price={p.price}
          image={p.image}
          slug={p.slug}
          brand={p.brand}
        />
      ))}
    </div>
  )
}
