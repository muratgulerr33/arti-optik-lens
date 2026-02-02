# Design Token & Typography Compliance Audit — Report Only

**Tarih:** 2026-02-02  
**Proje:** arti-optik-next  
**Referans:** [docs/design/01.design-rules-v1.md](../design/01.design-rules-v1.md), [src/app/design/page.tsx](../../src/app/design/page.tsx)  
**Kapsam:** Renk (token dışı) ve font-family (canon dışı) kullanımları. Otomatik fix yapılmadı.

---

## 1. Executive Summary

- **Toplam ihlal (benzersiz konum):** Renk ~14, Font 1 (font-cormorant).
- **En çok tekrar eden pattern’ler:**
  1. `bg-white` / `dark:bg-white` (kart/media yüzeyleri)
  2. `text-gray-*` / `border-gray-*` (auth kartı)
  3. `text-zinc-900/25`, `text-red-500`, `fill-red-500` (favori butonu)
  4. `text-white` / `text-white/85` (hero banner metin)
  5. `text-green-600` / `text-yellow-600` (design sayfası A11y durum ikonları — status exception)
- **Riskli yerler:** Auth (giriş kartı), Favori butonu (global kullanım), PDP/listing (ürün kartı bg-white), Hero (banner metin), Workshop (canon dışı font).

---

## 2. STEP 0 — Dosya Doğrulama

| Dosya | Durum | Path |
|-------|--------|------|
| Design Rules | Bulundu | `docs/design/01.design-rules-v1.md` |
| Design Page (Living Style Guide) | Bulundu | `src/app/design/page.tsx` |
| Token kaynağı (CSS) | Bulundu | `src/app/globals.css` |
| Tailwind config | Bulundu | `tailwind.config.ts` |
| Layout (font/ThemeProvider) | Bulundu | `src/app/layout.tsx` |

---

## 3. STEP 1 — Allowed Set (Whitelist)

### 3.1 Allowed Color Classes

**Kaynak:** `src/app/globals.css` @theme (--color-* mapping), `tailwind.config.ts` (ring, ring-offset, focus-outline).

- **Background/Surface:** `bg-background`, `bg-card`, `bg-popover`, `bg-muted`, `bg-accent`, `bg-secondary`, `bg-primary`, `bg-destructive`, `bg-white` yok (kart için token: `bg-card`).
- **Text:** `text-foreground`, `text-muted-foreground`, `text-card-foreground`, `text-popover-foreground`, `text-primary`, `text-primary-foreground`, `text-secondary-foreground`, `text-accent-foreground`, `text-destructive-foreground`.
- **Border/Input/Ring:** `border-border`, `border-input`, `ring-ring`, `ring-offset-background` (ve `ring-offset`).
- **Opacity suffix allowed:** `text-primary/70`, `border-primary/20` vb.

### 3.2 Allowed Font-Family Classes

**Kaynak:** `src/app/design/page.tsx`, `src/lib/fonts.ts`, `src/app/globals.css` @theme (--font-display, --font-body, --font-numbers).

- **Canon:** `font-display`, `font-body`, `font-numbers`.
- **İstisna (debug/teknik):** `font-mono` (token adları, order id vb.).

---

## 4. Findings Table

| type | severity | file | line | snippet | why | recommended_fix |
|------|----------|------|------|---------|-----|-----------------|
| color | high | src/components/auth/auth-card.tsx | 288 | `border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-white dark:text-gray-700 dark:hover:bg-gray-100` | Token dışı palette (gray, white) | `border-border bg-card text-foreground hover:bg-accent dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-accent` |
| color | high | src/components/auth/auth-card.tsx | 297 | `border-0 bg-[#1877F2] text-white hover:bg-[#1864D9]` | Hard-coded hex (Facebook marka) | Token’a taşı veya “brand exception” dokümante et; tercihen `bg-primary text-primary-foreground` veya ayrı --facebook token |
| color | high | src/components/favorites/favorite-button.tsx | 121 | `text-zinc-900/25` + `drop-shadow-[0_1px_1px_rgba(0,0,0,0.28)]` | Palette + inline rgba | `text-muted-foreground/25` veya `text-foreground/25`; shadow için token/utility |
| color | high | src/components/favorites/favorite-button.tsx | 128 | `fill-red-500 text-red-500` / `fill-transparent text-zinc-900/25` | Palette (red, zinc) | Favori durumu için: `text-primary`/`fill-primary` (aktif), `text-muted-foreground/25` (pasif); Design Rules V1’de status token yok — exception listesine alınabilir |
| color | medium | src/components/home/home-brand-grid-item.tsx | 14 | `bg-white` … `dark:bg-white` `ring-black/5` `dark:ring-black/10` | Token dışı white/black | `bg-card`; ring için `ring-border` veya `ring-foreground/5` |
| color | medium | src/components/catalog/product-card.tsx | 48 | `bg-white dark:bg-white ring-1 ring-inset ring-black/10` | Aynı | `bg-card`; `ring-border` veya `ring-foreground/10` |
| color | medium | src/components/ui/slider.tsx | 56 | `bg-white` | Thumb rengi | `bg-card` veya `bg-background` |
| color | medium | src/components/home/brand-logo-tile.tsx | 46 | `text-[#111111]` | Hard-coded hex | `text-foreground` |
| color | medium | src/components/home/home-hero-banners.tsx | 70, 73-74 | `text-white`, `text-white/85` | Hero overlay metin | Token: `text-primary-foreground` veya overlay için ayrı token; geçici: `text-primary-foreground` |
| color | low (exception) | src/app/design/page.tsx | 772, 774 | `text-green-600`, `text-yellow-600` | A11y durum ikonları; Design Rules: status colors V1 dışı | Exceptions bölümünde listelendi; ileride status token ile değiştirilebilir |
| color | low | src/components/auth/auth-card.tsx | 35-38 | SVG `fill="#4285F4"` vb. | Google logo marka renkleri (SVG path) | Brand asset exception; dokümante edilebilir, değiştirme zorunlu değil |
| color | — | src/app/design/page.tsx | 177, 195, 210, … | `oklch(...)` JSX içi string (token değeri gösterimi) | CSS değil, runtime token değeri readout | İhlal değil; rapor dışı |
| font | medium | src/app/workshop/page.tsx | 55 | `font-cormorant text-4xl …` | Canon dışı (sadece font-display, font-body, font-numbers, font-mono) | `font-display` (veya sayfa özel amacı varsa “Workshop exception” dokümante et) |

---

## 5. Exceptions

- **Status palette (Design Rules V1 dışı):**  
  - [src/app/design/page.tsx](../../src/app/design/page.tsx) satır 772, 774: `text-green-600`, `text-yellow-600` — A11y check durum ikonları. V1’de status tokenization yok; ileride token ile değiştirilebilir.
- **Brand assets (renk sabit kalabilir):**  
  - [src/components/auth/auth-card.tsx](../../src/components/auth/auth-card.tsx): Google logo SVG `fill="#4285F4"` vb.; Facebook butonu `bg-[#1877F2]`. Marka rengi olarak dokümante edilip “allowed exception” yapılabilir.
- **Token value display:**  
  - design/page.tsx içinde `oklch(...)` string’leri yalnızca token değeri göstermek için; CSS/style ihlali sayılmadı.

---

## 6. Tarama Komutları (Kanıt)

Aşağıdaki komutlar `src` altında (`.next` / `node_modules` hariç) çalıştırıldı.

**Palette renk sınıfları:**
```bash
rg -n "(^|\\s)(bg|text|border|ring|from|to|via)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|stone|slate|gray|zinc|neutral)-[0-9]{2,3}" src
```
Çıktı: 5 eşleşme (favorite-button, auth-card, design/page).

**Hard-coded renk (hex/rgb/hsl/oklch):**
```bash
rg -n "#([0-9a-fA-F]{3,8})\b|rgb\(|hsl\(|oklch\(" src --glob "*.{tsx,ts,jsx,js}"
```
Çıktı: 14 eşleşme (auth-card SVG/button, brand-logo-tile, design/page token fallback string’leri).

**Font canon dışı:**
```bash
rg -n "(^|\\s)font-(sans|serif|mono)\\b" src
rg -n "(^|\\s)font-\\[[^\\]]+\\]" src
rg -n "(^|\\s)font-[a-zA-Z0-9_-]+\\b" src
```
font-cormorant: workshop/page.tsx; font-mono design/checkout’ta allowed exception; font-display, font-body, font-numbers whitelist’te.

---

## 7. Next Actions (Öneri — Uygulama Yapılmadı)

1. **Dalga 1 — Global/UI:**  
   `favorite-button` (zinc/red → token), `auth-card` (gray/white/hex → token veya exception dokümantasyonu), `slider` (bg-white → bg-card).
2. **Dalga 2 — Bileşenler:**  
   `home-brand-grid-item`, `product-card` (catalog), `brand-logo-tile` — bg-white / ring-black / text-#111111 → token.
3. **Dalga 3 — Sayfalar / özel:**  
   Hero banner metin (`text-white` → token), Workshop `font-cormorant` → `font-display` veya exception, design sayfası status renkleri (V2 status token’a bırakılabilir).

PR/otomatik fix bu raporda yapılmadı; sadece rapor üretildi.

---

## 8. Evidence Checklist

- [x] Design rules path doğrulandı
- [x] Design page path doğrulandı
- [x] globals.css + tailwind.config.ts incelendi
- [x] rg çıktıları rapora yansıtıldı
- [x] Her bulguda file/line/snippet var
- [x] Exceptions ayrı listelendi
