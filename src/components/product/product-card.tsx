import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface ProductCardProps {
  id: string | number;
  slug: string;
  brandName: string;
  title: string;
  priceKurus: number;
  imageUrl: string;
}

export function ProductCard({
  id,
  slug,
  brandName,
  title,
  priceKurus,
  imageUrl,
}: ProductCardProps) {
  return (
    <Link href={`/urun/${slug}`} className="group block active:scale-[0.98] transition-transform" data-testid={`product-card-${id}`}>
      <div className="rounded-xl bg-card border border-border/10 p-3">
        <div className="space-y-3">
          <div
            className={cn(
              "relative aspect-[4/5] overflow-hidden rounded-lg",
              "bg-media-surface"
            )}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : (
              <div
                className="absolute inset-0 bg-muted"
                aria-hidden
              />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {brandName}
            </p>
            <div className="line-clamp-2 font-semibold text-foreground">
              {title}
            </div>
            <p className="font-medium text-foreground">
              {formatPrice(priceKurus)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
