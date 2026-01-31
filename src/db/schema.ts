import { pgTable, serial, text, integer, boolean, numeric, jsonb, index, customType, timestamp, uuid, pgEnum, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ------------------------------------------------------------------
// NEXTAUTH / AUTH.JS TABLES (DrizzleAdapter)
// Migration: drizzle/0001_chubby_spectrum.sql
// ------------------------------------------------------------------

export const roleEnum = pgEnum('role', ['user', 'admin']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'paid', 'shipped']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  password: text('password'),
  role: roleEnum('role').default('user'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const accounts = pgTable('accounts', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: integer('expires_at'),
  tokenType: text('token_type'),
  scope: text('scope'),
  idToken: text('id_token'),
  sessionState: text('session_state'),
}, (t) => ({
  pk: primaryKey({ columns: [t.provider, t.providerAccountId] }),
}));

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.identifier, t.token] }),
}));

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

// Backup table for PR4 attributes cleanup rollback (çöp key cleanup)
export const productVariantsAttributesBackup = pgTable('product_variants_attributes_backup', {
  variantId: integer('variant_id').primaryKey().references(() => productVariants.id, { onDelete: 'cascade' }),
  attributesBefore: jsonb('attributes_before').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

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

// ------------------------------------------------------------------
// CHECKOUT: ADDRESSES, ORDERS, ORDER ITEMS
// ------------------------------------------------------------------

export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), // 'Ev' | 'İş'
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(),
  city: text('city').notNull(),
  district: text('district').notNull(),
  addressLine: text('address_line').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  addressId: uuid('address_id')
    .notNull()
    .references(() => addresses.id, { onDelete: 'restrict' }),
  totalAmount: integer('total_amount').notNull(), // kuruş
  status: orderStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'restrict' }),
  quantity: integer('quantity').notNull(),
  price: integer('price').notNull(), // o anki fiyat (kuruş)
});

// Relations: User -> Many Addresses, User -> Many Orders
// Order -> One User, One Address, Many OrderItems
// OrderItem -> One Order, One Product

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  address: one(addresses, {
    fields: [orders.addressId],
    references: [addresses.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// ------------------------------------------------------------------
// WISHLIST / FAVORITES
// ------------------------------------------------------------------

export const wishlistItems = pgTable(
  'wishlist_items',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.productId] }),
    userIdx: index('wishlist_user_idx').on(t.userId),
  })
);

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  user: one(users, {
    fields: [wishlistItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlistItems.productId],
    references: [products.id],
  }),
}));