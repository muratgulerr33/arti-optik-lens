# Guest kalp tıklaması — Manuel doğrulama checklist

**Amaç:** Guest iken kalbe tıklandığında server action (Next-Action POST) atılmadığını ve login yönlendirmesinin doğru çalıştığını doğrulamak.

## Checklist

1. **Çıkış yap** (veya gizli pencerede aç) → guest kullanıcı ol.
2. **Herhangi bir sayfada** (örn. ana sayfa veya ürün listesi) bir ürün kartındaki **kalp ikonuna tıkla**.
3. **Beklenen:**
   - URL: `/auth/login?callbackUrl=...` (mevcut sayfa path’i callbackUrl’de).
   - **Network sekmesi:** `Next-Action` veya wishlist/server action ile ilgili **POST isteği olmamalı** (sadece sayfa navigasyonu).
4. **Giriş yap** → callbackUrl’e geri dönülmeli; scroll + otomatik favori ekleme + toast + kalp dolu + wishlist sayfasında görünür (post-login flow).

## Kod referansı

- `src/components/favorites/favorite-button.tsx`: Guest branch’te `router.push(/auth/login?callbackUrl=...)` ile `return`; `toggleWishlist` (server action) **çağrılmaz** → POST atılmaz.
