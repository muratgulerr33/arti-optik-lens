# Final Coverage Report — 2026-01-31

Ana working tree: `chore/lib-dictionaries` (REPO). Backup: `~/arti-optik-backups/20260131-025419`.

## 1) OK (covered by PR / worktree)

- **chore/deps-build**: `.npmrc` (legacy-peer-deps), build gate — push edildi.
- **chore/lib-dictionaries**: `src/lib/dictionaries.ts` — branch açık, doğrulandı.
- **feat/category-filters**: rebase + clean install + playwright.config — worktree `_wt-category-filters`.
- **feat/home-sections**: home + brand dosyaları WIP_SHA’dan geri yüklendi, commit + build, push — worktree `_wt-home-sections`.
- **feat/pdp-detail-card**: PDP/product bileşenleri + format.ts, commit + build, push — worktree `_wt-pdp-detail`.
- **chore/db-tools**: scripts (cleanup-attributes-keys.ts, db-xray.ts), forensics/backup hariç — push edildi.

## 2) Intentionally skipped (forensics / backup dumps)

- `docs/forensics/**` — tüm raporlar ve ekran görüntüleri (commit edilmeyecek, .gitignore’da).
- `drizzle/0003_product_variants_attributes_backup.sql` — backup dump, chore/db-tools’a dahil edilmedi.
- `drizzle/0001_chubby_spectrum.sql`, `drizzle/0002_free_hex.sql`, `drizzle/meta/*` — eski migration isimleri; mevcut repo `0000_futuristic_taskmaster.sql` kullanıyor.

## 3) Still missing in main WT & needs new PR (or existing feature branch)

**A-search-system (feat/search-system worktree’de olabilir):**

- `drizzle/0004_pg_trgm_search.sql`
- `tests/e2e/search-health.spec.ts`, `search-matrix.spec.ts`, `search-smoke.spec.ts`, `search-ui-smoke.spec.ts`

**B-category-filters (feat/category-filters worktree’de olabilir):**

- `src/lib/api/products.ts`
- `tests/e2e/category-filter-smoke.spec.ts`

**C-db-attributes (chore/db-tools’ta scripts var; product-specs feat/pdp-detail-card’ta):**

- `src/components/product/product-specs.tsx` — feat/pdp-detail-card’ta mevcut.
- `scripts/cleanup-attributes-keys.ts`, `scripts/db-xray.ts` — chore/db-tools’ta mevcut.

**Unknown / diğer:**

- `playwright.config.ts` — feat/category-filters’ta eklendi.
- `public/brand/*`, `src/components/home/home-value-props.tsx`, `section-header.tsx` — feat/home-sections’ta.
- `src/app/urun/*`, `src/components/product/*`, `src/lib/format.ts` — feat/pdp-detail-card’ta.
- Docs (DB_XRAY, HERO_AND_LINK_FIX, gemini, masterpack, report mimari) — rapor/geçici; ayrı PR veya skip.
- `src/app/account/*`, `src/app/actions/checkout.ts`, `checkout-content.tsx` — account/checkout için ayrı PR.
- `src/components/search/*`, `src/db/queries/search.ts` — feat/search-system.
- `tests/e2e/*`, `tools/*`, `scripts/scrape/*` — ilgili feature branch’lere veya ayrı PR.

Özet: Ana WT’de eksik görünen birçok dosya ilgili worktree’lerde (feat/home-sections, feat/pdp-detail-card, feat/category-filters, chore/db-tools, feat/search-system) restore edildi veya kasıtlı skip edildi. Yeni PR gerekebilecekler: account/checkout sayfaları, search bileşenleri (search-system dışında), docs ve tools için ayrı karar.
