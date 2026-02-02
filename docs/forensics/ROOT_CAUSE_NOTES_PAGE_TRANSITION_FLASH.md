# Root Cause Notes — Page Transition Flash (PWA / Native-Feel)

**Tarih:** 2026-02-02  
**Amaç:** Flash’ın kaynağını kodda kanıtla (tahmin değil).

---

## 1) Page transition — `src/components/app/page-transition.tsx`

**Kanıt:** Dosya **mevcut değil.** `src/components/app/` klasörü repoda yok.

- Geçiş key’leme, reduced-motion fallback, scroll restore: **uygulanmıyor** (component yok).
- Sonuç: Sayfa geçişlerinde ortak bir wrapper/animasyon katmanı yok; Next.js varsayılan davranışı (anında swap) geçerli. Boş frame riski loading boundary eksikliği ile birleşince artıyor.

**Referans:** Plan ve masterpack dokümanları `page-transition.tsx` (framer-motion, lines 46–63 scroll restore, 85/112 reduced motion) referans veriyor; repoda bu dosya yok.

---

## 2) Loading boundaries — `loading.tsx`

**Kanıt:**

- `src/app/urun/[slug]/loading.tsx` — **yok.** Sadece `page.tsx` var (`src/app/urun/[slug]/` listesi).
- `src/app/[gender]/gunes-gozlugu/loading.tsx` — **yok.** Sadece `page.tsx`, `category-content.tsx` var.

Next.js App Router’da segment için `loading.tsx` yoksa, o segmentin suspend süresi boyunca **üst layout’un Suspense fallback’i** veya **boş/geç gelen içerik** gösterilir. Root layout’ta `<main>` için özel bir Suspense/fallback yok; sadece Header için `Suspense fallback={<div className="h-16 bg-background border-b" />}` var (`src/app/layout.tsx` satır 46).

**Sonuç:** Category ve PDP geçişlerinde loading boundary yok → **skeleton gap / blank frame** kök nedeni: bu route’larda `loading.tsx` eksikliği.

**Diğer sayfalar:** `src/app/search/page.tsx` Suspense + "Yükleniyor..." + `min-h-screen bg-background` kullanıyor (satır 24–34). Checkout/account için ayrı `loading.tsx` yok; kanıt varsa eklenebilir (STEP 2’de karar).

---

## 3) Theme / hydration kaynaklı blink

**Kanıt:**

- **Layout:** `src/app/layout.tsx` — `<html lang="tr" suppressHydrationWarning>` (satır 28). `ThemeProvider` ile `disableTransitionOnChange` (satır 41). Body: `className={cn("min-h-screen bg-background ...")}` (satır 31–35).
- **Design Rules v1:** `docs/design/01.design-rules-v1.md` — Bölüm 4 “Hydration-safe Rendering”: theme’e bağlı UI için **mounted pattern** ve gerekirse `suppressHydrationWarning` öneriliyor. Hydration mismatch sebebi: theme SSR/CSR farklı render (satır 580–582).
- **Theme provider:** `src/components/theme/theme-provider.tsx` — Sadece `next-themes` wrapper; mounted/SSR fallback yok. Theme toggle veya theme’e bağlı bileşenlerde `mounted` kullanılmıyorsa, ilk client render’da theme uygulanırken kısa blink olabilir.
- **globals.css:** `body { @apply bg-background text-foreground; }` (satır 189–191). `:root` ve `:root.dark` token’ları tutarlı. `prefers-reduced-motion` (satır 201–210) animasyon sürelerini 0.01ms yapıyor.

**Sonuç:** Layout seviyesinde `suppressHydrationWarning` ve `disableTransitionOnChange` var; body bg-background. Theme blink riski özellikle **theme’e bağlı bileşenlerde** (örn. theme toggle, theme’e göre metin/ikon) — bu bileşenlerde mounted pattern kullanılıp kullanılmadığı ayrı kontrol edilmeli. Root layout’ta ek “mounted” wrapper gerekmez; sayfa geçişi flash’ının ana nedeni loading/skeleton eksikliği.

---

## Özet (dosya/satır referanslı)

| Kök neden | Dosya / konum | Not |
|-----------|----------------|-----|
| Page transition wrapper yok | `src/components/app/page-transition.tsx` yok | Geçiş animasyonu ve scroll restore uygulanmıyor |
| PDP loading boundary yok | `src/app/urun/[slug]/` — sadece `page.tsx` | Skeleton gap / blank frame |
| Category loading boundary yok | `src/app/[gender]/gunes-gozlugu/` — sadece `page.tsx`, `category-content.tsx` | Skeleton gap / blank frame |
| Skeleton component yok | `src/components/ui/skeleton.tsx` yok | loading.tsx’lerde kullanılacak ortak skeleton yok |
| Theme/hydration | `layout.tsx` L28, L41; Design Rules 4.1, 580–582 | Layout tarafı yeterli; theme’e bağlı bileşenlerde mounted pattern kontrolü |

---

**Çıktı:** STEP 1 tamamlandı. STEP 2’ye geçmeden önce Murat onayı plan dokümanında belirtilmiştir.
