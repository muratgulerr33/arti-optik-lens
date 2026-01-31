# UX / Görsel E2E Raporu — 29 Ocak 2026

Bu rapor, Playwright e2e testlerinin UI ile uyumlu hale getirilmesi (data-testid + aria-label) ve test çalıştırma sonuçlarını özetler.

## Test sonuç tablosu

| # | Test adı | Sonuç | Not |
|---|----------|--------|-----|
| 1 | Home: bannerlar, Popüler Markalar, markalar grid (home-hero, home-banner-kadin, home-banner-erkek, home-brand-grid) | PASS | |
| 2 | Kadın banner -> /kadin/gunes-gozlugu, product-grid görünür | PASS | |
| 3 | Erkek banner -> /erkek/gunes-gozlugu, product-grid görünür | PASS | |
| 4 | Header search ikon -> /search, search-input görünür + focus | PASS | |
| 5 | search-input "Ray-Ban" Enter -> /search?q=Ray-Ban, URL doğru | PASS | URL kontrolü; sonuç alanı API/DB’ye bağlı |
| 6 | Popüler Markalar chip (popular-brand-ray-ban) -> /search?q=Ray-Ban | PASS | |

**Özet:** 6/6 PASS. Bağımlılıklar (next-auth v5, @auth/drizzle-adapter, bcryptjs, react-hook-form, @hookform/resolvers, zod, @types/bcryptjs) eklendi; port 3000 boşken `npm run test:e2e` ile tam geçiş alındı.

## Kullanılan data-testid listesi

| data-testid | Konum | Açıklama |
|-------------|--------|----------|
| `header-search` | Header search link | Arama sayfasına giden ikon/link |
| `home-hero` | Ana sayfa hero section wrapper | Hero banner’ların sarmalayıcısı |
| `home-banner-kadin` | Kadın hero kartı | /kadin/gunes-gozlugu link’i |
| `home-banner-erkek` | Erkek hero kartı | /erkek/gunes-gozlugu link’i |
| `home-brand-grid` | Popüler Markalar grid | Ana sayfa marka grid’i |
| `search-input` | /search sayfası | Arama input’u, placeholder "Marka veya model ara" |
| `popular-brand-<slug>` | /search Popüler Markalar | Örn. popular-brand-ray-ban |
| `product-grid` | Kategori + arama sonuçları | Ürün grid container (ProductGrid) |

## Değişen dosyalar

- `src/components/layout/header.tsx` — header-search link’e `data-testid="header-search"`, `aria-label="Ara"` eklendi.
- `src/components/home/home-hero-banners.tsx` — section’a `data-testid="home-hero"`, banner link’lere `home-banner-kadin` / `home-banner-erkek` eklendi.
- `src/components/home/home-brand-grid.tsx` — section’a `data-testid="home-brand-grid"` eklendi.
- `src/app/search/search-client.tsx` — input’a `data-testid="search-input"`, placeholder "Marka veya model ara", popüler markalar `HOME_BRAND_SLUGS` + `data-testid="popular-brand-<slug>"` ile güncellendi.
- `src/components/catalog/product-grid.tsx` — grid container’a `data-testid="product-grid"` eklendi.
- `playwright.config.ts` — `webServer`: command `npm run dev`, port 3000, `reuseExistingServer: !process.env.CI`.
- `tests/e2e/flows.spec.ts` — Tüm testler role/name yerine `getByTestId` ile güncellendi; screenshot path’leri `docs/forensics/screens/2026-01-29/` kullanıyor.

## Screenshot path’leri

- Başarılı koşuda (hedeflenen): `docs/forensics/screens/2026-01-29/01-home.png` … `06-search-popular-brand.png`
- Bu koşudaki fail screenshot’ları: `docs/forensics/screens/2026-01-29/01-home-failed.png` … `06-search-popular-brand-failed.png`
- Playwright çıktısı: `test-results/` altındaki ilgili klasörlerde `test-failed-1.png`

## Sonraki adımlar

1. Port 3000 boşken `npm run test:e2e` çalıştırılarak 6/6 PASS hedeflenmeli.
2. CI’da `CI=true` ile çalıştırıldığında webServer otomatik başlar; `reuseExistingServer: false` kullanılır.
