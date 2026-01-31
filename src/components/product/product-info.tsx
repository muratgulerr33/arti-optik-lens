import { formatPrice, formatProductName } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProductInfoProps {
  brand: string;
  name: string;
  price: number; // Price in kuruş
  description?: string | null;
}

export function ProductInfo({
  brand,
  name,
  price,
  description,
}: ProductInfoProps) {
  const displayName = formatProductName(name);
  const formattedPrice = formatPrice(price);

  return (
    <div className="space-y-6">
      {/* Brand */}
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {brand}
      </p>

      {/* Title */}
      <h1 className="text-3xl font-bold text-foreground block">
        {displayName}
      </h1>

      {/* Price */}
      <div className="space-y-2">
        <p className="text-4xl font-bold text-foreground">
          {formattedPrice}
        </p>

        {/* Installment Badge */}
        <Badge variant="secondary" className="text-sm">
          Peşin Fiyatına 3 Taksit
        </Badge>
      </div>

      {/* Description */}
      {description && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Ürün Açıklaması</h2>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
      )}
    </div>
  );
}
