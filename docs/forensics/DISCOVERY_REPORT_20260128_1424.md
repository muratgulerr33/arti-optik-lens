# DISCOVERY REPORT — UI’da Ürün Yok / Category Failed Query / Search 200 Boş

Tarih: 28 Ocak 2026 14:24. Keşif/forensik; kanıta dayalı. Hiçbir kod değişikliği uygulanmadı.

**Referans:** [DISCOVERY_COMMAND_LOG_20260128_1424.md](DISCOVERY_COMMAND_LOG_20260128_1424.md) — ham komut çıktıları.

---

## (A) Snapshot

| Konu | Kanıt |
|------|--------|
| **Dizin** | `pwd`: /Users/apple/dev/arti-optik-next; `.env.local`, `src`, `drizzle`, `docker-compose.yml` mevcut |
| **Branch** | `git branch --show-current`: chore/track-core |
| **Son commit** | 55454ea fix(api): return 200 with empty results on search DB connection error |
| **Node/npm** | node v22.14.0, npm 10.9.2 |
| **Port 3000** | node (PID 7137) LISTEN |
| **Port 5432** | com.docke (cinselhobi_db) LISTEN |
| **Port 5433** | com.docke (arti-optik-postgres) LISTEN |
| **Docker** | arti-optik-postgres Up 2 hours (healthy), 0.0.0.0:5433->5432/tcp; cinselhobi_db 0.0.0.0:5432->5432/tcp |
| **ENV** | .env.local satır 11: DATABASE_URL=postgresql://postgres:****@localhost:5433/artioplik |

---

## (B) Repro adımları (UI ve endpoint)

- **GET /api/search?q=ray&limit=3:** HTTP 200, body’de `items` dolu (Ray-Ban ürünleri). Kanıt: curl çıktısı — COMMAND_LOG.
- **GET /kadin/gunes-gozlugu:** HTTP 200, HTML’de "Ray-Ban", "Güneş Gözlük" geçiyor; ürünler render ediliyor. Kanıt: curl + grep çıktısı.
- **GET /erkek/gunes-gozlugu:** HTTP 200, HTML döndü.

Özet: Bu discovery anında hem search hem category endpoint’leri başarılı; DB bağlantısı çalışıyor.

---

## (C) DB doğrulama (veri var mı, doğru DB mi)

- **Container / DB:** `docker exec arti-optik-postgres psql -U postgres -d artioplik -c "select 1;"` → 1 row. Tablolar: products, brands, product_variants, categories, users, accounts, sessions, verification_tokens.
- **Sayımlar:** products 119, brands 17, product_variants 150. gender: unisex 49, erkek 38, kadin 32.
- **kadin join query (LIMIT 5):** psql’de 5 satır döndü (Ray-Ban örnekleri), hata yok.

Kanıt: COMMAND_LOG Phase 1. Bugünkü DB’de ürün var; doğru DB artioplik, port 5433.

---

## (D) App ↔ DB bağlantı zinciri (env → connection.ts → drizzle → query)

| Bağlantı halkası | Kanıt |
|------------------|--------|
| **DATABASE_URL** | .env.local satır 11: `postgresql://postgres:****@localhost:5433/artioplik`. Port hard-coded değil; connection.ts sadece `process.env.DATABASE_URL` kullanıyor. |
| **connection.ts** | Satır 11–17: `process.env.DATABASE_URL` kontrolü; Pool(normalizedUrl). Satır 46–84: db proxy, ilk erişimde getDb() ile pool oluşturuluyor. |
| **search route** | src/app/api/search/route.ts: db.select()… innerJoin(brands), leftJoin(productVariants). Catch (94–109): DB/connection hatalarında 200 + boş items dönüyor; ECONNREFUSED ise status 200, diğer hatalar 500. |
| **category page** | src/app/[gender]/gunes-gozlugu/page.tsx: getProductsByGender() db.select()… where(eq(products.gender, dbGender)). Catch (59–62): `products: [], dbError: true` dönüyor. |
| **gender mapping** | genderMap = { kadin: "kadin", erkek: "erkek", unisex: "unisex" }; URL param doğrudan DB değeri (kadin). |

---

## (E) “Neden search boş ama category patlıyor?” analizi

- **Search:** Hata durumunda catch bloğu (route.ts 94–109) 200 + boş `items` döndüğü için kullanıcı “ürün yok” görüyor; gerçekte DB bağlantı/query hatası olabilir.
- **Category:** getProductsByGender catch’te `dbError: true` dönüyor; CategoryContent EmptyState variant="db-error" ile “Veritabanına bağlanılamadı. Lütfen daha sonra tekrar deneyin.” gösteriyor (empty-state.tsx satır 13, 22).
- Fark: Search hatayı maskeleyip 200 boş veriyor; category ise dbError ile UI’da net hata mesajı gösteriyor. Aynı bağlantı hatası (yanlış port / DB kapalı) search’te “boş sonuç”, category’de “Failed query” veya “Veritabanına bağlanılamadı” olarak görünebilir.

---

## (F) Kök neden(ler) + kanıt

1. **Uygulama yanlış porta (5432) veya yanlış DB’ye bağlandığında (veya DB kapalıyken)** category sayfasındaki getProductsByGender sorgusu fail ediyor; catch `dbError: true` + boş liste dönüyor; UI “Veritabanına bağlanılamadı” gösteriyor. **Kanıt:** page.tsx 59–62, category-content.tsx 63–64, empty-state.tsx DB_ERROR_MESSAGE.
2. **Aynı bağlantı hatası** /api/search’te catch ile yakalanıp 200 + boş items dönüyor; kullanıcı tarafında “ürün yok” gibi görünüyor. **Kanıt:** route.ts 94–109, özellikle ECONNREFUSED için status 200.
3. **Geçmişte DB connection error yaşanmış.** **Kanıt:** git log 55454ea — “fix(api): return 200 with empty results on search DB connection error”.

Şu an .env.local 5433/artioplik ile doğru DB’ye gidildiği için bu discovery’de hem search hem category başarılı; sorun port/env uyuşmazlığı veya DB kapalıyken ortaya çıkıyor.

---

## (G) Minimal fix seçenekleri (UYGULAMA YOK, sadece öneri)

1. **ENV/port doğrulama:** DATABASE_URL’in her zaman doğru portu (arti-optik için 5433) kullandığından emin ol; dev server’ı .env.local değişikliği sonrası yeniden başlat.
2. **Search route:** DB hatasında her zaman 200 boş dönmek yerine, development için (örn. DEBUG_DB_ERROR=1) 500 + hata loglamak; production’da isteğe bağlı 200 boş kalabilir.
3. **Category sayfa:** Zaten dbError: true ile EmptyState “Veritabanına bağlanılamadı” gösteriliyor; ek bir değişiklik zorunlu değil.

---

## (H) Riskler / Ne asla yapılmamalı

- **Yıkıcı komutlar:** git reset --hard, git clean -fd, git restore ., docker stop/rm arti-optik-postgres, volume silme, db drop — YASAK.
- **Kod değişikliği/commit:** Bu rapor sadece keşif; kullanıcı onayı olmadan değişiklik uygulanmadı.

---

## ROOT_CAUSE_REPORT_28JAN2026 ile çelişki

Yok. ROOT_CAUSE_REPORT’taki “Failed query … where products.gender = kadin limit 500” ifadesi, getProductsByGender catch’te dbError: true dönmesi ve UI’da EmptyState “Veritabanına bağlanılamadı” ile uyumlu; aynı kök neden (bağlantı/port/env veya DB kapalı) açıklanıyor. Bugünkü curl ile her iki endpoint de 200 ve dolu; mevcut env (5433/artioplik) doğru.
