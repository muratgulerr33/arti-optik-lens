#!/usr/bin/env node

/**
 * V1 Seed Importer
 * Seed dosyasını DB'ye import eder (sadece sunglasses ürünleri)
 * 
 * Usage: 
 *   node tools/seed/seed-v1-from-scrape.mjs [--dry-run] [--truncate] [--file=path/to/file.json]
 * 
 * Parameters:
 *   --dry-run: Değişiklikleri uygulamadan test eder
 *   --truncate: Mevcut ürünleri siler (dry-run ile çalışmaz)
 *   --file: Seed dosyası yolu (default: tools/seed/input/v1-seed-100.full.json)
 * 
 * Validation Rules:
 *   - Sadece sunglasses ürünleri import edilir (productType kontrolü)
 *   - price zorunlu ve > 0 olmalı
 *   - imageUrls >= 1 zorunlu
 *   - Unique anahtar: slug veya sourceUrl
 *   - Price format: TL olarak saklanır (numeric precision: 10, scale: 2)
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
// eq and sql imports removed - not used
import * as schemaModule from '../../src/db/schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing in .env.local');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Schema'yı düzgün import et (default export içinde)
const schema = schemaModule.default || schemaModule;
const db = drizzle(pool, { schema });

// CLI args
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const shouldTruncate = args.includes('--truncate');
const fileArg = args.find(arg => arg.startsWith('--file='));
const seedFile = fileArg 
  ? fileArg.split('=')[1] 
  : path.join(__dirname, 'input/v1-seed-100.full.json');

// JSON dosyasını oku
function readSeedFile() {
  if (!fs.existsSync(seedFile)) {
    throw new Error(`Seed dosyası bulunamadı: ${seedFile}`);
  }
  const content = fs.readFileSync(seedFile, 'utf-8');
  return JSON.parse(content);
}

// Gender heuristik (breadcrumb'ten)
function inferGender(breadcrumb) {
  if (!breadcrumb || !Array.isArray(breadcrumb)) {
    return 'unisex';
  }
  
  const breadcrumbStr = breadcrumb.join(' ').toLowerCase();
  
  if (breadcrumbStr.includes('kadın') || breadcrumbStr.includes('women') || breadcrumbStr.includes('female')) {
    return 'women';
  }
  if (breadcrumbStr.includes('erkek') || breadcrumbStr.includes('men') || breadcrumbStr.includes('male')) {
    return 'men';
  }
  
  return 'unisex';
}

// Shape heuristik (slug/name/breadcrumb'ten)
function inferShape(item) {
  const shapeKeywords = {
    'aviator': 'aviator',
    'pilot': 'aviator',
    'wayfarer': 'wayfarer',
    'round': 'round',
    'yuvarlak': 'round',
    'square': 'square',
    'kare': 'square',
    'rectangular': 'rectangular',
    'dikdörtgen': 'rectangular',
    'geometric': 'geometric',
    'geometrik': 'geometric',
    'oversize': 'oversize',
    'cat-eye': 'cat-eye',
    'cat eye': 'cat-eye',
    'kedi gözü': 'cat-eye',
  };
  
  // Önce attributes'tan kontrol et
  if (item.attributes && item.attributes.shape) {
    return item.attributes.shape;
  }
  
  // Sonra slug/name/breadcrumb'ten çıkar
  const searchText = [
    item.slug || '',
    item.name || item.title || '',
    ...(item.breadcrumb || item.categoryPath || [])
  ].join(' ').toLowerCase();
  
  for (const [keyword, shape] of Object.entries(shapeKeywords)) {
    if (searchText.includes(keyword)) {
      return shape;
    }
  }
  
  // Bulunamazsa boş bırak
  return null;
}

// Slug oluştur
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Image URL'leri normalize et (relative ise base ile düzelt)
function normalizeImageUrls(imageUrls, baseUrl = '') {
  if (!Array.isArray(imageUrls)) {
    return [];
  }
  
  return imageUrls.map(url => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (baseUrl && !url.startsWith('/')) {
      return `${baseUrl}/${url}`;
    }
    return url;
  }).filter(Boolean);
}

// Seed import
async function importSeed() {
  console.log('🌱 V1 Seed Import başlatılıyor...');
  console.log(`   Dosya: ${seedFile}`);
  console.log(`   Dry-run: ${isDryRun ? 'EVET' : 'HAYIR'}`);
  console.log(`   Truncate: ${shouldTruncate ? 'EVET' : 'HAYIR'}\n`);
  
  if (isDryRun) {
    console.log('⚠️  DRY-RUN modu: Değişiklikler uygulanmayacak\n');
  }
  
  try {
    const seedData = readSeedFile();
    const products = Array.isArray(seedData) ? seedData : (seedData.products || []);
    
    if (!Array.isArray(products) || products.length === 0) {
      throw new Error('Seed dosyasında ürün bulunamadı');
    }
    
    console.log(`📦 ${products.length} ürün bulundu\n`);
    
    if (shouldTruncate && !isDryRun) {
      console.log('🗑️  Mevcut ürünler siliniyor...');
      await db.delete(schema.productVariants);
      await db.delete(schema.products);
      console.log('✅ Temizleme tamamlandı\n');
    }
    
    let inserted = 0;
    let skipped = 0;
    let errors = 0;
    
    // Tüm markaları önce çek (cache)
    const allBrands = await db.select().from(schema.brands);
    const brandMap = new Map(allBrands.map(b => [b.slug.toLowerCase(), b.id]));
    
    // Tüm kategorileri çek (cache)
    const allCategories = await db.select().from(schema.categories);
    
    // V1 için default kategori oluştur (yoksa)
    let defaultCategoryId = null;
    const defaultCategorySlug = 'sunglasses';
    const defaultCategory = allCategories.find(c => c.slug.toLowerCase() === defaultCategorySlug);
    
    if (!defaultCategory) {
      if (!isDryRun) {
        const [newCategory] = await db.insert(schema.categories).values({
          name: 'Güneş Gözlüğü',
          slug: defaultCategorySlug,
          path: 'Sunglasses',
        }).returning();
        defaultCategoryId = newCategory.id;
        console.log(`✅ Default kategori oluşturuldu: ${defaultCategorySlug}`);
      } else {
        console.log(`⚠️  DRY-RUN: Default kategori oluşturulacak: ${defaultCategorySlug}`);
      }
    } else {
      defaultCategoryId = defaultCategory.id;
    }
    
    for (let i = 0; i < products.length; i++) {
      const item = products[i];
      
      try {
        // Normalize
        const brandName = item.brand || item.brandName || 'Unknown';
        const brandSlug = createSlug(brandName);
        const productName = item.name || item.title || 'Ürün';
        const productSlug = item.slug || createSlug(productName);
        const price = parseFloat(item.price) || 0;
        const stock = item.totalStock || item.stock || 0;
        const stockStatus = stock > 0 ? 'in_stock' : 'out_of_stock';
        const gender = inferGender(item.breadcrumb || item.categoryPath);
        const shape = inferShape(item);
        const imageUrls = normalizeImageUrls(item.imageUrls || item.images || []);
        const sourceUrl = item.sourceUrl || item.url || null;
        const sourceData = {
          breadcrumb: item.breadcrumb || item.categoryPath || [],
          originalData: item,
        };
        
        // Attributes hazırla (shape bilgisini ekle)
        const attributes = item.attributes || {};
        if (shape) {
          attributes.shape = shape;
        }
        
        // Brand kontrolü
        let brandId = brandMap.get(brandSlug.toLowerCase());
        if (!brandId) {
          console.log(`⚠️  Marka bulunamadı: ${brandName} (${brandSlug}), atlanıyor`);
          skipped++;
          continue;
        }
        
        // Category kontrolü (V1: 2 seviye kategori - gender + sunglasses)
        // V1'de kategori derinliği 2 seviye: {gender} ve {gender}.sunglasses
        // Shape/style bilgisi kategori değil, attribute olarak saklanır
        const categoryId = defaultCategoryId;
        if (!categoryId) {
          console.log(`⚠️  Kategori bulunamadı, atlanıyor`);
          skipped++;
          continue;
        }
        
        // V1 Validation: Sadece sunglasses
        // Not: Seed dosyası zaten filtreli olabilir ama tekrar doğrula
        const productType = item.productType || 'sunglasses';
        if (productType !== 'sunglasses') {
          console.log(`⚠️  V1 dışı ürün tipi (${productType}), atlanıyor: ${productName}`);
          skipped++;
          continue;
        }
        
        // Validation
        if (!productName || !productSlug) {
          console.log(`⚠️  Ürün adı/slug eksik, atlanıyor: ${JSON.stringify(item)}`);
          skipped++;
          continue;
        }
        
        if (price <= 0) {
          console.log(`⚠️  Fiyat geçersiz (${price}), atlanıyor: ${productName}`);
          skipped++;
          continue;
        }
        
        // imageUrls >= 1 zorunlu
        if (!imageUrls || imageUrls.length === 0) {
          console.log(`⚠️  Görsel yok (imageUrls >= 1 zorunlu), atlanıyor: ${productName}`);
          skipped++;
          continue;
        }
        
        // Unique anahtar kontrolü: slug veya sourceUrl (mevcut ürün kontrolü)
        // Not: DB'de unique constraint var, duplicate hatası catch edilecek
        
        if (isDryRun) {
          console.log(`[DRY-RUN] ${i + 1}/${products.length} - ${productName} (${brandName}) - ${price} TL - Stok: ${stock}`);
          inserted++;
          continue;
        }
        
        // Product insert
        const [product] = await db.insert(schema.products).values({
          brandId,
          categoryId,
          name: productName,
          slug: productSlug,
          description: item.description || null,
          gender,
          productType: 'sunglasses',
          sourceUrl,
          sourceData,
        }).returning();
        
        // Variant insert (V1 basit: 1 default variant)
        // attributes içinde shape bilgisi varsa saklanır (kategori değil, facet olarak)
        await db.insert(schema.productVariants).values({
          productId: product.id,
          sku: item.sku || item.productId || `SKU-${product.id}`,
          price: price.toString(),
          stock,
          stockStatus,
          attributes: attributes, // shape bilgisi içerir (varsa)
          images: imageUrls,
          isFeatured: false,
        });
        
        inserted++;
        if ((i + 1) % 10 === 0) {
          console.log(`✅ ${i + 1}/${products.length} ürün işlendi...`);
        }
      } catch (error) {
        errors++;
        console.error(`❌ Hata (ürün ${i + 1}):`, error.message);
        if (!isDryRun) {
          console.error('   Item:', JSON.stringify(item, null, 2));
        }
      }
    }
    
    console.log(`\n✨ Import tamamlandı!`);
    console.log(`   Eklendi: ${inserted}`);
    console.log(`   Atlandı: ${skipped}`);
    console.log(`   Hata: ${errors}`);
    
    if (isDryRun) {
      console.log(`\n⚠️  DRY-RUN modu: Gerçek import için --dry-run parametresini kaldırın`);
    }
  } catch (error) {
    console.error('❌ Import hatası:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

importSeed();
