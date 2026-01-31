/**
 * DB X-Ray: Veritabanı otopsisı ve analiz raporu
 * Arama/filtreleme tutarsızlıklarını (örn. "Damla" aranıyor ama bulunamıyor) analiz etmek için
 * gerçek veriyi konsola yazdırır.
 *
 * Çalıştırma: npx tsx scripts/db-xray.ts
 * Gerekli: .env.local içinde DATABASE_URL tanımlı olmalı
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { sql } from "drizzle-orm";
import { getDbForAdapter } from "../src/db/connection";

async function main() {
  const db = getDbForAdapter();

  console.log("\n========== 1. KATEGORİ ANALİZİ (Ürün sayısı / kategori) ==========\n");

  const categoryStats = await db.execute(sql`
    SELECT c.id, c.name, c.slug, c.path::text, COUNT(p.id) AS product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    GROUP BY c.id, c.name, c.slug, c.path
    ORDER BY product_count DESC
  `);

  for (const row of categoryStats.rows) {
    console.log(`  ${(row as Record<string, unknown>).name} (slug: ${(row as Record<string, unknown>).slug}, path: ${(row as Record<string, unknown>).path}): ${(row as Record<string, unknown>).product_count} ürün`);
  }

  console.log("\n========== 2. ŞEKİL (SHAPE) ENVANTERİ (attributes->>'shape') ==========\n");

  const shapeStats = await db.execute(sql`
    SELECT (attributes->>'shape') AS shape_value, COUNT(*) AS cnt
    FROM product_variants
    GROUP BY (attributes->>'shape')
    ORDER BY cnt DESC
  `);

  const shapeMap: Record<string, number> = {};
  for (const row of shapeStats.rows) {
    const r = row as Record<string, unknown>;
    const val = r.shape_value == null ? "(null/boş)" : String(r.shape_value);
    const cnt = Number(r.cnt);
    shapeMap[val] = cnt;
    console.log(`  ${val}: ${cnt}`);
  }
  console.log("\n  Özet (değer: sayı):", shapeMap);

  console.log("\n========== 3. ÇERÇEVE (SHAPE) VE KATEGORİ İLİŞKİSİ ==========\n");

  const shapeCategoryStats = await db.execute(sql`
    SELECT (pv.attributes->>'shape') AS shape_value, c.name AS category_name, COUNT(*) AS cnt
    FROM product_variants pv
    JOIN products p ON p.id = pv.product_id
    JOIN categories c ON c.id = p.category_id
    GROUP BY (pv.attributes->>'shape'), c.name
    ORDER BY shape_value, cnt DESC
  `);

  const byShape: Record<string, Array<{ category: string; count: number }>> = {};
  for (const row of shapeCategoryStats.rows) {
    const r = row as Record<string, unknown>;
    const shape = r.shape_value == null ? "(null/boş)" : String(r.shape_value);
    const cat = String(r.category_name);
    const cnt = Number(r.cnt);
    if (!byShape[shape]) byShape[shape] = [];
    byShape[shape].push({ category: cat, count: cnt });
  }
  for (const [shape, items] of Object.entries(byShape)) {
    console.log(`  ${shape}:`);
    for (const { category, count } of items) {
      console.log(`    - ${category}: ${count}`);
    }
  }

  console.log("\n========== 4. RENK (COLOR_FRAME) ANALİZİ (attributes->>'color_frame') ==========\n");

  const colorStats = await db.execute(sql`
    SELECT (attributes->>'color_frame') AS color_value, COUNT(*) AS cnt
    FROM product_variants
    GROUP BY (attributes->>'color_frame')
    ORDER BY cnt DESC
  `);

  const colorMap: Record<string, number> = {};
  for (const row of colorStats.rows) {
    const r = row as Record<string, unknown>;
    const val = r.color_value == null ? "(null/boş)" : String(r.color_value);
    const cnt = Number(r.cnt);
    colorMap[val] = cnt;
    console.log(`  ${val}: ${cnt}`);
  }
  console.log("\n  Özet (değer: sayı):", colorMap);

  console.log("\n========== 5. MARKA VE CİNSİYET DAĞILIMI ==========\n");

  const brandGenderStats = await db.execute(sql`
    SELECT b.name AS brand_name, p.gender, COUNT(*) AS cnt
    FROM products p
    JOIN brands b ON b.id = p.brand_id
    GROUP BY b.name, p.gender
    ORDER BY brand_name, cnt DESC
  `);

  const byBrand: Record<string, Array<{ gender: string; count: number }>> = {};
  const brandTotals: Record<string, number> = {};
  for (const row of brandGenderStats.rows) {
    const r = row as Record<string, unknown>;
    const brand = String(r.brand_name);
    const gender = String(r.gender);
    const cnt = Number(r.cnt);
    if (!byBrand[brand]) byBrand[brand] = [];
    byBrand[brand].push({ gender, count: cnt });
    brandTotals[brand] = (brandTotals[brand] ?? 0) + cnt;
  }

  console.log("  Marka bazında toplam ürün:");
  for (const [brand, total] of Object.entries(brandTotals).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${brand}: ${total} ürün`);
  }
  console.log("\n  Marka x Cinsiyet:");
  for (const [brand, items] of Object.entries(byBrand)) {
    console.log(`  ${brand}:`);
    for (const { gender, count } of items) {
      console.log(`    - ${gender}: ${count}`);
    }
  }

  console.log("\n========== 6. ATTRIBUTES KEY ENVANTERİ (product_variants.attributes) ==========\n");

  const keyStats = await db.execute(sql`
    SELECT key, COUNT(*) AS cnt
    FROM product_variants, jsonb_object_keys(COALESCE(attributes, '{}'::jsonb)) AS key
    GROUP BY key
    ORDER BY cnt DESC
  `);

  for (const row of keyStats.rows) {
    const r = row as Record<string, unknown>;
    console.log(`  ${r.key}: ${r.cnt} varyant`);
  }

  console.log("\n========== DB X-RAY TAMAMLANDI ==========\n");
}

main().catch((err) => {
  console.error("DB X-Ray hatası:", err);
  process.exit(1);
});
