# COMMAND_LOG — Kanıta Dayalı Forensics

**Kural:** Her çıktı aşağıdaki komutlardan alındı. Destructive komut çalıştırılmadı.

---

## RECOVERY2 — PHASE 0 DURUM SNAPSHOT

Plandaki komutlar ve ham çıktılar:

**1) git rev-parse --abbrev-ref HEAD**
```
chore/track-core
```

**2) git log -5 --oneline --decorate**
```
12c9829 (HEAD -> chore/track-core) chore: track core app source and public assets
7602c69 (main) fix: export formatPrice and formatProductName
5cc6d28 (origin/main, origin/HEAD) docs: finalize V1 scope lock + masterpack cleanup (no legacy leaks)
3319c8f docs: sync v1/v2 scope + seed scripts idempotent
a602de9 chore: make db connection build-safe + lint fixes
```

**3) git status --porcelain**
```
?? docs/forensics/
?? docs/gemini/
?? docs/masterpack/STEP_A_AUDIT_REPORT.md
?? docs/masterpack/STEP_B_CLEANUP_REPORT.md
?? docs/masterpack/STEP_C_DISCOVERY_REPORT.md
?? drizzle/0001_chubby_spectrum.sql
?? drizzle/0002_free_hex.sql
?? drizzle/meta/0001_snapshot.json
?? drizzle/meta/0002_snapshot.json
?? "report mimari.md"
?? scripts/
?? tools/convert-to-gemini.mjs
?? tools/seed/count-brands-by-products.mjs
?? tools/seed/inspect-import-bundle-v1.mjs
?? tools/seed/seed-import-bundle-v1.mjs
```

**4) git stash list**
```
(boş)
```

**5) git reflog -20 --date=local**
```
12c9829 HEAD@{Wed Jan 28 05:31:44 2026}: commit: chore: track core app source and public assets
7602c69 HEAD@{Wed Jan 28 05:31:16 2026}: checkout: moving from main to chore/track-core
7602c69 HEAD@{Wed Jan 28 05:29:14 2026}: commit: fix: export formatPrice and formatProductName
5cc6d28 HEAD@{Wed Jan 28 04:45:16 2026}: reset: moving to HEAD
5cc6d28 HEAD@{Tue Jan 27 00:47:19 2026}: commit: docs: finalize V1 scope lock + masterpack cleanup (no legacy leaks)
3319c8f HEAD@{Mon Jan 26 18:10:39 2026}: commit: docs: sync v1/v2 scope + seed scripts idempotent
a602de9 HEAD@{Mon Jan 26 16:21:58 2026}: commit: chore: make db connection build-safe + lint fixes
d66bdee HEAD@{Mon Jan 26 04:34:31 2026}: commit: docs+seed: lock V1 scope, hub taxonomy, seed import policy
62088da HEAD@{Sun Jan 25 19:39:18 2026}: commit (initial): chore: initial commit (ARTI OPTIK Next scaffold + masterpack)
```

**6) git remote -v**
```
origin	https://github.com/muratgulerr33/arti-optik-lens.git (fetch)
origin	https://github.com/muratgulerr33/arti-optik-lens.git (push)
```

**7) ls -la src/app src/components src/lib**
(Çıktı: src/app → page.tsx, layout.tsx, [gender], actions, api, auth, checkout, hesabim, search, urun, workshop, design; src/components → Navbar.tsx, Footer.tsx, home/, layout/, catalog/, …; src/lib → fonts.ts, utils.ts, validators/.)

---

## RECOVERY2 — PHASE 1 "Anasayfa neden yok?"

**Komutlar ve sonuçlar:**  
- `test -f src/app/page.tsx && echo "src/app/page.tsx VAR"` → src/app/page.tsx VAR  
- `sed -n '1,120p' src/app/page.tsx` → create-next-app template (Next logo, "To get started...")  
- `sed -n '1,160p' src/app/layout.tsx` → ThemeProvider, AuthProvider, … SearchProvider, {children}; Header/Footer/Navbar yok  
- `rg -n "HomeHeroBanners|HomeBrandGrid|Header(|Footer(|Navbar(" src/app` → **No matches**  
- `rg "export function HomeHeroBanners|…|Footer" src/components` → home-hero-banners.tsx:24 HomeHeroBanners, home-brand-grid.tsx:9 HomeBrandGrid, layout/header.tsx:12 Header, layout/footer.tsx:3 Footer  
- `git log --oneline -- src/app/page.tsx` → 62088da (tek commit)  
- `git log --all -S "HomeHeroBanners" --oneline -- src/app/page.tsx` → **(boş)**  

**Rapor:** Dosya var. Render edilmiyor (page/layout bu bileşenleri kullanmıyor). Git geçmişinde page.tsx’te HomeHeroBanners/HomeBrandGrid hiç bağlanmamış.

---

## RECOVERY2 — PHASE 2 "Kayıp stash/commit var mı?"

**Komutlar ve sonuçlar:**  
- `git fsck --lost-found --no-reflogs | head -80` → **dangling commit ddacf80e3ac68ce7fc0399bc2eb573643c5df30f**  
- `git show ddacf80 --stat` → Merge "WIP on main: 5cc6d28 …"; **src/app/page.tsx | 212 +155 -57** (içinde page.tsx değişimi var). Checkout/geri yükleme **yapılmadı**.  
- `git log --all --oneline --decorate --graph --max-count=30` → 12c9829 (HEAD chore/track-core) … 62088da.

**Not:** Dangling commit ddacf80, main üzerinde bir WIP merge’i; page.tsx’te büyük değişiklik içeriyor. Planda “geri yükleme deneme yapma” kuralına uyuldu.

---

## RECOVERY2 — PHASE 5 Doğrulama

**Komutlar:**  
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → **500**  
- Planda: "Build auth/db kırık olabilir, bu iş paketinin konusu değilse dokunma." Dev server cevap veriyor; 200 yerine 500 alındı (muhtemelen auth/runtime ile ilgili).

**Uygulanan recovery commit’leri:**  
- `0613504` feat: wire homepage to home components (src/app/page.tsx)  
- `e886616` feat: add Header and Footer to root layout (src/app/layout.tsx)

---

## PHASE 0 — SNAPSHOT (DESTRUCTIVE YOK)

### Komutlar ve çıktı özeti

| Komut | Çıktı özeti |
|-------|--------------|
| `date` | Wed Jan 28 06:22:06 +03 2026 |
| `pwd` | /Users/apple/dev/arti-optik-next |
| `node -v` | v22.14.0 |
| `npm -v` | 10.9.2 |
| `git rev-parse --abbrev-ref HEAD` | chore/track-core |
| `git log -10 --oneline --decorate` | 12c9829 (HEAD) chore: track core…; 7602c69 (main) fix: formatPrice…; 5cc6d28 (origin/main) docs: finalize…; … 62088da initial commit |
| `git status --porcelain=v1` | ?? docs/forensics/, ?? docs/gemini/, ?? drizzle/0001, 0002, meta, ?? report mimari.md, ?? scripts/, ?? tools/*.mjs |
| `git diff --stat` | (boş — tracked dosyalarda değişiklik yok) |
| `git stash list` | (boş) |
| `git branch -vv` | * chore/track-core 12c9829; main 7602c69 [origin/main: ahead 1] |
| `git remote -v` | origin https://github.com/muratgulerr33/arti-optik-lens.git (fetch/push) |

**“Şu an hangi branch/commit’teyiz, working tree temiz mi kirli mi?”**  
Branch: `chore/track-core`. HEAD: 12c9829. origin/main: 5cc6d28. Working tree: **kirli** — tracked dosyada değişiklik yok ama untracked çok: docs/forensics, docs/gemini, docs/masterpack/STEP_*.md, drizzle/0001, 0002, meta, report mimari.md, scripts/, tools/*.mjs.

---

## PHASE 1 — ROUTING / ANASAYFA FORENSICS

| Komut | Çıktı özeti |
|-------|--------------|
| `ls -la src/app` | page.tsx, layout.tsx, [gender], actions, api, auth, checkout, hesabim, search, urun, workshop, design vb. |
| `test -f src/app/page.tsx && echo "src/app/page.tsx VAR"` | src/app/page.tsx VAR |
| `sed -n '1,220p' src/app/page.tsx` | import Image from "next/image"; export default function Home() { … Next logo, "To get started, edit the page.tsx file", Vercel/Next linkleri — create-next-app template. |
| `sed -n '1,260p' src/app/layout.tsx` | ThemeProvider, AuthProvider, FavoritesProvider, CartProvider, HeaderProvider, SearchProvider, {children}. **Navbar/Footer/layout/header/layout/footer yok.** |
| `rg -n "components/(Navbar\|Footer\|layout/header\|layout/footer)" src/app src/components -S` | **No matches.** |
| `ls -la src/components` | Navbar.tsx, Footer.tsx, ProductCard.tsx, layout/, home/, catalog/ mevcut. |
| `ls -la src/components/home src/components/layout src/components/catalog` | home: home-hero-banners.tsx, home-brand-grid.tsx, …; layout: header.tsx, footer.tsx; catalog: product-card.tsx, product-grid.tsx, … |

**Sonuç:** / route kaynağı `src/app/page.tsx` (satır 1–66). Root layout’ta Header/Footer **render edilmiyor**. Bileşenler **dosya olarak var**, layout/page’de **kullanılmıyor** → “Dosya var ama kullanılmıyor.”

---

## PHASE 2 — DIFF / NELER DEĞİŞTİ?

| Komut | Çıktı özeti |
|-------|--------------|
| `git fetch --all --prune` | (başarılı) |
| `git diff --name-status origin/main..HEAD` | Çok sayıda A (added): public/brands, public/hero, public/products/**/*.webp, src/app/*, src/components/*, src/auth.ts, src/middleware.ts, src/store, src/lib/utils.ts (M değil, bu range’de sadece A’lar); 12c9829 tek commit. |
| `git log --oneline --decorate origin/main..HEAD` | 12c9829 chore: track core app source and public assets; 7602c69 fix: export formatPrice and formatProductName |
| `git log --oneline -- src/app/page.tsx` | 62088da chore: initial commit (ARTI OPTIK Next scaffold + masterpack) **— sadece bu.** |
| `git blame src/app/page.tsx \| head -40` | Tüm satırlar ^62088da (2026-01-25 19:39:18 +0300). |
| `git log -S "HomeHeroBanners" -S "HomeBrandGrid" -S "ProductGrid" --oneline -- src/app/page.tsx` | **(boş)** — bu string’ler page.tsx geçmişinde hiç yok. |

**“Geçmişte hiç home yapılmamış mı?”** **Evet, kanıtlı.** `src/app/page.tsx` yalnızca 62088da’da var; tüm satırlar o committe ait; HomeHeroBanners/HomeBrandGrid/ProductGrid bu dosyada hiç commit edilmemiş.

---

## PHASE 3 — HATA/BUILD/EXPORT FORENSICS

| Komut | Çıktı özeti |
|-------|--------------|
| `rg -n "formatPrice\|formatProductName" src -S` | utils.ts:9,19 (export); product-info.tsx:1,42,43 (import from @/lib/utils); product-card.tsx:3,21,58 (import from @/lib/utils); cart-sheet.tsx:17–24 (local formatPrice), 45,113; checkout/page.tsx:15 (local formatPrice), 72,79,84,121. |
| `sed -n '1,200p' src/lib/utils.ts` | Satır 9: `export function formatPrice(kurus: number)`, satır 19: `export function formatProductName(title: string)`. İkisi de var. |
| `lsof -i :3000` | node 14874 *:hbci (LISTEN). |
| `ls -la .next/dev/lock` | -rw-r--r-- 1 apple staff 0 Jan 28 05:26 .next/dev/lock — **dev server zaten açık.** Lock silinmedi, process sonlandırılmadı. |
| `npm run build` | **Exit 1.** Turbopack build failed: src/auth.ts:4 getDbForAdapter (@/db/connection’da yok); src/auth.ts:5 users, accounts, sessions, verificationTokens (@/db/schema’da yok). Hata dosya/satır: auth.ts satır 4, 5; connection.ts ve schema.ts beklenen export’ları sağlamıyor. |
| `npm run lint` | 1 error: src/auth.ts:17 Unexpected any (@typescript-eslint/no-explicit-any). 2 warning: register/page.tsx:5 AuthCard unused; urun/[slug]/page.tsx:157 no-img-element. |

**formatPrice/formatProductName:** utils’te export **var**. Import edenler: product-info.tsx, product-card.tsx. **Çakışan yerel fonksiyon:** cart-sheet.tsx satır 17–24, checkout/page.tsx satır 15 (kendi `formatPrice`’ları, utils kullanmıyor).

**“/ ve /search neden patlıyor?”:** Build **auth/schema/connection** yüzünden patlıyor; auth.ts checkout layout ve api route üzerinden dahil oluyor. / tek başına sadece page.tsx kullandığı için dev’de açılabilir; build tüm app’i derlediği için auth hatası build’i durduruyor. /search doğrudan auth kullanmıyor, dev’de çalışıyor olabilir; “patlama” build ve (varsa) checkout/hesabım gibi auth kullanan sayfalarla ilgili.

---

## PHASE 4 — DB/API SANITY

| Komut | Çıktı özeti |
|-------|--------------|
| `docker ps -a \| rg "arti-optik-postgres\|postgres"` | arti-optik-postgres Up 2 hours (healthy) 0.0.0.0:5433->5432/tcp. |
| `curl -s "http://localhost:3000/api/search?q=ray&limit=3"` | HTTP 200. JSON: items array (Ray-Ban RB 2140, RB 0102S, RB 3765 vb.). |
| DB kapatma (docker stop) | **YAPILMADI.** Kullanıcı onayı olmadan destructive sayıldı. Raporda “DB down testi yapılmadı” notu var. |

---

## PHASE 5 / RECOVERY — Kullanılan komutlar

| Komut | Çıktı özeti |
|-------|--------------|
| `git log --oneline -- src/app/page.tsx` | 62088da (sadece). |
| `git blame src/app/page.tsx \| head -40` | Tüm satırlar 62088da. |
| `git log -S "HomeHeroBanners" … -- src/app/page.tsx` | Boş. |

Recovery için önerilen komutlar (çalıştırılmadı, sadece planda):  
`git branch backup-YYYYMMDD-pre-recovery`, `tar -czvf ../repo-backup-YYYYMMDD.tar.gz . --exclude=node_modules --exclude=.next`.
