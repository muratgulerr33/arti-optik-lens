# Search/Filter doğrulama dedektifliği — Attributes & keys raporu

Bu rapor, plandaki 4 maddeye göre yapılan incelemenin çıktısıdır: key listesi, hangi dosyada kullanıldığı ve yanlış tabloya bakılıp bakılmadığı.

---

## 1. `attributes->>'shape'` kullanımı — Hangi dosyalar? products mi product_variants mi?

**Sonuç: Tüm kullanımlar `product_variants` tablosuna referans.**

| Dosya | Kullanım | Tablo |
|-------|----------|--------|
| [src/app/api/search/route.ts](src/app/api/search/route.ts) | `product_variants.attributes->>'shape' ILIKE ...` | product_variants |
| [src/lib/api/products.ts](src/lib/api/products.ts) | `product_variants.attributes->>'shape' = ${s}` | product_variants |
| [scripts/db-xray.ts](scripts/db-xray.ts) | `attributes->>'shape'` (FROM product_variants) | product_variants |

**Özet:** `products` tablosunda `attributes` kolonu yok; şema yalnızca `product_variants.attributes` (JSONB) kullanıyor. Yanlış tabloya bakılmıyor.

---

## 2. Key kullanımı: color_frame, color_lens, material, feature_lens, cam_ozelligi, ekartman, size

### 2.1 Hangi dosyada hangi key kullanılıyor?

| Key | Kullanıldığı yerler | Tablo / kaynak |
|-----|----------------------|-----------------|
| **color_frame** | [src/lib/api/products.ts](src/lib/api/products.ts) (filtre), [src/app/api/search/route.ts](src/app/api/search/route.ts) (arama), [active-filters-bar.tsx](src/components/catalog/active-filters-bar.tsx), [gunes-gozlugu/page.tsx](src/app/[gender]/gunes-gozlugu/page.tsx), [product-specs.tsx](src/components/product/product-specs.tsx), [product-attributes.tsx](src/components/product/product-attributes.tsx) | product_variants |
| **color_lens** | products.ts (filtre), active-filters-bar, gunes-gozlugu/page, product-specs, product-attributes | product_variants |
| **material** | products.ts (filtre), search/route (ILIKE), active-filters-bar, gunes-gozlugu/page, product-specs, product-attributes | product_variants |
| **feature_lens** | [product-specs.tsx](src/components/product/product-specs.tsx) (DISPLAY_CONFIG — `keys: ["feature_lens", "lens_tech", "cam_ozelligi"]`) | Sadece PDP gösterim; DB'de bu key yok |
| **cam_ozelligi** | product-specs.tsx (aynı grup) | Sadece PDP gösterim; DB'de bu key yok |
| **lens_tech** | product-specs.tsx, product-attributes.tsx, schema.ts (yorum) | product_variants (DB'de 137 varyant) |
| **ekartman** | product-specs.tsx (`keys: ["ekartman", "size"]`), [import-bundle-v1/variants.import.json](import-bundle-v1/variants.import.json) | product_variants (DB'de sadece 2 varyant) |
| **size** | product-specs.tsx (ekartman ile aynı satır), DB'de 148 varyant | product_variants |

### 2.2 Key–DB uyumu

- **DB'de var:** shape, color_frame, color_lens, material, size, size_temple, size_bridge, size_lens_width, lens_tech, marka, gender, mensei, model_numarasi, cam_materyali, ekartman (2), …
- **DB'de yok / alternatif kullanılıyor:**  
  - `feature_lens`, `cam_ozelligi` — PDP'de gösterim için tanımlı; DB'de karşılık olarak **lens_tech** var (137 varyant). product-specs ilk dolu değeri kullandığı için lens_tech varsa doğru görünür.
  - **ekartman** — DB'de yalnızca 2 varyantta var; import/variants'ta "ekartman" kullanılıyor, çoğu varyantta **size** (148) veya **size_bridge/size_temple/size_lens_width** var.

**Yanlış tablo:** Yok. Tüm filtre/arama ve PDP verisi `product_variants.attributes` üzerinden.

---

## 3. PDP data fetch — attributes nereden geliyor? product-specs hangi objeyi alıyor?

**Kaynak:** [src/app/urun/[slug]/page.tsx](src/app/urun/[slug]/page.tsx)

- `getProductBySlug(slug)` ile ürün + varyantlar geliyor.
- Varyantlar `productVariants` tablosundan seçiliyor; her satırda `attributes: productVariants.attributes` dönüyor (satır 67–68, 82–88).
- Sayfada `variant = product.variants[0]` (ilk varyant) kullanılıyor.
- `attributesRecord = variant.attributes` (object ise) cast edilip **ProductSpecs**’e veriliyor:

```ts
<ProductSpecs attributes={attributesRecord} />
```

**Netleşme:**  
- **product-specs.tsx** aldığı obje: **İlk varyantın `product_variants.attributes` objesi.**  
- Yani PDP’deki “Özellikler” listesi **product** değil, **seçilen (ilk) variant**’ın attributes’ına bakıyor. Bu, şemaya uygun (attributes sadece variant’ta).

---

## 4. DB tarafı — product_variants.attributes key envanteri

Sorgu (db-xray’e eklendi):

```sql
SELECT key, COUNT(*) AS cnt
FROM product_variants, jsonb_object_keys(COALESCE(attributes, '{}'::jsonb)) AS key
GROUP BY key
ORDER BY cnt DESC;
```

### 4.1 Shape/color_frame dışında gerçekten kullanılan key’ler (özet)

| Key | Varyant sayısı | Açıklama |
|-----|-----------------|----------|
| barcode | 150 | |
| core_model_code | 150 | |
| color_lens | 150 | |
| color_code | 150 | |
| cam_materyali | 150 | |
| model_numarasi | 150 | |
| urun_kodu | 150 | |
| marka | 150 | |
| material | 150 | |
| gender | 149 | |
| size | 148 | |
| color_frame | 148 | |
| mensei | 147 | |
| size_temple | 146 | |
| size_bridge | 145 | |
| size_lens_width | 145 | |
| shape | 145 | |
| lens_tech | 137 | |
| tedarikci | 122 | |
| ayna_kaplama | 8 | |
| ekartman | 2 | |

### 4.2 Veri kalitesi uyarıları

- **Sahte/key olarak yazılmış key’ler:**  
  `cok_satan_markalar_ray_ban_prada_mustang_giris_yap_uye_ol_aramaniza_uygun_sonuc_bulunamadi_daha_fazla_goster` (150 varyant) — muhtemelen metin veya başka bir alan attributes’a key olarak girmiş; temizlenmeli.
- **Slug/ürün kodu benzeri key’ler:** Çok sayıda key (örn. `0mk2240u_30058g_54_17_140_online_dene`, `ft1220_01b_52_21_140`) tek varyanta özel; bunların attributes key’i olmaması, ayrı bir kolon (örn. sku/slug) olması gerekebilir.

Bu key’lerin tam listesi ve güncel sayılar için:

```bash
npx tsx scripts/db-xray.ts
```

çıktısındaki “6. ATTRIBUTES KEY ENVANTERİ” bölümü kullanılabilir.

---

## 5. Özet tablo: Key listesi + dosya + yanlış tablo?

| Key | DB'de var? | Kullanıldığı dosyalar (özet) | Yanlış tablo? |
|-----|------------|------------------------------|----------------|
| shape | Evet (145) | products.ts, search/route.ts, db-xray, docs | Hayır — product_variants |
| color_frame | Evet (148) | products.ts, search/route, active-filters-bar, gunes-gozlugu/page, product-specs, product-attributes | Hayır |
| color_lens | Evet (150) | Aynı filtre/PDP bileşenleri | Hayır |
| material | Evet (150) | Aynı filtre/PDP bileşenleri | Hayır |
| size | Evet (148) | product-specs (ekartman ile birlikte) | Hayır |
| ekartman | Evet (2) | product-specs, import bundle | Hayır |
| feature_lens | Hayır | Sadece product-specs (lens_tech fallback) | — |
| cam_ozelligi | Hayır | Sadece product-specs (lens_tech fallback) | — |
| lens_tech | Evet (137) | product-specs, product-attributes, schema yorum | Hayır |

**Genel sonuç:**  
- Tüm search/filter ve PDP attributes kullanımı **product_variants.attributes** ile tutarlı; **products** tablosuna yanlış referans yok.  
- PDP’de ProductSpecs’e verilen obje: **ilk varyantın attributes’ı** (product_variants).  
- DB’de `feature_lens` / `cam_ozelligi` yok; gösterimde `lens_tech` ile fallback doğru çalışıyor.  
- DB’de gereksiz/sahte key’ler (uzun metin key’i, slug benzeri key’ler) var; import/seed tarafında düzeltme önerilir.
