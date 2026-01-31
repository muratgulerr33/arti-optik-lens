/**
 * product_variants.attributes için normalizasyon:
 * - Türkçe alan adlarını İngilizce anahtarlara map eder
 * - Mapping'de olmayan anahtarları formatlayıp saklar (catch-all, veri kaybı yok)
 * - İsim/açıklama metninden fallback (shape, color) çıkarır
 */

const KNOWN_ENGLISH_KEYS = new Set([
  "color",
  "color_frame",
  "color_lens",
  "shape",
  "material",
  "size_bridge",
  "size_temple",
  "size_lens_width",
  "lens_tech",
  "gender",
]);

/** Kaynak verideki Türkçe anahtar -> DB'deki İngilizce anahtar (plan: Çerçeve Rengi, Renk, Genel Renk -> color_frame) */
const TURKISH_TO_ENGLISH = {
  Renk: "color_frame",
  "Genel Renk": "color_frame",
  "Çerçeve Rengi": "color_frame",
  "Cerçeve Rengi": "color_frame",
  "Cam Rengi": "color_lens",
  Şekil: "shape",
  "Gövde Tipi": "shape",
  Materyal: "material",
  "Çerçeve Materyali": "material",
  Ekartman: "size_bridge",
  "Köprü Genişliği": "size_bridge",
  "Sap Uzunluğu": "size_temple",
  "Şakak Uzunluğu": "size_temple",
  "Cam Özelliği": "lens_tech",
  "Cam Tipi": "lens_tech",
  // kebab-case (tireli küçük harf) anahtarlar
  "cerceve-sekli": "shape",
  "govde-tipi": "shape",
  sekil: "shape",
  "cerceve-rengi": "color_frame",
  renk: "color_frame",
  "cam-rengi": "color_lens",
  "cerceve-materyali": "material",
  materyal: "material",
  "cam-ozelligi": "lens_tech",
  "sap-uzunlugu": "size_temple",
  "kopru-uzunlugu": "size_bridge",
  "cam-olcusu": "size_lens_width",
  cinsiyet: "gender",
};

/**
 * Mapping'de olmayan anahtarlar için formatlanmış anahtar üretir (catch-all).
 * Tire -> alt çizgi, boşluklar -> alt çizgi, çoklu alt çizgi tekilleştirilir, küçük harf.
 */
function formatUnknownKey(key) {
  if (typeof key !== "string" || !key.length) return "";
  const s = key
    .trim()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return s ? s.toLowerCase() : "";
}

/** Ham attributes objesini anlamlı İngilizce anahtarlara dönüştürür; tanımsız anahtarları formatlayıp saklar (veri kaybı yok) */
function mapToEnglishAttributes(raw) {
  if (!raw || typeof raw !== "object") return {};
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v === undefined || v === null || v === "") continue;
    const key = typeof k === "string" ? k.trim() : String(k);
    if (!key.length) continue;

    let englishKey = null;
    if (Object.prototype.hasOwnProperty.call(TURKISH_TO_ENGLISH, key)) {
      englishKey = TURKISH_TO_ENGLISH[key];
    } else if (KNOWN_ENGLISH_KEYS.has(key)) {
      englishKey = key;
    } else {
      englishKey = formatUnknownKey(key) || null;
    }
    if (englishKey) out[englishKey] = v;
  }
  return out;
}

/** İsim/açıklama metninden shape kelimelerini yakalar (plan: Damla -> shape 'Damla') */
const SHAPE_PATTERNS = [
  { regex: /\b(damla)\b/i, value: "Damla" },
  { regex: /\b(pilot|aviator)\b/i, value: "aviator" },
  { regex: /\b(wayfarer)\b/i, value: "wayfarer" },
  { regex: /\b(yuvarlak|round)\b/i, value: "round" },
  { regex: /\b(kare|square)\b/i, value: "square" },
  { regex: /\b(dikdörtgen|rectangular)\b/i, value: "rectangular" },
  { regex: /\b(geometrik|geometric)\b/i, value: "geometric" },
  { regex: /\b(oversize)\b/i, value: "oversize" },
  { regex: /\b(kedi\s*gözü|cat\s*eye|cat-eye)\b/i, value: "cat-eye" },
];

const COLOR_PATTERNS = [
  { regex: /\b(siyah|black)\b/i, value: "Siyah" },
  { regex: /\b(beyaz|white)\b/i, value: "Beyaz" },
  { regex: /\b(gri|grey|gray)\b/i, value: "Gri" },
  { regex: /\b(kahverengi|brown)\b/i, value: "Kahverengi" },
  { regex: /\b(kemik)\b/i, value: "Kemik" },
  { regex: /\b(mavi|blue)\b/i, value: "Mavi" },
  { regex: /\b(yeşil|green)\b/i, value: "Yeşil" },
  { regex: /\b(kırmızı|red)\b/i, value: "Kırmızı" },
  { regex: /\b(altın|gold)\b/i, value: "Altın" },
  { regex: /\b(gümüş|silver)\b/i, value: "Gümüş" },
];

/** Plan: Polarize geçiyorsa lens_tech: 'Polarize' */
const LENS_TECH_PATTERNS = [
  { regex: /\b(polarize|polarized)\b/i, value: "Polarize" },
  { regex: /\b(mirror|ayna)\b/i, value: "Mirror" },
  { regex: /\b(gradient)\b/i, value: "Gradient" },
];

function extractAttributesFromText(text) {
  if (!text || typeof text !== "string") return {};
  const t = text.trim();
  if (!t.length) return {};
  const out = {};
  for (const { regex, value } of SHAPE_PATTERNS) {
    if (regex.test(t)) {
      out.shape = value;
      break;
    }
  }
  for (const { regex, value } of COLOR_PATTERNS) {
    if (regex.test(t)) {
      out.color = value;
      break;
    }
  }
  for (const { regex, value } of LENS_TECH_PATTERNS) {
    if (regex.test(t)) {
      out.lens_tech = value;
      break;
    }
  }
  return out;
}

/**
 * Tek bir attributes objesini normalize eder.
 * @param {Record<string, unknown>} rawAttrs - Ham attributes (Türkçe anahtarlar veya slug benzeri anahtarlar içerebilir)
 * @param {{ name?: string, description?: string }} fallbackText - İsim/açıklama; buradan shape/color çıkarılır (kaynakta yoksa)
 */
export function normalizeAttributes(rawAttrs, fallbackText = {}) {
  const mapped = mapToEnglishAttributes(rawAttrs || {});
  const name = fallbackText.name ?? "";
  const description = fallbackText.description ?? "";
  const combined = [name, description].filter(Boolean).join(" ");
  const extracted = extractAttributesFromText(combined);
  // Fallback sadece boş olan alanları doldurur
  if (extracted.shape && !mapped.shape) mapped.shape = extracted.shape;
  if (extracted.color && !mapped.color) mapped.color = extracted.color;
  if (extracted.color && !mapped.color_frame) mapped.color_frame = extracted.color;
  if (extracted.lens_tech && !mapped.lens_tech) mapped.lens_tech = extracted.lens_tech;
  return mapped;
}
