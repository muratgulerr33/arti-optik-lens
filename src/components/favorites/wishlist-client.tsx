"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
import { useWishlist } from "@/components/favorites/favorites-provider"
import { ProductCard } from "@/components/catalog/product-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ProductListEntry } from "@/lib/products"

const REMOVE_ANIMATION_MS = 180

export function WishlistClient() {
  const { wishlistProductIds, removeFromWishlist, isLoading: providerLoading } = useWishlist()
  const [products, setProducts] = useState<ProductListEntry[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [dbError, setDbError] = useState(false)
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set())
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())

  const displayIds = [...new Set([...wishlistProductIds, ...removingIds])]
  const idsParam = [...displayIds].sort((a, b) => a - b).join(",")
  const hasIds = idsParam.length > 0
  const showLoading = hasIds && (providerLoading || productsLoading)

  useEffect(() => {
    let alive = true
    const controller = new AbortController()
    const doCleanup = () => {
      alive = false
      controller.abort()
    }

    if (!hasIds) {
      queueMicrotask(() => {
        if (!alive) return
        setProducts([])
        setDbError(false)
        setProductsLoading(false)
      })
      return doCleanup
    }

    queueMicrotask(() => {
      if (!alive) return
      setProductsLoading(true)
    })
    fetch(`/api/wishlist-products?ids=${encodeURIComponent(idsParam)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) throw new Error("wishlist fetch failed")
        return res.json()
      })
      .then((data) => {
        if (!alive || controller.signal.aborted) return
        setProducts(data.products ?? [])
        setDbError(Boolean(data.dbError))
      })
      .catch(() => {
        if (!alive || controller.signal.aborted) return
        setProducts([])
        setDbError(true)
      })
      .finally(() => {
        if (!alive || controller.signal.aborted) return
        setProductsLoading(false)
      })
    return doCleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hasIds derived from idsParam; [idsParam] only per PR-2.1
  }, [idsParam])

  const handleRemoveFromWishlist = useCallback(
    async (productId: number) => {
      if (pendingIds.has(productId) || removingIds.has(productId)) return
      setPendingIds((prev) => new Set(prev).add(productId))
      await new Promise((r) => setTimeout(r, 70))
      setRemovingIds((prev) => new Set(prev).add(productId))
      const result = await removeFromWishlist(productId)
      setPendingIds((prev) => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
      if (result.ok) {
        window.setTimeout(() => {
          setRemovingIds((prev) => {
            const next = new Set(prev)
            next.delete(productId)
            return next
          })
          setProducts((prev) => prev.filter((p) => p.id !== productId))
        }, REMOVE_ANIMATION_MS)
      } else {
        setRemovingIds((prev) => {
          const next = new Set(prev)
          next.delete(productId)
          return next
        })
      }
    },
    [removeFromWishlist, pendingIds, removingIds]
  )

  if (showLoading) {
    return (
      <div className="py-8 text-muted-foreground" aria-live="polite">
        Yükleniyor...
      </div>
    )
  }

  if (wishlistProductIds.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl border bg-card py-12 text-center"
        data-testid="wishlist-empty-state"
      >
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
      <div
        className="flex flex-col items-center justify-center rounded-xl border bg-card py-12 text-center"
        data-testid="wishlist-empty-state"
      >
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
        <div
          key={p.slug}
          className={cn(
            "transition-[transform,opacity] duration-200 ease-out",
            removingIds.has(p.id)
              ? "pointer-events-none scale-95 opacity-0"
              : "scale-100 opacity-100"
          )}
        >
          <ProductCard
            id={p.id}
            title={p.title}
            price={p.price}
            image={p.image}
            slug={p.slug}
            brand={p.brand}
            onRemoveFromWishlist={handleRemoveFromWishlist}
          />
        </div>
      ))}
    </div>
  )
}
