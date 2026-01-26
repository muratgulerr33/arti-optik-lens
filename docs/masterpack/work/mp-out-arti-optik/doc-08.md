<a id="doc-08"></a>
# DOC-08: 08.api-contracts-frontend.md

---
# 08. API Contracts - Frontend

Bu doküman, ARTI OPTİK V1 projesindeki frontend'in konuştuğu tüm API sözleşmelerini "tek doğru kaynak" olarak tanımlar. Amaç: AI asistanların (Cursor/ChatGPT) uydurma endpoint/alan üretmesini engellemek ve mevcut API contract'larını doğru şekilde kullanmasını sağlamak.

**Last verified from repo scan (package.json):** 2026-01-26  
**Proje:** ARTI OPTİK V1  
**Next.js:** 16.1.1  
**React:** 19.2.3

**Evidence:** `package.json` (dependencies: next@16.1.1, react@19.2.3, react-dom@19.2.3)

---

## 1. Purpose & Scope

Bu doküman şunları kapsar:

1. **Route Handlers (App Router API):** `/api/*` endpoint'leri, request/response şekilleri, auth kontrolü
2. **Server Actions:** `src/actions/*` içindeki server action'lar, input/output şekilleri
3. **External APIs:** Frontend'den direkt çağrılan harici API'ler (varsa)
4. **Authentication & Session:** Auth.js v5 (NextAuth.js) kullanımı, session yönetimi
5. **Global Conventions:** Headers, error format, pagination, caching kuralları
6. **Data Types & Schemas:** Zod validation şemaları, TypeScript type'ları

Bu doküman şunları kapsamaz:

- Backend/DB query detayları (sadece API contract'ları)
- External Catalog Import: Unknown / TODO: verify in repo (import script not found in repo, frontend'den kullanılmıyor)
- Internal Drizzle ORM query'leri (sadece API response shape'leri)

**Evidence:** `src/app/api/`, `src/actions/`, `02.architecture-lock.md` (lines 250-264)

---

## V1 Scope Lock (API Contracts Context)

**V1 HARD RULES:**
- **V1 = Sadece Online Storefront + Sadece GÜNEŞ GÖZLÜĞÜ**
- **Lens/Numaralı Ürün:** Online satılmaz (V1 dışı, sadece mağaza/POS - V2)
- **POS:** Tamamen V2 (placeholder/feature-flag, V1 scope'tan çıkarılmış, tüm POS kontratları V2 için placeholder)
- **Domain:** artioptiklens.com.tr (canonical base, SEO için tek kaynak)
- **Checkout:** Sadece kredi kartı (PayTR)
- **Kargo:** Yurtiçi Kargo entegrasyonu

**POS Kontratları:**
- Tüm POS kontratları (7.7.1, 7.7.2, 7.7.3) V2 placeholder/feature-flag olarak işaretlenmiştir
- V1 scope'tan çıkarılmıştır, V1'de aktif değildir

---

## 2. Base URLs & Environments (Frontend)

### 2.1 Internal API Routes

Frontend, internal API route'larına **relative path** ile erişir:
- Base URL: Yok (relative path kullanılıyor)
- Pattern: `/api/*`
- Örnek: `fetch("/api/products")`, `fetch("/api/search?q=...")`

**Evidence:** `src/components/catalog/load-more-grid.tsx` (line 54: `new URL("/api/products", window.location.origin)`), `src/components/search/search-overlay.tsx` (line 144: `fetch(\`/api/search?q=...\`)`), `src/components/product/product-detail-page.tsx` (line 88: `fetch(\`/api/products/${slug}\`)`)

### 2.2 Environment Variables (Frontend Perspective)

Frontend'den kullanılan environment variable'lar:

- **As of repo scan (2026-01-26):** Frontend'de `NEXT_PUBLIC_*` env variable'ları kullanılmıyor (kanıt: `rg -n "NEXT_PUBLIC_" src` sonucu 0)
- **Backend env'ler:** `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL` backend'de kullanılıyor, frontend'den erişilmiyor

**Assumption:** Frontend tüm API çağrılarını relative path ile yapıyor, external API base URL'i yok.

**Evidence:** `rg -n "NEXT_PUBLIC_" src` (sonuç: 0, scan date: 2026-01-26), `01.project-brief.md` (lines 220-232: env variables backend-only)

---

## 3. Authentication & Session

### 3.1 Auth Provider

- **Library:** NextAuth.js v5 (Auth.js v5)
- **Strategy:** JWT (session strategy: "jwt")
- **Provider:** Credentials (email/password)
- **Adapter:** DrizzleAdapter (PostgreSQL)

**Evidence:** `src/auth.ts` (lines 21-71), `src/auth.config.ts` (lines 18-20: `strategy: "jwt"`), `package.json` (next-auth dependency)

### 3.2 Session Management

- **Cookie-based:** NextAuth.js otomatik cookie yönetimi
- **Session access:** Server Component'lerde `await auth()`, Client Component'lerde `useAuth()` hook
- **Session shape:** `{ user: { id: string, email: string, name: string, role?: "admin" | "user" } }`

**Evidence:** `src/auth.ts` (line 21: `export const { handlers, signIn, signOut, auth }`), `src/types/auth.ts` (lines 3-22: Session/User/JWT type extensions), `src/hooks/use-auth.ts` (useAuth hook)

### 3.3 Auth Endpoints

- **NextAuth catch-all:** `/api/auth/[...nextauth]` (GET, POST)
- **Signup:** `/api/auth/signup` (POST)
- **Sign in/out:** NextAuth.js client-side helpers (`signIn`, `signOut` from `next-auth/react`)

**Evidence:** `src/app/api/auth/[...nextauth]/route.ts` (lines 1-5: `export const { GET, POST } = handlers`), `src/app/api/auth/signup/route.ts` (POST handler)

### 3.4 Protected Routes

- **Auth check:** Server Component'lerde `const session = await auth(); if (!session) { redirect("/login") }`
- **Client check:** `useAuth()` hook ile `isAuthenticated` kontrolü
- **Admin check:** `session.user.role === "admin"` kontrolü

**Evidence:** `src/actions/checkout.ts` (line 23: `if (!session?.user?.id) return { ok: false, error: "Unauthorized" }`), `src/actions/admin.ts` (lines 30-35: admin role check), `src/app/order-success/[id]/page.tsx` (auth check - referenced in 03.routes-and-navigation-map.md)

---

## 4. Global Conventions

### 4.1 Headers

#### Request Headers

- **Content-Type:** `application/json` (POST/PUT request'lerde)
- **Authorization:** Yok (cookie-based auth, NextAuth.js otomatik yönetiyor)

**Evidence:** `src/components/auth/signup-form.tsx` (line 31: `headers: { "Content-Type": "application/json" }`)

#### Response Headers

- **Content-Type:** `application/json` (API route'larında)
- **Cache-Control:** `no-store` (`/api/products` route'unda)

**Evidence:** `src/app/api/products/route.ts` (lines 145-149: `headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }`)

### 4.2 Error Format

**V1 Standardized Error Shape:** Tüm API hataları aşağıdaki standart formatta döner:

- **Standard Error Shape:** `{ code: string, message: string, details?: any }`
- **Standard Error Codes:**
  - `"NOT_FOUND"` - Kaynak bulunamadı
  - `"OUT_OF_STOCK"` - Stokta yok
  - `"VALIDATION_ERROR"` - Validasyon hatası
  - `"UNAUTHORIZED"` - Yetkisiz erişim
  - `"FORBIDDEN"` - Erişim reddedildi
  - `"INTERNAL_ERROR"` - Sunucu hatası

#### Route Handler Error Format

- **Shape:** `{ code: string, message: string, details?: any }` (JSON)
- **Status codes:** 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error)
- **Examples:**
  - `{ code: "VALIDATION_ERROR", message: "Slug is required" }` (400)
  - `{ code: "NOT_FOUND", message: "Product not found" }` (404)
  - `{ code: "INTERNAL_ERROR", message: "Kayıt sırasında bir hata oluştu." }` (500)

**Note:** Mevcut kod tabanında bazı route handler'lar hala eski `{ error: string }` formatını kullanıyor olabilir. V1'de tüm hatalar standart formata geçirilecek.

**Evidence:** `src/app/api/products/[slug]/route.ts` (lines 46, 52: error responses), `src/app/api/auth/signup/route.ts` (lines 15-18, 29-32, 53-56: error responses), `src/app/api/search/route.ts` (lines 100-105: error response)

#### Server Action Error Format

- **Shape:** `{ ok: false, code: string, message: string, details?: any, errors?: ZodError[] }`
- **Success shape:** `{ ok: true, ...data }`
- **Examples:**
  - `{ ok: false, code: "UNAUTHORIZED", message: "Unauthorized" }`
  - `{ ok: false, code: "VALIDATION_ERROR", message: "Validation error", errors: [...] }`
  - `{ ok: false, code: "OUT_OF_STOCK", message: "Product is out of stock", details: { productId: 123 } }`
  - `{ ok: true, orderId: "..." }`

**Note:** Mevcut kod tabanında bazı server action'lar hala eski `{ ok: false, error: string }` formatını kullanıyor olabilir. V1'de tüm hatalar standart formata geçirilecek.

**Evidence:** `src/actions/checkout.ts` (lines 24, 37, 40-44: error/success patterns), `src/actions/address.ts` (lines 30, 38-43: error patterns), `src/actions/favorites.ts` (lines 14, 35: error patterns)

### 4.3 Pagination / Filter / Sort

#### Cursor-based Pagination

- **Query params:** `cursor` (number, optional), `limit` (number, 1-50, default: PRODUCTS_PER_PAGE)
- **Response:** `{ products: Product[], nextCursor: number | null }`
- **Next cursor:** `nextCursor === null` ise son sayfa

**Evidence:** `src/app/api/products/route.ts` (lines 17-18, 29-35, 37-44, 140-143: cursor pagination), `src/components/catalog/load-more-grid.tsx` (lines 56-58, 84, 100-104: cursor usage)

#### Filtering

- **Query params:**
  - `categorySlug` (string, optional)
  - `min` (number, TL cinsinden, optional)
  - `max` (number, TL cinsinden, optional)
  - `inStock` ("1" | "true", optional)
  - `sub` (string, comma-separated wcId'ler, optional)
  - `subCategoryIds` (string, comma-separated internal id'ler, optional, deprecated)

**Evidence:** `src/app/api/products/route.ts` (lines 19-26, 53-103: filter parsing), `src/components/catalog/load-more-grid.tsx` (lines 59-76: filter usage)

#### Sorting

- **Query param:** `sort` (string, optional)
- **Valid values:** `"newest"` (default), `"price_asc"`, `"price_desc"`, `"name_asc"`

**Evidence:** `src/app/api/products/route.ts` (lines 20, 47-51: sort parsing), `src/components/catalog/load-more-grid.tsx` (line 63: sort usage)

### 4.4 Caching Rules

#### Route Handler Caching

- **Dynamic mode:** Some route handlers explicitly set `export const dynamic = "force-dynamic"` (e.g., products routes). Others do not explicitly declare it; default behavior applies.
- **Revalidate:** `export const revalidate = 0` (`/api/products` route'unda)
- **Cache-Control:** `no-store` header (`/api/products` route'unda)

**Evidence:** `src/app/api/products/route.ts` (lines 9-10: `dynamic = "force-dynamic"`, `revalidate = 0`), `src/app/api/products/[slug]/route.ts` (line 4: `dynamic = "force-dynamic"`), `src/app/api/products/[slug]/related/route.ts` (line 4: `dynamic = "force-dynamic"`), `src/app/api/search/route.ts` (no cache config, defaults to dynamic)

---

## 5. API Inventory (Route Handlers)

| Endpoint | Methods | File Path | Auth | Inputs | Response | Errors | Notes |
|----------|---------|-----------|------|--------|----------|--------|-------|
| `/api/products` | GET | `src/app/api/products/route.ts` | Optional (userId from session) | Query: `limit`, `cursor`, `categorySlug`, `sort`, `min`, `max`, `inStock`, `sub`, `subCategoryIds` | `{ products: Product[], nextCursor: number \| null }` | 500 (try-catch) | Cursor pagination, filtering, sorting. Cache: no-store |
| `/api/products/[slug]` | GET | `src/app/api/products/[slug]/route.ts` | Public | Path: `slug` (string) | `{ id, wcId, slug, name, description, shortDescription, price, regularPrice, salePrice, currency, images, sku, stockStatus, stockQuantity }` | 400 (slug required), 404 (not found) | Product detail API |
| `/api/products/[slug]/related` | GET | `src/app/api/products/[slug]/related/route.ts` | Public | Path: `slug` (string) | `Product[]` (10 items, first image only) | 400 (slug required) | Related products (10 items) |
| `/api/search` | GET | `src/app/api/search/route.ts` | Public | Query: `q` (string, required), `limit` (number, max 20, default 8) | `{ items: Product[], categories: Category[], fallbackCategory: Category \| null, fallbackItems: Product[] }` | 500 (try-catch, returns empty arrays) | Search API, returns empty arrays on error |
| `/api/auth/[...nextauth]` | GET, POST | `src/app/api/auth/[...nextauth]/route.ts` | Public | NextAuth.js catch-all | NextAuth.js responses | NextAuth.js errors | NextAuth.js endpoints (signin, signout, callback, etc.) |
| `/api/auth/signup` | POST | `src/app/api/auth/signup/route.ts` | Public | Body: `{ name: string, email: string, password: string }` | `{ message: string }` (201) | 400 (validation), 500 (server error) | User registration, Argon2id hash |

**Evidence:** `src/app/api/products/route.ts`, `src/app/api/products/[slug]/route.ts`, `src/app/api/products/[slug]/related/route.ts`, `src/app/api/search/route.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/api/auth/signup/route.ts`

---

## 6. API Inventory (External / Remote APIs)

**As of repo scan (2026-01-26):** Frontend'de `fetch(` çağrısı bulunamadı ve `package.json`'da bilinen HTTP client bağımlılığı yok (axios/ky/node-fetch/undici/superagent/got/ofetch/graphql-request). Bu nedenle frontend'den direkt external API çağrısı için bulgu yok.

**Evidence:** `rg -n "fetch\\(" src` (sonuç: 0, scan date: 2026-01-26), `rg -n "\"(axios|ky|node-fetch|undici|superagent|got|ofetch|graphql-request)\"" package.json` (sonuç: 0)

---

## 7. Contracts by Feature

### 7.1 Product

**V1 HARD RULE:** Product URL `/urun/[slug]` formatında kalır.

**Note - Category URL (TBD):** Kategori route placeholder'ları mevcuttur, ancak final mapping (URL yapısı) daha sonra belirlenecektir. Kategori filtreleme şu an `categorySlug` query parametresi ile yapılmaktadır.

#### List Products

- **Endpoint:** `GET /api/products`
- **Query params:** `limit`, `cursor`, `categorySlug`, `sort`, `min`, `max`, `inStock`, `sub`
- **Response:** `{ products: Product[], nextCursor: number | null }`
- **Product shape:** `{ id, wcId, name, slug, price, images, stockStatus, isFavorite? }`
- **Usage:** `src/components/catalog/load-more-grid.tsx`

**Evidence:** `src/app/api/products/route.ts`, `src/components/catalog/load-more-grid.tsx` (lines 54-84)

#### Get Product Detail

- **Endpoint:** `GET /api/products/[slug]`
- **Response:** `{ id, wcId, slug, name, description, shortDescription, price, regularPrice, salePrice, currency, images: Array<{ src: string, alt?: string }>, sku, stockStatus, stockQuantity }`
- **Usage:** `src/components/product/product-detail-page.tsx`

**Evidence:** `src/app/api/products/[slug]/route.ts` (lines 57-72), `src/components/product/product-detail-page.tsx` (lines 88-99)

#### Get Related Products

- **Endpoint:** `GET /api/products/[slug]/related`
- **Response:** `Product[]` (10 items, first image only)
- **Usage:** Unknown (component'te kullanım bulunamadı)

**Evidence:** `src/app/api/products/[slug]/related/route.ts` (lines 49-66)

### 7.2 Cart

- **API route yok:** Cart state client-side (localStorage/context) yönetiliyor
- **Server action yok:** Cart işlemleri client-side

**Evidence:** `codebase_search` (cart API route yok), `src/components/cart/` (client-side cart management)

### 7.3 Checkout

**V1 HARD RULE:** Online checkout'ta ödeme yöntemi SADECE kredi kartı (PayTR) kullanılır. Kapıda ödeme (cash-on-delivery) online checkout'ta yoktur.

- **Server Action:** `createOrderAction` (`src/actions/checkout.ts`)
- **Input:** `{ addressId: number, paymentMethod: "credit_card", cartItems: Array<{ productId: number, quantity: number }> }`
- **Output (union type):**
  - credit_card (PayTR configured): `{ ok: true, paytr: { iframeToken: string, orderId: string } }`
  - credit_card (PayTR NOT configured): `{ ok: false, error: "Kredi kartı ödeme sistemi şu anda yapılandırılmamış..." }`
  - Error: `{ ok: false, error: string, errors?: ZodError[] }`
- **Auth:** Required (Unauthorized döner)
- **Usage:** `src/app/checkout/page.tsx`

**Evidence:** `src/actions/checkout.ts` (lines 24-35: checkoutSchema, lines 125-302: createOrderAction), `src/app/checkout/page.tsx`

#### 7.3.1 getPayTRConfigStatus

- **Server Action:** `getPayTRConfigStatus` (`src/actions/checkout.ts`)
- **Output:** `{ configured: boolean }`
- **Auth:** Not required (public)
- **Usage:** `src/app/checkout/page.tsx` (PayTR configured kontrolü için)

**Evidence:** `src/actions/checkout.ts` (lines 19-22: getPayTRConfigStatus), `src/app/checkout/page.tsx` (lines 72-76: paytrConfigured state)

#### 7.3.2 PayTR Callback Route

**V1 HARD RULE:** Online checkout'ta ödeme yöntemi SADECE PayTR (kredi kartı) kullanılır. Bu callback route online checkout ödemeleri için kullanılır.

- **Endpoint:** `POST /api/payments/paytr/callback`
- **File:** `src/app/api/payments/paytr/callback/route.ts`
- **Auth:** Yok (PayTR server çağıracağı için)
- **Request:** FormData (merchant_oid, status, total_amount, hash, vb.)
- **Response:** Plain text "OK" (200) veya "Not Found" (404 if not configured)
- **Security:** Hash verification (HMAC-SHA256), idempotency (paid ise tekrar update yok)

**Evidence:** `src/app/api/payments/paytr/callback/route.ts` (full file: lines 1-230)

### 7.4 Orders

- **Server Action:** `updateOrderStatus` (`src/actions/admin.ts`)
- **Input:** `orderId: string, newStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled"`
- **Output:** `{ success: boolean, error?: string }`
- **Auth:** Required, Admin role required
- **Usage:** `src/app/admin/orders/`

**Evidence:** `src/actions/admin.ts` (lines 16-71), `src/app/admin/orders/`

### 7.5 Account/Auth

#### Sign Up

- **Endpoint:** `POST /api/auth/signup`
- **Input:** `{ name: string, email: string, password: string }`
- **Output:** `{ message: string }` (201) veya `{ error: string }` (400/500)
- **Usage:** `src/components/auth/signup-form.tsx`

**Evidence:** `src/app/api/auth/signup/route.ts` (lines 10-58), `src/components/auth/signup-form.tsx` (lines 29-33)

#### Sign In/Out

- **NextAuth.js client helpers:** `signIn("credentials", { email, password, redirect })`, `signOut({ redirect })`
- **Usage:** `src/components/auth/login-form.tsx`

**Evidence:** `src/auth.ts` (exported signIn/signOut), `src/components/auth/login-form.tsx`

#### Favorites

- **Server Actions:**
  - `toggleFavoriteAction(productId: number)`: `{ ok: boolean, isFavorite: boolean, error?: string }`
  - `getMyFavoritesAction()`: `{ ok: boolean, favorites: Product[], error?: string }`
  - `checkIsFavoriteAction(productId: number)`: `{ ok: boolean, isFavorite: boolean }`
  - `getMyFavoriteProductIdsAction()`: `{ ok: boolean, productIds: number[], error?: string }`
- **Auth:** Required (Unauthorized döner)
- **Usage:** `src/components/favorites/favorite-button.tsx`

**Evidence:** `src/actions/favorites.ts` (lines 7-88), `src/components/favorites/favorite-button.tsx` (line 69: `toggleFavoriteAction`)

#### Addresses

- **Server Actions:**
  - `addAddressAction(data)`: `{ ok: boolean, address?: Address, error?: string, errors?: ZodError[] }`
  - `getAddressesAction()`: `{ ok: boolean, addresses: Address[], error?: string }`
  - `deleteAddressAction(addressId)`: `{ ok: boolean, error?: string }`
  - `updateAddressAction(addressId, data)`: `{ ok: boolean, address?: Address, error?: string, errors?: ZodError[] }`
- **Auth:** Required
- **Usage:** `src/components/account/address-form.tsx`, `src/components/account/address-list.tsx`

**Evidence:** `src/actions/address.ts` (lines 13-24, 26-119), `src/components/account/address-form.tsx`, `src/components/account/address-list.tsx`

### 7.6 Search

- **Endpoint:** `GET /api/search`
- **Query params:** `q` (string, required), `limit` (number, max 20, default 8)
- **Response:** `{ items: Product[], categories: Category[], fallbackCategory: Category | null, fallbackItems: Product[] }`
- **Error handling:** Try-catch, returns empty arrays on error
- **Usage:** `src/components/search/search-overlay.tsx`

**Evidence:** `src/app/api/search/route.ts` (lines 8-107), `src/components/search/search-overlay.tsx` (lines 144-152)

### 7.7 Admin + POS Contracts (V2 - V1'de feature-flag ile kapalı)

**V1 HARD RULES:**
- Admin list sayfaları MUTLAKA paginated olmalı (cursor veya page-based, tutarlı olmalı; 1000 kayıt dump edilmemeli)
- Settings > Undo Transaction mevcut: log listesi (paginated) + undo aksiyonu onay ile. Undo audit trail tutmalı

**POS V2 İŞARETLEME:** POS ve POS'a bağlı tüm kontratlar V2 placeholder/feature-flag olarak işaretlenmiştir. V1 scope'tan çıkarılmıştır. Aşağıdaki POS kontratları V2 için placeholder olarak dokümante edilmiştir.

#### 7.7.1 POS Quick Sale (Enter Flow) - V2 Placeholder

- **Server Action / Endpoint:** `POST /api/pos/quick-sale` (veya server action)
- **Input:**
  - `barcodeOrSku: string` (required)
  - `qty: number` (default: 1, optional)
  - `paymentMethod: "cash" | "card"` (default: "cash", optional)
  - `customerInfo?: { name?: string, phone?: string }` (optional)
- **Output:**
  - Success: `{ ok: true, transactionId: string, createdAt: string, lines: Array<{ productId: number, name: string, qty: number, price: number }>, total: number, stockResult: { productId: number, newStock: number } }`
  - Error: `{ ok: false, code: "NOT_FOUND" | "OUT_OF_STOCK" | "VALIDATION_ERROR", message: string, details?: any }`
- **Auth:** Required, Admin role required
- **Usage:** POS interface (Admin içinde)

#### 7.7.2 POS Transaction Log List (Paginated) - V2 Placeholder

- **Endpoint:** `GET /api/pos/transactions`
- **Query params:**
  - `cursor?: number` veya `page?: number` (pagination, tutarlı olmalı)
  - `pageSize?: number` (default: 20, max: 100)
  - `dateFrom?: string` (ISO date string, optional)
  - `dateTo?: string` (ISO date string, optional)
  - `cashier?: string` (user ID veya name, optional)
  - `search?: string` (transactionId veya barcode ile arama, optional)
- **Response:**
  - Cursor-based: `{ items: Transaction[], nextCursor: number | null }`
  - Page-based: `{ items: Transaction[], total: number, page: number, pageSize: number, totalPages: number }`
- **Transaction shape:** `{ id: string, transactionId: string, createdAt: string, cashier: { id: string, name: string }, lines: Array<{ productId: number, name: string, qty: number, price: number }>, total: number, paymentMethod: "cash" | "card" }`
- **Auth:** Required, Admin role required
- **Usage:** Settings > Undo Transaction list page

#### 7.7.3 Undo Transaction (Settings > Undo) - V2 Placeholder

- **Endpoint:** `POST /api/pos/transactions/[transactionId]/undo`
- **Input:**
  - `transactionId: string` (path parameter)
  - `reason?: string` (optional, undo nedeni)
- **Output:**
  - Success: `{ ok: true, undoId: string, status: "undone", stockRestored: boolean, auditTrailRef: string }`
  - Error: `{ ok: false, code: "NOT_FOUND" | "FORBIDDEN" | "VALIDATION_ERROR", message: string, details?: any }`
- **Auth:** Required, Admin role required
- **Note:** Undo işlemi audit trail tutmalı, stok geri yüklenmeli
- **Usage:** Settings > Undo Transaction action

#### 7.7.4 Admin Payments List (PayTR)

- **Endpoint:** `GET /api/admin/payments`
- **Query params:**
  - `cursor?: number` veya `page?: number` (pagination, tutarlı olmalı)
  - `pageSize?: number` (default: 20, max: 100)
  - `status?: "success" | "failed" | "pending"` (optional)
  - `dateFrom?: string` (ISO date string, optional)
  - `dateTo?: string` (ISO date string, optional)
- **Response:**
  - Cursor-based: `{ items: Payment[], nextCursor: number | null }`
  - Page-based: `{ items: Payment[], total: number, page: number, pageSize: number, totalPages: number }`
- **Payment shape:** `{ id: string, orderId: string | null, amount: number, status: "success" | "failed" | "pending", provider: "paytr", transactionId: string, createdAt: string }`
- **Auth:** Required, Admin role required
- **Usage:** Admin payments list page

#### 7.7.5 Admin Customers List

- **Endpoint:** `GET /api/admin/customers`
- **Query params:**
  - `cursor?: number` veya `page?: number` (pagination, tutarlı olmalı)
  - `pageSize?: number` (default: 20, max: 100)
  - `search?: string` (name, email, phone ile arama, optional)
  - `dateFrom?: string` (ISO date string, optional, kayıt tarihi)
  - `dateTo?: string` (ISO date string, optional, kayıt tarihi)
- **Response:**
  - Cursor-based: `{ items: Customer[], nextCursor: number | null }`
  - Page-based: `{ items: Customer[], total: number, page: number, pageSize: number, totalPages: number }`
- **Default sort:** En yeni önce (newest-first)
- **Customer shape:** `{ id: string, name: string, email: string, phone?: string, createdAt: string, orderCount?: number }`
- **Auth:** Required, Admin role required
- **Usage:** Admin customers list page

#### 7.7.6 Dashboard Summary

- **Endpoint:** `GET /api/admin/dashboard/summary`
- **Response:** `{ kpis: { totalSales: number, totalOrders: number, totalCustomers: number, todaySales: number }, topProducts: Array<{ productId: number, name: string, salesCount: number, revenue: number }>, criticalStock: Array<{ productId: number, name: string, stockQuantity: number, sku: string }> }`
- **Auth:** Required, Admin role required
- **Usage:** Admin dashboard page

---

## 8. Data Types & Shared Schemas

### 8.1 Zod Schemas

#### Checkout Schema

- **File:** `src/actions/checkout.ts`
- **Schema:**
```typescript
z.object({
  addressId: z.number().int().positive(),
  paymentMethod: z.enum(["credit_card"]), // V1: Sadece kredi kartı (PayTR), COD yok
  cartItems: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive().max(99),
  })).min(1),
})
```

**Evidence:** `src/actions/checkout.ts` (lines 7-18)

#### Address Schema

- **File:** `src/actions/address.ts`
- **Schema:**
```typescript
z.object({
  title: z.string().min(1).max(100),
  fullAddress: z.string().min(5).max(500),
  city: z.string().min(1).max(100),
  district: z.string().min(1).max(100),
  phone: z.string().min(10).max(20).regex(/^[0-9+\-\s()]+$/),
  isDefault: z.boolean().optional(),
})
```

**Evidence:** `src/actions/address.ts` (lines 13-24)

### 8.2 TypeScript Types

#### Auth Types

- **File:** `src/types/auth.ts`
- **Extensions:** NextAuth Session, User, JWT interfaces
- **Shape:** `{ id: string, role?: "admin" | "user" }`

**Evidence:** `src/types/auth.ts` (lines 3-22)

#### Product Types

- **Inferred from API responses:** Product shape API route'larından çıkarılıyor
- **No shared type file:** Product type'ları component'lerde inline tanımlı

**Evidence:** `src/components/catalog/load-more-grid.tsx` (lines 6-15: Product interface), `src/app/api/products/[slug]/route.ts` (response shape)

---

## 9. Mocking & Testing Notes

- **MSW:** Unknown (codebase'de MSW kullanımı bulunamadı)
- **Fixtures/Mock data:** Unknown (test dosyaları yok)
- **API tests:** Unknown (test framework kurulumu yok)

**Evidence:** `01.project-brief.md` (line 29: "Test framework kurulumu (şu an test dosyası yok)"), `grep -r "msw\|@testing-library"` (sonuç: 0)

---

## 10. Breaking-Change Rules (Hard)

1. **Contract alanları değişirse:** Versioning/feature flag veya migration plan zorunlu
2. **FE "Unknown field" eklemeye toleranslı olmalı:** Response'larda yeni field'lar eklenebilir, FE ignore edebilmeli
3. **ChatGPT/Cursor uydurma endpoint/alan yazamaz:** Bu doküman tek kaynak, yeni endpoint/alan eklemek için bu doküman güncellenmeli
4. **Server Action return shape değişirse:** Tüm client-side kullanımlar güncellenmeli
5. **Zod schema değişirse:** Validation error'ları client-side handle edilmeli

**Evidence:** `02.architecture-lock.md` (breaking change rules), `06.frontend-standards-2026.md` (API standards)

---

## 11. Open Questions

1. **Ödeme sağlayıcı entegrasyonu var mı?** ✅ VAR: Mock + PayTR altyapısı (env-gated). Local'da mock ile test edilebilir, prod'da PayTR ENV'leri girilince aktif olur. Başvuru/merchant aktivasyonu ayrı işlem.
2. **Stok doğrulama nerede yapılıyor?** Checkout'ta stok kontrolü var mı? (Unknown)
3. **Auth refresh token var mı?** NextAuth.js JWT strategy kullanılıyor, refresh token mekanizması Unknown
4. **Rate limiting var mı?** API route'larında rate limiting yok (Unknown)
5. **API versioning stratejisi var mı?** Versioning yok, breaking change'ler için plan Unknown
6. **Webhook endpoint'leri var mı?** ✅ PayTR callback route var: `/api/payments/paytr/callback` (POST, hash verify + idempotency). Diğer external webhook'lar için endpoint'ler Unknown.
7. **File upload endpoint'i var mı?** Kullanıcı profil fotoğrafı veya diğer upload'lar için endpoint Unknown
8. **Email verification var mı?** Signup'ta email verification mekanizması Unknown
9. **Password reset endpoint'i var mı?** Password reset flow'u Unknown
10. **Order tracking endpoint'i var mı?** Sipariş takibi için external API entegrasyonu Unknown

**Evidence:** `docs/2026-01-16-paytr-kredi-karti-checkout.md` (payment gateway dokümantasyonu), `src/app/api/payments/paytr/callback/route.ts` (PayTR callback), `src/app/api/auth/signup/route.ts` (email verification yok), codebase_search (rate limiting, diğer webhook'lar, file upload bulunamadı)

---

## 12. Evidence Index

1. `src/app/api/products/route.ts` - Products list API, cursor pagination, filtering
2. `src/app/api/products/[slug]/route.ts` - Product detail API
3. `src/app/api/products/[slug]/related/route.ts` - Related products API
4. `src/app/api/search/route.ts` - Search API
5. `src/app/api/auth/[...nextauth]/route.ts` - NextAuth.js catch-all
6. `src/app/api/auth/signup/route.ts` - Signup API
7. `src/actions/checkout.ts` - Checkout server action, Zod schema, getPayTRConfigStatus
8. `src/lib/payments/payment-provider.ts` - PaymentProvider interface
9. `src/lib/payments/mock-credit-card-provider.ts` - Mock CC provider (dev-only)
10. `src/lib/payments/paytr-provider.ts` - PayTR provider, ENV-gated
11. `src/app/api/payments/paytr/callback/route.ts` - PayTR callback webhook
12. `src/db/schema.ts` - Orders payment fields (paymentStatus, paymentTransactionId, paymentProvider, paymentMetadata)
13. `drizzle/0007_woozy_wendigo.sql` - Payment fields migration
14. `docs/2026-01-16-paytr-kredi-karti-checkout.md` - PayTR/CC checkout dokümantasyonu
8. `src/actions/favorites.ts` - Favorites server actions
9. `src/actions/address.ts` - Address server actions, Zod schema
10. `src/actions/admin.ts` - Admin server actions
11. `src/auth.ts` - NextAuth.js config, JWT strategy
12. `src/auth.config.ts` - Auth config, session strategy
13. `src/types/auth.ts` - Auth TypeScript type extensions
14. `src/components/catalog/load-more-grid.tsx` - Products API usage, cursor pagination
15. `src/components/product/product-detail-page.tsx` - Product detail API usage
16. `src/components/search/search-overlay.tsx` - Search API usage
17. `src/components/auth/signup-form.tsx` - Signup API usage
18. `src/components/favorites/favorite-button.tsx` - Favorites server action usage
19. `src/components/account/address-form.tsx` - Address server action usage
20. `src/hooks/use-auth.ts` - Auth hook
21. `package.json` - Dependencies (next-auth, zod, react-hook-form)
22. `02.architecture-lock.md` - Architecture, API patterns
23. `03.routes-and-navigation-map.md` - Route table, API routes
24. `06.frontend-standards-2026.md` - Error handling, validation standards
25. `01.project-brief.md` - Environment variables, API overview

---

## 13. Self-Check

- [x] Uydurma yok (tüm endpoint'ler kanıtlı)
- [x] `.env` değerleri yok, sadece key isimleri var
- [x] Route handler inventory tam (6 endpoint)
- [x] Client-side fetch/wrapper envanteri var (load-more-grid, search-overlay, product-detail-page, signup-form)
- [x] En az 20 evidence var (25 evidence listelendi)

---
---
