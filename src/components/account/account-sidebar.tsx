"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const menuItems = [
  { label: "Profilim", href: "/account" },
  { label: "Siparişlerim", href: "/account/siparisler" },
  { label: "Favorilerim", href: "/account/wishlist" },
  { label: "Adreslerim", href: "/account/adresler" },
]

const linkClass =
  "flex min-h-11 shrink-0 items-center rounded-md px-4 py-2 text-sm font-medium transition-colors md:block md:min-h-0"

export function AccountSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full md:w-auto md:min-w-[12rem]">
      {/* Mobil: yatay kaydırılabilir tab */}
      <nav
        className="flex gap-1 overflow-x-auto py-2 md:flex-col md:overflow-visible md:space-y-1 md:py-0"
        aria-label="Hesap menüsü"
      >
        {menuItems.map((item) => {
          const isActive =
            item.href === "/account"
              ? pathname === "/account"
              : pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                linkClass,
                isActive
                  ? "bg-primary text-primary-foreground md:w-full"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground md:w-full"
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-4 border-t pt-4 md:mt-4">
        <Button
          variant="destructive"
          className="min-h-11 w-full md:min-h-11"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Çıkış Yap
        </Button>
      </div>
    </aside>
  )
}
