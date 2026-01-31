/**
 * Kuruş cinsinden integer değeri Türk Lirası formatına çevirir.
 * Örnek: 125000 → "1.250,00 TL"
 */
export function formatPrice(kurus: number): string {
  const lira = kurus / 100;
  return lira.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " TL";
}

const turkishMap: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
  Ç: "c", Ğ: "g", İ: "i", I: "i", Ö: "o", Ş: "s", Ü: "u",
};

/**
 * Türkçe karakterleri temizleyip URL dostu slug üretir.
 */
export function slugify(value: string): string {
  let s = value.trim().toLowerCase();
  for (const [tr, en] of Object.entries(turkishMap)) {
    s = s.replace(new RegExp(tr, "g"), en);
  }
  return s
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
