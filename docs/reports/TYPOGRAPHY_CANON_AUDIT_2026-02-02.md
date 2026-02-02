# Typography Canon Compliance Audit — Report Only

**Tarih:** 2026-02-02  
**Proje:** arti-optik-next  
**Referans:** [docs/design/01.design-rules-v1.md](../design/01.design-rules-v1.md), [src/app/design/page.tsx](../../src/app/design/page.tsx)  
**Kapsam:** Font-family, type scale (text size), rhythm (leading, tracking), font weight. Sadece rapor; otomatik fix yapılmadı.

---

## 1. Executive Summary

- **Toplam ihlal (benzersiz konum):** font-family 1, text size arbitrary 2, leading 3, tracking 4 (1 arbitrary).
- **En çok tekrar eden pattern'ler:**
  1. Arbitrary text size: `text-[15px]`, `text-[11px]`
  2. Arbitrary tracking: `tracking-[0.12em]`
  3. Canon dışı leading: `leading-snug` (design page’te yok)
  4. Canon dışı tracking: `tracking-wide`, `tracking-wider` (design page’te yok)
  5. Canon dışı font-family: `font-cormorant` (workshop)
- **Riskli yerler:** Sticky product bar (arbitrary text size), catalog product card (arbitrary text + tracking + leading-snug), workshop (font-cormorant + tracking-wider), product info/card (tracking-wide), hero banners (leading-snug).

---

## 2. STEP 0 — Source of Truth Doğrulama

| Dosya | Durum | Path / Kanıt |
|-------|--------|----------------|
| Design Page (Living Style Guide) | Bulundu | `src/app/design/page.tsx` |
| Design Rules | Bulundu | `docs/design/01.design-rules-v1.md` (typography açık bölüm yok; canon design page’ten) |
| tailwind.config.ts | Bulundu | Custom fontFamily / fontSize / lineHeight / letterSpacing yok; canon design page + Tailwind default scale |
| globals.css | Bulundu | `--font-display`, `--font-body`, `--font-numbers` (@theme, lines 7–13) |
| layout.tsx | Bulundu | `fontDisplay`, `fontBody`, `fontNumbers` from `@/lib/fonts`; body `font-body` (line 33) |
| lib/fonts.ts | Bulundu | DM Sans (display), Plus Jakarta Sans (body), Manrope (numbers) |

---

## 3. STEP 1 — Canon Whitelist (Design Page Merkezli)

### 3.1 Allowed Font-Family Classes

**Kaynak:** `src/app/design/page.tsx`, `src/app/globals.css` @theme, `src/lib/fonts.ts`.

- **Canon:** `font-display`, `font-body`, `font-numbers`.
- **İstisna (debug / teknik):** `font-mono` (token adları, order id, kbd, code).

**Kanıt (design page):** Örn. satır 137 `font-display`, 140 `font-body`, 175–176 `font-mono`, 371 `font-numbers`.

### 3.2 Allowed Text Size Classes

**Kaynak:** `src/app/design/page.tsx`. Tailwind config’te custom fontSize yok → **Unknown** (scale design page örneklerinden çıkarıldı).

- **Canon (design page’te kullanılan):** `text-xs`, `text-sm`, `text-base`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`, `text-5xl`, `text-6xl` (responsive: `md:text-6xl`, `md:text-5xl`, `sm:text-2xl` vb.).

### 3.3 Allowed Leading Classes

**Kaynak:** `src/app/design/page.tsx`.

- **Canon:** `leading-relaxed`, `leading-none`, `leading-tight`.

**Kanıt:** Satır 348–353 `leading-relaxed`, 564/573/582 `leading-none`, 323/855/891/926 `leading-tight`.

### 3.4 Allowed Tracking Classes

**Kaynak:** `src/app/design/page.tsx`.

- **Canon:** `tracking-tighter`, `tracking-tight`, `tracking-widest`.

**Kanıt:** Satır 137/170/311/317/323/403 `tracking-tighter`, 323/855/891/926 `tracking-tight`, 163/298/310/368/409/422/597/840/852 `tracking-widest`.

### 3.5 Allowed Font Weight Classes

**Kaynak:** `src/app/design/page.tsx`.

- **Canon:** `font-medium`, `font-semibold`, `font-bold`.

**Kanıt:** Örn. 149 `font-medium`, 162/297/317/429 `font-semibold`, 137/170/188/311 `font-bold`.

### 3.6 Sayısal metin (tabular-nums)

Design page fiyat/veri için `font-numbers` + `tabular-nums` kullanıyor (örn. satır 371, 378, 382, 388, 869). Bu kombinasyon kanon beklentisi; sapmalar raporda “review-needed” olarak işaretlendi.

---

## 4. Findings Table

| type | severity | file | line | snippet | why | recommended_fix |
|-----|----------|------|------|---------|-----|----------------|
| font-family | medium | src/app/workshop/page.tsx | 55 | `font-cormorant text-4xl ...` | Canon dışı font-family | `font-display` veya exception dokümante et |
| size (arbitrary) | high | src/components/product/sticky-product-bar.tsx | 48 | `text-[15px] font-semibold` | Arbitrary text size | `text-base` veya `text-sm` |
| size (arbitrary) | high | src/components/catalog/product-card.tsx | 66 | `text-[11px] ... tracking-[0.12em]` | Arbitrary text size + tracking | `text-xs`, `tracking-widest` |
| tracking (arbitrary) | high | src/components/catalog/product-card.tsx | 66 | `tracking-[0.12em]` | Arbitrary letter-spacing | `tracking-widest` |
| leading | medium | src/components/catalog/product-card.tsx | 71 | `leading-snug` | Canon’da yok (relaxed, none, tight) | `leading-tight` veya `leading-relaxed` |
| leading | medium | src/components/home/home-hero-banners.tsx | 74 | `leading-snug` | Aynı | `leading-tight` veya `leading-relaxed` |
| tracking | medium | src/components/product/product-info.tsx | 23 | `tracking-wide` | Canon’da yok | `tracking-widest` |
| tracking | medium | src/components/product/product-card.tsx | 50 | `tracking-wide` | Aynı | `tracking-widest` |
| tracking | medium | src/app/workshop/page.tsx | 99 | `tracking-wider` | Canon’da yok | `tracking-widest` |

---

## 5. Exceptions / Intentional

- **font-mono (design page dışı):**  
  - [src/app/checkout/success/page.tsx](../../src/app/checkout/success/page.tsx) satır 21: Sipariş/order bilgisi gösterimi. Design rules: “font-mono sadece debug/teknik etiket (allowed exception)”. Order ID teknik/readout sayıldığı için **exception** olarak bırakıldı.
- **Design page:** Tüm typography örnekleri canon kaynağı; ihlal sayılmadı.
- **Partial canon / review-needed:**  
  - tailwind.config.ts’te custom fontSize/lineHeight/letterSpacing yok; scale tamamen design page örneklerinden çıkarıldı. Design page’te geçmeyen standart Tailwind text/leading/tracking sınıfları “potansiyel tutarsızlık” veya “review-needed” olarak değerlendirilebilir.

---

## 6. Tarama Komutları (Kanıt)

`src` altında (`.next` / `node_modules` hariç) çalıştırılan komutlar:

**Font-family (canon dışı):**
```bash
rg -n "(^|\s)font-(sans|serif|mono)\b" src
rg -n "(^|\s)font-\[[^\]]+\]" src
rg -n "(^|\s)font-[a-zA-Z0-9_-]+\b" src
```
- font-mono: design/page + checkout/success (exception).
- font-cormorant: workshop/page.tsx (ihlal).

**Arbitrary text size:**
```bash
rg -n "(^|\s)text-\[[^\]]+\]" src
```
- text-[15px]: sticky-product-bar.tsx; text-[#111111]: brand-logo-tile (renk, typography değil); text-[11px]: catalog/product-card.tsx.

**Leading:**
```bash
rg -n "(^|\s)leading-[a-zA-Z0-9_-]+\b" src
rg -n "(^|\s)leading-\[[^\]]+\]" src
```
- leading-snug: catalog/product-card, product-info (leading-relaxed da var), home-hero-banners, workshop. Canon dışı: leading-snug.

**Tracking:**
```bash
rg -n "(^|\s)tracking-[a-zA-Z0-9_-]+\b" src
rg -n "(^|\s)tracking-\[[^\]]+\]" src
```
- tracking-[0.12em]: catalog/product-card (high). tracking-wide: product-info, product-card. tracking-wider: workshop.

---

## 7. Next Actions (Öneri — Uygulama Yapılmadı)

1. **Dalga 1 — Yüksek öncelik (arbitrary):**  
   sticky-product-bar `text-[15px]` → `text-base` veya `text-sm`; catalog product-card `text-[11px]` ve `tracking-[0.12em]` → `text-xs` + `tracking-widest`.
2. **Dalga 2 — Orta öncelik (canon dışı utility):**  
   leading-snug → leading-tight/relaxed (catalog product-card, home-hero-banners); tracking-wide → tracking-widest (product-info, product-card); workshop tracking-wider → tracking-widest; workshop font-cormorant → font-display veya exception dokümantasyonu.
3. **Dalga 3 — Gözden geçirme:**  
   Sayısal metinlerde `font-numbers` + `tabular-nums` kullanımını tüm fiyat/order alanlarında kontrol et; design page canon’u kapsamadığı için “review-needed” kalan sınıfları dokümante et.

PR veya otomatik fix bu raporda yapılmadı; sadece rapor üretildi.

---

## 8. Evidence Checklist

- [x] Design page path doğrulandı
- [x] Design rules path doğrulandı
- [x] tailwind.config.ts + layout.tsx + globals.css + lib/fonts.ts incelendi
- [x] Font-family taraması tamam
- [x] Text size (standart + arbitrary) taraması tamam
- [x] Leading + tracking taraması tamam
- [x] Findings table’da her satırda file/line/snippet var
- [x] Exceptions / Unknown ayrı listelendi
