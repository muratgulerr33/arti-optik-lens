// tools/seed/inspect-import-bundle-v1.mjs
// variants.import.json içindeki fiyat alanlarının min/max/örneklerini yazdırır.
// Kuruş*100 teşhisi: kaç değer >= 10_000_000

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const PRICE_KEYS = ["price_kurus", "priceKurus", "price_krs", "priceKrs", "priceTL", "price_tl", "priceTl", "price", "price_try"];

function pick(obj, keys) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
}

function parseNumberish(v) {
  if (v === undefined || v === null) return NaN;
  if (typeof v === "number") return v;
  const s0 = String(v).trim();
  if (!s0) return NaN;
  const s = s0.replaceAll("₺", "").replaceAll("TL", "").replace(/\s+/g, "");
  if (s.includes(",")) return Number(s.replace(/\./g, "").replace(",", "."));
  return Number(s);
}

function extractPriceKurus(variant) {
  const raw = pick(variant, PRICE_KEYS);
  return parseNumberish(raw);
}

function loadEnvFileIfNeeded() {
  if (process.env.IMPORT_BUNDLE_DIR) return;
  const tryFiles = [".env.local", ".env"];
  const cwd = process.cwd();
  for (const f of tryFiles) {
    const p = path.join(cwd, f);
    if (!fs.existsSync(p)) continue;
    const content = fs.readFileSync(p, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
  }
}

loadEnvFileIfNeeded();

const bundleDir = process.env.IMPORT_BUNDLE_DIR ?? path.join(process.cwd(), "import-bundle-v1");
const variantsPath = path.join(bundleDir, "data", "variants.import.json");

if (!fs.existsSync(variantsPath)) {
  console.error("variants.import.json bulunamadı:", variantsPath);
  process.exit(1);
}

const variants = JSON.parse(fs.readFileSync(variantsPath, "utf8"));
if (!Array.isArray(variants)) {
  console.error("variants.import.json array değil.");
  process.exit(1);
}

const prices = variants.map(extractPriceKurus).filter((n) => Number.isFinite(n));
const huge = prices.filter((n) => n >= 10_000_000);

console.log("--- variants.import.json fiyat inspector ---");
console.log("bundleDir:", bundleDir);
console.log("toplam variant:", variants.length);
console.log("fiyatı parse edilen:", prices.length);
console.log("min:", prices.length ? Math.min(...prices) : "-");
console.log("max:", prices.length ? Math.max(...prices) : "-");
console.log(">= 10_000_000 (kuruş*100?) adet:", huge.length);
console.log("örnek 10 fiyat:", prices.slice(0, 10));
console.log("---");
