# Product gallery (slider) — scroll’da bozulma tespit listesi

Sadece tespit. Kod değişikliği veya öneri yok.

---

## 1. Product gallery’nin parent zincirinde: transform, position sticky/fixed, overflow, dynamic padding/height var mı?

**Kanıt (dosya:satır):**

- **Dynamic padding/height: VAR.**  
  - PDP sayfa container’ı: `pb-[calc(var(--pdp-bar-h,0px)+12px+env(safe-area-inset-bottom))]`  
  - [`src/app/urun/[slug]/page.tsx`](src/app/urun/[slug]/page.tsx) satır 216 (className içinde).  
  - `--pdp-bar-h` değeri scroll/sentinel durumuna göre StickyProductBar tarafından ayarlanıyor: `document.documentElement.style.setProperty("--pdp-bar-h", showBar ? \`${h}px\` : "0px")`  
  - [`src/components/product/sticky-product-bar.tsx`](src/components/product/sticky-product-bar.tsx) satır 38 (ResizeObserver callback), satır 48 (showBar false iken).  
  - Sonuç: Gallery’nin üstündeki container’ın padding-bottom’u scroll sırasında değişiyor (0px ↔ bar yüksekliği).

- **transform:** Parent zincirinde (ProductGallery → grid → container → root) transform yok. Sticky bar’da `transform: translateY(...)` var; o element gallery’nin parent’ı değil.

- **position sticky/fixed:** Gallery parent zincirinde yok. Sticky bar `fixed` ama gallery’nin üstündeki zincirde değil.

- **overflow:** Gallery’nin kendi içinde `overflow-hidden` var ([`src/components/product/product-gallery.tsx`](src/components/product/product-gallery.tsx) — viewport div ve aspect wrapper). Parent zincirinde (min-w-0, grid, container) overflow tanımı yok.

---

## 2. Scroll sırasında değişen class veya inline style gallery parent’ını etkiliyor mu?

**Evet.**

- Scroll ile sentinel viewport’tan çıkınca/girince `useStickyVisibilityBySentinel` → `sentinelInView` değişiyor; `showBar` buna bağlı.
- `showBar` değişince StickyProductBar `document.documentElement.style.setProperty("--pdp-bar-h", ...)` ile global style değiştiriyor.
- Bu değişken gallery parent’ı olan container’da kullanılıyor: `pb-[calc(var(--pdp-bar-h,0px)+12px+...)]`.
- Sonuç: Scroll sırasında değişen (document-level) inline style, gallery parent’ının padding-bottom’unu değiştiriyor.

---

## 3. Slider’ın ölçü aldığı element scroll ile reflow alıyor mu?

**Evet.**

- Embla viewport’u `ref={emblaRef}` ile işaretlenen div ([`src/components/product/product-gallery.tsx`](src/components/product/product-gallery.tsx): `relative overflow-hidden touch-pan-y overscroll-x-contain`). Slider bu viewport’un boyutuna göre ölçü alıyor.
- Bu viewport, gallery → min-w-0 → grid → container zincirinde. Container’ın padding-bottom’u `--pdp-bar-h` ile scroll’da değiştiği için sayfa layout’u reflow alıyor.
- Bu reflow, container içeriğini (grid ve dolayısıyla gallery/slider viewport) da layout hesaplamasına sokar. Slider’ın ölçü aldığı element, scroll ile tetiklenen reflow zincirinde.

---

Özet: Scroll’da bozulma için tespit edilen nedenler — (1) gallery parent zincirinde dynamic padding (`--pdp-bar-h`), (2) scroll’da değişen style’ın gallery parent’ını etkilemesi, (3) slider viewport’unun bu reflow zincirinde olması.
