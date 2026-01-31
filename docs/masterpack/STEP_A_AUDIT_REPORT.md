# STEP A - AUDIT RAPORU
## Mobile Bottom Nav/Tabs Temizlik Öncesi Kanıt Toplama

**Tarih:** 2026-01-27  
**Hedef:** Masterpack'ten mobile bottom nav/tabs referanslarını tespit et

---

## 1. MASTERPACK DOSYASI BULUNDU

✅ **Ana Masterpack:** `docs/masterpack/00.chatgpt-master-pack-arti-optik-26-01-2026.md`  
✅ **Dosya boyutu:** 8842 satır

---

## 2. MASTERPACK'TE BULUNAN EŞLEŞMELER

### 2.1 Direkt Eşleşmeler (Ana Masterpack)

**Ana masterpack dosyasında (`00.chatgpt-master-pack-arti-optik-26-01-2026.md`) bulunan referanslar:**

1. **Boş string referansları (``)** - 6 adet
   - Satır 3318: Route-to-Component Map bölümünde boş layout component referansı
   - Satır 3334: Category/Listing route'unda boş layout component
   - Satır 3348: Product Detail route'unda "Gizli (product detail'de gösterilmez)" notu ile
   - Satır 3360: Cart route'unda "Cart tab aktif" notu ile
   - Satır 3373: Checkout route'unda boş layout component
   - Satır 3385: Order Success route'unda boş layout component
   - Satır 3397: Search route'unda boş layout component
   - Satır 3411: Account Pages route'unda boş layout component

2. **`aria-current="page"` referansları** - 2 adet
   - Satır 2042: Navigation accessibility bölümünde
   - Satır 6310: QA checklist'te screen reader labels bölümünde

3. **`safe-area-inset-bottom` referansları** - 7 adet
   - Satır 1998: Mobile patterns bölümünde (notch support)
   - Satır 2265: Native UX Principles > Safe Area Support
   - Satır 2530: Design system constraints
   - Satır 5256: Native UX rules referansı
   - Satır 6340: QA checklist - Sticky action bar
   - Satır 6882: QA checklist - Sticky action bar
   - Satır 7959: Design rules referansı

**Not:** Ana masterpack dosyasında "mobile bottom nav", "mobile tabs", "5 tab", "PDP bottom nav hidden" gibi direkt terimler **BULUNAMADI**. Ancak boş string referansları (` `` `) muhtemelen mobile bottom nav için placeholder'lar.

### 2.2 Work Klasöründeki Dosyalarda Bulunan Eşleşmeler

**Work klasöründeki dosyalarda çok sayıda referans bulundu:**

- `doc-03.md`: Mobile Bottom Navigation bölümü (5 tab listesi, PDP hide exception)
- `doc-04.md`: MobileBottomNav component tanımı, 5 tab açıklaması
- `doc-05.md`: Mobile Bottom Navigation Rules (4.1), tab scroll, cart drawer
- `doc-07.md`: MobileBottomNav component inventory'de
- `doc-11.md`: Route map'te MobileBottomNav referansları, QA checklist'te bottom nav maddeleri
- `doc-12.md`: QA checklist'te "Mobile bottom nav çalışıyor (5 tab: Home, Categories, Cart, Wishlist, Profile)"
- `doc-14.md`: "PDP bottom nav hidden", "Bottom nav: Mobile'da 5 tab"

**Not:** Work klasöründeki dosyalar masterpack'in parçası mı? Plan'a göre sadece ana masterpack dosyası (`00.chatgpt-master-pack-arti-optik*.md`) hedef. Work klasörü ayrı mı değerlendirilmeli?

---

## 3. SRC/ KLASÖRÜNDE KOD ARAMASI

### 3.1 Component Dosyaları

❌ **`src/components/app/mobile-bottom-nav.tsx`** - **BULUNAMADI**  
❌ **`src/components/app/mobile-tabs.ts`** - **BULUNAMADI**  
❌ **`src/components/app/` klasörü** - **MEVCUT DEĞİL**

### 3.2 Import/Kullanım Araması

❌ **`MobileBottomNav`** - src/ içinde eşleşme yok  
❌ **`mobile-bottom-nav`** - src/ içinde eşleşme yok  
❌ **`MobileTabs`** - src/ içinde eşleşme yok  
❌ **`mobile-tabs`** - src/ içinde eşleşme yok

**SONUÇ:** Kod tarafında mobile bottom nav/tabs implementasyonu **YOK**. Sadece dokümantasyonda referanslar var.

---

## 4. SİLİNECEK/GÜNCELLENECEK BAŞLIKLAR LİSTESİ

### Ana Masterpack Dosyasında:

1. **Route-to-Component Map (Section 8)** - Boş string referansları (` `` `)
   - 8.1 Home: Boş layout component satırı
   - 8.2 Category/Listing: Boş layout component satırı
   - 8.3 Product Detail: "Gizli (product detail'de gösterilmez)" notu
   - 8.4 Cart: "Cart tab aktif" notu
   - 8.5 Checkout: Boş layout component satırı
   - 8.6 Order Success: Boş layout component satırı
   - 8.7 Search: Boş layout component satırı
   - 8.8 Account Pages: Boş layout component satırı

2. **Accessibility Guidelines (Section 8)** - `aria-current="page"` referansları
   - Satır 2042: Navigation bölümünde (genel kullanım, bottom nav'a özel değil - KORUNMALI?)
   - Satır 6310: QA checklist'te (genel navigation - KORUNMALI?)

3. **Safe Area Referansları** - `safe-area-inset-bottom`
   - Bu referanslar sadece bottom nav'a bağlı değil, sticky action bar gibi başka öğelerde de kullanılıyor
   - **KARAR GEREKLİ:** Sadece bottom nav'a bağlı anlatılar mı kaldırılacak, yoksa tüm safe-area referansları mı?

### Work Klasöründeki Dosyalarda (Eğer masterpack'in parçasıysa):

- `doc-03.md`: Section 5.3 Mobile Bottom Navigation (tamamen kaldırılacak)
- `doc-04.md`: MobileBottomNav component tanımı, 5 tab açıklamaları
- `doc-05.md`: Section 4.1 Mobile Bottom Navigation Rules
- `doc-07.md`: MobileBottomNav inventory entry
- `doc-11.md`: Route map'te MobileBottomNav, QA checklist maddeleri
- `doc-12.md`: QA checklist'te bottom nav maddeleri
- `doc-14.md`: PDP bottom nav hidden, 5 tab referansları

---

## 5. CART DRAWER REFERANSLARI

✅ **Cart Drawer component/pattern referansları KALACAK** (plan gereği)

**Ana masterpack'te cart drawer referansları:**
- Section 3.3 Feature Components: CartView component tanımı
- Drawer component tanımı (Section 3.2)
- Route map'te cart drawer kullanımı

**Not:** Sadece "bottom nav tab'ından açılır" gibi entrypoint referansları silinecek. Cart drawer'ın kendisi korunacak.

---

## 6. ÖZEL DURUMLAR

### 6.1 Safe Area Support

**Sorun:** `safe-area-inset-bottom` referansları hem bottom nav'da hem de sticky action bar'da kullanılıyor.

**Plan'a göre:** "Safe-area sadece bottom nav'a bağlı anlatılıyorsa kaldır; sticky action bar gibi başka öğelerde genel kural olarak gerekiyorsa **bottom nav'sız** şekilde kısa bırak."

**Karar Gereklidir:** Hangi safe-area referansları bottom nav'a bağlı, hangileri genel kural?

### 6.2 aria-current="page"

**Sorun:** `aria-current="page"` genel navigation pattern'i, sadece bottom nav'a özel değil.

**Plan'a göre:** "tab match/scroll/index anlatıları" kaldırılacak. `aria-current` genel navigation pattern'i olduğu için **KORUNMALI** olabilir.

**Karar Gereklidir:** `aria-current` referansları korunacak mı?

### 6.3 Ürün URL Standardı

✅ **`/urun/[slug]` ürün URL standardı KORUNACAK** (plan gereği)  
✅ Sadece "PDP'de bottom nav gizlenir" gibi istisna metni kaldırılacak

---

## 7. ÖZET

### Masterpack'te Bulunan Eşleşmeler:
- ✅ Boş string referansları (` `` `): 8 adet (Route-to-Component Map'te)
- ✅ `aria-current="page"`: 2 adet (genel navigation - korunmalı mı?)
- ✅ `safe-area-inset-bottom`: 7 adet (bottom nav'a bağlı olanlar kaldırılacak)
- ❌ "mobile bottom nav", "mobile tabs", "5 tab" gibi direkt terimler: **BULUNAMADI** (ana masterpack'te)

### Work Klasöründe:
- ⚠️ Çok sayıda referans var (doc-03, doc-04, doc-05, doc-07, doc-11, doc-12, doc-14)
- ⚠️ **SORU:** Work klasörü masterpack'in parçası mı?

### Kod Tarafında:
- ❌ `src/components/app/mobile-bottom-nav.tsx` - **YOK**
- ❌ `src/components/app/mobile-tabs.ts` - **YOK**
- ❌ `src/components/app/` klasörü - **YOK**
- ✅ **SONUÇ:** Kod değişikliği gerekmiyor, sadece dokümantasyon temizliği yapılacak

---

## 8. SİLİNECEK/GÜNCELLENECEK BÖLÜMLER (ÖN İZLEME)

### Ana Masterpack (`00.chatgpt-master-pack-arti-optik-26-01-2026.md`):

1. **Section 8: Route-to-Component Map**
   - Tüm route'lardaki boş layout component satırları (` `` `) kaldırılacak
   - Product Detail'deki "Gizli (product detail'de gösterilmez)" notu kaldırılacak
   - Cart route'undaki "Cart tab aktif" notu kaldırılacak

2. **Safe Area Referansları**
   - Bottom nav'a özel olanlar kaldırılacak
   - Sticky action bar gibi genel kullanımlar korunacak (bottom nav'sız şekilde)

3. **Work Klasörü Dosyaları** (Eğer masterpack'in parçasıysa)
   - Tüm mobile bottom nav/tabs bölümleri kaldırılacak
   - QA checklist'teki bottom nav maddeleri kaldırılacak
   - Inventory'deki MobileBottomNav entry'si kaldırılacak

---

## 9. KARAR GEREKTİREN NOKTALAR

1. **Work klasörü masterpack'in parçası mı?**
   - Eğer evetse, work klasöründeki dosyalar da temizlenecek
   - Eğer hayırsa, sadece ana masterpack dosyası temizlenecek

2. **`aria-current="page"` referansları korunacak mı?**
   - Genel navigation pattern'i olduğu için korunmalı mı?
   - Yoksa bottom nav'a özel anlatılar mı var?

3. **Safe area referansları hangileri bottom nav'a bağlı?**
   - Hangi referanslar sadece bottom nav için?
   - Hangi referanslar genel kural (sticky action bar, vb.)?

---

⛔ **Bu adım için Murat onayı gerekli**

**Sonraki Adım:** Murat "Tamam" derse Step B (Masterpack temizliği) başlatılacak.
