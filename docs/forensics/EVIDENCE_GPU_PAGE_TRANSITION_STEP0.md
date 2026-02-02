# Evidence — GPU-Friendly Page Transition

**Tarih:** 2026-02-02

## STEP 0 — Mevcut durum (öncesi)

1. **`src/components/app/page-transition.tsx`** — Var. Client component; `usePathname()`, `key={pathname}`; `useLayoutEffect` ile `window.scrollTo({ top: 0, left: 0, behavior: "instant" });` her pathname değişiminde çalışıyordu.
2. **`src/app/layout.tsx`** — `main` sınıfı: `pt-16 bg-background`. İçerik `<PageTransition>{children}</PageTransition>` ile sarılı.
3. **scrollTo(0,0)** — Kaldırıldı (OS back gesture / scroll restore için Next default kullanılıyor).

## Uygulama sonrası — Evidence checklist

- [x] page-transition dosyası var + kullanılıyor (layout.tsx)
- [x] globals.css keyframe eklendi (@keyframes page-enter, .page-enter, .page-enter-none, prefers-reduced-motion override)
- [x] bg-background layout’ta stabil (main zaten vardı; html/body background-color: var(--background) eklendi)
- [ ] reduced-motion test edildi (manuel: DevTools veya sistem tercihi)
- [ ] perf kaydı alındı (manuel: Home → Category → PDP, main thread jank kontrolü)
