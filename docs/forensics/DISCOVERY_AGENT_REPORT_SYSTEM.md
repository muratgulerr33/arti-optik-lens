# Discovery Agent Report — Sistem Röntgeni ve Veri Tutarsızlığı Analizi

**Tarih:** 30 Ocak 2026  
**Kapsam:** Veritabanı `product_variants.attributes`, frontend filtre/URL, backend sorgulama (kategori + arama API).  
**Kural:** Sadece analiz; kod değişikliği yapılmadı.

---

## 1. DB'deki Shape Değerleri (Veritabanı Otopsisi)

Veritabanına doğrudan bağlanılmadı; seed/import script’leri ve şema incelendi.

**Kaynaklar:**  
- [tools/seed/lib/normalize-attributes.mjs](tools/seed/lib/normalize-attributes.mjs) — `SHAPE_PATTERNS` ve `extractAttributesFromText`  
- [tools/seed/seed-v1-from-scrape.mjs](tools/seed/seed-v1-from-scrape.mjs) — `inferShape`  
- [import-bundle-v1/variants.import.json](import-bundle-v1/variants.import.json) — ham attributes örnekleri  

**Shape değerleri (DB’ye yazılabilecekler):**

| Kaynak | Shape değeri |
|--------|---------------|
| normalize-attributes (metinden) | `"Damla"`, `"aviator"`, `"wayfarer"`, `"round"`, `"square"`, `"rectangular"`, `"geometric"`, `"oversize"`, `"cat-eye"` |
| seed-v1-from-scrape inferShape | `"aviator"`, `"wayfarer"`, `"round"`, `"square"`, `"rectangular"`, `"geometric"`, `"oversize"`, `"cat-eye"` (hepsi İngilizce) |
| Import bundle ham veri | `"cerceve-sekli": "Geometrik"` → map sonrası `shape: "Geometrik"` (Türkçe değer korunuyor) |

**Sonuç:** DB’de `attributes->>'shape'` altında hem **Türkçe** (`"Damla"`, `"Geometrik"`) hem **İngilizce** (`"aviator"`, `"wayfarer"`, `"round"`, `"square"`, `"cat-eye"`, `"geometric"`) değerler olabilir. Tek bir standart yok.

**color_frame:**  
- normalize-attributes `COLOR_PATTERNS`: Türkçe (`"Siyah"`, `"Beyaz"`, `"Gri"`, `"Kahverengi"`, `"Mavi"`, `"Yeşil"`, `"Kırmızı"`, `"Altın"`, `"Gümüş"` vb.).  
- Import bundle’da `"cerceve-rengi": "Sarı"` gibi Türkçe değerler var.  
- Schema örneği İngilizce (`"Black"`) yazıyor; fiili seed/import Türkçe yazıyor.

**material:**  
- Import bundle’da `"cerceve-materyali": "Metal"` — Türkçe.  
- Normalize sadece anahtar çeviriyor (`Materyal` → `material`), değer aynen kalıyor; DB’de `"Metal"`, `"Acetate"` gibi karışık olabilir.

---

## 2. Frontend'in Gönderdiği Değer

**"Damla" seçilince URL’e ne gidiyor?**

- **Kaynak:** [src/app/search/search-client.tsx](src/app/search/search-client.tsx) — `SHAPES` sabiti ve linkler.

```ts
const SHAPES = [
  { label: "Damla", value: "aviator" },
  { label: "Yuvarlak", value: "round" },
  { label: "Köşeli", value: "square" },
  { label: "Çekik", value: "cat-eye" },
  { label: "Geometrik", value: "geometric" },
]
```

- Link: `href={/unisex/gunes-gozlugu?shape=${encodeURIComponent(shape.value)}}`  
- **Sonuç:** Kullanıcı "Damla"ya tıkladığında URL’e **`?shape=aviator`** gidiyor (yani frontend **`aviator`** gönderiyor).

Kategori sayfası ([src/app/[gender]/gunes-gozlugu/page.tsx](src/app/[gender]/gunes-gozlugu/page.tsx)) URL’den `shape`’i olduğu gibi alıp `getProductsByCategory(gender, { shape })`’e veriyor; ek bir çeviri yok.  
FilterSheet ([src/components/catalog/filter-sheet.tsx](src/components/catalog/filter-sheet.tsx)) içinde shape/color_frame/material filtreleri **yok**; sadece cinsiyet, fiyat, stok var. Shape seçimi sadece arama sayfasındaki SHAPES linkleriyle yapılıyor.

**Özet:**  
- **Frontend "Damla" seçince gönderdiği değer:** `shape=aviator`

---

## 3. Backend'in Aradığı Değer (SQL’e giren)

**Kategori sayfası backend:** [src/lib/api/products.ts](src/lib/api/products.ts)

- URL’den gelen `filters.shape` (örn. `"aviator"`) **doğrudan** SQL’de kullanılıyor; hiçbir çeviri/mapping yok.
- Sorgu: `product_variants.attributes->>'shape' = ${s}` (örn. `attributes->>'shape' = 'aviator'`).

Yani **kategori backend’ine giren değer:** URL’deki değerin aynısı, örn. **`"aviator"`**.

**Arama API:** [src/app/api/search/route.ts](src/app/api/search/route.ts)

- `SHAPE_MAP`: `damla` → `'pilot'`, `aviator` → `'pilot'`, `pilot` → `'pilot'`, `kare`/`square` → `'square'`, vb.
- Arama sorgusu şekil için: `product_variants.attributes::text ILIKE '%' + filters.shape + '%'` (örn. `%pilot%`).
- Yani arama API’de kullanıcı "damla" veya "aviator" yazarsa backend **`pilot`** ile ILIKE yapıyor; bu sadece arama endpoint’i için, kategori sayfası için değil.

**Özet:**  
- **Kategori sayfası:** SQL’e giren shape değeri = URL’deki değer = **`"aviator"`** (Damla seçilince).  
- **Arama API:** Shape filtresi `SHAPE_MAP` ile `pilot` vb. oluyor; kategori akışından farklı.

---

## 4. SUÇLU (Kök neden özeti)

- **Frontend:** "Damla" seçilince **`shape=aviator`** gönderiyor. Bu, İngilizce slug ile tutarlı.
- **Kategori backend:** Gelen **`aviator`** değerini **olduğu gibi** `attributes->>'shape' = 'aviator'` ile arıyor; reverse mapping yok.
- **Veritabanı:** Seed/import tarafında:
  - normalize-attributes metinden shape çıkarırken **"Damla"** (Türkçe) yazıyor (`SHAPE_PATTERNS`: `damla` → `"Damla"`).
  - Import bundle’daki ham veride `cerceve-sekli: "Geometrik"` gibi Türkçe değerler var; anahtar İngilizce’ye çevriliyor ama **değer** Türkçe kalıyor.
  - seed-v1-from-scrape ise shape’i İngilizce (`aviator`, `wayfarer`, vb.) yazıyor.

**Sonuç:**  
- DB’de `shape` bazen **"Damla"** (Türkçe), bazen **"aviator"** (İngilizce) yazılıyor.  
- Kategori backend **sadece** URL’deki değeri (`aviator`) kullanıyor; **"Damla" → "aviator"** çevirisi backend’de yok.  
- Bu yüzden DB’de `shape: "Damla"` olan kayıtlar, `?shape=aviator` ile yapılan sorguda **eşleşmiyor** → **0 sonuç**.

**Suçlu özeti:**  
Veri ile kod arasındaki kopukluk: **Frontend doğru şekilde `aviator` yolluyor; kategori backend’i de `aviator` ile tam eşleşme yapıyor. Ancak DB’de shape değeri Türkçe "Damla" (veya "Geometrik" vb.) olarak yazılmış kayıtlar var. Backend’de Türkçe→İngilizce (veya tek tip değer) eşlemesi olmadığı için bu kayıtlar dönmüyor.** Asıl tutarsızlık: **veritabanına yazan seed/import’un shape (ve isteğe bağlı color_frame/material) değerlerini tek dilde (tercihen backend’in beklediği İngilizce slug’larla) standartlaştırmaması** ve **kategori API’nin tek bir literal değere göre eşleşmesi** (alternatif veya normalize edilmiş değerleri kullanmaması).

---

## 5. Ek Notlar

- **Arama API** (`/api/search`): `SHAPE_MAP` ile damla/aviator → `pilot` yapıyor ve `attributes::text ILIKE '%pilot%'` kullanıyor; bu yüzden metin aramasında "damla" veya "aviator" yazınca sonuç çıkabiliyor. Kategori sayfası ise **tam eşleşme** (`->>'shape' = 'aviator'`) kullandığı için aynı esneklik yok.
- **FilterSheet:** Kategori sayfasında shape/color_frame/material filtreleri yok; sadece arama sayfasındaki SHAPES linkleri shape’i setliyor.
- **active-filters-bar:** URL’deki `shape` değerini (örn. `aviator`) etiket olarak gösteriyor; kullanıcıya "Şekil: aviator" gibi İngilizce görünebilir.
