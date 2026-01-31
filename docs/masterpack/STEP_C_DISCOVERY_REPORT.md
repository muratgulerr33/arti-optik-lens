# STEP C – Keşif Raporu (Hub + L2 Katalog + Filter Bar)

**Amaç:** Repo’da hub (Home merkezli L1) + L2 liste/katalog + Filter Bar (facet) için mevcut durum haritası, boşluk listesi ve minimum altyapı önerisi.

**Aranan dosyalar:** `src/app/**`, `src/components/**`, `src/db/schema.ts`, `src/app/api/**`, `tools/seed/**`, `package.json`.

---

## 1. Route Map

| Hedef (DOC-01/03) | Mevcut | Tam path / Not |
|-------------------|--------|-----------------|
| Home | Var | `src/app/page.tsx` — Hero banners, brand grid, featured products (DB’den 8 ürün). |
| Hub (merkez L1) | **Yok** | Aranan: `src/app/hub/page.tsx`, `src/app/hub/[hubSlug]/page.tsx`. Sonuç: 0 dosya. **Unknown:** `find src/app -maxdepth 4 -type f -name "page.tsx"` ile kontrol edildi; `hub` klasörü yok. |
| Kategori / Liste (L2) | Var (farklı yapı) | `src/app/kategori/[gender]/gunes-gozlugu/page.tsx` — L1 = URL’de gender (kadin/erkek/unisex), sabit alt segment `gunes-gozlugu`. Server component ile DB’den ürün çekiyor, `CategoryContent` client’a iletiyor. |
| Ürün detay | Var | `src/app/urun/[slug]/page.tsx` — Slug ile tek ürün + ilk varyant; breadcrumb, gallery, product-info, add-to-cart. |

**Ek route’lar (katalog dışı):** `src/app/search/page.tsx`, `src/app/checkout/page.tsx`, `src/app/hesabim/**`, `src/app/auth/login|register`, `src/app/design/page.tsx`, `src/app/workshop/page.tsx`.

---

## 2. Component Map (Filter / Katalog UI)

| DOC-07 / Hedef isim | Repo’da | Path / Kullanım |
|---------------------|--------|------------------|
| CatalogControls | **Yok** | Aranan: `rg "CatalogControls" src/components src/app`. Sonuç: 0. Birebir bu isimde component yok. |
| **PLPToolbar** | Var | `src/components/catalog/plp-toolbar.tsx` — “Sırala” + “Filtrele” butonları, `FilterSheet` ve `SortSheet` açıyor; ürün sayısı gösteriyor. Kullanım: `src/app/kategori/[gender]/gunes-gozlugu/category-content.tsx`. |
| ActiveFiltersBar | Var | `src/components/catalog/active-filters-bar.tsx` — URL’den `gender`, `minPrice`, `maxPrice`, `inStock` okuyup badge’lerle gösteriyor; tek tıkla kaldırıyor. Kullanım: `category-content.tsx` içinde PLPToolbar altında. |
| FilterBar (üst bar) | **Yok** | Aranan: `rg "FilterBar|FiltersBar" src`. Sonuç: 0. Birebir “FilterBar” yok. |
| **FilterSheet** | Var | `src/components/catalog/filter-sheet.tsx` — Alt sheet; Cinsiyet (kadin/erkek/unisex), Fiyat (min/max ₺), Stokta checkbox. Facet (shape/material/polarize/uv) yok. |

**Katalog bileşenleri:** `product-grid.tsx`, `product-card.tsx`, `sort-sheet.tsx` — `src/components/catalog/` altında.

---

## 3. API Param Listesi (Gerçekte)

| DOC-08 / Beklenen | Endpoint | Gerçek durum |
|-------------------|----------|--------------|
| `/api/products` (filtre/sort/pagination) | **Yok** | Aranan: `src/app/api/**`. Mevcut: `src/app/api/search/route.ts`, `src/app/api/auth/[...nextauth]/route.ts`. `api/products` route’u yok. **Unknown:** DOC-08’de bahsedilen products endpoint’i bu repo’da bulunamadı. |
| `/api/search` | Var | `src/app/api/search/route.ts`. **Query params:** `q` (metin, trim), `limit` (default 8, max 20). **Başka param yok:** min/max/inStock/categorySlug/sort/brand/shape/material/polarize/uv — hiçbiri parse edilmiyor. |
| DB tarafı filtre (search) | — | Sadece `ilike(products.name)` ve `ilike(brands.name)`; category, gender, price, stock, attributes filtresi yok. |

**Ürün listesi nereden geliyor?** Kategori sayfası ve Home, doğrudan server component içinde Drizzle ile çekiyor; liste için ayrı bir REST `/api/products` yok.

---

## 4. DB Schema Özet (Gerçekte)

**Dosya:** `src/db/schema.ts`.

- **brands:** id, name, slug, description, logoUrl, isActive.  
- **categories:** id, name, slug, path (ltree). Yorum: shape/style kategori değil, `product_variants.attributes` içinde.  
- **products:** id, brandId, categoryId, name, slug, description, gender, productType, sourceUrl, sourceData, createdAt.  
- **product_variants:** id, productId, sku, price, stock, stockStatus, **attributes (jsonb, notNull)**, images, isFeatured.  
  - Şema yorumunda attributes örnekleri: `color_frame`, `color_lens`, `material`, `lens_tech` (Polarized), `size_bridge`, `size_temple`, `vlt_category`.  
  - GIN index: `variant_attributes_gin_idx` on `attributes`.  
- **İlişkiler:** products → brand, category; products → variants. Marka: `brands` var, ürünle `products.brandId` ile bağlı.

**Facet alanları (shape, polarize, uv, material, color):** Kolon yok; hepsi `product_variants.attributes` JSONB içinde tasarlanmış. Anahtarlar şemada sabit değil; yorumda material, lens_tech, vlt_category geçiyor. Gerçek key’ler seed/import’a bağlı.

---

## 5. Seed / Brand Kaynakları

| Kaynak | Var mı? | Açıklama |
|--------|---------|----------|
| `tools/seed/input/v1-seed.sample.json` | Var | Örnek ürünlar; her item’da `brand` string (Ray-Ban, Oakley, …). Ayrı “brand listesi” array’i yok. `attributes`: color_frame, color_lens, material, lens_tech, size_bridge, size_temple. |
| `tools/seed/seed-brands.mjs` | Var | 17 marka sabit listesi (BRAND_SEEDS); `brands` tablosuna insert, `onConflictDoNothing` ile slug üzerinden idempotent. |
| package.json `seed:brands` | Var | `"seed:brands": "tsx tools/seed/seed-brands.mjs"`. |
| package.json `db:generate` / `db:migrate` / `db:extensions` | Var | `db:generate`, `db:migrate`, `db:extensions` tanımlı. |
| Brand listesi “nereden geliyor”? | — | Tablo: `brands`; seed: `seed-brands.mjs` (17 marka). Ürün import’u: `seed-import-bundle-v1.mjs` brands tablosundan slug ile eşleştiriyor. |

---

## 6. Gap Listesi (Yeni Karar vs Mevcut Repo)

**Yeni karar seti (referans):**

- Home = Hub merkezi (L1).
- L1: Erkek / Kadın / Unisex + Markalar + banner’lar kataloglara götürür.
- L2: En üstte Filter Bar; hiyerarşi + nitelik facet filtreleme.
- Toplam 2 seviye.

### 6.1 Mevcut Olanlar (tam path + kısa açıklama)

- `src/app/page.tsx` — Home; hero, marka grid, öne çıkan ürünler.
- `src/app/kategori/[gender]/gunes-gozlugu/page.tsx` — Cinsiyet bazlı L2 katalog; DB’den ürün, client’ta URL ile fiyat/stok filtreleri.
- `src/app/urun/[slug]/page.tsx` — Ürün detay.
- `src/components/catalog/plp-toolbar.tsx` — Toolbar (sırala + filtrele).
- `src/components/catalog/active-filters-bar.tsx` — Aktif filtre badge’leri (gender, minPrice, maxPrice, inStock).
- `src/components/catalog/filter-sheet.tsx` — Filtre UI (cinsiyet, fiyat, stok); facet (shape/material/polarize/uv) yok.
- `src/components/catalog/product-grid.tsx`, `product-card.tsx`, `sort-sheet.tsx` — Liste/sıralama UI.
- `src/db/schema.ts` — products, product_variants, brands, categories; variants.attributes (jsonb) facet’e uygun altyapı.
- `src/app/api/search/route.ts` — Sadece arama (q, limit).
- `tools/seed/seed-brands.mjs` + `seed:brands` — Marka seed’i.
- `tools/seed/input/v1-seed.sample.json` — Örnek bundle; attributes’ta material, lens_tech vb. var.

### 6.2 Eksikler

- **Hub route’ları:** `/hub`, `/hub/[hubSlug]` yok. L1 “hub merkezi” için ayrı route yok; şu an sadece Home var.
- **DOC-07 “CatalogControls”:** Bu isimde component yok; işlev PLPToolbar + FilterSheet ile kısmen karşılanıyor.
- **“Filter Bar” (üst bar):** Birebir isimde yok; FilterSheet alt sheet olarak var, üstte sabit facet bar yok.
- **Facet filtre (shape, material, polarize, uv):**  
  - **UI:** FilterSheet’te yok; sadece gender, fiyat, stok.  
  - **API:** `/api/products` olmadığı için facet query param’ları yok. Liste şu an sayfa bazlı server component’ten geliyor.  
  - **DB:** attributes (jsonb) var, GIN index var; ancak API/UI bu alanlara göre filtrelemiyor.
- **`/api/products`:** DOC-08’deki contract (min/max/inStock/categorySlug/sort/facet) için endpoint yok.

### 6.3 Tutarsız / Belirsiz Doküman Noktaları

- **DOC-01/03 route standardı:** `/hub/*`, `/kategori/*`, `/urun/[slug]` deniyor. Repo’da `/hub/*` yok; kategori path’i `/kategori/[gender]/gunes-gozlugu` şeklinde (L1 = gender, sabit “gunes-gozlugu”).
- **DOC-08:** `/api/products` filtre/sort/pagination contract’ı anlatılıyor; repo’da bu endpoint yok, yerine sadece `/api/search` (q, limit) var.

### 6.4 Minimum Altyapı Önerisi (sadece başlıklar)

1. **Route:** İstenirse L1 için `/hub` (ve gerekirse `/hub/[hubSlug]`) eklenmeli; “Home = Hub” ise mevcut `/` yeterli sayılıp sadece dokümantasyon netleştirilebilir.
2. **DB:** Mevcut schema facet’e uygun (attributes jsonb + GIN). Eksikse attribute key’leri (shape, material, lens_tech, vlt_category vb.) seed/import ile standartlaştırılmalı.
3. **API:** Katalog listesi için `/api/products` (veya mevcut kategori sayfasının backend’i) genişletilmeli; query params: categorySlug/gender, minPrice, maxPrice, inStock, sort, **facet params** (shape, material, polarize, uv vb.). Böylece Filter Bar / FilterSheet bu API’yi kullanabilir.
4. **UI:** FilterSheet’e facet blokları (shape, material, polarize, uv) eklenmeli; isim “Filter Bar” olarak sabit üst bar mı isteniyor, yoksa mevcut sheet yeterli mi, product/ux kararına bırakılmalı.
5. **Sıra önerisi:** DB attribute tutarlılığı → API’de facet + listeleme contract → UI’da facet filtreleri. Route (hub) ihtiyaca göre önce veya sonra.

---

## 7. Evidence / Aranân Yerler

- Route: `list_dir src/app`, `find src/app -maxdepth 4 -type f -name "page.tsx"`, `glob **/hub/**/*`.
- UI: `rg "CatalogControls|ActiveFiltersBar|FilterBar|FiltersBar" src/components src/app`.
- API: `list_dir src/app/api`, `rg "searchParams|\.get\(|req\.nextUrl" src/app/api`, `src/app/api/search/route.ts` tam okuma.
- DB: `src/db/schema.ts` tam okuma, `rg "product_variants|products|brands|attributes|..." src/db/schema.ts`.
- Seed: `ls tools/seed tools/seed/input`, `rg "seed:brands|db:generate|db:migrate" package.json`, `rg "brands" tools/seed`, `v1-seed.sample.json` ve `seed-brands.mjs` okuma.

**Uydurma yok:** Bulunamayan her öğe için “Yok” veya “Unknown” ve hangi dosya/komutla arandığı yukarıda belirtildi.
