# Fix Plan — Page Transition Flash (PWA / Native-Feel)

**Tarih:** 2026-02-02  
**Amaç:** En az değişiklikle en büyük etki. Drawer/Dialog’a dokunulmayacak; yeni dependency eklenmeyecek; yeni route icat edilmeyecek.

---

## Öncelik sırası

### A) Tema / background flash

- **Kontrol:** Root layout + sayfa container’larda bg token tutarlılığı.
- **Kanıt:** Layout’ta `body` zaten `bg-background`; `main` inherit ediyor. Theme blink için Design Rules’daki çözüm: mounted pattern + gerekirse `suppressHydrationWarning`. Layout’ta `suppressHydrationWarning` ve `disableTransitionOnChange` mevcut.
- **Fix:** `main`’e açıkça `bg-background` eklemek (tutarlılık). Theme’e bağlı bileşenlerde mounted pattern bu plan kapsamı dışında (scope: sayfa geçişi flash’ı).

**Dosya:** `src/app/layout.tsx` — `<main className="pt-16">` → `<main className="pt-16 bg-background">`.

---

### B) Skeleton gap / blank frame

- **Kontrol:** Mevcut loading.tsx yok; eklenmeli.
- **Fix:**
  1. `src/components/ui/skeleton.tsx` — minimal skeleton (Tailwind `animate-pulse` + bg-muted); yeni UI icat yok.
  2. `src/app/urun/[slug]/loading.tsx` — PDP skeleton (mevcut PDP layout’a uyumlu: başlık + galeri alanı + bilgi blokları placeholder).
  3. `src/app/[gender]/gunes-gozlugu/loading.tsx` — Kategori skeleton (header + grid placeholder).

**Dosyalar:**
- **Oluştur:** `src/components/ui/skeleton.tsx`
- **Oluştur:** `src/app/urun/[slug]/loading.tsx`
- **Oluştur:** `src/app/[gender]/gunes-gozlugu/loading.tsx`

---

### C) Layout shift / zıplama

- Bu adımda sadece loading boundary ve bg tutarlılığı yapılıyor. Başlık/grid/görsel container ölçü stabilitesi (min-height / aspect-ratio) kanıt sonrası ayrı PR’da ele alınabilir. **Fix Plan’da kod değişikliği yok.**

---

### D) PDP → PDP geçişi

- Aynı route segmentinde slug değişince Next.js yeni `loading.tsx` gösterir. PDP için `loading.tsx` eklendiğinde (B) bu geçişte de skeleton görünecek; ek özel “devralma” hissi bu plan kapsamı dışında.

---

### E) Page transition wrapper (dependency yok)

- Plan: **Yeni dependency ekleme** yasak. Dokümanlarda `page-transition.tsx` (framer-motion) geçiyor; repoda framer-motion yok.
- **Fix:** CSS-only, minimal wrapper: `src/components/app/page-transition.tsx` — `pathname` ile key’leyen, `children`’ı saran, aynı `bg-background` veren wrapper; isteğe bağlı kısa CSS transition (opacity veya transform). Scroll restore: Next.js App Router davranışına bırakılır veya ileride aynı dosyada `useEffect` ile `window.scrollTo(0,0)` (veya restore) eklenebilir; reduced-motion için transition süresi `0.01ms` veya `0` (CSS’te zaten `prefers-reduced-motion` var).
- **Layout:** `layout.tsx` içinde `children`’ı `PageTransition` ile sarmak (ThemeProvider içinde, main içinde).

**Dosyalar:**
- **Oluştur:** `src/components/app/page-transition.tsx` (client component; pathname key; bg-background; CSS-only geçiş; reduced-motion uyumlu)
- **Değiştir:** `src/app/layout.tsx` — main içeriğini PageTransition ile sarmak (children → `<PageTransition>{children}</PageTransition>`)

---

## Kesin kurallar

- Drawer/Dialog animasyonlarına dokunulmayacak (`src/components/ui/sheet.tsx` vb. scope dışı).
- Yeni dependency eklenmeyecek.
- Yeni route icat edilmeyecek.

---

## Değişiklik özeti

| Dosya | Aksiyon |
|-------|---------|
| `src/app/layout.tsx` | main’e `bg-background`; main içinde `PageTransition` ile children sarmak |
| `src/components/app/page-transition.tsx` | Oluştur — pathname key, bg-background, CSS-only transition, reduced-motion uyumlu |
| `src/components/ui/skeleton.tsx` | Oluştur — minimal skeleton (animate-pulse + bg-muted) |
| `src/app/urun/[slug]/loading.tsx` | Oluştur — PDP skeleton |
| `src/app/[gender]/gunes-gozlugu/loading.tsx` | Oluştur — Kategori skeleton |

---

**Çıktı:** STEP 2 tamamlandı. STEP 3 uygulama ile devam edilir.
