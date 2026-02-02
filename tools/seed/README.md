# Seed Scripts

Ürün ve varyant verilerini veritabanına yükleyen scriptler.

## Attributes normalizasyonu

`product_variants.attributes` alanı anlamlı İngilizce anahtarlarla doldurulur:

- **lib/normalize-attributes.mjs**: Türkçe alan adlarını İngilizce anahtarlara map eder, SKU/slug benzeri anahtarları eler, isim/açıklama metninden shape/color fallback çıkarır.
- Map: `Renk` / `Genel Renk` → `color`, `Çerçeve Rengi` → `color_frame`, `Cam Rengi` → `color_lens`, `Şekil` / `Gövde Tipi` → `shape`, `Materyal` → `material`, `Ekartman` → `size_bridge`.

## Veritabanını temizleyip tekrar seed etme

### seed-v1-from-scrape.mjs (JSON dosyasından)

Mevcut ürün ve varyantları silip ardından import eder:

```bash
# .env.local içinde DATABASE_URL tanımlı olmalı
node tools/seed/seed-v1-from-scrape.mjs --truncate --file=tools/seed/input/v1-seed-100.full.json
```

- `--truncate`: Önce `product_variants` ve `products` tablolarını siler, sonra seed yapar. Dry-run ile birlikte kullanılmaz.
- `--dry-run`: Değişiklik uygulamadan test eder.
- `--file=...`: Seed JSON dosyası yolu (varsayılan: `tools/seed/input/v1-seed-100.full.json`).

### seed-import-bundle-v1.mjs (bundle klasöründen)

Bu script UPSERT kullanır; tabloları otomatik silmez. Sıfırdan temiz seed için önce tabloları manuel temizleyip sonra çalıştırın:

```bash
# 1) Veritabanında tabloları temizle (psql veya Drizzle/migration ile)
# Örnek (psql):
#   DELETE FROM product_variants;
#   DELETE FROM products;

# 2) Bundle'dan import
IMPORT_BUNDLE_DIR=import-bundle-v1 node tools/seed/seed-import-bundle-v1.mjs
```

`DATABASE_URL` gerekli (.env.local veya ortam değişkeni).

### Wishlist seed (seed-wishlist.mjs)

Test kullanıcısı ve favori ürünleri ekler (E2E / smoke test için). **Önce** `db:migrate` (veya `db:push`) ile `wishlist_items` tablosunun oluşturulmuş olması gerekir; `users` ve `products` tablolarında kayıt olmalıdır.

```bash
npm run db:migrate   # veya npm run db:push
npm run seed:wishlist
```

**Tablo doğrulama:** `npm run db:migrate` sonrası `wishlist_items` tablosunun oluştuğunu doğrulamak için psql ile `\dt` çıktısında `wishlist_items` görünmeli.

**Doğrulama:** Wishlist E2E smoke testi (`tests/e2e/wishlist-smoke.spec.ts`) giriş sonrası favori sayfasını doğrular; test kullanıcısı için önce `seed:wishlist` çalıştırılmalıdır. Tüm E2E: `npm run test:e2e`.
