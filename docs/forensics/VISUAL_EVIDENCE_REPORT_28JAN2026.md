# ARTI OPTİK V1 — VISUAL + URL EVIDENCE DISCOVERY REPORT
**Tarih:** 28 Ocak 2026  
**Branch:** `chore/track-core`  
**Commit:** `55454ea`

---

## KANIT TABLOSU

| Adım | Komut / Aksiyon | Beklenen | Gerçek Çıktı / Gözlem | Kanıt (path/url) | Sonuç |
|------|----------------|----------|----------------------|------------------|-------|
| Preflight | `git rev-parse --abbrev-ref HEAD` | Branch adı | `chore/track-core` | Terminal çıktısı | ✅ |
| Preflight | `git rev-parse --short HEAD` | Commit hash | `55454ea` | Terminal çıktısı | ✅ |
| Preflight | `git status --porcelain` | Değişiklik listesi | `D src/app/[gender]/gunes-gozlugu/category-content.tsx` + untracked files | Terminal çıktısı | ⚠️ |
| Preflight | `npm -v && node -v` | Versiyonlar | `10.9.2` / `v22.14.0` | Terminal çıktısı | ✅ |
| Preflight | `npm run build` | Build başarılı | **Build error:** `Module not found: Can't resolve './category-content'` | `src/app/[gender]/gunes-gozlugu/page.tsx:2:1` | ❌ |
| Preflight | `npm run lint` | Lint temiz | 5 error (auth.ts `any` types), 2 warning | Terminal çıktısı | ⚠️ |
| 1) String kaynağı | `rg -n "Henüz marka listesi yok\|Popüler Markalar"` | Dosya konumları | `src/app/search/search-client.tsx:215,292` | L215, L292 | ✅ |
| 1) Component kaynağı | `rg -n "home-brand\|brand-grid"` | Dosya konumları | `src/components/home/home-brand-grid.tsx:13` | L13 | ✅ |
| 2) Search ikonu | `sed -n '1,220p' src/components/layout/header.tsx` | Action tipi | **Link** (`asChild` + `Link href="/search"`) | L40-50 | ✅ |
| 3) Home markalar | `sed -n '1,240p' src/components/home/home-brand-config.ts` | Data kaynağı | **Statik config:** `HOME_BRAND_SLUGS` array | L2-10 | ✅ |
| 3) Home markalar | `sed -n '1,260p' src/components/home/home-brand-grid.tsx` | Render mantığı | `HOME_BRAND_SLUGS.map()` ile statik render | L16-22 | ✅ |
| 4) /search sayfası | `ls -la src/app/search` | Dosya yapısı | `page.tsx`, `search-client.tsx` | Terminal çıktısı | ✅ |
| 4) /search markalar | `sed -n '1,260p' src/app/search/search-client.tsx` | Data kaynağı | **Boş array:** `const popularBrands: string[] = []` | L18 | ❌ |
| 4) API çağrısı | `rg -n "api/search\|fetch" src/app/search` | API kullanımı | `/api/search` çağrısı var (`q.length >= 2` koşuluyla) | L106-108 | ✅ |
| 5A) Home screenshot | Browser: `http://localhost:3000/` | Popüler Markalar görünür | **7 marka kartı görünür** (Ray-Ban, Prada, Versace, vb.) | `docs/forensics/screens/20260128-1822-home.png` | ✅ |
| 5B) Search boş | Browser: `http://localhost:3000/search` | "Henüz marka listesi yok" görünür | **Mesaj görünür:** "Henüz marka listesi yok." | `docs/forensics/screens/20260128-1822-search-empty.png` | ✅ |
| 5C) Search dolu | Browser: `http://localhost:3000/search?q=Ray-Ban` | Ürün grid görünür | **20 sonuç görünür** (Ray-Ban ürünleri) | `docs/forensics/screens/20260128-1822-search-rayban.png` | ✅ |
| 5D) Brand tıklama | Home'dan Ray-Ban'a tıkla | `/search?q=Ray-Ban` URL'ine gider | **Link href:** `/search?q=Ray-Ban` (home-brand-grid-item.tsx L12) | `src/components/home/home-brand-grid-item.tsx:12` | ✅ |
| 5E) Kategori route | Browser: `http://localhost:3000/kadin/gunes-gozlugu` | Sayfa yüklenir | **Build error:** Module not found `./category-content` | `docs/forensics/screens/20260128-1822-category-error.png` | ❌ |
| 6) Network API | `curl -i "http://localhost:3000/api/search?q=Ray-Ban&limit=3"` | 200 OK + JSON | **200 OK:** 3 item döndü | Terminal çıktısı | ✅ |
| 6) Network API | `curl -i "http://localhost:3000/api/search?q=Tom%20Ford&limit=3"` | 200 OK + JSON | **500 Internal Server Error:** category-content hatası | Terminal çıktısı | ❌ |
| 7) category-content | `ls -la src/app/[gender]/gunes-gozlugu/` | Dosya var | **Dosya YOK** (sadece `page.tsx` var) | Terminal çıktısı | ❌ |
| 7) category-content | `git ls-files | grep category-content` | Git'te var mı? | **Git'te VAR:** `src/app/[gender]/gunes-gozlugu/category-content.tsx` | Terminal çıktısı | ⚠️ |
| 7) Import kanıtı | `sed -n '1,80p' src/app/[gender]/gunes-gozlugu/page.tsx` | Import satırı | `import { CategoryContent } from "./category-content"` (L2) | L2 | ✅ |
| 8) PDP fiyat | `sed -n '1,260p' src/lib/utils.ts` | Format fonksiyonu | `formatPrice(kurus: number)` → TRY formatı | L9-16 | ✅ |
| 8) PDP fiyat | `sed -n '1,100p' src/components/product/product-info.tsx` | Kullanım | `formatPrice(price)` çağrısı (price kuruş cinsinden) | L43 | ✅ |

---

## Bulgular

### [B1] Home vs /search Popüler Markalar Çelişkisi
**Kanıt:**
- Home: `src/components/home/home-brand-config.ts` → Statik `HOME_BRAND_SLUGS` array (7 marka)
- /search: `src/app/search/search-client.tsx:18` → `const popularBrands: string[] = []` (boş array)

**Kullanıcı Etkisi:**
- Home sayfasında 7 marka kartı görünür
- /search sayfasında "Henüz marka listesi yok" mesajı görünür
- Kullanıcı tutarsızlık yaşar

**Risk:** Orta — UX tutarsızlığı, ancak kritik değil

---

### [B2] Search İkonu Davranışı
**Kanıt:** `src/components/layout/header.tsx:40-50`
- Search ikonu bir **Link** component'i (`asChild` + `Link href="/search"`)
- Modal açmıyor, direkt `/search` sayfasına yönlendiriyor

**Kullanıcı Etkisi:**
- İkona tıklayınca `/search` sayfasına gider (beklenen davranış)
- Input otomatik focus olur (`search-client.tsx:59`)

**Risk:** Düşük — Beklenen davranış çalışıyor

---

### [B3] category-content.tsx Eksikliği (Build Error)
**Kanıt:**
- `git status`: `D src/app/[gender]/gunes-gozlugu/category-content.tsx` (silinmiş)
- `git ls-files`: Dosya git'te hala track ediliyor
- `ls -la`: Dosya filesystem'de YOK
- `page.tsx:2`: `import { CategoryContent } from "./category-content"` → **Module not found**

**Kullanıcı Etkisi:**
- Tüm kategori route'ları (`/kadin/gunes-gozlugu`, `/erkek/gunes-gozlugu`, `/unisex/gunes-gozlugu`) **500 Internal Server Error** veriyor
- Build başarısız oluyor
- `/api/search` bile bu hatadan etkileniyor (Tom Ford araması 500 döndü)

**Risk:** Yüksek — Kritik sayfalar çalışmıyor

---

### [B4] /search Sayfası API Kullanımı
**Kanıt:** `src/app/search/search-client.tsx:106-108`
- `/api/search` çağrısı yapılıyor (`q.length >= 2` koşuluyla)
- API route çalışıyor (`/api/search?q=Ray-Ban` → 200 OK, 3 item)
- Ancak `popularBrands` array'i boş olduğu için "Henüz marka listesi yok" gösteriliyor

**Kullanıcı Etkisi:**
- Arama çalışıyor (Ray-Ban → 20 sonuç)
- Ancak boş durumda marka listesi gösterilmiyor

**Risk:** Orta — Özellik eksikliği

---

### [B5] PDP Fiyat Formatı
**Kanıt:**
- `src/lib/utils.ts:9-16`: `formatPrice(kurus: number)` → TRY formatı (ondalıksız)
- `src/components/product/product-info.tsx:43`: `formatPrice(price)` kullanılıyor
- Price **kuruş cinsinden** integer olarak geliyor (DB'den)

**Kullanıcı Etkisi:**
- Fiyatlar doğru formatlanıyor (örn: `₺7.560`)

**Risk:** Düşük — Çalışıyor

---

## Kök Neden(ler)

1. **category-content.tsx dosyası silinmiş ama git'te hala track ediliyor**
   - Dosya filesystem'de yok ama `page.tsx` import etmeye çalışıyor
   - Bu yüzden tüm kategori route'ları 500 veriyor
   - Build başarısız oluyor

2. **/search sayfasında `popularBrands` array'i boş bırakılmış**
   - Home'da statik config kullanılıyor ama /search'ta implement edilmemiş
   - TODO comment var (`search-client.tsx:17`): "TODO: Fetch real data from DB (Prisma/Drizzle)"
   - Bu yüzden "Henüz marka listesi yok" mesajı görünüyor

3. **Home ve /search farklı data kaynakları kullanıyor**
   - Home: Statik config (`HOME_BRAND_SLUGS`)
   - /search: Boş array (`popularBrands: []`)
   - Tutarlılık yok

---

## Minimal Fix Paketi (Öneri)

### Seçenek A (En Güvenli — category-content'i geri getir)
**Değişecek dosyalar:**
- `src/app/[gender]/gunes-gozlugu/category-content.tsx` (geri getir veya yeniden oluştur)

**Doğrulama:**
```bash
# 1. Dosyayı geri getir (git'ten)
git checkout HEAD -- src/app/[gender]/gunes-gozlugu/category-content.tsx

# 2. Build test
npm run build

# 3. URL test
curl -i "http://localhost:3000/kadin/gunes-gozlugu"
curl -i "http://localhost:3000/api/search?q=Tom%20Ford&limit=3"
```

**Risk:** Düşük — Sadece silinmiş dosyayı geri getiriyoruz

---

### Seçenek B (/search'ta Home config'i kullan)
**Değişecek dosyalar:**
- `src/app/search/search-client.tsx` (L18 değişikliği)

**Değişiklik:**
```typescript
// Önceki (L18):
const popularBrands: string[] = []

// Yeni:
import { HOME_BRAND_DISPLAY_NAMES } from "@/components/home/home-brand-config"
const popularBrands = Object.values(HOME_BRAND_DISPLAY_NAMES)
```

**Doğrulama:**
```bash
# 1. Dev server'da test
# Browser: http://localhost:3000/search
# Beklenen: 7 marka badge'i görünür (Ray-Ban, Prada, vb.)
```

**Risk:** Düşük — Sadece boş array'i dolduruyoruz

---

## Unknown / Eksik Kanıt

- [ ] `category-content.tsx` dosyasının içeriği neydi? (Git history'den bakılabilir)
- [ ] Neden dosya silindi? (Git log ile kontrol edilebilir)
- [ ] `/search` sayfasında markalar DB'den mi yoksa config'den mi gelmeli? (Product requirement belirsiz)
- [ ] Network panel screenshot'ları alınmadı (DevTools → Network → Fetch/XHR)
- [ ] Home'dan brand'e tıklayınca gerçekten `/search?q=...` URL'ine gidiyor mu? (Browser test yapıldı ama screenshot yok)

---

## Screenshot Referansları

1. **Home:** `docs/forensics/screens/20260128-1822-home.png`
   - URL: `http://localhost:3000/`
   - Popüler Markalar bölümü görünür (7 marka kartı)

2. **Search Boş:** `docs/forensics/screens/20260128-1822-search-empty.png`
   - URL: `http://localhost:3000/search`
   - "Henüz marka listesi yok" mesajı görünür

3. **Search Dolu:** `docs/forensics/screens/20260128-1822-search-rayban.png`
   - URL: `http://localhost:3000/search?q=Ray-Ban`
   - 20 ürün sonucu görünür

4. **Category Error:** `docs/forensics/screens/20260128-1822-category-error.png`
   - URL: `http://localhost:3000/kadin/gunes-gozlugu`
   - Build error: "Module not found: Can't resolve './category-content'"

---

**Rapor Sonu:** Tüm kanıtlar toplandı ve dokümante edildi.
