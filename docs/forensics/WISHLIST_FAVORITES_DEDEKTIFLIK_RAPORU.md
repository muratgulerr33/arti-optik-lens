# ARTI OPTİK — Wishlist/Favorites Dedektiflik Keşfi (SIFIR KURULUM + KANITLI RAPOR)

**Tarih:** 2026-01-31  
**Kapsam:** Repo içinde wishlist/favorites ile ilgili mevcut durum; kod değişikliği yapılmadan sadece keşif.

---

## 1. Repo Snapshot

**Komut çıktıları (kanıt):**

| Komut | Çıktı |
|-------|--------|
| `pwd` | `/Users/apple/dev/arti-optik-next` |
| `git status -sb` | Branch: `chore/track-core...origin/chore/track-core`; birçok M/D/?? dosya (değişiklikler mevcut) |
| `git rev-parse --abbrev-ref HEAD` | `chore/track-core` |
| `node -v` | `v22.14.0` |
| `npm -v` | `10.9.2` |

**package.json özeti (kanıt):**

- **Scripts:** `dev`, `build`, `start`, `lint`, `seed:v1`, `seed:brands`, `db:generate`, `db:push`, `db:migrate`, `db:studio`, `db:extensions`, `test:e2e`
- **Bağımlılıklar (ilgili):** `next` 16.1.4, `next-auth` 5.0.0-beta.25, `drizzle-orm` ^0.45.1, `@auth/drizzle-adapter` ^1.7.2, `react` 19.2.3, `zustand` ^5.0.10
- **Package manager:** `package-lock.json` mevcut → npm kullanılıyor.

**Kurulum gerçekliği (sıfırdan):**

- Repo npm ile çalışıyor (package-lock.json var).
- Minimum çalıştırma: `npm install` → `npm run dev` (README’de `npm run dev` veya yarn/pnpm/bun dev öneriliyor).
- Env: `.env.example` mevcut; içinde `DATABASE_URL=` ve opsiyonel Docker/Postgres değişkenleri tanımlı. `AUTH_SECRET` README’de geçmiyor; next-auth için genelde gerekir (Unknown: dokümanda yok). Bu aşamada `.env` oluşturulmadı; sadece tespit.

---

## 2. Wishlist Route Durumu

**Sonuç: YOK.**

- `src/app/account/wishlist/page.tsx` **yok.**  
- `src/app/account/` altında sadece şunlar var: `layout.tsx`, `page.tsx`, `adresler/page.tsx`, `siparisler/page.tsx`. Wishlist route yok.

**Kanıt (dosya listesi):**

```
src/app/account/
  - adresler/page.tsx
  - layout.tsx
  - page.tsx
  - siparisler/page.tsx
```

- Repo genelinde `account/wishlist`, `/wishlist`, `wishlist` string’i **hiçbir yerde geçmiyor** (`rg -n "account/wishlist|/wishlist|wishlist" src` → 0 sonuç; "wishlist" kelimesi sadece bu rapor ve plan bağlamında kullanılıyor).

---

## 3. Account Entrypoint Durumu

**Sonuç: "Favoriler" sekmesi/linki yok; neden: menü sabit liste, wishlist eklenmemiş.**

Account menüsü [src/components/account/account-sidebar.tsx](src/components/account/account-sidebar.tsx) içinde tanımlı. Menü öğeleri sabit bir dizi:

```tsx
const menuItems = [
  { label: "Profilim", href: "/account" },
  { label: "Siparişlerim", href: "/account/siparisler" },
  { label: "Adreslerim", href: "/account/adresler" },
]
```

**Kanıt:** `account-sidebar.tsx` satır 9–13. "Favoriler" veya "Wishlist" bu dizide yok; bu yüzden Account UI’da favoriler entrypoint’i yok.

---

## 4. State Source of Truth (Provider vs Action)

**Sonuç: Sadece isimlendirilmiş bir Provider var; state veya server action yok.**

### 4A) Provider

- **Var:** `FavoritesProvider` [src/components/favorites/favorites-provider.tsx](src/components/favorites/favorites-provider.tsx)
- **Export:** `export function FavoritesProvider({ children }: { children: React.ReactNode })`
- **İçerik:** Sadece `return <>{children}</>` — **state yok, createContext/useContext yok, toggle/productId API’si yok.**

```tsx
"use client"
import * as React from "react"
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

**Kanıt:** `favorites-provider.tsx` tam dosya.

- Layout’ta sarıyor: [src/app/layout.tsx](src/app/layout.tsx) satır 7, 45, 57 — `import { FavoritesProvider } from "@/components/favorites/favorites-provider"` ve `<FavoritesProvider>` ile children sarılı.

### 4B) Server action

- **Yok.** `src/app/actions/` altında sadece `auth.ts` ve `checkout.ts` var. `favorites.ts` veya `wishlist` ile ilgili action yok.
- `revalidatePath("/account/wishlist")` veya benzeri **hiçbir yerde yok** (`rg` ile doğrulandı).

### 4C) UI hangi katmanı çağırıyor?

- **Favorite-button / FavoriteButton:** Repo’da **yok** (`rg "favorite-button|FavoriteButton" src` → 0 sonuç).
- Product card’larda favori ikonu/butonu **yok** (aşağıda kanıt).
- Sonuç: Favori toggle eden UI olmadığı için ne Provider ne de server action “çağrılmıyor”; **çelişki yok, eksiklik var.**

**Öneri (repo gerçeğine göre):** Şu an tek “kaynak” FavoritesProvider’ın kendisi ve boş. İleride state source of truth için ya Provider içinde context + (opsiyonel) server sync, ya da doğrudan server action + revalidatePath tercih edilebilir; mevcut kodda ikisi de yok.

---

## 5. DB Schema Durumu

**Sonuç: Favorites/wishlist tablosu veya ilişkisi YOK.**

- Schema dosyası: [src/db/schema.ts](src/db/schema.ts).
- Tablolar: `users`, `accounts`, `sessions`, `verificationTokens`, `brands`, `categories`, `products`, `productVariants`, `productVariantsAttributesBackup`, `addresses`, `orders`, `orderItems`. **favorites / user_favorites / wishlist_items yok.**
- `rg -n "favorites|wishlist" src/db` → 0 sonuç. Drizzle migrations içinde de `favorites`/`wishlist` geçmiyor.

**Kanıt:** `src/db/schema.ts` tamamı taranmış; sadece yukarıdaki tablolar ve ilişkileri var.

---

## 6. Product Card UI Durumu

**Sonuç: Favori ikonu yok; 44x44 hedefi veya dolu/boş state class’ları product card’larda tanımlı değil.**

- **Kullanılan card:** Liste sayfalarında (ana sayfa, kategori, arama) [src/components/catalog/product-card.tsx](src/components/catalog/product-card.tsx) kullanılıyor.  
  Kanıt: `src/app/page.tsx`, `src/app/[gender]/gunes-gozlugu/category-content.tsx`, `src/app/search/search-client.tsx` içinde `import { ProductCard } from "@/components/catalog/product-card"`.
- **Alternatif card:** [src/components/product/product-card.tsx](src/components/product/product-card.tsx) farklı bir bileşen (id, slug, brandName, title, priceKurus, imageUrl); repo taramasında bu product-card’ın sayfa içinde kullanıldığı bir import **yok** (sadece catalog/product-card kullanılıyor).

**Catalog ProductCard (gerçek kullanılan):**

- Favori ikonu/butonu **yok.**  
- Yapı: `Link` → resim alanı (beyaz arka plan: `bg-white dark:bg-white`) → içerik (marka, isim, fiyat).  
- Sağ üstte absolute bir eleman yok; `h-11`/`w-11` bu dosyada geçmiyor.

**Kanıt (özet):**  
- [src/components/catalog/product-card.tsx](src/components/catalog/product-card.tsx): `"relative block ... rounded-2xl bg-card"`, resim div’i `"rounded-xl aspect-[4/3] bg-white ..."`; favori butonu/ikonu yok.  
- [src/components/product/product-card.tsx](src/components/product/product-card.tsx): `"rounded-xl bg-card border ..."`, resim alanı `bg-media-surface`; yine favori yok.

- **favorite-button.tsx:** [src/components/favorites/](src/components/favorites/) altında sadece `favorites-provider.tsx` var; `favorite-button.tsx` yok.

---

## 7. Auth Gate Durumu

**Sonuç: Favori toggle akışı olmadığı için doğrudan “favori için auth gate” yok. Account ve checkout için auth zorunlu.**

- Auth: [src/auth.ts](src/auth.ts) — NextAuth, Credentials, DrizzleAdapter; `auth` export ediliyor.
- Korunan route’lar: [src/middleware.ts](src/middleware.ts) — `/account` ve `/checkout` için token yoksa `/auth/login`’e yönlendirme (callbackUrl ile). Favori/wishlist route’u olmadığı için middleware’de özel bir favori kuralı yok.
- Account layout: [src/app/account/layout.tsx](src/app/account/layout.tsx) — `const session = await auth(); if (!session) redirect("/auth/login");` → Account sayfaları giriş zorunlu.

Favori toggle’ın ileride nerede olacağı (kart vs account/wishlist sayfası) belli olmadığı için: “Favori toggle ederken session zorunlu mu?” sorusu repo’da **uygulama kanıtıyla yanıtlanamıyor**; sadece account tarafı login zorunlu.

---

## 8. Çelişkiler Listesi

| Konu | Doküman / Beklenti | Repo gerçeği | Not |
|------|--------------------|--------------|-----|
| Wishlist route | Olması beklenebilir | Yok | Doküman dışı; plan/şablon ile uyumlu. |
| Favoriler linki (Account) | Olması beklenebilir | Yok; menüde sadece Profilim, Siparişlerim, Adreslerim | Kanıt: account-sidebar menuItems. |
| FavoritesProvider state | Provider = state paylaşan katman | Provider boş (sadece children render) | Çelişki: isim var, davranış yok. |
| Server action (favorites) | Olması beklenebilir | Yok | actions/favorites.ts yok. |
| DB favorites tablosu | Olması beklenebilir | Yok | schema’da favorites/wishlist yok. |
| Product card favori ikonu | Olması beklenebilir | Yok | catalog/product-card’da ikon yok. |
| Auth gate (favori) | Toggle’da login gerekebilir | Favori toggle yok; account sayfaları login zorunlu | Çelişki yok; eksik özellik. |

Tüm maddeler repo kanıtıyla; doküman dışı varsayım yok.

---

## 9. Önerilen En Güvenli Uygulama Sırası (Sadece Plan, Kod Yok)

1. **DB:** `favorites` (veya `user_favorites`) tablosu: `userId`, `productId` (veya variantId), `createdAt`; schema + migration.
2. **Backend:** Server action(s) — ekleme/çıkarma + gerekirse `revalidatePath("/account/wishlist")`; auth kontrolü (session) action içinde.
3. **State:** Ya Provider içinde context + client state (optimistic UI) ve server ile sync, ya da sadece server action + revalidate; tek source of truth netleştirilsin.
4. **Route:** `src/app/account/wishlist/page.tsx` — liste sayfası; auth layout zaten koruyor.
5. **Account UI:** `account-sidebar.tsx` menuItems’a "Favoriler" linki ekleme.
6. **UI bileşenleri:** Favori butonu (kart sağ üst, hedef 44x44); catalog/product-card’a entegre; dolu/boş state. İsteğe bağlı: `components/favorites/favorite-button.tsx`.
7. **Auth gate:** Toggle ve wishlist sayfası login gerektirsin; toggle’da session yoksa login’e yönlendirme veya toast (tercih netleştirilmeli).

---

## 10. Riskler + Smoke Test Checklist

**Riskler:**

- FavoritesProvider şu an boş; ileride context eklenecekse mevcut layout sarmalayıcıları (Cart, Auth, Theme) ile sıra ve bağımlılık dikkate alınmalı.
- Favori verisi kalıcı olmadan sadece client state ile gidilirse, sayfa yenilemede kaybolur; kalıcılık için DB + server action gerekir.
- Product card’a ikon eklenirken link tıklanabilirliği (Link vs button) ve erişilebilirlik (aria-label, 44x44) dikkate alınmalı.

**Smoke test checklist (wishlist özelliği eklendikten sonra):**

- [ ] Giriş yapmadan favori toggle: beklenen davranış (redirect/toast) gerçekleşiyor mu?
- [ ] Giriş yapıp ürün kartında favori ekleme/çıkarma: liste ve account/wishlist sayfası güncelleniyor mu?
- [ ] `/account/wishlist` sayfası sadece giriş yapılmış kullanıcıya açılıyor mu?
- [ ] Account sidebar’da "Favoriler" linki görünüyor ve doğru sayfaya gidiyor mu?
- [ ] Favori butonu en az 44x44 hedef alanı sunuyor mu? (Erişilebilirlik)

---

**Çıkış koşulu:** Keşif tamamlandı; rapor üretildi; hiçbir kod değiştirilmedi.
