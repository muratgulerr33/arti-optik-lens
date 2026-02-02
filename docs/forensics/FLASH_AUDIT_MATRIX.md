# Flash Audit Matrix — Global Page Transition (PWA / Native-Feel)

**Tarih:** 2026-02-02  
**Kapsam:** Sayfa geçişleri (drawer hariç). Kanıt: repo taraması + plan referansları.

## İncelenen geçiş listesi (repo route’larına göre)

| # | Transition | Route A → B | Path kanıtı |
|---|------------|-------------|-------------|
| 1 | Home → Category | `/` → `/[gender]/gunes-gozlugu` | `src/app/page.tsx`, `src/app/[gender]/gunes-gozlugu/page.tsx` |
| 2 | Category → PDP | `/[gender]/gunes-gozlugu` → `/urun/[slug]` | `src/app/urun/[slug]/page.tsx` |
| 3 | PDP → PDP | `/urun/[slug]` → `/urun/[slug]` (ardışık slug) | Aynı segment |
| 4 | Search → PDP | `/search?q=...` → `/urun/[slug]` | `src/app/search/page.tsx`, `src/app/urun/[slug]/page.tsx` |
| 5 | Cart → Checkout | (Cart sheet; sayfa yok) → `/checkout` | `src/app/checkout/page.tsx` |
| 6 | Login → Account | `/auth/login` → `/account/*` | `src/app/auth/login`, `src/app/account/` |
| 7 | Account → PDP | `/account/*` → `/urun/[slug]` | Wishlist/orders içinden link |

## Repo kanıt özeti (kod taraması)

- **page-transition.tsx:** **Yok.** `src/components/app/` klasörü mevcut değil. Dokümanlarda referans var, repoda dosya yok.
- **loading.tsx:** **Yok.** `src/app/urun/[slug]/loading.tsx` ve `src/app/[gender]/gunes-gozlugu/loading.tsx` mevcut değil. Skeleton/loading boundary yok.
- **Layout:** `src/app/layout.tsx` — `ThemeProvider` (disableTransitionOnChange), `html suppressHydrationWarning`, `body` className’de `bg-background`. `main` sadece `pt-16`; `PageTransition` wrapper yok.
- **globals.css:** `body { @apply bg-background }`, `prefers-reduced-motion` ile animasyon süreleri 0.01ms. Theme token’lar `:root` ve `:root.dark` ile tanımlı.
- **Search:** Suspense fallback “Yükleniyor...” + `min-h-screen bg-background` — boş frame riski düşük, metin var.
- **Skeleton component:** `src/components/ui/skeleton.tsx` **yok.**

## Sonuç matrisi (kanıta dayalı tahmin)

| Transition | Issue | Repro | Suspected root cause |
|------------|--------|-------|----------------------|
| Home → Category | Skeleton gap / blank frame | 1) Home’dan kategori linkine tıkla 2) Ağ yavaşsa boş ekran | loading.tsx yok; Next.js varsayılan boş/sonra içerik |
| Category → PDP | Skeleton gap / blank frame | 1) Kategori grid’den ürüne tıkla 2) Boş an görülebilir | loading.tsx yok PDP’de |
| PDP → PDP | Blank / unmount flash | 1) PDP’de related/grid’den başka ürüne tıkla 2) Aynı segment, yeniden fetch | loading boundary yok; içerik geç gelince boş frame |
| Search → PDP | Skeleton gap | 1) Arama sonucından PDP’ye tıkla | PDP loading.tsx yok |
| (Cart) → Checkout | Unknown | Cart sheet; doğrudan /checkout’a yönlendirme | Auth + data fetch; loading boundary yok (kanıt gerekir) |
| Login → Account | Unknown | Giriş sonrası /account | Layout/loading kanıtı yok |
| Account → PDP | Skeleton gap | Wishlist/orders’dan ürüne tıkla | PDP loading.tsx yok |

**Theme blink:** Layout’ta `suppressHydrationWarning` ve `disableTransitionOnChange` var. Hydration mismatch konsol uyarısı olup olmadığı manuel test ile doğrulanmalı; kod taramasında “mounted” pattern yok (theme client-only render için dokümanda bahsediliyor).

## Evidence checklist (Cursor doldurdu)

- [x] `page-transition.tsx` repoda yok — devrede değil.
- [x] Category/PDP `loading.tsx` yok — skeleton gösterilmiyor.
- [ ] Theme blink (hydration warning + repro) — manuel test gerekli.
- [ ] Fix sonrası önce/sonra karşılaştırma — STEP 3 sonrası.

---

**Çıktı:** Bu rapor STEP 0 çıktısıdır. STEP 1’e geçmeden önce Murat onayı plan dokümanında belirtilmiştir.
