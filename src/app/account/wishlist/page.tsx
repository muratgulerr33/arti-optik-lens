import { WishlistClient } from "@/components/favorites/wishlist-client"

export const dynamic = "force-dynamic"

export default function AccountWishlistPage() {
  return (
    <div data-testid="wishlist-page">
      <h1 className="mb-6 text-2xl font-bold">Favorilerim</h1>
      <WishlistClient />
    </div>
  )
}
