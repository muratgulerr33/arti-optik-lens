# Playwright E2E Test Raporu — Gemini için

**Tarih:** 29 Ocak 2026  
**Proje:** arti-optik-next  
**Komut:** `npx playwright test`  
**Ortam:** Chromium (Desktop Chrome), workers: 1, baseURL: http://localhost:3000

---

## Özet

| Sonuç | Sayı |
|-------|------|
| **Geçen** | 4 |
| **Kalan** | 3 |
| **Toplam** | 7 |

**Çalışma süresi:** ~2.1 dakika (retry’lar dahil)

---

## Test Dosyaları ve Konfigürasyon

- **Test dizini:** `./tests/e2e`
- **Dosyalar:**
  - `tests/e2e/core-flow.spec.ts` — V1 Core Flow Sanity Check
  - `tests/e2e/flows.spec.ts` — UX flows (6 senaryo)
- **Playwright config:** `playwright.config.ts`
  - `testDir: "./tests/e2e"`
  - `fullyParallel: false`, `workers: 1`
  - `retries: 2` (CI’da)
  - `baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"`
  - `webServer: { command: "npm run dev", port: 3000 }`
  - `projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]`
  - `outputDir: "test-results/"`

---

## Geçen Testler (4)

1. **core-flow.spec.ts** › V1 Core Flow Sanity Check › `ana sayfa -> arama -> sepet drawer (boş)` — ✓ (~3–4s)
2. **flows.spec.ts** › UX flows › `1) Home: bannerlar, Popüler Markalar, markalar grid` — ✓ (~2s)
3. **flows.spec.ts** › UX flows › `2) Kadın banner -> /kadin/gunes-gozlugu: ürün kartları (en az 1)` — ✓ (~2–3s)
4. **flows.spec.ts** › UX flows › `3) Erkek banner -> /erkek/gunes-gozlugu: ürün kartları (en az 1)` — ✓ (~2s)

---

## Kalan Testler (3) — Hata Detayları

### 1) Test: `4) Header search ikon -> /search: input görünür ve focus`

- **Dosya/satır:** `tests/e2e/flows.spec.ts:90`
- **Hata:** `Test timeout of 30000ms exceeded`  
  `locator.click: Test timeout of 30000ms exceeded`
- **Locator:** `getByTestId('header-search')`
- **Call log:**
  - Locator bulundu: `<a href="/search" aria-label="Ara" ... data-testid="header-search" ...>`
  - Click denendi; element **görünür değil** (visible değil).
  - "element is not visible" — birçok retry sonrası timeout.
- **Sebep:** `header-search` sadece mobilde görünüyor (`sm:hidden` ile); desktop’ta header’da SearchInput (form) var, link gizli. Test Chromium Desktop’ta çalıştığı için bu link görünmüyor.
- **Kod:** `await page.getByTestId("header-search").click();`

---

### 2) Test: `5) Input Ray-Ban, enter -> /search?q=Ray-Ban: sonuç listesi`

- **Dosya/satır:** `tests/e2e/flows.spec.ts:122`
- **Hata:** `strict mode violation: getByTestId('search-input') resolved to 2 elements`
- **Açıklama:** Sayfada iki tane `search-input` var:
  1. Header’daki (banner içinde): `getByRole('banner').getByTestId('search-input')`
  2. Search sayfası içeriğindeki: `locator('div').filter({ hasText: 'GeriPopüler MarkalarRay-' }).getByTestId('search-input')`
- **Sebep:** Hem header hem search sayfası SearchInput kullanıyor; aynı `data-testid="search-input"` iki yerde. Playwright tek element bekliyor, 2 bulununca hata veriyor.
- **Kod:** `const searchInput = page.getByTestId("search-input"); await searchInput.fill("Ray-Ban");`

---

### 3) Test: `6) Popüler Markalar chip -> /search?q=Ray-Ban: patlamasın`

- **Dosya/satır:** `tests/e2e/flows.spec.ts:163`
- **Hata:** `expect(locator).toBeVisible() failed`  
  `strict mode violation: getByTestId('search-input') resolved to 2 elements`
- **Açıklama:** Yine iki adet `search-input` (header + search sayfası); `page.getByTestId("search-input").toBeVisible()` tek element bekliyor.
- **Kod:** `await expect(page.getByTestId("search-input")).toBeVisible();`

---

## Terminal Çıktısı (Ham Özet)

```
Running 7 tests using 1 worker

[WebServer] ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
  ✓  1 [chromium] › tests/e2e/core-flow.spec.ts:4:7 › V1 Core Flow Sanity Check › ana sayfa -> arama -> sepet drawer (boş) (3.4s)
  ✓  2 [chromium] › tests/e2e/flows.spec.ts:6:7 › UX flows › 1) Home: bannerlar, Popüler Markalar, markalar grid (2.0s)
  ✓  3 [chromium] › tests/e2e/flows.spec.ts:35:7 › UX flows › 2) Kadın banner -> /kadin/gunes-gozlugu: ürün kartları (en az 1) (2.3s)
  ✓  4 [chromium] › tests/e2e/flows.spec.ts:58:7 › UX flows › 3) Erkek banner -> /erkek/gunes-gozlugu: ürün kartları (en az 1) (1.9s)
  ✘  5 [chromium] › tests/e2e/flows.spec.ts:81:7 › UX flows › 4) Header search ikon -> /search: input görünür ve focus (30.3s)
  ✘  6 … (retry #1) (30.4s)
  ✘  7 … (retry #2) (30.3s)
  ✘  8 [chromium] › tests/e2e/flows.spec.ts:106:7 › UX flows › 5) Input Ray-Ban, enter -> /search?q=Ray-Ban: sonuç listesi (1.2s)
  ✘  9 … (retry #1) (1.5s)
  ✘  10 … (retry #2) (1.2s)
  ✘  11 [chromium] › tests/e2e/flows.spec.ts:140:7 › UX flows › 6) Popüler Markalar chip -> /search?q=Ray-Ban: patlamasın (1.8s)
  ✘  12 … (retry #1) (2.1s)
  ✘  13 … (retry #2) (1.8s)

  3 failed
  [chromium] › tests/e2e/flows.spec.ts:81:7 › UX flows › 4) Header search ikon -> /search: input görünür ve focus
  [chromium] › tests/e2e/flows.spec.ts:106:7 › UX flows › 5) Input Ray-Ban, enter -> /search?q=Ray-Ban: sonuç listesi
  [chromium] › tests/e2e/flows.spec.ts:140:7 › UX flows › 6) Popüler Markalar chip -> /search?q=Ray-Ban: patlamasın
  4 passed (2.1m)
```

**Exit code:** 1 (test hatası)

---

## Önerilen Düzeltmeler (Gemini için)

1. **Test 4 (header-search):**
   - Desktop’ta `header-search` görünmüyor; test viewport’u mobil yapılabilir (`page.setViewportSize({ width: 375, height: 667 })`) veya
   - Desktop akışında doğrudan `/search`’e gidilip orada `search-input` ile devam edilebilir.

2. **Test 5 ve 6 (search-input çift element):**
   - Locator’ı daralt: örn. `page.getByRole('banner').getByTestId('search-input')` (header) veya search sayfası container’ına göre `page.locator('main').getByTestId('search-input')` / `page.getByPlaceholder('Marka veya model ara').first()` gibi tek bir element seçilecek şekilde güncelle.

3. **Uzun vadede:**
   - Search sayfasındaki arama alanına farklı bir `data-testid` verilebilir (örn. `search-page-input`) ki strict mode tek element bulsun.

---

## Ek Bilgiler

- **Uyarılar (çalıştırma sırasında):**
  - `NO_COLOR` env is ignored due to `FORCE_COLOR`
  - Next.js: "The \"middleware\" file convention is deprecated. Please use \"proxy\" instead."
- **Artefaktlar:** Hata anında ekran görüntüleri ve trace’ler `test-results/` altında (örn. `test-results/flows-UX-flows-4-.../test-failed-1.png`, `.../trace.zip`).
- **Tekrar çalıştırma:** `npm run test:e2e` veya `npx playwright test`

Bu rapor, pencerede gördüğün tüm test çıktısı ve hata detaylarıyla Gemini’ye verilecek şekilde hazırlandı.
