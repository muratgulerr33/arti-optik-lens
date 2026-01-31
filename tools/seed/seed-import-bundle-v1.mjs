// tools/seed/seed-import-bundle-v1.mjs
// Idempotent import: products.slug + product_variants.sku üzerinden UPSERT
// price = integer kuruş

// IMPORTANT: Column/table names are based on current project context in masterpack + your prompt.
// If schema differs in repo, adjust SQL accordingly. (Unknown)

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import pgPkg from "pg";
import { normalizeAttributes } from "./lib/normalize-attributes.mjs";
const { Pool } = pgPkg;

// --- tiny env loader (dependency-free) ---
function loadEnvFileIfNeeded() {
  if (process.env.DATABASE_URL) return;

  const tryFiles = [".env.local", ".env"];
  for (const f of tryFiles) {
    const p = path.join(process.cwd(), f);
    if (!fs.existsSync(p)) continue;

    const content = fs.readFileSync(p, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      const eq = line.indexOf("=");
      if (eq === -1) continue;

      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();

      // strip quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }

      if (!(key in process.env)) process.env[key] = val;
    }
  }
}

function readJson(p) {
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

function normalizeGender(input) {
  const g = (input ?? "").toString().toLowerCase().trim();
  if (g === "kadin" || g === "kadın" || g === "women" || g === "woman" || g === "female") return "kadin";
  if (g === "erkek" || g === "men" || g === "man" || g === "male") return "erkek";
  if (g === "unisex") return "unisex";
  return "unisex"; // fallback (Assumption + Reasoning: bundle zaten 150 set guard’lı, unisex safe fallback)
}

function categorySlugFromGender(gender) {
  const g = normalizeGender(gender);
  if (g === "kadin") return "kadin-gunes-gozlugu";
  if (g === "erkek") return "erkek-gunes-gozlugu";
  return "unisex-gunes-gozlugu";
}

function pick(obj, keys) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
}

function ensureArray(v) {
  if (Array.isArray(v)) return v;
  if (v === undefined || v === null) return [];
  return [v];
}

function toIntSafe(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function parseNumberish(v) {
  if (v === undefined || v === null) return NaN;
  if (typeof v === "number") return v;

  const s0 = String(v).trim();
  if (!s0) return NaN;

  // "2.600,50" -> "2600.50"  |  "2.600" -> "2600"
  const s = s0
    .replaceAll("₺", "")
    .replaceAll("TL", "")
    .replace(/\s+/g, "");

  if (s.includes(",")) {
    return Number(s.replace(/\./g, "").replace(",", "."));
  }
  return Number(s);
}

function computePriceKurus(variant) {
  // 1) Explicit kuruş alanları varsa direkt al
  const pk = pick(variant, ["price_kurus", "priceKurus", "price_krs", "priceKrs"]);
  if (pk !== undefined) {
    const n = toIntSafe(pk);
    // pk de "kuruş*100" gelebiliyor → burada da düzelt
    if (Number.isInteger(n) && n >= 10_000_000) return Math.round(n / 100);
    return n;
  }

  // 2) Aksi halde price / priceTL vb. alanlardan oku
  const raw = pick(variant, ["priceTL", "price_tl", "priceTl", "price", "price_try"]);
  const n = parseNumberish(raw);
  if (!Number.isFinite(n)) return 0;

  // Kuruş*100 tespiti: çok büyük tam sayılar → /100 (plan: updated price)
  const KURUS_X100_THRESHOLD = 10_000_000;
  if (Number.isInteger(n) && n >= KURUS_X100_THRESHOLD) return Math.round(n / 100);

  // Normal kuruş (>= 10_000 ≈ 100 TL)
  if (Number.isInteger(n) && n >= 10_000) return n;

  // TL kabul et → kuruşa çevir
  return Math.round(n * 100);
}

async function main() {
  loadEnvFileIfNeeded();

  const bundleDir = process.env.IMPORT_BUNDLE_DIR ?? "import-bundle-v1";
  const productsJsonPath = path.join(bundleDir, "products.import.json");
  const variantsJsonPath = path.join(bundleDir, "variants.import.json");

  if (!fs.existsSync(productsJsonPath)) {
    throw new Error(`products.import.json bulunamadı: ${productsJsonPath}`);
  }
  if (!fs.existsSync(variantsJsonPath)) {
    throw new Error(`variants.import.json bulunamadı: ${variantsJsonPath}`);
  }

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL missing. .env.local içine koy veya komutta env ver."
    );
  }

  const products = readJson(productsJsonPath);
  const variants = readJson(variantsJsonPath);

  if (!Array.isArray(products) || !Array.isArray(variants)) {
    throw new Error("JSON formatı beklenen array değil (products/variants).");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  const stats = {
    productsInserted: 0,
    productsUpdated: 0,
    variantsInserted: 0,
    variantsUpdated: 0,
    missingBrands: 0,
    categoriesCreated: 0,
    missingProductForVariant: 0,
    imagesMissingOnDisk: 0,
  };

  try {
    await client.query("BEGIN");

    // --- Veritabanı temizliği: import öncesi sipariş + ürün verilerini sil (brands/categories korunur) ---
    await client.query(`
      TRUNCATE TABLE order_items, orders, product_variants, products
      RESTART IDENTITY CASCADE;
    `);

    // --- Prefetch brands/categories we need ---
    const brandSlugs = Array.from(
      new Set(
        products
          .map((p) => pick(p, ["brand_slug", "brandSlug", "brand"]))
          .filter(Boolean)
          .map((x) => x.toString())
      )
    );

    const categorySlugs = Array.from(
      new Set(products.map((p) => categorySlugFromGender(p.gender)))
    );

    const brandRows = await client.query(
      `SELECT id, slug FROM brands WHERE slug = ANY($1::text[])`,
      [brandSlugs]
    );
    const brandIdBySlug = new Map(brandRows.rows.map((r) => [r.slug, r.id]));

    const catRows = await client.query(
      `SELECT id, slug FROM categories WHERE slug = ANY($1::text[])`,
      [categorySlugs]
    );
    const categoryIdBySlug = new Map(catRows.rows.map((r) => [r.slug, r.id]));

    /** Slug'dan kategori adı (yoksa "Güneş Gözlüğü"). Oluşturulacak kayıt için. */
    function categoryNameFromSlug(slug) {
      if (!slug || typeof slug !== "string") return "Güneş Gözlüğü";
      const s = slug.toLowerCase();
      if (s.startsWith("kadin")) return "Kadın Güneş Gözlüğü";
      if (s.startsWith("erkek")) return "Erkek Güneş Gözlüğü";
      if (s.startsWith("unisex")) return "Unisex Güneş Gözlüğü";
      return "Güneş Gözlüğü";
    }

    /** Slug'dan ltree path (kadin-gunes-gozlugu -> kadin.gunes.gozlugu). */
    function categoryPathFromSlug(slug) {
      if (!slug || typeof slug !== "string") return "unisex.gunes.gozlugu";
      return slug.replace(/-/g, ".");
    }

    // --- Upsert products, build productIdBySlug map ---
    const productIdBySlug = new Map();
    const productInfoBySlug = new Map();
    for (const p of products) {
      const slug = pick(p, ["slug", "product_slug", "productSlug"]);
      if (slug) {
        productInfoBySlug.set(slug, p);
      }
    }

    for (const p of products) {
      const productSlug = pick(p, ["slug", "product_slug", "productSlug"]);
      const brandSlug = pick(p, ["brand_slug", "brandSlug", "brand"]);
      const gender = normalizeGender(p.gender);
      const categorySlug = categorySlugFromGender(gender);

      if (!productSlug || !brandSlug) {
        // Hard skip: cannot link
        continue;
      }

      const brandId = brandIdBySlug.get(brandSlug);
      if (!brandId) {
        stats.missingBrands += 1;
        continue;
      }

      let categoryId = categoryIdBySlug.get(categorySlug);
      if (!categoryId) {
        const categoryName = categoryNameFromSlug(categorySlug);
        const categoryPath = categoryPathFromSlug(categorySlug);
        const ins = await client.query(
          `INSERT INTO categories (name, slug, path) VALUES ($1, $2, $3::ltree) RETURNING id`,
          [categoryName, categorySlug, categoryPath]
        );
        categoryId = ins.rows[0].id;
        categoryIdBySlug.set(categorySlug, categoryId);
        stats.categoriesCreated += 1;
      }

      const name = pick(p, ["name"]) ?? null;
      const description = pick(p, ["description", "desc"]) ?? null;
      const sourceUrl = pick(p, ["source_url", "sourceUrl"]) ?? null;
      const sourceData = pick(p, ["source_data", "sourceData"]) ?? null;
      const productType = pick(p, ["product_type", "productType"]) ?? "sunglasses";

      const res = await client.query(
        `
        INSERT INTO products
          (brand_id, category_id, name, slug, description, gender, product_type, source_url, source_data)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
        ON CONFLICT (slug) DO UPDATE SET
          brand_id = EXCLUDED.brand_id,
          category_id = EXCLUDED.category_id,
          name = COALESCE(EXCLUDED.name, products.name),
          description = COALESCE(EXCLUDED.description, products.description),
          gender = EXCLUDED.gender,
          product_type = EXCLUDED.product_type,
          source_url = COALESCE(EXCLUDED.source_url, products.source_url),
          source_data = COALESCE(EXCLUDED.source_data, products.source_data)
        RETURNING id, (xmax = 0) AS inserted;
        `,
        [
          brandId,
          categoryId,
          name,
          productSlug,
          description,
          gender,
          productType,
          sourceUrl,
          sourceData ? JSON.stringify(sourceData) : null,
        ]
      );

      const { id, inserted } = res.rows[0];
      productIdBySlug.set(productSlug, id);

      if (inserted) stats.productsInserted += 1;
      else stats.productsUpdated += 1;
    }

    // --- Upsert variants ---
    for (const v of variants) {
      const sku = pick(v, ["sku", "SKU"]);
      const productSlug = pick(v, ["product_slug", "productSlug", "slug"]);
      if (!sku || !productSlug) continue;

      const productId = productIdBySlug.get(productSlug);
      if (!productId) {
        // ürün JSON’unda yoksa (beklenmez ama guard)
        stats.missingProductForVariant += 1;
        continue;
      }

      const priceInt = computePriceKurus(v);

      const stock = toIntSafe(pick(v, ["stock", "qty", "quantity"]), 0);
      const stockStatus =
        pick(v, ["stock_status", "stockStatus"]) ??
        (stock > 0 ? "in_stock" : "out_of_stock"); // (Assumption + Reasoning: common stock status enum)

      const productInfo = productInfoBySlug.get(productSlug) ?? {};
      const specifications = ensureArray(productInfo?.specifications ?? productInfo?.specs);
      const specsObj = specifications.reduce((acc, item) => {
        if (item && item.name != null && item.value != null) {
          acc[String(item.name).trim()] = item.value;
        }
        return acc;
      }, {});
      const rawAttrs = pick(v, ["attributes", "attrs"]) ?? {};
      const mergedAttributes = { ...specsObj, ...rawAttrs };
      const fallbackText = { name: pick(productInfo, ["name"]), description: pick(productInfo, ["description", "desc"]) };
      const attributes = normalizeAttributes(mergedAttributes, fallbackText);

      const imagesRaw = ensureArray(pick(v, ["images", "image_paths", "imagePaths"]));

      // Normalize image paths: ensure they start with "/products/"
      const images = imagesRaw
        .filter(Boolean)
        .map((x) => x.toString().trim())
        .map((p) => {
          if (p.startsWith("/products/")) return p;
          if (p.startsWith("products/")) return "/" + p;
          if (p.startsWith("/")) return p; // fallback
          // If only filename, assume bundle convention: /products/<productSlug>/<filename>
          return `/products/${productSlug}/${p}`;
        });

      const res = await client.query(
        `
        INSERT INTO product_variants
          (product_id, sku, price, stock, stock_status, attributes, images)
        VALUES
          ($1, $2, $3::int, $4, $5, $6::jsonb, $7::jsonb)
        ON CONFLICT (sku) DO UPDATE SET
          product_id = EXCLUDED.product_id,
          price = EXCLUDED.price,
          stock = EXCLUDED.stock,
          stock_status = EXCLUDED.stock_status,
          attributes = EXCLUDED.attributes,
          images = EXCLUDED.images
        RETURNING id, (xmax = 0) AS inserted;
        `,
        [
          productId,
          sku,
          priceInt,
          stock,
          stockStatus,
          JSON.stringify(attributes ?? {}),
          JSON.stringify(images ?? []),
        ]
      );

      const { inserted } = res.rows[0];
      if (inserted) stats.variantsInserted += 1;
      else stats.variantsUpdated += 1;
    }

    await client.query("COMMIT");

    // --- Optional: quick disk image verification (counts only) ---
    // Checks first 3 images encountered (fast)
    let checked = 0;
    for (const v of variants) {
      if (checked >= 3) break;
      const imagesRaw = ensureArray(pick(v, ["images", "image_paths", "imagePaths"]));
      const candidate = imagesRaw.find(Boolean);
      if (!candidate) continue;

      const p = candidate.toString().trim().startsWith("/")
        ? candidate.toString().trim().slice(1)
        : candidate.toString().trim();
      const diskPath = path.join(process.cwd(), "public", p.replace(/^public\//, ""));
      checked += 1;

      if (!fs.existsSync(diskPath)) stats.imagesMissingOnDisk += 1;
    }

    console.log("✅ Import tamamlandı.");
    console.log(JSON.stringify(stats, null, 2));
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("⛔ Import başarısız. ROLLBACK yapıldı.");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
