# ARTI OPTİK — Forensic Discovery + Minimal Fix Verification
**Tarih:** 28 Ocak 2026  
**Kurallar:** Yıkıcı komut yok; her bulgu komut + çıktı özeti + dosya/satır veya URL kanıtı.

---

## A) Build kırığı (category-content)

### Komutlar ve çıktılar

| # | Komut | Beklenen | Gerçek | Kanıt |
|---|--------|----------|--------|-------|
| A1 | `ls -la src/app/[gender]/gunes-gozlugu/` | category-content.* veya page.tsx | Sadece `page.tsx` ve `.DS_Store`; **category-content yok** | Dizin listesi |
| A2 | `ls -la .../category-content.*` | Dosya listesi | `no matches found` (exit 1) | — |
| A3 | `git status --porcelain \| head -50` | Değişiklik listesi | `D src/app/[gender]/gunes-gozlugu/category-content.tsx` (silinmiş) | git status |
| A4 | `git ls-files \| rg "category-content"` | Track edilen path | `src/app/[gender]/gunes-gozlugu/category-content.tsx` | git ls-files |
| A5 | `sed -n '1,80p' .../page.tsx` | Import satırı | L2: `import { CategoryContent } from "./category-content"` | [page.tsx](src/app/[gender]/gunes-gozlugu/page.tsx) L2 |

**Sonuç:** Git’te dosya track ediliyor, diskte yok → **A-Decision uygulandı.**

### A-Decision (git’te var, disk’te yok)

```bash
git checkout HEAD -- src/app/[gender]/gunes-gozlugu/category-content.tsx
```
**Çıktı:** (boş, exit 0) — dosya geri getirildi.

### Doğrulama (restore sonrası)

| Adım | Komut | Beklenen | Gerçek | Sonuç |
|------|--------|----------|--------|--------|
| Build | `npm run build` | Başarılı derleme | `✓ Compiled successfully in 5.3s` … `✓ Generating static pages` | ✅ |
| URL | `curl -i http://localhost:3000/kadin/gunes-gozlugu \| head -20` | 200 veya HTML | Sunucu kapalı: `Couldn't connect` (curl 7) | ⚠️ Sunucu yok |

**Not:** Build başarılı; kategori sayfası doğrulaması için dev server’ın çalışır durumda olması gerekir.

---

## B) /search Popüler Markalar kaynağı

| # | Komut | Beklenen | Gerçek | Kanıt |
|---|--------|----------|--------|-------|
| B1 | `rg -n "Henüz marka listesi yok\|popularBrands" src/app/search` | Eşleşmeler | L18: `const popularBrands: string[] = []`; L214-215, L291-292: koşul + "Henüz marka listesi yok." | [search-client.tsx](src/app/search/search-client.tsx) L18, L214-215, L291-292 |
| B2 | `sed -n '1,260p' search-client.tsx` | Kaynak | L17-18: `// TODO: Fetch real data from DB`; `const popularBrands: string[] = []`; L214-215, 291-292 boşken mesaj | Aynı dosya |
| B3 | `sed -n '1,120p' home-brand-config.ts` | Config | `HOME_BRAND_SLUGS` (7 slug), `HOME_BRAND_DISPLAY_NAMES` (slug → isim) | [home-brand-config.ts](src/components/home/home-brand-config.ts) L1-20 |
| B4 | `sed -n '1,200p' header.tsx` | Search aksiyonu | L40-49: `Button asChild` → `Link href="/search"` (Search ikonu) | [header.tsx](src/components/layout/header.tsx) L40-49 |

**Özet:**  
- "/search Popüler Markalar" listesi **search-client.tsx** içinde `popularBrands` (L18) ile besleniyor; şu an **boş array** → "Henüz marka listesi yok." (L215, L292).  
- Home’daki marka listesi **home-brand-config.ts** statik config’ten; header’daki arama ikonu **Link** ile `/search`’e gidiyor.

---

## C) /api/search davranışı (masking vs gerçek hata)

| # | Komut | Beklenen | Gerçek | Kanıt |
|---|--------|----------|--------|-------|
| C1 | `curl -i "http://localhost:3000/api/search?q=Ray-Ban&limit=3" \| head -40` | 200 + JSON | Sunucu kapalı: `Failed to connect` (curl exit 7) | — |
| C2 | `curl -i "http://localhost:3000/api/search?q=Tom%20Ford&limit=3" \| head -40` | 200 veya hata | Sunucu kapalı: `Failed to connect` | — |

**Not:** Bu oturumda dev server çalışmadığı için canlı API cevabı alınamadı. Önceki rapora göre category-content eksikken `/api/search` bile 500 verebiliyordu (Next.js compilation hatası); dosya geri getirildikten sonra build başarılı, API’nin 500 vermesi beklenmez. Doğrulama: dev server açıldıktan sonra her iki curl tekrarlanmalı.

---

## D) Fiyat (kuruş mu TL mi?)

### DB örnekleri (product_variants.price)

```text
# 5 satır
 id | product_id | price  
----+------------+--------
  1 |          1 | 705000
  2 |          2 | 672000
  3 |          2 | 800000
  4 |          3 | 710000
  5 |          3 | 756000

# min/max
 min_price | max_price 
-----------+-----------
    251200 |   2540000
```

**Komut:**  
`PGPASSWORD=postgres psql -h localhost -p 5433 -U postgres -d artioplik -c "SELECT ... LIMIT 5;" -c "SELECT MIN(price::numeric), MAX(price::numeric) FROM product_variants;"`

**Yorum:** Değerler 251200–2540000 aralığında; TL ile uyumlu olan **kuruş** (örn. 756000 → 7560 TL). Schema yorumunda "15400.00" yazıyor olsa da gerçek veri **kuruş** (integer benzeri) saklanıyor.

### Kod kanıtı

| Dosya | Satır / içerik | Anlam |
|-------|----------------|--------|
| [src/lib/utils.ts](src/lib/utils.ts) | L8-15: `formatPrice(kurus: number)` → `(kurus / 100).toLocaleString("tr-TR", { currency: "TRY", ... })` | Girdi **kuruş**, çıktı TRY metni |
| [src/components/product/product-info.tsx](src/components/product/product-info.tsx) | L30: `price: number; // Price in kuruş`; L43: `formatPrice(price)` | PDP fiyatı kuruş olarak kullanılıyor |

**Sonuç:** DB’de fiyat **kuruş**; kod kuruş kabul edip TRY’e çeviriyor — tutarlı.

---

## E) Çıktı formatı — özet

### Kanıt tablosu (özet)

| Adım | Komut | Beklenen | Gerçek | Kanıt | Sonuç |
|------|--------|----------|--------|-------|--------|
| A1-A5 | ls, git status, git ls-files, page.tsx | Dosya/import durumu | Disk’te yok, git’te var, page L2 import | A yukarıda | ❌→✅ restore |
| A-Decision | git checkout HEAD -- .../category-content.tsx | Dosya geri gelir | Exit 0, dosya oluştu | — | ✅ |
| Build | npm run build | Build OK | Compiled + static pages OK | Terminal | ✅ |
| B1-B4 | rg/sed search, config, header | Kaynak ve davranış | popularBrands=[], config ayrı, Link /search | B yukarıda | ✅ |
| C1-C2 | curl /api/search | 200 + JSON | Server kapalı | — | ⚠️ |
| D | psql + utils/product-info | Kuruş saklama + format | 705000 vb., formatPrice(kurus) | DB + kod | ✅ |

### Bulgular (kanıtlı)

1. **category-content.tsx** git’te vardı, diskten silinmişti; `page.tsx` L2 hâlâ `"./category-content"` import ediyordu → build kırığı. **Fix:** `git checkout HEAD -- src/app/[gender]/gunes-gozlugu/category-content.tsx` uygulandı; build başarılı.
2. **/search Popüler Markalar** boş çünkü `search-client.tsx` L18’de `popularBrands: string[] = []`; L214-215 ve L291-292’de `popularBrands.length === 0` iken "Henüz marka listesi yok." gösteriliyor. Home ise `home-brand-config.ts` statik config kullanıyor.
3. **Fiyat:** DB’de `product_variants.price` kuruş (ör. 756000); `utils.formatPrice(kurus)` ve `product-info` “price in kuruş” ile uyumlu.

### Kök neden(ler)

1. **category-content.tsx** diskten silinmiş, import kalmış → modül bulunamıyor, build ve ilgili route’lar (kategori + önceki rapora göre bazen API) kırılıyor.
2. **/search** için “Popüler Markalar” verisi hiç bağlanmamış: sabit boş array, TODO ile “Fetch real data from DB” notu.
3. Home ile /search farklı kaynak kullanıyor (statik config vs boş array) → tutarsız UX.

### Minimal fix paketi

- **A (uygulandı):** `git checkout HEAD -- src/app/[gender]/gunes-gozlugu/category-content.tsx` → build düzeldi.
- **B (öneri):** `/search`’te Popüler Markalar’ı doldurmak için `home-brand-config` kullan:  
  `search-client.tsx` içinde `HOME_BRAND_DISPLAY_NAMES` (veya eşdeğeri) import edip `popularBrands` yerine `Object.values(HOME_BRAND_DISPLAY_NAMES)` kullan.
- **C:** API 500’leri category-content restore ile giderilmiş olmalı; dev server açıkken `curl -i "http://localhost:3000/api/search?q=Ray-Ban&limit=3"` ve `q=Tom%20Ford` ile tekrar doğrula.

### Doğrulama sonuçları

| URL / aksiyon | Beklenen | Sonuç (bu oturum) |
|---------------|----------|--------------------|
| `npm run build` | Exit 0, static pages üretilir | ✅ Başarılı |
| `http://localhost:3000/kadin/gunes-gozlugu` | 200, kategori sayfası | ⚠️ Sunucu kapalı, test edilmedi |
| `http://localhost:3000/api/search?q=Ray-Ban&limit=3` | 200, JSON items | ⚠️ Sunucu kapalı |
| `http://localhost:3000/api/search?q=Tom%20Ford&limit=3` | 200, JSON items | ⚠️ Sunucu kapalı |

**Özet:** Build kırığı giderildi; API ve kategori URL doğrulaması için dev server çalışırken curl/browser ile tekrarlanmalı.
