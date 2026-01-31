# DISCOVERY COMMAND LOG — 28 Ocak 2026 14:24

Ham komutlar ve kısa çıktı özeti. Hiçbir değişiklik uygulanmadı.

---

## PHASE 0 — Snapshot

### 1) pwd, ls
```
pwd: /Users/apple/dev/arti-optik-next
ls -la: .env.local, .next, src, drizzle, docker-compose.yml, package.json, docs, tools, scripts vb. mevcut.
```

### 2) node, npm
```
node -v: v22.14.0
npm -v: 10.9.2
```

### 3) git
```
git branch --show-current: chore/track-core
git status --porcelain: ?? docs/forensics/, ?? docs/gemini/, ?? drizzle/0001_*, ?? drizzle/0002_*, ?? tools/seed/*, ?? "report mimari.md", ?? scripts/
git log --oneline -15: 55454ea fix(api): return 200 with empty results..., bc34deb fix(ui): wrap layout..., ce88de8 fix(auth): export next-auth..., e886616 feat: add Header..., 0613504 feat: wire homepage..., 12c9829 chore: track core..., 7602c69 fix: export formatPrice..., 5cc6d28 docs: finalize V1 scope..., 3319c8f docs: sync v1/v2..., a602de9 chore: make db connection..., d66bdee docs+seed: lock V1..., 62088da chore: initial commit...
git remote -v: origin https://github.com/muratgulerr33/arti-optik-lens.git (fetch/push)
```

### 4) .env.local (maskeli)
```
3:# DATABASE_URL=postgresql://postgres:****@localhost:5432/artioplik
6:# DATABASE_URL=...
8:POSTGRES_USER=postgres
9:POSTGRES_PASSWORD=postgres
10:POSTGRES_DB=artioplik
11:DATABASE_URL=postgresql://postgres:****@localhost:5433/artioplik
14-18: AUTH_SECRET, POSTGRES yorum satırları
```

### 5) Port / process
```
lsof -iTCP:3000 -sTCP:LISTEN: node (PID 7137) LISTEN
lsof -iTCP:5432 -sTCP:LISTEN: com.docke (PID 6835) — cinselhobi_db
lsof -iTCP:5433 -sTCP:LISTEN: com.docke (PID 6835) — arti-optik-postgres
```

### 6) Docker
```
docker ps -a:
  arti-optik-postgres   Up 2 hours (healthy)   0.0.0.0:5433->5432/tcp
  cinselhobi_db         Up 2 hours             0.0.0.0:5432->5432/tcp
docker inspect arti-optik-postgres: /arti-optik-postgres running healthy
docker port arti-optik-postgres: 5432/tcp -> 0.0.0.0:5433
docker logs --tail 80: "PostgreSQL Database directory... Skipping initialization"
```

---

## PHASE 1 — DB doğrulama

### 1) psql select 1
```
docker exec -i arti-optik-postgres psql -U postgres -d artioplik -c "select 1;"
?column? 1 (1 row)
```

### 2) Tablolar
```
\dt: accounts, brands, categories, product_variants, products, sessions, users, verification_tokens (8 tablo)
```

### 3) Sayımlar
```
products: 119
brands: 17
product_variants: 150
gender: unisex 49, erkek 38, kadin 32
```

### 4) kadin join query (LIMIT 5)
```
5 satır döndü: Ray-Ban RB 4397, RB 4430, RB 0840S, RB 3625 (id, name, slug, brand, price). Hata yok.
```

---

## PHASE 3 — Repro (curl)

### GET /api/search?q=ray&limit=3
```
HTTP/1.1 200 OK
content-type: application/json
Body: items dolu — Ray-Ban RB 2140, RB 0102S, RB 3765 (title, price, image, slug, brand). categories: [], fallbackCategory: null, fallbackItems: [].
```

### GET /kadin/gunes-gozlugu
```
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Cache-Control: no-store, must-revalidate
HTML içinde "Ray-Ban", "Güneş Gözlük" geçiyor — ürünler render edilmiş.
```

### GET /erkek/gunes-gozlugu
```
HTTP/1.1 200 OK
Benzer şekilde HTML döndü (büyük response).
```

---

*Log sonu. Rapor: DISCOVERY_REPORT_20260128_1424.md*
