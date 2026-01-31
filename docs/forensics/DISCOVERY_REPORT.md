# Discovery Report — Kanıta Dayalı Teşhis

**Amaç:** "Ürün yok / failed query / search boş dönüyor / DB var mı?" konusunu kanıta dayalı teşhis.  
**Ham log:** [DISCOVERY_COMMAND_LOG.md](DISCOVERY_COMMAND_LOG.md)

---

## A) OBSERVATIONS (yalnız kanıtlı maddeler)

1. **PWD / Repo:** Çalışma dizini `/Users/apple/dev/arti-optik-next`; git root aynı.
2. **Branch:** `chore/track-core`; remote `origin` → `https://github.com/muratgulerr33/arti-optik-lens.git`.
3. **Working tree:** Temiz (staged/tracked diff yok); untracked: docs/forensics, docs/gemini, docs/masterpack/*, drizzle/*.sql, tools/seed/*.mjs, scripts/, vb.
4. **Son 15 commit:** En son `55454ea fix(api): return 200 with empty results on search DB connection error`; öncesinde SessionProvider, auth schema, layout, homepage, vb.
5. **Port 3000 / 3001:** Bu oturumda dinleyen process yok (lsof boş).
6. **.next/dev:** Var; `.next/dev/lock` yok (LOCK_YOK).
7. **Docker:** `arti-optik-postgres` Up 2 hours (healthy), port mapping `0.0.0.0:5433->5432/tcp`. `cinselhobi_db` aynı anda 5432->5432 kullanıyor.
8. **Postgres state:** arti-optik-postgres `Status: running`, `Health: healthy`.
9. **.env.local:** `DATABASE_URL=postgresql://***:***@localhost:5433/artioplik` (satır 11; port 5433).
10. **DB bağlantı:** `psql "$DATABASE_URL" -c "select 1 as ok;"` → 1 row. Bağlantı başarılı.
11. **Tablolar:** accounts, brands, categories, product_variants, products, sessions, users, verification_tokens (8 tablo).
12. **Counts:** products 119, brands 17, product_variants 150.
13. **gender dağılımı:** unisex 49, erkek 38, kadin 32.
14. **Kadin join:** `p.gender='kadin'` ile join sorgusu 5 satır döndü (Ray-Ban örnekleri).
15. **Dev server:** Bu oturumda çalışmıyor; curl localhost:3000 ve /api/search → 000/FAIL.
16. **Search route (kod):** catch’te DB/connection hatasında `isConnectionError ? 200 : 500` ile 200 + boş `items` dönüyor (satır 94–108).
17. **Category page (kod):** `getProductsByGender` catch’te `{ products: [], dbError: true }`; `CategoryContent` bunu `EmptyState variant={dbError ? "db-error" : "empty"}` ile kullanıyor (category-content.tsx 62–64).
18. **EmptyState:** variant "db-error" → "Veritabanına bağlanılamadı. Lütfen daha sonra tekrar deneyin."

---

## B) WHAT USER SEES vs WHAT SYSTEM DOES (kanıtlı)

- **Kullanıcı:** Arama boş dönebilir veya kategori sayfasında "Veritabanına bağlanılamadı" / "Henüz ürün yok" görebilir.
- **Sistem (kanıt):** DB aslında dolu (119 ürün, 17 marka, 150 variant); psql ile localhost:5433’e bağlanıp sorgular başarılı. Yani "DB yok" değil; uygulama çalışırken ya DB’ye ulaşamıyor (port/env/container) ya da dev server kapalı olduğu için hiç istek atmıyor. Search API, DB hatasında 200 + boş döndüğü için kullanıcı "ürün yok" gibi algılayabilir; category sayfası DB hatasında dbError ile EmptyState "db-error" gösteriyor.

---

## C) ROOT CAUSE (en olası 1–2 sebep, kanıt)

1. **Dev server kapalı / port 3000’de uygulama yok.**  
   Kanıt: lsof 3000/3001 boş; curl 000/FAIL. Bu oturumda UI’a erişim yok, dolayısıyla "search boş / ürün yok" deneyimi bu ortamda doğrudan test edilemedi; geçmişte yaşanmışsa sebep aşağıdaki olabilir.

2. **DATABASE_URL / port uyumsuzluğu veya Postgres’e ulaşamama (geçmişte).**  
   Kanıt: .env.local port 5433; container 5433->5432 map’li. Şu an psql 5433 ile başarılı. Eğer daha önce .env 5432 kullanıyorsa veya container down idiyse, app DB’ye bağlanamaz; search 200+boş, category dbError+EmptyState "db-error" gösterir.

---

## D) WHY "ürün yok" hissi oluşuyor?

- **Search:** DB/connection hatasında API 200 + boş `items` döndüğü için (route.ts satır 99–106) istemci "sonuç yok" gibi gösteriyor; hata mesajı yok.
- **Category:** DB hatasında `dbError: true` ile EmptyState "Veritabanına bağlanılamadı" gösteriliyor; bu durumda "ürün yok" değil "DB hatası" mesajı var.
- **Özet:** "Ürün yok" hissi büyük ölçüde search’ün hata durumunda 200+boş dönmesinden; category tarafı dbError ile daha net ayrışıyor.

---

## E) MINIMAL FIX (KOD YAZMADAN) — operasyonel

- Doğru container up mı? **Evet** — arti-optik-postgres Up, healthy.
- Doğru port mu? **Evet** — host 5433, .env.local 5433.
- Doğru DATABASE_URL mi? **Evet** — psql ile test edildi, bağlantı OK.
- Dev server lock/port durumu: Bu oturumda 3000’de process yok, .next/dev/lock yok; dev server başlatılmamış. Uygulamayı test etmek için `npm run dev` ile dev server’ı başlatmak yeterli (yıkıcı komut değil).

---

## F) MINIMAL FIX (KOD DEĞİŞİKLİĞİ GEREKİRSE) — sadece öneri, UYGULAMA YOK

- **Search endpoint:** DB/connection hatasında 200 yerine (ör. 503 veya 500) ve/veya response body’de `error: "database_unavailable"` benzeri bir alan verilmesi; böylece istemci "sonuç yok" ile "sistem hatası" ayrıştırılabilir.
- **Category / search tutarlılığı:** Search tarafında da DB hatası durumunda kullanıcıya açık bir hata mesajı (veya aynı EmptyState "db-error" mantığı) önerilebilir; davranış category ile tutarlı olur.

---

## G) IMPORT GEREKİR Mİ? (SADECE KANITLA)

- **Hayır.** DB’de products 119, brands 17, product_variants 150; counts > 0. Import zorunluluğu yok.
- Repo’da import/seed script’leri mevcut (sadece bulundu, çalıştırılmadı):
  - `tools/seed/`: seed-import-bundle-v1.mjs, seed-v1-from-scrape.mjs, seed-brands.mjs, count-brands-by-products.mjs, inspect-import-bundle-v1.mjs.
  - package.json: `seed:v1`, `seed:brands`, `db:generate`, `db:migrate`, `db:studio`.
- İleride import gerekirse: `npm run seed:v1` / `npm run seed:brands` vb. kullanıcı onayı ile çalıştırılmalı; bu raporlama oturumunda çalıştırılmadı.

---

## H) DO NOT RUN LIST (yıkıcı komutlar)

- Kod değiştirme / commit / push yapma.
- Migration veya seed/import çalıştırma (kullanıcı onayı olmadan).
- Yıkıcı komutlar: `git reset --hard`, `git clean -fd`, `git restore .`, `git checkout -- .`, `git stash pop/drop`, `docker stop/rm`, `rm -rf`, `.next` veya lock silme.
