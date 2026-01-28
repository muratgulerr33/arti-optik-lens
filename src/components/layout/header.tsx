"use client"

import Link from "next/link"
import { Search, ShoppingBag, User } from "lucide-react"
import { useSession } from "next-auth/react"
import { useScrollDirection } from "@/hooks/use-scroll-direction"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/store/cart-store"
import { cn } from "@/lib/utils"

export function Header() {
  const { scrollDirection, isAtTop } = useScrollDirection(10)
  const { status } = useSession()
  const items = useCartStore((s) => s.items)
  const openCart = useCartStore((s) => s.openCart)
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)

  // Header is visible if at top OR scrolling up
  const isVisible = isAtTop || scrollDirection === "up"

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b transition-transform duration-300 ease-in-out",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
      style={{ willChange: "transform" }}
    >
      <div className="flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center">
          <span className="font-display text-xl font-bold tracking-tighter">
            ARTI OPTİK
          </span>
        </Link>

        {/* Right: Search + Cart + User Icons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11"
            asChild
          >
            <Link href="/search">
              <Search className="h-5 w-5" />
              <span className="sr-only">Ara</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 relative"
            onClick={openCart}
            aria-label="Sepet"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-0.5 -right-0.5 h-5 min-w-5 flex items-center justify-center rounded-full p-0 text-xs"
              >
                {cartCount}
              </Badge>
            )}
            <span className="sr-only">Sepet</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11"
            asChild
          >
            <Link href={status === "authenticated" ? "/hesabim" : "/auth/login"}>
              <User className="h-5 w-5" />
              <span className="sr-only">
                {status === "authenticated" ? "Hesabım" : "Giriş Yap"}
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
