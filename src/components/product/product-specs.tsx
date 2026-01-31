/**
 * Ürün detay sayfasında "Özellikler" başlığı altında tek sütun liste.
 * Sadece DISPLAY_CONFIG'deki 12 nitelik gösterilir; değeri olmayan satırlar render edilmez.
 */

const GENDER_LABEL_MAP: Record<string, string> = {
  kadin: "Kadın",
  women: "Kadın",
  erkek: "Erkek",
  men: "Erkek",
  unisex: "Unisex",
  kids: "Çocuk",
}

const DISPLAY_CONFIG: { keys: string[]; label: string }[] = [
  { keys: ["gender"], label: "Cinsiyet" },
  { keys: ["marka"], label: "Marka" },
  { keys: ["ekartman", "size"], label: "Ekartman" },
  { keys: ["color_frame"], label: "Çerçeve Rengi" },
  { keys: ["shape"], label: "Çerçeve Şekli" },
  { keys: ["material"], label: "Materyal" },
  { keys: ["color_lens"], label: "Cam Rengi" },
  { keys: ["cam_materyali"], label: "Cam Materyali" },
  { keys: ["size_lens_width", "cam_olcusu"], label: "Cam Genişliği" },
  { keys: ["feature_lens", "lens_tech", "cam_ozelligi"], label: "Cam Özelliği" },
  { keys: ["mensei"], label: "Menşei" },
  { keys: ["model_numarasi"], label: "Model Kodu" },
];

/** İlk dolu değeri döndürür; array ise ", " ile birleştirir. */
function getValue(attributes: Record<string, unknown>, keyList: string[]): string {
  for (const key of keyList) {
    const raw = attributes[key];
    if (raw == null) continue;
    if (raw === "") continue;
    if (Array.isArray(raw)) {
      const parts = raw
        .map((x) => (x != null && x !== "" ? String(x).trim() : ""))
        .filter(Boolean);
      if (parts.length) return parts.join(", ");
      continue;
    }
    const str = String(raw).trim();
    if (str) return str;
  }
  return "";
}

function formatDisplayValue(keys: string[], value: string): string {
  if (keys.includes("gender") && value) {
    return GENDER_LABEL_MAP[value.toLowerCase()] ?? value;
  }
  return value;
}

interface ProductSpecsProps {
  attributes: Record<string, unknown> | null | undefined;
}

export function ProductSpecs({ attributes }: ProductSpecsProps) {
  if (!attributes || typeof attributes !== "object") return null;

  const rows = DISPLAY_CONFIG.map(({ keys, label }) => {
    const raw = getValue(attributes, keys);
    return { label, value: formatDisplayValue(keys, raw) };
  }).filter((row) => row.value !== "");

  if (rows.length === 0) return null;

  return (
    <div className="mt-6 flex flex-col font-display">
      <h3 className="text-lg font-bold text-foreground mb-4 tracking-tight px-1">
        Özellikler
      </h3>
      <div className="flex flex-col divide-y divide-border">
        {rows.map(({ label, value }, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-3.5 px-1 min-h-[3rem]"
          >
            <span className="text-sm font-medium text-muted-foreground">
              {label}
            </span>
            <span className="text-sm font-semibold text-foreground text-right max-w-[60%] leading-tight">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
