/**
 * Varyant özelliklerini (Renk, Ekartman, Cam Tipi) DB'deki attributes JSON'dan listeler.
 */
interface ProductAttributesProps {
  attributes: Record<string, unknown> | null | undefined;
}

const ATTRIBUTE_MAP: { key: string; label: string }[] = [
  { key: "color_frame", label: "Renk" },
  { key: "color_lens", label: "Cam Rengi" },
  { key: "size_bridge", label: "Ekartman (Köprü)" },
  { key: "size_temple", label: "Sap Uzunluğu" },
  { key: "lens_tech", label: "Cam Tipi" },
  { key: "material", label: "Materyal" },
  { key: "vlt_category", label: "VLT Kategori" },
];

function formatValue(raw: unknown): string {
  if (raw == null) return "—";
  return String(raw).trim() || "—";
}

export function ProductAttributes({ attributes }: ProductAttributesProps) {
  if (!attributes || typeof attributes !== "object") return null;

  const items = ATTRIBUTE_MAP.map(({ key, label }) => {
    const value = attributes[key];
    if (value == null || value === "") return null;
    return { label, value: formatValue(value) };
  }).filter((item): item is { label: string; value: string } => item != null);

  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Varyant Özellikleri</h2>
      <ul className="space-y-1.5">
        {items.map((item, idx) => (
          <li key={idx} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{item.label}:</span>
            <span className="font-medium">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
