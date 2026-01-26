import { pgTable, serial, text, integer, boolean, numeric, jsonb, index, customType, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * ------------------------------------------------------------------
 * ARTI OPTİK V1 - VERİTABANI MİMARİSİ
 * ------------------------------------------------------------------
 * Strateji: Hibrit Yapı (Relational + JSONB)
 * Hedef: Lüks segment güneş gözlüğü, detaylı teknik filtreleme.
 *
 * KRİTİK NOT: Bu şemanın çalışması için veritabanında (Neon/Postgres)
 * şu komutun BİR KERE çalıştırılması gerekir:
 * CREATE EXTENSION IF NOT EXISTS ltree;
 */

// 1. PostgreSQL 'Ltree' Eklentisi Tanımı (Kategori Ağacı İçin)
// Drizzle'da native ltree desteği olmadığı için customType kullanıyoruz.
const ltree = customType<{ data: string }>({
  dataType() {
    return 'ltree';
  },
});

// ------------------------------------------------------------------
// TABLOLAR (TABLES)
// ------------------------------------------------------------------

// 1. MARKALAR (BRANDS)
// Ray-Ban, Prada, Versace gibi markaların tutulduğu tablo.
export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(), // Örn: 'Ray-Ban'
  slug: text('slug').notNull().unique(), // Örn: 'ray-ban'
  description: text('description'), // Marka hikayesi (Lüks algısı için)
  logoUrl: text('logo_url'), // S3 veya Public klasör yolu
  isActive: boolean('is_active').default(true),
});

// 2. KATEGORİLER (CATEGORIES - LTREE MİMARİSİ)
// Klasik ParentID yerine Path (Yol) mantığı.
// V1 Örnek Path: 'men.sunglasses' (max 2 seviye)
// Shape/Style bilgisi kategori değil, product_variants.attributes.shape attribute olarak saklanır
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // Örn: 'Sunglasses'
  slug: text('slug').notNull(), // Örn: 'sunglasses'
  
  // HİYERARŞİ BURADA:
  // V1: Root: 'men', Child: 'men.sunglasses' (max 2 seviye)
  // Shape/Style (aviator, wayfarer, vb.) kategori değil, attribute olarak saklanır
  path: ltree('path').notNull(), 
}, (t) => ({
  // GIST Index: Ağaç sorgularını (Alt kategorileri getir) fişek gibi yapar.
  pathIdx: index('categories_path_idx').using('gist', t.path),
}));

// 3. ÜRÜNLER (PRODUCTS - PARENT MODEL)
// Varyantlardan bağımsız ana ürün kimliği.
// Örn: "Ray-Ban Original Wayfarer" (Renk bağımsız)
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  brandId: integer('brand_id').references(() => brands.id).notNull(),
  categoryId: integer('category_id').references(() => categories.id).notNull(),
  
  name: text('name').notNull(), // Ürün Adı
  slug: text('slug').notNull().unique(), // URL slug (örn: 'ray-ban-original-wayfarer')
  description: text('description'), // SEO açıklaması
  
  // HEDEF KİTLE (Kategori ağacını destekler)
  gender: text('gender').notNull(), // 'men', 'women', 'unisex', 'kids' (V2 Hazır)
  
  // V1: productType sabit "sunglasses" (V2'de çocuk/lens/aksesuar eklenebilir)
  productType: text('product_type').notNull().default('sunglasses'), // 'sunglasses', 'kids', 'lens', 'accessories' (V2)
  
  // Seed importer için source bilgileri (ileride refresh için)
  sourceUrl: text('source_url'), // Scrape kaynak URL
  sourceData: jsonb('source_data'), // Breadcrumb ve diğer source metadata
  
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
  brandIdx: index('product_brand_idx').on(t.brandId),
  categoryIdx: index('product_category_idx').on(t.categoryId),
  slugIdx: index('product_slug_idx').on(t.slug),
}));

// 4. VARYANTLAR (VARIANTS - THE REAL ITEM)
// Asıl satılan, stoğu olan, rengi olan ürün.
// Örn: "Ray-Ban Wayfarer - Siyah Çerçeve / Yeşil Cam / 50mm"
export const productVariants = pgTable('product_variants', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  
  sku: text('sku').notNull().unique(), // Stok Kodu (RB-2140-901-50)
  price: numeric('price', { precision: 10, scale: 2 }).notNull(), // 15400.00
  stock: integer('stock').notNull().default(0),
  
  // Stok durumu için hızlı erişim (V1 SEO için)
  stockStatus: text('stock_status').default('in_stock'), // 'in_stock', 'out_of_stock', 'low_stock'
  
  // --- FİLTRELEME & TEKNİK ÖZELLİKLER (JSONB MAGIC) ---
  // Burası senin "Deep Research" raporundaki en kritik yer.
  // İçine şunlar gelecek:
  // {
  //   "color_frame": "Black",
  //   "color_lens": "G-15 Green",
  //   "material": "Acetate",  <-- Lüks filtresi
  //   "lens_tech": "Polarized", <-- Teknoloji filtresi
  //   "size_bridge": 22,
  //   "size_temple": 150,
  //   "vlt_category": "3"
  // }
  attributes: jsonb('attributes').notNull(),
  
  // Görseller (Array olarak)
  images: jsonb('images').default([]), 
  
  isFeatured: boolean('is_featured').default(false), // Vitrin ürünü mü?
}, (t) => ({
  // GIN Index: JSON içindeki "Polarize" kelimesini milisaniyede bulur.
  attributesIdx: index('variant_attributes_gin_idx').using('gin', t.attributes),
  priceIdx: index('variant_price_idx').on(t.price),
}));

// ------------------------------------------------------------------
// İLİŞKİLER (RELATIONS)
// ------------------------------------------------------------------

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
}));

export const variantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));