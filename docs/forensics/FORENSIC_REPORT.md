# FORENSIC_REPORT — Kanıtlı Bulgular

**Kural:** Her iddia (1) komut, (2) çıktı özeti, (3) dosya yolu + satır referansı ile. Bilinmeyen: “BİLİNMİYOR”.

---

## 1) / route’un kaynağı

- **İddia:** `/` route’u `src/app/page.tsx` tarafından sunuluyor; içerik create-next-app şablonu.
- **Komut:** `test -f src/app/page.tsx && echo "VAR"` → VAR.
- **Komut:** `sed -n '1,220p' src/app/page.tsx`.
- **Dosya + satır:** [src/app/page.tsx](src/app/page.tsx) satır 1–66: `import Image from "next/image"`, `export default function Home()`, Next logo, “To get started, edit the page.tsx file”, Vercel/Next linkleri. Proje bileşeni importu yok.
- **Sonuç:** Kanıtlı. / kaynağı `src/app/page.tsx`; içerik template.

---

## 2) Root layout’ta Header/Footer render ediliyor mu?

- **İddia:** Root layout’ta Navbar/Footer veya layout/header / layout/footer **render edilmiyor**.
- **Komut:** `sed -n '1,260p' src/app/layout.tsx`.
- **Dosya + satır:** [src/app/layout.tsx](src/app/layout.tsx) satır 1–56: Sadece ThemeProvider, AuthProvider, FavoritesProvider, CartProvider, HeaderProvider, SearchProvider, `{children}`. Hiçbir yerde `Navbar`, `Footer`, `Header`, `@/components/layout/header`, `@/components/layout/footer` geçmiyor.
- **Komut:** `rg -n "components/(Navbar|Footer|layout/header|layout/footer)" src/app src/components -S` → **No matches.**
- **Sonuç:** Kanıtlı. Root layout’ta Header/Footer render edilmiyor.

---

## 3) Bileşenler “yok mu”?

- **İddia:** Bileşenler **dosya olarak var**; layout/page’de **kullanılmıyor**.
- **Komut:** `ls -la src/components`, `ls -la src/components/home src/components/layout src/components/catalog`.
- **Dosya referansı:**  
  - [src/components/Navbar.tsx](src/components/Navbar.tsx), [src/components/Footer.tsx](src/components/Footer.tsx), [src/components/layout/header.tsx](src/components/layout/header.tsx) (export `Header`), [src/components/layout/footer.tsx](src/components/layout/footer.tsx) (export `Footer`), [src/components/home/home-hero-banners.tsx](src/components/home/home-hero-banners.tsx) (export `HomeHeroBanners`), [src/components/home/home-brand-grid.tsx](src/components/home/home-brand-grid.tsx) (export `HomeBrandGrid`), [src/components/catalog/product-card.tsx](src/components/catalog/product-card.tsx), [src/components/catalog/product-grid.tsx](src/components/catalog/product-grid.tsx) — hepsi mevcut.
- **Sonuç:** **“Dosya var ama kullanılmıyor.”** (Ana sayfa ve root layout bu bileşenleri import etmiyor.)

---

## 4) Geçmişte ana sayfada “home” yapılmış mı?

- **İddia:** `src/app/page.tsx` geçmişinde HomeHeroBanners / HomeBrandGrid / ProductGrid **hiç yok**.
- **Komut:** `git log --oneline -- src/app/page.tsx` → çıktı: 62088da (sadece).
- **Komut:** `git blame src/app/page.tsx | head -40` → tüm satırlar ^62088da.
- **Komut:** `git log -S "HomeHeroBanners" -S "HomeBrandGrid" -S "ProductGrid" --oneline -- src/app/page.tsx` → **boş.**
- **Dosya + satır:** [src/app/page.tsx](src/app/page.tsx) — git blame ile tüm satırlar 62088da’ya ait.
- **Sonuç:** Kanıtlı. Geçmişte “home” bileşenleri page.tsx’te hiç commit edilmemiş.

---

## 5) formatPrice / formatProductName

- **İddia:** utils’te export **var**; product-info ve product-card import ediyor; cart-sheet ve checkout’ta **yerel** formatPrice var (duplicate).
- **Komut:** `rg -n "formatPrice|formatProductName" src -S`.
- **Dosya + satır:**  
  - [src/lib/utils.ts](src/lib/utils.ts) satır 9: `export function formatPrice(kurus: number)`; satır 19: `export function formatProductName(title: string)` — **var.**  
  - [src/components/product/product-info.tsx](src/components/product/product-info.tsx) satır 1: `import { formatPrice, formatProductName } from "@/lib/utils"`; satır 42–43 kullanım.  
  - [src/components/catalog/product-card.tsx](src/components/catalog/product-card.tsx) satır 3: aynı import; satır 21, 58 kullanım.  
  - [src/components/cart/cart-sheet.tsx](src/components/cart/cart-sheet.tsx) satır 17–24: `function formatPrice(kurus: number)` (yerel); satır 45, 113 kullanım — utils import yok.  
  - [src/app/checkout/page.tsx](src/app/checkout/page.tsx) satır 15: yerel `function formatPrice(kurus: number)`; satır 72, 79, 84, 121 kullanım — utils import yok.
- **Sonuç:** Kanıtlı. Export var; import edenler product-info, product-card; çakışan yerel fonksiyonlar cart-sheet (17–24), checkout/page (15).

---

## 6) Build / lint hataları

- **İddia:** Build, auth → db/connection ve db/schema export uyumsuzluğu yüzünden başarısız; lint’te auth.ts:17 `any` hatası var.
- **Komut:** `npm run build` — exit 1.
- **Dosya + satır:**  
  - [src/auth.ts](src/auth.ts) satır 4: `getDbForAdapter` — [src/db/connection.ts](src/db/connection.ts) bu export’u sunmuyor.  
  - [src/auth.ts](src/auth.ts) satır 5: `users, accounts, sessions, verificationTokens` — [src/db/schema.ts](src/db/schema.ts) bu export’ları sunmuyor.  
  - Build bu yüzden “Turbopack build failed” ile bitiyor.
- **Komut:** `npm run lint` — 1 error, 2 warning.
- **Dosya + satır:** [src/auth.ts](src/auth.ts) satır 17: `Unexpected any` (@typescript-eslint/no-explicit-any). [src/app/auth/register/page.tsx](src/app/auth/register/page.tsx) satır 5: AuthCard unused. [src/app/urun/[slug]/page.tsx](src/app/urun/[slug]/page.tsx) satır 157: no-img-element.
- **Sonuç:** Kanıtlı. Build hatası auth.ts satır 4–5 ve db/connection, db/schema; lint hatası auth.ts satır 17.

---

## 7) / ve /search “neden patlıyor?”

- **İddia:** “Patlama” build ve auth kullanan sayfalarla ilgili; / tek başına template olduğu için dev’de açılabilir; /search auth kullanmıyor, dev’de çalışıyor olabilir.
- **Kanıt:** Build, auth.ts → db/connection + db/schema import’ları yüzünden fail. Auth, [src/app/checkout/layout.tsx](src/app/checkout/layout.tsx) ve [src/app/api/auth/[...nextauth]/route.ts](src/app/api/auth/[...nextauth]/route.ts) üzerinden dahil. / sadece [src/app/page.tsx](src/app/page.tsx) + root layout; layout auth.ts import etmiyor, sadece AuthProvider. /search doğrudan auth import etmiyor.
- **BİLİNMİYOR:** Tarayıcıda / veya /search’e girildiğinde tam hangi istisna/hata göründüğü bu rapora yazılmadı. Sadece build/lint kanıtı var.

---

## 8) DB / API

- **Komut:** `docker ps -a | rg "arti-optik-postgres|postgres"` → arti-optik-postgres Up 2 hours (healthy), 5433→5432.
- **Komut:** `curl -s "http://localhost:3000/api/search?q=ray&limit=3"` → HTTP 200, JSON items.
- **DB down testi:** **Yapılmadı.** Kullanıcı onayı olmadan `docker stop` çalıştırılmadı.
- **Sonuç:** DB açıkken API cevap veriyor. DB kapalıyken davranış: BİLİNMİYOR (test yok).

---

## SON — ÖZET

### Ne durumdayız?

1. Branch: **chore/track-core**, HEAD **12c9829**. origin/main **5cc6d28**. Working tree’de tracked değişiklik yok; untracked: docs/forensics, docs/gemini, drizzle migration/snapshot, scripts, tools/*.mjs.
2. **/** route’u **[src/app/page.tsx](src/app/page.tsx)** ile sunuluyor; içerik create-next-app şablonu (Next logo, “To get started…”, Vercel/Next linkleri).
3. **Root layout** [src/app/layout.tsx](src/app/layout.tsx) sadece provider’lar + `{children}`; **Header/Footer/Navbar render edilmiyor**.
4. **Home bileşenleri** ([src/components/home/home-hero-banners.tsx](src/components/home/home-hero-banners.tsx), [src/components/home/home-brand-grid.tsx](src/components/home/home-brand-grid.tsx)), **layout/header, layout/footer** dosya olarak **var**; ana sayfa ve layout’ta **hiçbiri kullanılmıyor**.
5. **Build** auth → db/connection (getDbForAdapter) ve db/schema (users/accounts/sessions/verificationTokens) export uyumsuzluğu yüzünden **başarısız**. **Lint** 1 error (auth.ts:17 any), 2 warning.
6. **DB** (arti-optik-postgres) açık; **/api/search?q=ray&limit=3** HTTP 200, JSON dönüyor.

### Sorun ne? (kanıtlı)

- **Ana sayfa** şablon; proje bileşenleri (Hero, BrandGrid, Header, Footer) **hiç render edilmiyor** — kanıt: `rg` ile layout/page’de bu bileşenlere import yok; `sed` ile layout ve page içeriği gösterildi.
- **Build** auth.ts satır 4–5 ve db/connection + db/schema export’ları yüzünden kırık — kanıt: `npm run build` çıktısı ve [src/auth.ts](src/auth.ts), [src/db/connection.ts](src/db/connection.ts), [src/db/schema.ts](src/db/schema.ts) referansı.

### Neden eksik sanılıyor? (kanıtlı)

- Bileşenler **silinmemiş**; **kullanılmıyor**. Kanıt: `ls` ile Navbar, Footer, layout/header, layout/footer, home-hero-banners, home-brand-grid mevcut; `rg "components/(Navbar|Footer|layout/header|layout/footer)"` → No matches. Yani “eksik” = “ekranda yok” = “hiçbir yerde import/render edilmiyor”.

### En güvenli şekilde nasıl düzeltilir? (2 seçenek, küçük adım)

- **Seçenek A (en küçük):** [src/app/page.tsx](src/app/page.tsx)’i template yerine `HomeHeroBanners` + `HomeBrandGrid` render edecek hale getir. Tek dosya, tam diff [docs/forensics/RECOVERY_PLAN.md](docs/forensics/RECOVERY_PLAN.md) içinde.
- **Seçenek B:** [src/app/layout.tsx](src/app/layout.tsx)’te `Header` ve `Footer` import edip `{children}`’ı bunlarla sarmala; tüm sayfalarda navbar/footer görünür. Diff RECOVERY_PLAN’da.
- **Güvenlik:** Önce `git branch backup-YYYYMMDD-pre-recovery` ve isteğe bağlı `tar` yedek; destructive komut (reset/clean/checkout .) çalıştırılmaz.

### Kayıp var mı? (kanıt + bilinmeyen)

- **Kanıt:** Bileşen dosyaları mevcut; `git log/blame -S "HomeHeroBanners|HomeBrandGrid" -- src/app/page.tsx` boş → bu repoda ana sayfada hiç kullanılmamış. Yani **“silinmiş” bir home sayfası yok**; **kayıp yok**, sadece **hiç bağlanmamış**.
- **RECOVERY2 Phase 2 — Dangling commit:** `git fsck --lost-found --no-reflogs` → **dangling commit ddacf80e3ac68ce7fc0399bc2eb573643c5df30f**. `git show ddacf80 --stat`: merge "WIP on main: 5cc6d28 …"; **src/app/page.tsx | 212 +155 -57**. Yani reflog dışında kalmış bir commit’te page.tsx büyük değişiklik içeriyor; geri yükleme denemesi yapılmadı (planda yasak).
- **Bilinmeyen:** Tarayıcıda / veya /search’te görülen tam hata metni bu raporda yok. DB kapalıyken API/UI davranışı test edilmedi.
