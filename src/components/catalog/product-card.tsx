import Link from "next/link";
import Image from "next/image";
import { formatPrice, formatProductName } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  title: string;
  price: number; // Price in kuruş (e.g., 26000 for 260 TL)
  image: string;
  slug: string;
  brand: string;
}

export function ProductCard({
  title,
  price,
  image,
  slug,
  brand,
}: ProductCardProps) {
  const name = formatProductName(title);

  return (
    <Link href={`/urun/${slug}`} className="group">
      <div className="space-y-3">
        {/* Image Container (The Stage) */}
        <div
          className={cn(
            "relative aspect-[4/5] overflow-hidden",
            "bg-[#F9F9F9] dark:bg-[#F9F9F9]", // Fixed light background - does NOT change in dark mode
            "border border-border/10",
            "rounded-lg"
          )}
        >
          <Image
            src={image}
            alt={title}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>

        {/* Info Section (Below Image) */}
        <div className="space-y-1">
          {/* Brand */}
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {brand}
          </p>

          {/* Name */}
          <div className="line-clamp-2 font-semibold text-foreground">
            {name}
          </div>

          {/* Price */}
          <p className="font-medium text-foreground">
            {formatPrice(Number(price))}
          </p>
        </div>
      </div>
    </Link>
  );
}
