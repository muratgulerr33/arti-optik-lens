import { formatPrice, formatProductName } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Sadece bu key'ler Teknik Özellikler'de gösterilir (sıra + label). Çöp key'ler dahil değil.
const SPEC_FIELDS: { key: string; label: string }[] = [
  { key: "size", label: "Boyut" },
  { key: "cam-rengi", label: "Cam Rengi" },
  { key: "cam-olcusu", label: "Cam Ölçüsü" },
  { key: "cam-ozelligi", label: "Cam Özelliği" },
  { key: "cam-materyali", label: "Cam Materyali" },
  { key: "cerceve-rengi", label: "Çerçeve Rengi" },
  { key: "cerceve-sekli", label: "Çerçeve Şekli" },
  { key: "cerceve-materyali", label: "Çerçeve Materyali" },
  { key: "kopru-uzunlugu", label: "Köprü" },
  { key: "sap-uzunlugu", label: "Sap" },
  { key: "mensei", label: "Menşei" },
];

function formatSpecValue(raw: unknown): string {
  const s = raw == null ? "" : String(raw).trim();
  if (!s) return s;
  // "54 mm" -> "54mm" gibi boşluklu ölçü birimlerini standartlaştır
  const normalized = s.replace(/\b(\d+)\s*mm\b/gi, "$1mm");
  return normalized;
}

interface ProductInfoProps {
  brand: string;
  name: string;
  price: number; // Price in kuruş
  description?: string | null;
  attributes?: Record<string, unknown> | null;
}

export function ProductInfo({
  brand,
  name,
  price,
  description,
  attributes,
}: ProductInfoProps) {
  const displayName = formatProductName(name);
  const formattedPrice = formatPrice(price);

  // Technical specs: sadece whitelist'teki key'ler, sırayla; value yoksa satır atlanır
  const technicalSpecs = attributes
    ? SPEC_FIELDS.map(({ key, label }) => {
        const raw = attributes[key];
        if (raw == null || raw === "") return null;
        return { label, value: formatSpecValue(raw) };
      }).filter((item): item is { label: string; value: string } => item != null)
    : [];

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

      {/* Technical Specs */}
      {technicalSpecs.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Teknik Özellikler</h2>
          <ul className="space-y-1.5">
            {technicalSpecs.map((spec, idx) => (
              <li key={idx} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{spec.label}:</span>
                <span className="font-medium">{spec.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
