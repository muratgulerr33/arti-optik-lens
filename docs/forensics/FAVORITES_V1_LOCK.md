# Favorites/Wishlist V1 Lock

**Amaç:** V1'de favoriler/wishlist davranışının tamamlandığını ve "Source of Truth" olarak kilitlendiğini belgelemek. Tüm kararlar bu dokümana göre uygulanır.

**Referans:** Masterpack `docs/masterpack/00.chatgpt-master-pack-arti-optik-01-02-2026.md` → V1 SCOPE LOCK → V1 LOCK — Favorites/Wishlist.

---

## V1 LOCK — Favorites/Wishlist

### UI (Heart icon) standardı (FINAL)

- **Arka plan:** Arka plan/daire yok, `bg-transparent`
- **Outline (favoride değil):** `fill-transparent` + `text-zinc-900/25` + `drop-shadow-[0_1px_1px_rgba(0,0,0,0.28)]` (tema bağımsız)
- **Filled (favoride):** `fill-red-500` `text-red-500`
- **Touch target:** 44×44
- **Light/Dark:** Aynı görünüm (tema override yok)
- **Pending:** Buton disabled + spinner (outline ile aynı ton/soft shadow)
- **Press:** `transition-transform duration-100 ease-out` + `active:scale-[0.92]`; pending/loading iken press devre dışı

**Evidence:** `src/components/favorites/favorite-button.tsx`

### Guest flow (Native davranış)

- **Guest kalbe basınca:** `/auth/login?callbackUrl=...` ile yönlendirme
- **sessionStorage intent:** `ao:wishlist:intent` (productId, returnTo, scrollY, ts)
- **Login sonrası:** Aynı sayfaya dön + scroll restore + otomatik add + toast + kalp dolu + wishlist'te görünür
- **callbackUrl güvenliği:** Sadece internal path kabul (nested/full URL güvenliği)

**Evidence:** `src/components/favorites/favorite-button.tsx`, `src/components/favorites/favorites-provider.tsx`, auth callback flow

### Wishlist page davranışı

- **Remove animasyonu:** Fade/scale-out sonra listeden düşme
- **Toast:** `/account/wishlist` içinde add/remove success/error mesajları
- **Canonical route:** `/hesabim/wishlist` → `redirect("/account/wishlist")`

**Evidence:** `src/app/account/wishlist/page.tsx`, `src/app/hesabim/wishlist/` (redirect), `src/components/favorites/wishlist-client.tsx`

### Concurrency / Spam koruması

- **FavoritesProvider inFlight lock:** Aynı productId'ye eşzamanlı istek engeli; tek istek tamamlanmadan aynı ürün için tekrar toggle kuyruğa alınmaz / atılmaz.

**Evidence:** `src/components/favorites/favorites-provider.tsx` (inFlight / lock mantığı)

---

## Manual QA checklist (V1)

- [ ] **Guest → login → geri dön:** Scroll restore + toast + kalp dolu + wishlist'te görünür
- [ ] **Auth user hızlı tıklama (spam):** Tek istek gider, UI bozulmaz (inFlight lock)
- [ ] **Wishlist remove:** Animasyon (fade/scale-out) + toast
- [ ] **Refresh sonrası:** Favoriler kalıcı (server sync doğru)

---

## Backlog (V2) — V1'e GİRMEYECEK

Aşağıdaki maddeler V2 veya sonrasına taşınmıştır; V1 scope’ta değişiklik yapılmaz.

- Undo / geri al toast (remove sonrası "Geri al")
- Bulk remove (çoklu seçim ile toplu çıkarma)
- Offline / guest local wishlist (guest için localStorage ile yerel liste)
- Analytics event (favori ekleme/çıkarma event’leri)
- E2E stabilizasyon (wishlist e2e testleri)
- Skeleton / loading polish (wishlist sayfası loading state)
- Accessibility audit (favori butonu ve wishlist sayfası a11y)

---

## Bu güncellemenin çıktı özeti

**Güncellenen / eklenen doc dosyaları**

1. **`docs/forensics/FAVORITES_V1_LOCK.md`** (yeni)
   - V1 LOCK — Favorites/Wishlist: UI standardı, Guest flow, Wishlist sayfa davranışı, Concurrency/Spam koruması
   - Manual QA checklist (V1): 4 madde
   - Backlog (V2): V1'e girmeyecek maddeler listesi
   - Çıktı özeti (bu bölüm)

2. **`docs/masterpack/00.chatgpt-master-pack-arti-optik-01-02-2026.md`**
   - V1 SCOPE LOCK altına **"### V1 LOCK — Favorites/Wishlist"** eklendi
   - UI (Heart), Guest flow, Wishlist sayfa, Concurrency özet maddeleri
   - Detay ve QA/Backlog için `docs/forensics/FAVORITES_V1_LOCK.md` referansı

*Son güncelleme: Plan DOC UPDATE — Favorites/Wishlist V1 lock + backlog uygulaması.*
