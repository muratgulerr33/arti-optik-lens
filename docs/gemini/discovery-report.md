# Gemini Discovery Report — Artı Optik

**Tarih:** 2026-01-28  
**Kapsam:** Routing, state/logic, UI/theme, database şeması — mevcut durum ve eksikler.

---

## 1. ROUTING YAPISI (`src/app`)

### Mevcut Durum
- **`/checkout`:** Klasör ve `page.tsx` mevcut. `src/app/checkout/layout.tsx` ve `src/app/checkout/page.tsx` var; checkout sayfası `useCartStore` ile sepet özeti gösteriyor.
- **Auth:** `(auth)` route grubu yok. Auth sayfaları düz route olarak kurulmuş: `src/app/auth/login/page.tsx`, `src/app/auth/register/page.tsx`.
- **`/hesabim`:** Mevcut. `layout.tsx`, `page.tsx`, `adresler/page.tsx`, `siparisler/page.tsx` ile hesap ve alt sayfalar tanımlı.
- **Sepet route:** `/cart` veya benzeri fiziksel route yok. Sepet yalnızca `CartSheet` (header’dan açılan sheet) ve checkout sayfasında “sepet özeti” olarak kullanılıyor.

### Eksikler
- Auth için route group `(auth)` yok; login/register layout veya ortak wrapper ayrışmamış.
- Sepet için ayrı sayfa (`/sepet` veya `/cart`) yok; sadece sheet + checkout içi özet var.

---

## 2. STATE & LOGIC

### Mevcut Durum
- **Sepet:** `src/store/cart-store.ts` içinde Zustand ile yönetiliyor. `useCartStore` kullanılıyor; checkout ve ürün sayfası bu store’a bağlı.
- **Auth:** NextAuth (Credentials + Drizzle adapter). `src/auth.ts` ve `src/app/api/auth/[...nextauth]/route.ts` ile tanımlı; Clerk veya başka provider yok.
- **Sepet bileşeni:** `src/components/cart/cart-sheet.tsx` içinde `CartSheet`; `src/components/cart/cart-provider.tsx` ile layout’a sarılıyor ve header’da tetikleniyor.

### Eksikler
- Sipariş/ödeme akışı için server action veya API ile order kaydı yok; sadece client-side sepet ve checkout UI var.

---

## 3. UI & THEME

### Mevcut Durum
- **Fontlar:** V1 kurallarına uygun. `src/lib/fonts.ts`: DM Sans (display), Plus Jakarta Sans (body), Manrope (numbers). Layout’ta `fontDisplay`, `fontBody`, `fontNumbers` variable’ları class’a veriliyor; `globals.css` ve `tailwind.config.ts` ile `--font-display`, `--font-body`, `--font-numbers` kullanılıyor.
- **Renkler:** `globals.css` içinde oklch token’lar (warm paper, espresso, primary/secondary/muted vb.) ve dark mode `:root.dark` ile tanımlı. `tailwind.config.ts` sadece `ring`, `ring-offset`, `focus-outline` ve motion token’ları extend ediyor; renkler CSS tarafında.
- **Bileşenler:** `src/components/ui` altında `button`, `input`, `label`, `checkbox`, `card`, `badge`, `accordion`, `separator`, `sheet`, `slider` mevcut.

### Eksikler
- `form` bileşeni (örn. react-hook-form + zod wrapper) yok. Design rules v1’de “Form component library genişletme (Textarea, Select, vb. şu an mevcut değil)” olarak belirtilmiş; Textarea/Select gibi bileşenler UI klasöründe yok.

---

## 4. DATABASE (Schema)

### Mevcut Durum
- **`users`:** Tanımlı. `src/db/schema.ts` içinde `users` tablosu (id, name, email, password, role, emailVerified, image, createdAt); NextAuth için `accounts`, `sessions`, `verificationTokens` de var.
- **Fiyat tipi:** `product_variants.price` `integer` ve kuruş cinsinden (yorumda “Fiyat Kuruş cinsindendir (Örn: 100 TL -> 10000)”).
- **Diğer tablolar:** `brands`, `categories`, `products`, `product_variants` mevcut; ltree kategori path’i, jsonb attributes/images kullanılıyor.

### Eksikler
- **`orders`** tablosu yok.
- **`order_items`** (veya benzeri sipariş kalemleri) tablosu yok.
- Sipariş ödeme/adres durumları için schema tanımı yok.

---

*Rapor, planlanan “Gemini Discovery Report” kapsamında yalnızca mevcut dosya ve şema içeriklerine dayanarak hazırlanmıştır.*
