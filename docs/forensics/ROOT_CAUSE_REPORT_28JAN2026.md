# Forensik Rapor — Category “Failed query … products.gender = kadin” ve UI’da Ürün Yok

Tarih: 28 Ocak 2026. Plan: keşif/forensik + kök neden + minimal fix planı. Hiçbir değişiklik uygulanmadı.

---

## PHASE 0 — Snapshot

**1) Kim neredeyim?**
```
pwd: /Users/apple/dev/arti-optik-next
ls -la: .env.local, .next, src, drizzle, docker-compose.yml, package.json, vb. mevcut.
```

**2) Git durum:**
```
git branch --show-current: chore/track-core
git log --oneline -3: 55454ea fix(api): return 200 with empty results on search DB connection error
  bc34deb fix(ui): wrap layout with SessionProvider for Header
  ce88de8 fix(auth): export next-auth tables in schema
git status --porcelain: docs/forensics/, drizzle/0001, 0002, tools/seed/*, vb. untracked.
git diff --name-only: (boş)
```

**3) Env/versiyon:**
```
node -v: v22.14.0
npm -v: 10.9.2
```

---

## PHASE 1 — Dev server / port / lock

- **3000:** `node` (PID 7137) LISTEN.
- **3001:** Dinleyen process yok.
- **.next/dev:** Mevcut; `lock` dosyası var (0 byte).

---

## PHASE 2 — Docker / Postgres

- **docker ps -a:**
  - `arti-optik-postgres`: Up 9 minutes (healthy), **0.0.0.0:5433->5432/tcp**
  - `cinselhobi_db`: Up, **0.0.0.0:5432->5432/tcp**
- **arti-optik-postgres:** State running, Health Status healthy. Port mapping: **5432/tcp -> 0.0.0.0:5433**
- **pg_isready -U postgres:** `/var/run/postgresql:5432 - accepting connections`

Özet: Arti-optik DB **host port 5433**; başka bir DB (cinselhobi_db) **host port 5432** kullanıyor.

---

## PHASE 3 — App DB config (ENV)

- **.env.local (ilgili satırlar, secret maskeli):**
  - `DATABASE_URL=postgresql://postgres:****@localhost:5433/artioplik`
  - `POSTGRES_USER=postgres`, `POSTGRES_DB=artioplik`
- **Kod:** `src/db/connection.ts` yalnızca `process.env.DATABASE_URL` kullanıyor; port hard-coded değil.
- **Kanıt:** App, DATABASE_URL ile **5433** portuna gidiyor (env satırı).

---

## PHASE 4 — DB’de veri ve query

- **DB:** `artioplik` (docker exec -d artioplik ile erişildi).
- **Tablolar:** products, brands, product_variants, categories, users, accounts, sessions, verification_tokens.
- **Sayımlar:**
  - `products`: 119
  - `brands`: 17
  - `product_variants`: 150
- **gender dağılımı:** unisex 49, erkek 38, **kadin 32**
- **Kadin join query (LIMIT 5):** Hata yok; 5 satır döndü (Ray-Ban örnekleri).

Özet: DB’de “kadin” için ürün var; aynı query psql’de başarılı.

---

## PHASE 5 — Uygulama davranışı

- **GET /api/search?q=ray&limit=3:** HTTP 200, body’de `items` dolu (Ray-Ban ürünleri). DB bağlantısı çalışıyor.
- **GET /kadin/gunes-gozlugu:** HTTP 200, HTML’de “Ray-Ban” geçiyor; ürünler render ediliyor.
- **src/app/api/search/route.ts (satır 94–109):** `catch` bloğunda DB/connection hatalarında **200 + boş items** dönüyor; böylece DB hatası istemci tarafında “boş sonuç” gibi görünebilir.
- **src/app/[gender]/gunes-gozlugu/page.tsx (satır 59–62):** `getProductsByGender` catch’te `products: [], dbError: true` dönüyor; hata UI’da “Failed query” veya boş liste olarak görünebilir.

---

## A) Observations (kanıtlı)

| Konu | Kanıt |
|------|------|
| Docker | arti-optik-postgres healthy, port **5433**; cinselhobi_db port **5432** |
| App env | .env.local `DATABASE_URL=...localhost:5433/artioplik` |
| DB data | products 119, brands 17, product_variants 150; kadin 32 |
| Query | kadin join query psql’de 5 row, hata yok |
| /api/search | Şu an 200 + dolu items; route catch’te DB hatasında 200 + boş dönüyor |
| Category page | getProductsByGender catch’te dbError: true + boş liste |

---

## B) ROOT CAUSE (1 cümle)

**Uygulama geçmişte yanlış porta (5432) veya yanlış DB’ye bağlandığında (veya DB kapalıyken) category sayfasındaki `getProductsByGender` sorgusu fail edip “Failed query … where products.gender = kadin limit 500” hatasına yol açıyor; /api/search ise DB hatalarını yakalayıp 200 + boş sonuç döndüğü için aynı bağlantı hatası search tarafında “ürün yok” gibi maskelenebiliyor.**

Not: Şu an .env.local 5433/artioplik ile doğru DB’ye gidildiği için curl ile hem /api/search hem /kadin/gunes-gozlugu başarılı ve ürünler görünüyor; sorun port/env uyuşmazlığı veya DB kapalıyken ortaya çıkıyor.

---

## C) EVIDENCE (madde madde)

1. `.env.local` satırı: `DATABASE_URL=postgresql://postgres:***@localhost:5433/artioplik` → app 5433 kullanıyor.
2. `docker port arti-optik-postgres`: 5432/tcp -> 0.0.0.0:5433 → doğru DB 5433’te.
3. `docker exec … psql -d artioplik -c "SELECT COUNT(*) FROM products"`: 119.
4. `docker exec … psql -d artioplik` kadin join query: 5 row, hata yok.
5. `src/app/api/search/route.ts` satır 94–109: catch’te 200 + boş items.
6. `src/app/[gender]/gunes-gozlugu/page.tsx` satır 59–62: catch’te `products: [], dbError: true`.
7. Git: `55454ea fix(api): return 200 with empty results on search DB connection error` → DB connection error daha önce yaşanmış.

---

## D) NEXT MINIMAL FIX (kod yazmadan, öneri)

1. **Port/env:** DATABASE_URL’in her zaman doğru portu (arti-optik için 5433) kullandığından emin ol; dev server’ı .env.local değişikliği sonrası yeniden başlat.
2. **Category sayfa:** getProductsByGender DB hatasında sadece boş liste değil, kullanıcıya “Veritabanına bağlanılamadı” benzeri bir EmptyState göster (dbError: true zaten var, UI’da anlamlı mesaj).
3. **/api/search:** DB hatasında her zaman 200 boş dönmek yerine, debug/development için (örn. env flag) 500 dönüp hatayı loglamak; production’da isteğe bağlı 200 boş kalabilir.

---

## E) Kod değişikliği önerisi (DIFF uygulanmadı)

- **/api/search route:** DB error’da debug modda (örn. `DEBUG_DB_ERROR=1`) 500 + hata mesajı dön; aksi halde mevcut 200 boş davranışı koru.
- **getProductsByGender / Category page:** DB error’da zaten `dbError: true` dönülüyor; CategoryContent’te `dbError === true` iken “Veritabanına şu an ulaşılamıyor” gibi bir EmptyState göster.

---

**Benden beklenen:** Bu rapor + minimal fix planı; kullanıcı onayı olmadan değişiklik/commit yapılmadı.
