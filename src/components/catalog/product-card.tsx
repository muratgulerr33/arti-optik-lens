import Link from "next/link";
import Image from "next/image";
import { formatPrice, formatProductName } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "@/components/favorites/favorite-button";

interface ProductCardProps {
  title: string;
  price: number; // Price in kuruş (e.g., 26000 for 260 TL)
  image: string;
  slug: string;
  brand: string;
  /** Ürün ID (favori butonu için; yoksa kalp gösterilmez). */
  id?: number;
  /** Wishlist sayfasında favoriden kaldırma (fade-out UX) için kullanılır. */
  onRemoveFromWishlist?: (productId: number) => Promise<void>;
}

export function ProductCard({
  title,
  price,
  image,
  slug,
  brand,
  id,
  onRemoveFromWishlist,
}: ProductCardProps) {
  const name = formatProductName(title);
  const productHref = `/urun/${slug}`;

  return (
    <Link
      href={productHref}
      prefetch={false}
      aria-label={`${name} - ${formatPrice(Number(price))}`}
      data-testid="product-card"
      className={cn(
        "group relative block h-full overflow-hidden rounded-2xl bg-card",
        "ring-1 ring-foreground/10 shadow-sm transition dark:ring-white/10",
        "hover:-translate-y-0.5 hover:shadow-md",
        "active:translate-y-0 active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "motion-reduce:transform-none motion-reduce:transition-none",
        "touch-manipulation [-webkit-tap-highlight-color:transparent]"
      )}
    >
      {/* Image stage: fixed white in both themes (transparent product images on studio white) */}
      <div className="relative w-full overflow-hidden rounded-xl aspect-[4/3] bg-white dark:bg-white ring-1 ring-inset ring-black/10">
        {id != null && (
          <FavoriteButton
            productId={id}
            onRemoveFromWishlist={onRemoveFromWishlist}
          />
        )}
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-5 sm:p-6 transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transform-none"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 p-3">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-muted-foreground">
          {brand}
        </p>
        <div
          className={cn(
            "text-sm font-medium leading-snug text-foreground",
            "[display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden"
          )}
        >
          {name}
        </div>
        <p className="text-base font-semibold tabular-nums text-foreground">
          {formatPrice(Number(price))}
        </p>
      </div>
    </Link>
  );
}
