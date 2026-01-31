# ARTI-OPTIK — Branch Health Scan + Recovery Report

**Tarih:** 2026-01-31  
**Repo:** `/Users/apple/dev/arti-optik-next`  
**Backup dir:** `$HOME/arti-optik-backups/20260131-025419`  
**Baseline:** `origin/chore/track-core`

---

## 1. SCAN OUTPUT SUMMARY

### 1.1 Preflight (Kanıt)

**Komutlar:**
```bash
cd /Users/apple/dev/arti-optik-next
git fetch --all --prune
```

**TOPLEVEL:** `/Users/apple/dev/arti-optik-next`

**STATUS:**
```
## chore/lib-dictionaries...origin/chore/lib-dictionaries
 M src/components/product/product-gallery.tsx
?? docs/COVERAGE_REPORT_20260131.md
```

**WORKTREES:**
```
/Users/apple/dev/arti-optik-next       f718892 [chore/lib-dictionaries]
/Users/apple/dev/_wt-category-filters  76d449b [feat/category-filters]
/Users/apple/dev/_wt-db-tools          d40a8e9 [chore/db-tools]
/Users/apple/dev/_wt-home-sections     fd64042 [feat/home-sections]
/Users/apple/dev/_wt-pdp-detail        9c0401e [feat/pdp-detail-card]
/Users/apple/dev/_wt-search-system     c7d2583 [feat/search-system]
/Users/apple/dev/_wt-split-source      f243eec [wip/split-source]
```

**BRANCHES (local + remote):**  
- Baseline: `origin/chore/track-core` (72efcdb)  
- Candidates: `origin/feat/search-system`, `origin/chore/fix-auth-types`, `origin/chore/deps-build`, `origin/chore/lib-dictionaries`, `origin/feat/category-filters`, `origin/feat/home-sections`, `origin/feat/pdp-detail-card`, `origin/chore/db-tools`

**RECENT LOG (track-core):**
```
* f718892 (HEAD -> chore/lib-dictionaries, origin/chore/lib-dictionaries) chore(lib): add dictionaries utilities (shared)
* 72efcdb (origin/chore/track-core, chore/track-core) chore(gitignore): ignore local forensics folder
* 0c0c397 chore(gitignore): ignore generated artifacts
...
* 5cc6d28 (origin/main, origin/HEAD, main) docs: finalize V1 scope lock + masterpack cleanup
```

**STASH LIST:**
```
stash@{0}: On chore/track-core: wip: plp+pdp ui fixes (temp park)
stash@{1}: On chore/repo-hygiene: wip: wishlist (temp park)
stash@{2}: On chore/repo-hygiene: temp: park WIP for repo-hygiene PR
```

### 1.2 Merge-base ve diff özeti (Baseline: origin/chore/track-core)

| Branch | Merge-base | Dosya sayısı (değişen) | Eklenen | Silinen |
|--------|------------|-------------------------|---------|---------|
| origin/feat/search-system | 72efcdb | 13 | 8 | 0 |
| origin/chore/fix-auth-types | 43d614e | 1 (.gitignore) | 0 | 0 |
| origin/chore/deps-build | 72efcdb | 3 | .npmrc | 0 |
| origin/chore/lib-dictionaries | 72efcdb | 1 | src/lib/dictionaries.ts | 0 |
| origin/feat/category-filters | 72efcdb | 11 | 3 | 0 |
| origin/feat/home-sections | 72efcdb | 13 | 5 | 0 |
| origin/feat/pdp-detail-card | 72efcdb | 13 | 6 | 0 |
| origin/chore/db-tools | 72efcdb | 5 | 3 | 0 |

### 1.3 Backup coverage (groups/*.copy — 140 unique path)

| Branch | TOTAL_MISSING |
|--------|----------------|
| origin/chore/track-core | 98 |
| origin/feat/search-system | 90 |
| origin/chore/fix-auth-types | 98 |
| origin/chore/deps-build | 98 |
| origin/chore/lib-dictionaries | 97 |
| origin/feat/category-filters | 95 |
| origin/feat/home-sections | 94 |
| origin/feat/pdp-detail-card | 92 |
| origin/chore/db-tools | 96 |

En az eksik: **origin/feat/pdp-detail-card** (92), sonra **origin/feat/home-sections** (94), **origin/feat/category-filters** (95).

---

## 2. TRUTH MAP

Satır: kritik dosya grubu. Kolon: branch. Hücre: ✅ var / ❌ yok (branch’ta o dosya grubunun kapsamı).

| Grup | track-core | feat/search-system | fix-auth-types | deps-build | lib-dictionaries | feat/category-filters | feat/home-sections | feat/pdp-detail-card | chore/db-tools |
|------|------------|--------------------|----------------|-----------|------------------|------------------------|--------------------|----------------------|----------------|
| **Search** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Auth types** | ✅ (merge) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Deps (.npmrc, legacy-peer)** | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Dictionaries** | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Category filters** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Home sections** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **PDP detail** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **DB tools** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### Kilit dosyalar (hangi branch’ta var)

| Dosya / klasör | Branch |
|----------------|--------|
| drizzle/0004_pg_trgm_search.sql | feat/search-system |
| tests/e2e/search-*.spec.ts | feat/search-system |
| src/app/api/search/route.ts | feat/search-system (search mantığı burada; src/db/queries/search.ts backup listesinde yok) |
| src/components/search/search-input.tsx | feat/search-system |
| src/components/search/popular-brands.tsx | feat/search-system |
| src/lib/dictionaries.ts | feat/search-system, chore/lib-dictionaries, feat/category-filters |
| src/lib/api/products.ts | feat/category-filters |
| src/app/[gender]/gunes-gozlugu/category-content.tsx | feat/category-filters |
| src/components/catalog/* (filter-sheet, product-grid, active-filters-bar, product-card) | feat/category-filters |
| src/components/product/* (product-gallery, product-attributes, sticky bar, product-specs, product-card) | feat/pdp-detail-card |
| src/app/urun/[slug]/page.tsx | feat/pdp-detail-card |
| src/app/actions/checkout.ts, checkout content | Backup’ta var; hiçbir candidate’ta yok (account/checkout sayfaları baseline’da yok) |
| Account pages (src/app/account) | Hiçbir candidate’ta yok |
| scripts/db-xray.ts, scripts/cleanup-attributes-keys.ts | chore/db-tools |

---

## 3. CANONICAL BRANCH DECISIONS

| Alan | Canonical branch | Kanıt (git log --oneline -n 5) |
|------|------------------|----------------------------------|
| **Search** | origin/feat/search-system | c7d2583 chore(deps): add @playwright/test → 470c326 feat(search): SSOT /api/search + browse mode |
| **Auth types** | origin/chore/track-core (fix-auth-types merge edilmiş) | 72efcdb track-core, a4ffe5e chore(auth): merge fix-auth-types |
| **Deps** | origin/chore/deps-build | 5da4a5f chore(npm): enforce legacy-peer-deps for next-auth beta |
| **Dictionaries** | origin/chore/lib-dictionaries | f718892 chore(lib): add dictionaries utilities (shared) |
| **Category filters** | origin/feat/category-filters | c6eceb1 test(e2e): use PLAYWRIGHT_BASE_URL → 5b9ba4c feat(catalog): category filters + PLP grid |
| **Home sections** | origin/feat/home-sections | fd64042 feat(home): restore featured sections + brand assets |
| **PDP detail** | origin/feat/pdp-detail-card | 9c0401e feat(pdp): restore product detail layout + specs/add-to-cart |
| **DB tools** | origin/chore/db-tools | d40a8e9 chore(db): add db tooling + safe migrations |

---

## 4. PR SPLIT PLAN + COMMANDS

Hedef: `recovery/integrate` branch’ı `origin/chore/track-core` üzerinden açıp PR’larla sırayla entegre etmek.

### 4.1 Integration branch

```bash
cd /Users/apple/dev/arti-optik-next
git fetch --all --prune
git checkout -b recovery/integrate origin/chore/track-core
```

### 4.2 PR-1: Deps (legacy-peer-deps)

- **Dosyalar:** `.npmrc`, `package.json`, `package-lock.json` (deps-build ile uyumlu hale)
- **Yöntem:** `git checkout origin/chore/deps-build -- .npmrc package.json package-lock.json`
- **Gate:** `npm ci --legacy-peer-deps && npm run lint && npm run build` (DATABASE_URL gerekebilir)

```bash
git checkout origin/chore/deps-build -- .npmrc package.json package-lock.json
git add .npmrc package.json package-lock.json
git commit -m "chore(deps): legacy-peer-deps for next-auth beta"
npm ci --legacy-peer-deps
npm run lint
# DATABASE_URL=... npm run build  # gerekirse
git push -u origin recovery/integrate
```

### 4.3 PR-2: Dictionaries

- **Dosyalar:** `src/lib/dictionaries.ts`
- **Yöntem:** `git checkout origin/chore/lib-dictionaries -- src/lib/dictionaries.ts`
- **Gate:** lint, build

```bash
git checkout origin/chore/lib-dictionaries -- src/lib/dictionaries.ts
git add src/lib/dictionaries.ts
git commit -m "chore(lib): add dictionaries utilities"
npm run lint
git push origin recovery/integrate
```

### 4.4 PR-3: Search system

- **Dosyalar:** `drizzle/0004_pg_trgm_search.sql`, `src/app/api/search/route.ts`, `src/app/search/page.tsx`, `src/app/search/search-client.tsx`, `src/components/search/popular-brands.tsx`, `src/components/search/search-input.tsx`, `src/lib/dictionaries.ts` (zaten PR-2’de olabilir, çakışma varsa search-system sürümü), `tests/e2e/search-*.spec.ts`, `package.json`/`package-lock.json` (playwright vb. gerekirse)
- **Yöntem:** `git checkout origin/feat/search-system -- <yukarıdaki path’ler>`
- **Gate:** `npm ci --legacy-peer-deps`, lint, build, (opsiyonel) e2e

```bash
git checkout origin/feat/search-system -- \
  drizzle/0004_pg_trgm_search.sql \
  src/app/api/search/route.ts \
  src/app/search/page.tsx \
  src/app/search/search-client.tsx \
  src/components/search/popular-brands.tsx \
  src/components/search/search-input.tsx \
  tests/e2e/search-health.spec.ts \
  tests/e2e/search-matrix.spec.ts \
  tests/e2e/search-smoke.spec.ts \
  tests/e2e/search-ui-smoke.spec.ts
# dictionaries.ts PR-2'de geldiyse atla veya search-system versiyonunu tercih et
git add .
git commit -m "feat(search): pg_trgm search + api + ui + e2e"
npm run lint
git push origin recovery/integrate
```

### 4.5 PR-4: Category filters

- **Dosyalar:** `src/app/[gender]/gunes-gozlugu/category-content.tsx`, `src/app/[gender]/gunes-gozlugu/page.tsx`, `src/components/catalog/active-filters-bar.tsx`, `filter-sheet.tsx`, `product-card.tsx`, `product-grid.tsx`, `src/lib/api/products.ts`, `src/lib/dictionaries.ts` (yoksa), `tests/e2e/category-filter-smoke.spec.ts`, gerekli package değişiklikleri
- **Yöntem:** `git checkout origin/feat/category-filters -- <path’ler>`
- **Gate:** lint, build

```bash
git checkout origin/feat/category-filters -- \
  src/app/\[gender\]/gunes-gozlugu/category-content.tsx \
  src/app/\[gender\]/gunes-gozlugu/page.tsx \
  src/components/catalog/active-filters-bar.tsx \
  src/components/catalog/filter-sheet.tsx \
  src/components/catalog/product-card.tsx \
  src/components/catalog/product-grid.tsx \
  src/lib/api/products.ts \
  tests/e2e/category-filter-smoke.spec.ts
git add .
git commit -m "feat(catalog): category filters + PLP grid + e2e smoke"
npm run lint
git push origin recovery/integrate
```

### 4.6 PR-5: Home sections

- **Dosyalar:** `src/app/page.tsx`, `src/components/home/*`, `public/brand/arti-optik-header-*.webp`, `.npmrc`/package (yoksa)
- **Yöntem:** `git checkout origin/feat/home-sections -- <path’ler>`
- **Gate:** lint, build

```bash
git checkout origin/feat/home-sections -- \
  src/app/page.tsx \
  src/components/home/ \
  public/brand/
git add .
git commit -m "feat(home): featured sections + brand assets"
npm run lint
git push origin recovery/integrate
```

### 4.7 PR-6: PDP detail card

- **Dosyalar:** `src/app/urun/[slug]/page.tsx`, `src/components/product/add-to-cart.tsx`, `src/components/product/hooks/use-sticky-visibility-by-sentinel.ts`, `product-attributes.tsx`, `product-card.tsx`, `product-gallery.tsx`, `product-specs.tsx`, `sticky-product-bar.tsx`, `src/lib/format.ts`
- **Yöntem:** `git checkout origin/feat/pdp-detail-card -- <path’ler>`
- **Gate:** lint, build

```bash
git checkout origin/feat/pdp-detail-card -- \
  src/app/urun/\[slug\]/page.tsx \
  src/components/product/ \
  src/lib/format.ts
git add .
git commit -m "feat(pdp): product detail layout + specs + sticky bar"
npm run lint
git push origin recovery/integrate
```

### 4.8 PR-7: DB tools

- **Dosyalar:** `scripts/db-xray.ts`, `scripts/cleanup-attributes-keys.ts`; forensics/backup dosyalarını commit’e **ekleme**
- **Yöntem:** `git checkout origin/chore/db-tools -- scripts/db-xray.ts scripts/cleanup-attributes-keys.ts`
- **Gate:** lint, build

```bash
git checkout origin/chore/db-tools -- scripts/db-xray.ts scripts/cleanup-attributes-keys.ts
git add scripts/
git commit -m "chore(db): db tooling + safe migration scripts"
npm run lint
git push origin recovery/integrate
```

---

## 5. NEXTAUTH PEER CONFLICT POLICY

- `next-auth@5` beta, Next 16 ile peer dependency uyarı/hatası veriyor.
- **Repo standardı:** CI ve lokal build için `npm ci --legacy-peer-deps` kullan.
- **Opsiyonel:** `.npmrc` içine `legacy-peer-deps=true` ekleyen PR (zaten PR-1 ile deps-build getirildiğinde .npmrc gelir).

---

## 6. RISKS / EDGE CASES

- **Turbopack:** Build’de Turbopack kullanılıyorsa, legacy-peer-deps ve next-auth ile uyum test edilmeli.
- **Middleware / proxy:** Auth veya API proxy kullanılıyorsa, recovery branch’ta tekrar test edilmeli.
- **DATABASE_URL:** Build veya e2e için DB gerekebilir; `.env.local` commit edilmemeli, CI’da secret olarak verilmeli.
- **Çakışmalar:** Aynı dosya birden fazla PR’da geliyorsa (örn. `src/lib/dictionaries.ts`, `package.json`) sıra önemli; önce deps, sonra dictionaries, sonra search/category ile çakışma çözümü yapılmalı.
- **Account / checkout:** `src/app/account/*`, `src/app/actions/checkout.ts`, `checkout-content` backup’ta var ama hiçbir candidate branch’ta yok; restore bu raporun kapsamı dışında, ayrı bir karar/PR gerekir.
- **Stash:** `chore/track-core` üzerinde “plp+pdp ui fixes” stash’i var; recovery/integrate’e uygulamak istenirse ayrıca `git stash pop` ile denenmeli ve conflict çözülmeli.

---

*Rapor, plan dosyasındaki komutlar çalıştırılarak ve çıktılar kullanılarak üretilmiştir. Kod değişikliği yapılmamıştır.*
