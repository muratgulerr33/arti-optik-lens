# Reality Snapshot — Mimari Rapor (Q&A Cevapları)

Bu dosya, **00.masterpack-arti-optik-v0.md** içindeki Backlog’a temel oluşturmak üzere “gerçek durum” sorularına verilen cevapları içerir.  
Sadece repo okunarak hazırlanmıştır; hiçbir dosya değiştirilmemiştir.

---

## A) Şu an gerçekten çalışan ekranlar

### 1. Çalışan route’lar

**Done:**
- `/` — Home: Hero, cinsiyet hub (Kadın/Erkek/Unisex), öne çıkan ürünler (DB), marka rail, şekil rail. DB’den `getFeaturedProducts()` ve `getPopularBrandNames()` ile veri alınıyor.
- `/urun/[slug]` — Ürün detay: `ProductGallery`, `ProductInfo`, `AddToCart`, `Breadcrumbs`. Veri `getProductBySlug(slug)` ile DB’den.
- `/kategori/[gender]/gunes-gozlugu` — Ürün listesi: `kadin`, `erkek`, `unisex`. `CategoryContent` + `ProductCard`; veri DB’den `getProductsByGender()`.
- `/search` — Arama sayfası: `SearchClient`; API `/api/search?q=...` kullanılıyor.
- `/auth/login`, `/auth/register` — Auth sayfaları (NextAuth).
- `/hesabim`, `/hesabim/adresler`, `/hesabim/siparisler` — Hesabım alanı (layout + sayfalar mevcut).
- `/design`, `/workshop` — Ek sayfalar (içerik/amaç kod incelemesinde net değil).

**In progress:** — (belirtilecek bir şey yok)

**Planned / Eksik:**
- `/hub/unisex?shape=...` — Anasayfadaki “Şekle Göre” badge’leri `/hub/unisex?shape=...` linkine gidiyor; `app/hub/` route’u **yok**. Tıklanınca 404.
- `/checkout` — Cart sheet içinde “Sepete Git” `/checkout` linkine gidiyor; `app/checkout/` **yok**. 404.
- Footer linkleri: `/hakkimizda`, `/iletisim`, `/gizlilik`, `/kullanim-kosullari` — `layout/footer` bu href’leri kullanıyor; bu path’ler için `app/` altında sayfa **görülmedi**.

**Unknown:** —  

**Legacy cleanup:** —

### 2. Home (`/`) durumu

**Done:** Boş veya placeholder değil. Hero, cinsiyet butonları, “Öne Çıkan Ürünler” (DB), “Popüler Markalar” (DB), “Şekle Göre” rail’i ile dolu bir ana sayfa. Redirect yok.

---

## B) Navigation & Layout

### 3. Header — var mı, içinde neler var?

**Done:** Evet. `@/components/layout/header` kullanılıyor (`layout.tsx`). İçerik:
- **Logo:** “ARTI OPTİK” → `/`
- **Ara:** `/search` (Search ikonu)
- **Sepet:** `openCart()` ile cart sheet açılıyor (Zustand)
- **Kullanıcı:** Girişte “Hesabım” → `/hesabim`, değilse “Giriş Yap” → `/auth/login`  
Scroll’da gizlenip tekrar gösteriliyor (`useScrollDirection`).

**Legacy cleanup:** `Navbar.tsx` (root’ta) hâlâ var; layout’ta **kullanılmıyor**. Eski path’lere link veriyor: `/gunes-gozlugu/kadin`, `/gunes-gozlugu/erkek`, `/koleksiyonlar`. ARTI OPTİK’te asıl kullanılan route’lar `/kategori/.../gunes-gozlugu`.

### 4. Bottom nav

**Done:** Kodda **bottom nav yok**. `layout.tsx` yapısı: `Header` + `main` + `Footer`. Mobil alt menü (bottom nav) hiç kullanılmıyor.

**Legacy cleanup:** Bottom nav için component görülmedi; silinmiş veya hiç eklenmemiş.

### 5. Global layout (app/layout.tsx) — clone’dan bariz kalanlar

**Done:** Kullanılan yapı:
- `ThemeProvider`, `AuthProvider`, `FavoritesProvider`, `CartProvider`, `HeaderProvider`, `SearchProvider`
- `Header` (`@/components/layout/header`)
- `main.pt-16` + `children`
- `Footer` (`@/components/layout/footer`)
- `Toaster`
- Font: `fontDisplay`, `fontBody`, `fontNumbers` → `@/lib/fonts` (Geist değil)

**Legacy cleanup:** Layout’ta eski navbar/footer wrapper veya “clone”a özgü container yok. İki ayrı footer dosyası var: `Footer.tsx` (root, default export, grid/koleksiyon yapılı) ve `layout/footer.tsx` (named export, sade linkler). **Sadece** `layout/footer.tsx` import ediliyor; `Footer.tsx` kullanılmıyor.

---

## C) Typography (Geist sızıntısı)

### 6. Projede import edilen fontlar

**Done:**  
`src/lib/fonts.ts`:
- **DM Sans** — display (variable: `--font-display`)
- **Plus Jakarta Sans** — body (variable: `--font-body`)
- **Manrope** — numbers (variable: `--font-numbers`)

**Legacy cleanup:** **Geist**, kaynak kodda import edilmiyor. Sadece `docs/` ve `README.md` içinde eski dokümantasyon olarak geçiyor; layout ve `globals.css` `@/lib/fonts` kullanıyor. Tailwind `tailwind.config.ts` içinde yalnızca `--font-display`, `--font-body`, `--font-numbers` referans alıyor; Geist/Geist Mono yok.

### 7. DM Sans + Cagarta

**Done:** DM Sans kullanılıyor: `lib/fonts.ts` ve layout’ta `fontDisplay.variable` ile class’a veriliyor; `globals.css` ve `tailwind.config.ts` ile UI’da display/body/numbers olarak uygulanıyor.

**Unknown / Planned:** “Cagarta” adlı font projede (import, CSS, config) **hiç geçmiyor**. Sadece DM Sans + Plus Jakarta Sans + Manrope var. Cagarta tasarım kararı veya ileride eklenecek bir şeyse, kodda henüz yok.

---

## D) UI Components — ne var ne yok

### 8. Bileşenlerin varlığı

| Bileşen | Durum | Not |
|--------|--------|-----|
| ProductCard | **Var** | `@/components/catalog/product-card` — home, kategori, search’te kullanılıyor. |
| ProductGallery / Image slider | **Var** | `@/components/product/product-gallery` — Embla carousel; `/urun/[slug]` içinde. |
| Price | **Var** | `ProductInfo` ve `ProductCard` içinde; `formatPrice()` (kuruş → TRY). |
| Discount badge | **Yok** | ProductCard/ProductInfo’da indirim oranı veya “İndirim” badge’i yok. Sadece “Taksit” badge’i (ProductInfo) var. |
| AddToCart button | **Var** | `@/components/product/add-to-cart` — ürün sayfasında kullanılıyor. |
| Header | **Var** | `@/components/layout/header` — logo, search, cart, user. |
| Cart drawer | **Var** | `CartSheet` (`cart/cart-sheet.tsx`), `CartProvider` içinde render; Header’daki sepete tıklanınca açılıyor. |
| Cart page | **Yok** | Ayrı `/sepet` veya `/cart` sayfası yok; sadece drawer/sheet. |

### 9. Clone’dan kalan / ARTI OPTİK’te olmayacak bileşenler

**Legacy cleanup (silinmesi veya kullanıma alınması tartışılacak):**

1. **`Navbar.tsx`** — Layout’ta kullanılmıyor; `/gunes-gozlugu/...`, `/koleksiyonlar` linkleri mevcut route’larla uyumsuz.
2. **`Footer.tsx`** (root) — Layout `layout/footer.tsx` kullanıyor; bu dosya kullanılmıyor, daha “eski” grid/koleksiyon yapısında.
3. **`ProductCard.tsx`** (root) — Hiçbir yerde import edilmiyor; tüm kullanım `catalog/product-card`. Muhtemel clone artığı.
4. **`design/page.tsx`**, **`workshop/page.tsx`** — Ne işe yaradıkları ve kalıp kalmayacakları net değil; “clone’dan kalan” adayı olarak sayılabilir.

Daha fazla clone bileşeni için tüm `src/components` import grafiği ile kullanılmayan export’lar taranabilir.

---

## E) Data / Backend

### 10. Ürün verisi nereden geliyor?

**Done:** **DB (PostgreSQL + Drizzle)**.  
Home, kategori, ürün detay doğrudan `db` (`@/db/connection`) ile server component’lerde sorgulanıyor.  
Arama istemci tarafında `/api/search?q=...` çağrılıyor; bu API route da `db` kullanıyor. Hardcoded JSON veya static mock yok.

### 11. DB bağlantısı — PostgreSQL + Drizzle

**Done:**  
- `src/db/connection.ts`: `drizzle-orm/node-postgres` + `pg` Pool, `DATABASE_URL` ile lazy init.
- `src/db/schema.ts`: Şema tanımları mevcut.
- `drizzle/`: `0000_...`, `0001_chubby_spectrum.sql`, `0002_free_hex.sql` ve `meta/` snapshot’lar var.
- `package.json`: `db:generate`, `db:migrate`, `db:studio`, `seed:v1`, `seed:brands` script’leri var.

**Unknown:** Migration/seed’in bu ortamda fiilen çalıştırılıp çalıştırılmadığı yalnızca koda bakarak çıkarılamaz; ortamda bir kez çalıştırılıp log/çıktı ile doğrulanmalı.

### 12. API contract (endpoint’ler)

**Done:**  
- `GET /api/search?q=...&limit=...` — Arama; JSON `{ items, categories, fallbackCategory, fallbackItems }` dönüyor.
- `.../api/auth/[...nextauth]` — NextAuth handler.

**Planned / Unknown:** Ürün listesi ve detay için ayrı public REST contract (örn. `GET /api/products`, `GET /api/products/:slug`) yok; şu an sadece server component’ler ve search API’si var.

---

## F) Checkout / Sipariş (V1 kritik)

### 13. Sepet — state + UI

**Done:**  
- **State:** Zustand `cart-store` (id, name, brand, price, quantity, image, slug, productId, variantId). `CartProvider` layout’ta.
- **UI:** `CartSheet` (drawer), Header’da sepet ikonu → `openCart()`. Sepette adet değiştirme/silme, “Sepete Git” linki (`/checkout`) var.

### 14. Checkout ve PayTR

**Planned / Yok:**  
- `app/checkout/` route’u **yok**. Cart’taki “Sepete Git” `/checkout`’a gidiyor; sayfa olmadığı için 404.
- PayTR veya başka ödeme entegrasyonu koda **girilmemiş** (araştırma: “PayTR”, “paytr”, “checkout” — yalnızca metin ve `/checkout` href).

### 15. Kargo (Yurtiçi + sabit kargo)

**Unknown / Yok:**  
Kodda “Yurtiçi”, “kargo”, “shipping” ile ilgili modül/config/business logic **yok**. Sadece metin: ürün açıklamasında “Ücretsiz kargo” ve benzeri ifadeler geçiyor. Kargo kararı ve entegrasyonu kodda henüz yok.

---

## G) Deploy / Çalıştırma

### 16. VPS deploy (pm2 vb.)

**Unknown / Yok:**  
Repo kökünde ve bilinen konumlarda `pm2.config.js`, `ecosystem.config.js`, `pm2*.json` vb. **bulunamadı**. `docker-compose.yml` var; VPS/pm2 akışının bu repoda nereye kadar tanımlı olduğu ayrıca bakılmalı.

### 17. `npm run build` hatasız mı?

**Unknown:**  
Bu rapor **sadece dosya okuması** ile hazırlandı; `npm run build` çalıştırılmadı. Build’in yeşil olup olmadığını görmek için proje kökünde bir kez `npm run build` çalıştırılıp çıktı incelenmeli.

---

## Özet etiketler (Backlog için)

- **Done:** Route’lar (/, /urun/[slug], /kategori/.../gunes-gozlugu, /search, auth, hesabim), Header (logo/search/cart/user), Footer (layout/footer), DM Sans + Plus Jakarta + Manrope, ProductCard/ProductGallery/ProductInfo/AddToCart, Cart state + CartSheet, DB + Drizzle + migration/seed dosyaları, Search API.
- **In progress:** (Bu raporda boş bırakıldı.)
- **Planned:** `/hub/...` route, `/checkout` sayfası, footer sayfaları (/hakkimizda, /iletisim, /gizlilik, /kullanim-kosullari), indirim badge’i, public product API contract.
- **Unknown:** Cagarta kullanımı, migration/seed’in fiilen çalışıp çalışmaması, pm2/VPS akışı, `npm run build` sonucu.
- **Legacy cleanup:** `Navbar.tsx`, `Footer.tsx` (root), `ProductCard.tsx` (root), Geist’e dair doc/README referansları; isteğe bağlı design/workshop sayfalarının netleştirilmesi.

Bu cevaplar, **00.masterpack-arti-optik-v0.md** içindeki Backlog bölümüne ID’li maddeler (AO-001, AO-002, …) olarak taşınabilir.
