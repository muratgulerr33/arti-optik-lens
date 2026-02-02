# Changelog — Page Transition Flash Fix (PWA / Native-Feel)

**Tarih:** 2026-02-02  
**Kapsam:** Global sayfa geçişi flash/skeleton gap düzeltmeleri. Drawer hariç; yeni dependency yok.

## Yapılan değişiklikler

### Yeni dosyalar

- **`src/components/app/page-transition.tsx`** — Client component: pathname ile key, `bg-background`, route değişiminde scroll top (instant). CSS-only; `prefers-reduced-motion` globals.css ile zaten uyumlu.
- **`src/components/ui/skeleton.tsx`** — Minimal skeleton: `animate-pulse`, `bg-muted`, `cn` ile className birleştirme.
- **`src/app/urun/[slug]/loading.tsx`** — PDP loading: galeri alanı (aspect 4/5), breadcrumb/title/fiyat/özellikler placeholder, sticky bar placeholder.
- **`src/app/[gender]/gunes-gozlugu/loading.tsx`** — Kategori loading: toolbar, başlık, 8 kartlık grid skeleton.

### Güncellenen dosyalar

- **`src/app/layout.tsx`** — `main`’e `bg-background` eklendi; `children` `<PageTransition>` ile sarıldı.

## DoD (Definition of Done)

- [x] `npm run lint` temiz
- [x] `npm run build` başarılı
- [ ] Manuel test (mobile viewport + dark/light): Home → Category → PDP, Search → PDP, PDP → PDP, Account → PDP, prefers-reduced-motion — **Murat tarafından yapılacak**
- [ ] Console’da hydration mismatch yok — **Manuel test ile doğrulanacak**

## Öncesi / Sonrası

- **Öncesi:** `page-transition.tsx` ve her iki `loading.tsx` yoktu; Category/PDP geçişlerinde boş frame/skeleton gap riski vardı.
- **Sonrası:** Sayfa geçişlerinde aynı `bg-background`, PDP ve kategori için anında skeleton; route değişiminde scroll top.

## Rollback

Tek PR; gerekirse `git revert` + smoke test.
