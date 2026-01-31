# Discovery Report — 2026-01-28 16:00

**Amaç:** "UI'da ürün yok" + "Category Failed query" + "/api/search 200 ama boş" durumunun kök nedenini kanıta dayalı tespit.  
**Ham log:** `DISCOVERY_COMMAND_LOG_20260128_1600.md`

---

## 1. OBSERVATIONS

- **DB durumu:** `arti-optik-postgres` çalışıyor, healthy, port 5433→5432. DB'de 119 product, 17 brand, 150 product_variant var; kadin/erkek/unisex dağılımı mevcut.
- **Env:** `DATABASE_URL=postgresql://postgres:****@localhost:5433/artioplik` — uygulama 5433'e bağlanıyor (arti-optik-postgres).
- **Port çakışması:** 5432'de `cinselhobi_db`, 5433'te `arti-optik-postgres`. `.env.local` 5433 kullandığı için bu ortamda çakışma yok.
- **Search API davranışı:** `src/app/api/search/route.ts` catch bloğunda (satır 96–108) DB/bağlantı hatasında `ECONNREFUSED` ise **200** + boş `items` dönüyor; diğer hatalarda 500. Yani bağlantı hatası istemciye hata olarak yansımıyor.
- **Category sayfası davranışı:** `getProductsByGender()` hata aldığında `dbError: true` dönüyor; `CategoryContent` → `EmptyState variant="db-error"` → "Veritabanına bağlanılamadı..." (Failed query hissi).
- **Bu discovery anında:** Tüm HTTP 200; `/api/search?q=ray&limit=3` Ray-Ban ürünleri döndü; kategori sayfaları 200. Yani şu an DB erişilebilir ve UI’da ürün görünür durumda.

---

## 2. EVIDENCE

| Bulgu | Komut / dosya | Kanıt |
|--------|----------------|--------|
| App hangi porta bağlanıyor | `.env.local` (maskeli) | `DATABASE_URL=...localhost:5433/artioplik` |
| Postgres container durumu | `docker ps` | arti-optik-postgres Up 2 hours (healthy), 0.0.0.0:5433->5432/tcp |
| DB’de veri var | `docker exec ... psql -c "select 'products' t, count(*) ..."` | products 119, brands 17, product_variants 150 |
| Kadin ürünleri DB’de var | `docker exec ... psql` (join, gender=kadin, limit 5) | Ray-Ban RB 4397, 4430, 0840S, 3625 vb. satırlar |
| Search hata maskeleme | `src/app/api/search/route.ts` satır 96–108 | catch içinde `isConnectionError ? 200 : 500`, her iki durumda boş `items` |
| Category “Failed query” mesajı | `page.tsx` getProductsByGender catch → `dbError: true`; `category-content.tsx` → EmptyState | dbError true iken "Veritabanına bağlanılamadı..." |

---

## 3. ROOT CAUSE

**Tek cümle:** Uygulama doğru DB’ye (localhost:5433, arti-optik-postgres) bağlandığında veri geliyor; “UI’da ürün yok” + “Category Failed query” + “/api/search 200 boş” üçlüsü, **DB’ye erişilemediği** durumlarda ortaya çıkıyor — ve search API bu hatayı **200 + boş sonuç** ile maskeleyerek kullanıcıya hata göstermiyor.

**Destekleyen üç kanıt:**

1. **Search route kodu:** DB/connection hatasında catch’te 200 + boş JSON dönülüyor (satır 101–108). Commit mesajı: "fix(api): return 200 with empty results on search DB connection error".
2. **Category sayfası:** Aynı DB bağlantısı kullanılıyor; bağlantı hatası → getProductsByGender catch → dbError: true → EmptyState "Veritabanına bağlanılamadı..." (Failed query deneyimi).
3. **Ortam tutarlılığı:** DATABASE_URL=localhost:5433; arti-optik-postgres 5433’te; DB’de veri var. Port yanlış (örn. 5432) veya container kapalı olduğunda bağlantı reddedilir → search 200 boş, category Failed query.

---

## 4. WHY “UI ÜRÜN YOK” GÖRÜNÜYOR? (/api/search 200 + boş maskelemesi)

- **Category:** Sunucu tarafında `getProductsByGender()` DB’den veri çekemeyince catch’e düşüyor, `dbError: true` ile EmptyState “Veritabanına bağlanılamadı…” gösteriliyor. Kullanıcı bunu “Failed query” gibi görüyor.
- **Search:** API aynı `db` ile sorgu atıyor; DB/connection hatası olunca catch’te **200** + boş `items` dönüyor. İstemci hata almıyor, sadece boş liste görüyor. Bu yüzden “/api/search 200 ama boş” ve “UI’da ürün yok” (arama sonucu boş) birlikte görülebiliyor.
- Özet: DB erişilemezken category hata mesajı veriyor, search ise hatayı gizleyip 200 + boş veriyor; ikisi de aynı kök nedene (DB’ye ulaşılamaması) bağlı.

---

## 5. MINIMAL FIX OPTIONS (UYGULANMAYACAK; SADECE SEÇENEK)

- **Option A — Env/port/DB + dev server:**  
  - RUN LATER: `docker compose up -d` (veya ilgili postgres container’ı başlat).  
  - `.env.local` içinde `DATABASE_URL=...localhost:5433/artioplik` olduğundan emin ol (5432 değil).  
  - Gerekirse dev server’ı yeniden başlat: `npm run dev`.
- **Option B — Search’te DEV’de görünür hata:**  
  `/api/search` route’unda DB/connection hatasında, sadece development’ta (örn. `process.env.NODE_ENV === 'development'`) 200 yerine 5xx veya 200 body içinde `error: true, message: "DB connection failed"` gibi bilgi dönmek; production’da mevcut 200+boş davranışı korumak (isteğe bağlı).
- **Option C — Category ve Search hata davranışını tutarlı yapmak:**  
  Search’ü de category gibi “DB hatası” durumunda kullanıcıya anlamlı mesaj gösterecek şekilde değiştirmek (örn. 503 veya 200 + `error` alanı); böylece “200 boş” maskelemesi kalkar.

---

## 6. RISKLER / DO NOT RUN

- **Git:** `git reset --hard`, `git clean -fd`, `git restore .`, `git checkout -- .`, `git stash pop/drop` yapma.
- **Docker:** `docker rm`, `docker volume rm`, `docker system prune` (yıkıcı temizlik) yapma.
- **DB:** `DROP`, `TRUNCATE` gibi yıkıcı SQL çalıştırma.
- **Process:** Next dev server’ı gereksiz yere kill etme; kanıt toplama tamamlandı.

---

**Bitiş kriterleri (kanıtlı cevaplar):**

- **DB’de veri var mı?** Evet — products 119, brands 17, product_variants 150; kadin join sorgusu Ray-Ban satırları döndü.
- **App hangi DB’ye bağlanıyor?** localhost:5433 → arti-optik-postgres (docker port eşlemesi ve .env.local ile uyumlu).
- **Neden search boş gösterebiliyor?** DB/connection hatasında catch’te 200 + boş items dönülüyor; hata maskeleyici davranış.
- **Category neden “Failed query” veriyor?** DB’ye ulaşılamayınca getProductsByGender catch’e düşüyor, dbError: true → EmptyState “Veritabanına bağlanılamadı…” mesajı.
