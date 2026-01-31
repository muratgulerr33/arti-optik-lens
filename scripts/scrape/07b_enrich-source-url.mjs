#!/usr/bin/env node
/**
 * 07b_enrich-source-url.mjs
 * 
 * products.json içindeki her ürün için HTML'den gerçek sayfa URL'sini (source_url) çıkarmak
 * ve import'a hazır "products_enriched.json" üretmek.
 * 
 * Ayrıca debug için her ürünün source_data alanına ham mapping (image_mapping) + 
 * ilgili variant snapshot'ını gömmek.
 * 
 * Usage:
 *   node scripts/scrape/07b_enrich-source-url.mjs \
 *     --in out/scrape-v2-final/filtered/physical-brands/selected/physical-150-gender31 \
 *     --html products \
 *     --out out/scrape-v2-final/filtered/physical-brands/selected/physical-150-gender31/enriched
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

function die(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {
    inDir: null,
    htmlSubdir: null,
    outDir: null,
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];

    if (a === "--in") {
      args.inDir = argv[++i] ?? null;
    } else if (a === "--html") {
      args.htmlSubdir = argv[++i] ?? null;
    } else if (a === "--out") {
      args.outDir = argv[++i] ?? null;
    } else if (a === "--help" || a === "-h") {
      console.log(`
07b_enrich-source-url.mjs

--in <dir>      Input directory (must contain products.json, variants.json, image_mapping.json)
--html <subdir> HTML files subdirectory (relative to --in, default: "products")
--out <dir>     Output directory (will be created if needed)
`);
      process.exit(0);
    }
  }

  if (!args.inDir) die("--in is required");
  if (!args.outDir) die("--out is required");
  if (!args.htmlSubdir) args.htmlSubdir = "products";

  return args;
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  if (!(await exists(filePath))) {
    die(`Required file not found: ${filePath}`);
  }
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content);
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

/**
 * HTML içinden URL çıkarma
 * Öncelik sırası: og:url > canonical
 */
function extractUrlFromHtml(htmlContent) {
  if (!htmlContent || typeof htmlContent !== "string") {
    return { method: "none", url: null };
  }

  // 1. og:url kontrolü
  // Tolerant regex: attribute sırası, tek/çift tırnak farkları
  const ogUrlMatch = htmlContent.match(
    /<meta\s+property\s*=\s*["']og:url["']\s+content\s*=\s*["']([^"']+)["']/i
  ) || htmlContent.match(
    /<meta\s+content\s*=\s*["']([^"']+)["']\s+property\s*=\s*["']og:url["']/i
  );

  if (ogUrlMatch && ogUrlMatch[1]) {
    return { method: "og:url", url: ogUrlMatch[1].trim() };
  }

  // 2. canonical kontrolü
  const canonicalMatch = htmlContent.match(
    /<link\s+rel\s*=\s*["']canonical["']\s+href\s*=\s*["']([^"']+)["']/i
  ) || htmlContent.match(
    /<link\s+href\s*=\s*["']([^"']+)["']\s+rel\s*=\s*["']canonical["']/i
  );

  if (canonicalMatch && canonicalMatch[1]) {
    // Relative olsa bile raw kaydet
    return { method: "canonical", url: canonicalMatch[1].trim() };
  }

  return { method: "none", url: null };
}

/**
 * Ürün için HTML dosyasını bul
 */
async function findHtmlFile(product, htmlDir, htmlFiles) {
  // Önce ürün objesinde bariz bir referans varsa kullan
  if (product.html_file) {
    const htmlPath = path.join(htmlDir, product.html_file);
    if (await exists(htmlPath)) {
      return product.html_file;
    }
  }
  if (product.htmlPath) {
    const htmlPath = path.join(htmlDir, product.htmlPath);
    if (await exists(htmlPath)) {
      return product.htmlPath;
    }
  }

  // Yoksa slug/id'den tahmin et
  const candidates = [];
  if (product.slug) {
    candidates.push(`${product.slug}.html`);
  }
  if (product.id) {
    candidates.push(`${product.id}.html`);
  }
  if (product.productId) {
    candidates.push(`${product.productId}.html`);
  }

  // HTML dosya listesi üzerinden eşleştir
  for (const candidate of candidates) {
    if (htmlFiles.includes(candidate)) {
      return candidate;
    }
  }

  // Tam eşleşme yoksa, kısmi eşleşme dene
  for (const htmlFile of htmlFiles) {
    const baseName = path.basename(htmlFile, ".html");
    if (product.slug && baseName === product.slug) {
      return htmlFile;
    }
    if (product.id && baseName === String(product.id)) {
      return htmlFile;
    }
    if (product.productId && baseName === String(product.productId)) {
      return htmlFile;
    }
  }

  return null;
}

/**
 * Variant eşleştirme - esnek kurallar
 */
function matchVariants(product, variants) {
  if (!Array.isArray(variants) || variants.length === 0) {
    return { matched: [], reason: "no_variants" };
  }

  // Öncelik: variant.product_id === product.id
  const byProductId = variants.filter(
    (v) => v.product_id === product.id || v.productId === product.id
  );
  if (byProductId.length > 0) {
    return { matched: byProductId, reason: "product_id_match" };
  }

  // Alternatif: variant.product_slug, variant.productSlug, variant.slug içinde product.slug
  if (product.slug) {
    const bySlug = variants.filter((v) => {
      return (
        v.product_slug === product.slug ||
        v.productSlug === product.slug ||
        (v.slug && v.slug.includes(product.slug)) ||
        (v.productSlug && v.productSlug.includes(product.slug))
      );
    });
    if (bySlug.length > 0) {
      return { matched: bySlug, reason: "slug_match" };
    }
  }

  return { matched: [], reason: "no_match" };
}

/**
 * Image mapping eşleştirme
 */
function matchImageMapping(product, imageMapping) {
  if (!imageMapping || typeof imageMapping !== "object") {
    return { mapping: null, reason: "no_mapping_data" };
  }

  // Eğer imageMapping bir array ise, product.id ile eşleştir
  if (Array.isArray(imageMapping)) {
    const matched = imageMapping.find(
      (m) => m.product_id === product.id || m.productId === product.id
    );
    if (matched) {
      return { mapping: matched, reason: "product_id_match" };
    }
  }

  // Eğer imageMapping bir object ise, product.id veya slug ile key olarak kontrol et
  if (product.id && imageMapping[product.id]) {
    return { mapping: imageMapping[product.id], reason: "product_id_key" };
  }
  if (product.slug && imageMapping[product.slug]) {
    return { mapping: imageMapping[product.slug], reason: "slug_key" };
  }

  return { mapping: null, reason: "no_match" };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const inDirAbs = path.resolve(args.inDir);
  const htmlDirAbs = path.join(inDirAbs, args.htmlSubdir);
  const outDirAbs = path.resolve(args.outDir);

  console.log("\n🔍 Source URL Enrichment başlatılıyor...");
  console.log(`   Input: ${inDirAbs}`);
  console.log(`   HTML: ${htmlDirAbs}`);
  console.log(`   Output: ${outDirAbs}\n`);

  // Girdi dosyalarını oku
  const productsPath = path.join(inDirAbs, "products.json");
  const variantsPath = path.join(inDirAbs, "variants.json");
  const imageMappingPath = path.join(inDirAbs, "image_mapping.json");

  console.log("📖 Girdi dosyaları okunuyor...");
  const products = await readJson(productsPath);
  const variants = await readJson(variantsPath);
  const imageMapping = await readJson(imageMappingPath);

  if (!Array.isArray(products)) {
    die("products.json must contain an array");
  }

  console.log(`   ✅ ${products.length} ürün bulundu`);
  console.log(`   ✅ ${Array.isArray(variants) ? variants.length : "N/A"} variant bulundu\n`);

  // HTML dosyalarını listele
  let htmlFiles = [];
  if (await exists(htmlDirAbs)) {
    const entries = await fs.readdir(htmlDirAbs, { withFileTypes: true });
    htmlFiles = entries
      .filter((e) => e.isFile() && e.name.endsWith(".html"))
      .map((e) => e.name);
    console.log(`   ✅ ${htmlFiles.length} HTML dosyası bulundu\n`);
  } else {
    console.log(`   ⚠️  HTML klasörü bulunamadı: ${htmlDirAbs}\n`);
  }

  // Rapor için sayaçlar
  const report = {
    total: products.length,
    ogUrlFound: 0,
    canonicalFound: 0,
    urlNotFound: 0,
    htmlNotFound: 0,
  };

  // Her ürünü işle
  console.log("🔄 Ürünler işleniyor...\n");
  const enrichedProducts = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const enriched = { ...product };

    // HTML dosyasını bul
    const htmlFileName = await findHtmlFile(product, htmlDirAbs, htmlFiles);
    let htmlContent = null;
    let sourceUrlExtract = {
      method: "none",
      html_file: htmlFileName || null,
    };

    if (htmlFileName) {
      const htmlPath = path.join(htmlDirAbs, htmlFileName);
      try {
        htmlContent = await fs.readFile(htmlPath, "utf8");
        const urlResult = extractUrlFromHtml(htmlContent);
        sourceUrlExtract = {
          ...sourceUrlExtract,
          method: urlResult.method,
          [urlResult.method === "og:url" ? "og_url" : urlResult.method === "canonical" ? "canonical" : null]: urlResult.url,
        };

        if (urlResult.method === "og:url") {
          enriched.source_url = urlResult.url;
          report.ogUrlFound++;
        } else if (urlResult.method === "canonical") {
          enriched.source_url = urlResult.url;
          report.canonicalFound++;
        } else {
          enriched.source_url = null;
          report.urlNotFound++;
        }
      } catch (error) {
        console.error(`   ⚠️  HTML okuma hatası (${htmlFileName}): ${error.message}`);
        enriched.source_url = null;
        report.htmlNotFound++;
      }
    } else {
      enriched.source_url = null;
      report.htmlNotFound++;
      report.urlNotFound++;
    }

    // Variant eşleştirme
    const variantMatch = matchVariants(product, variants);
    const variantSnapshot = variantMatch.matched;

    // Image mapping eşleştirme
    const imageMatch = matchImageMapping(product, imageMapping);

    // source_data gömme
    enriched.source_data = {
      source_data_version: 1,
      source_url_extract: sourceUrlExtract,
      image_mapping_raw: imageMatch.mapping,
      image_mapping_match_reason: imageMatch.reason,
      variant_snapshot: variantSnapshot,
      variant_match_reason: variantMatch.reason,
    };

    enrichedProducts.push(enriched);

    if ((i + 1) % 50 === 0) {
      console.log(`   ✅ ${i + 1}/${products.length} ürün işlendi...`);
    }
  }

  console.log(`\n✅ Tüm ürünler işlendi (${products.length})\n`);

  // Çıktı klasörünü oluştur
  await ensureDir(outDirAbs);

  // products_enriched.json yaz
  const enrichedPath = path.join(outDirAbs, "products_enriched.json");
  await fs.writeFile(enrichedPath, JSON.stringify(enrichedProducts, null, 2), "utf8");
  console.log(`✅ Enriched products yazıldı: ${enrichedPath}`);

  // enrich_report.json yaz
  const reportPath = path.join(outDirAbs, "enrich_report.json");
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");
  console.log(`✅ Rapor yazıldı: ${reportPath}\n`);

  // Rapor özeti
  console.log("📊 Özet:");
  console.log(`   Toplam ürün: ${report.total}`);
  console.log(`   og:url bulunan: ${report.ogUrlFound}`);
  console.log(`   canonical bulunan: ${report.canonicalFound}`);
  console.log(`   URL bulunamayan: ${report.urlNotFound}`);
  console.log(`   HTML bulunamayan: ${report.htmlNotFound}`);
  console.log("");
}

main().catch((e) => {
  console.error("\n❌ Unhandled error:\n", e);
  process.exit(1);
});
