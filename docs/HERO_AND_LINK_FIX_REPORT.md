# ARTI OPTİK — Hero Fix + Home Link Fix — Tek Parça Rapor (GPT’ye kopyala-yapıştır)

---

# BÖLÜM 1 — ORİJİNAL PLAN (HERO FIX)

# ARTI OPTİK — Home (/) Sayfasını Eski "Kilitli" Tasarıma %100 Geri Getirme Planı (Tek Nokta Atışı)

## Rolün
Kendini "Senior Frontend Engineer (Next.js 16 App Router + Tailwind) + UI Quality Lead" olarak konumlandır.
Amaç: `/` ana sayfasını, repo içinde zaten bulunan home component'leri kullanarak, daha önce kilitlediğimiz mobil-first tasarıma **tam aynı kaliteyle** geri getirmek.

## Mutlak Kurallar
- Uydurma yok. Repo içindeki mevcut dosyaları OKU, gerçek path'lere göre değişiklik yap.
- Scope dışına çıkma: sadece Home sayfası ve home bileşenleri + gerekiyorsa ufak yardımcı fonksiyon/komponent. Auth/checkout vs. dokunma.
- Mevcut component'ler duruyor; ana sayfa "default next template"e dönmüş. Bu template'i tamamen kaldırıp eski iskeleti kur.
- `npm run build` başarılı olmalı. Projede önceden var olan lint uyarıları varsa (ör. src/auth.ts) bu task için ignore edilebilir ama yeni lint üretme.

---

## 0) Hızlı Keşif (Önce Oku)
Şu dosyaları açıp mevcut durumu çıkar:
- `src/app/page.tsx` (şu an default template mi? burayı temizleyeceğiz)
- `src/components/home/` altındaki tüm bileşenler (özellikle):
  - `home-hero-banners.tsx`
  - `home-brand-grid.tsx`
  - `home-brand-grid-item.tsx`
  - `brand-logo-tile.tsx`
  - `home-brand-config.ts` (7 marka slug + display name)
  - `hero-image-dev-check.tsx` (dev-only hero çözünürlük uyarısı)
- Featured ürünlerde kullanılacak mevcut catalog bileşenleri:
  - `src/components/catalog/` içinde `ProductGrid` ve `ProductCard` (ya da projede hangi isimler kullanılıyorsa)
- DB / drizzle şema:
  - `src/db/schema` (products/productVariants ve `isFeatured` nerede?)
  - DB connection: `src/db/connection` (ya da proje standardı)
  - fiyat formatlayıcı: `formatPrice` nereden geliyor? (lib/utils vs.)

Bu keşfin sonucunda uygulamaya geç.

---

## 1) Home (/) — Final UI Hedefi (Kilit Tasarım)
Mobil-first, iki hero kart + popüler markalar grid + "Öne Çıkan Ürünler" bölümü.

### A) Hero: 2 kart (Kadın / Erkek)
- Üstte iki banner kart, aralarında sıkı spacing (mobilde çok boşluk olmasın).
- Kartlar:
  - `rounded-3xl` hissi, yumuşak gölge, border ince.
  - Görsel: `public/hero/kadin-hero.webp` ve `public/hero/erkek-hero.webp` (hero görselleri en az 1200px genişlikte olmalı).
  - Overlay gradient okunabilir olmalı:
    - Kadın: soldan koyu -> transparan (`from-black/75 via-black/25 to-transparent`)
    - Erkek: sağ metin var, gradient soldan değil metne göre ters olabilir (repo içindeki önceki haliyle aynı mantık).
  - Yazılar:
    - Başlık: "Kadın" / "Erkek"
    - Subtitle: "Yeni sezon kadın güneş gözlükleri" / "Yeni sezon erkek güneş gözlükleri"
    - Subtitle class: `leading-snug text-white/85` + hafif `drop-shadow-sm`
  - Hizalama:
    - Kadın metin bloğu SOLDA (`justify-start`)
    - Erkek metin bloğu SAĞDA (`justify-end`), wrapper: `ml-auto flex flex-col items-end text-right`
    - Erkek'te titleRightGap ve subtitleRightGap aynı padding hissinde olmalı (yaklaşık 16–28px).
- Banner linkleri:
  - Kadın → `/hub/kadin`
  - Erkek → `/hub/erkek`

### B) Popüler Markalar (Grid)
- Başlık: "Popüler Markalar"
- 2 kolon grid (mobil), tile boyutu sabit:
  - Tile: `h-[88px] min-h-[88px]` (hepsi aynı yükseklik)
  - İç logo alanı: `h-[72px]` (h-18) / padding `px-3 sm:px-4`
  - Tile stili: `rounded-2xl`, `shadow-sm`, `border` ince, `select-none`, `touch-manipulation`
  - `focus-visible:ring-2 ring-primary ring-offset-2 ring-offset-background` ring kesilmemeli
- Grid container'da ring kesilmesin diye `overflow-visible` (gerekliyse) uygulanmalı.
- Marka listesi **DB'den değil** config'den gelmeli:
  - `home-brand-config.ts` içindeki 7 marka slug kullanılacak:
    - ray-ban, prada, versace, dolce-gabbana, tom-ford, emperio-armani, michael-kors
- CTA tile:
  - "Tümünü Gör" tile'ı da diğerleriyle aynı yükseklikte olmalı.
  - `border-primary/25`, `hover:bg-primary/5`, `text-primary`, sağda küçük chevron icon (`ChevronRight` h-4 w-4).
  - Href: projede brands/hub kurgusu neyse oraya (repo içinde daha önce nereye gidiyorsa onu kullan).

### C) Marka Logo Optical Tweaks (kritik)
- D&G, Emporio Armani, Michael Kors logoları optik olarak küçük kalıyordu; bunlar daha dolu görünmeli.
- Tweak'ler **computed style**'da gerçekten `<img>` üzerinde `transform != none` olarak görünmeli.
- Next/Image iç img'ye direkt style bazen wrapper'a gidiyor; çözüm:
  - `brand-logo-tile.tsx` içinde `useRef` + `useEffect` ile wrapper içindeki gerçek `img` node'unu bul
  - `img.style.transform = translateY(y) scale(s)` uygula
  - `transform-gpu` kullan
  - Bu 3 marka için scale/y değerleri (repo içindeki son halin mantığını koru):
    - dolce-gabbana: scale ~1.5 civarı
    - emperio-armani: scale ~1.6 civarı
    - michael-kors: scale ~1.3 civarı
  - Diğer markalar: transform uygulanmasın.

### D) Öne Çıkan Ürünler (Featured)
- Başlık: "Öne Çıkan Ürünler"
- Veri:
  - DB'den `productVariants.isFeatured === true` olan ürünleri çek
  - İlişkili product + variant datalarını mevcut `ProductGrid` / `ProductCard` bileşenlerinin beklediği shape'e göre hazırla
  - Limit: mobil performans için 6–8 item yeter
- Render:
  - Mevcut catalog bileşenlerini kullan (yeniden UI yazma).
  - Boşsa: bölüm gizlenebilir veya "Henüz öne çıkan ürün yok" minimal placeholder (tasarımı bozmayacak şekilde).

### E) Dev-only Hero çözünürlük uyarısı
- `hero-image-dev-check.tsx` varsa ve daha önce bağlandıysa, tekrar bağla.
- Sadece development'ta çalışmalı.
- `/hero/` altındaki img'lerde `naturalWidth < 1200` ise console warn atsın.

---

## 2) Uygulama Adımları (Kod Değişiklikleri)
1) `src/app/page.tsx`:
   - Default next template içeriğini kaldır.
   - Sırasıyla: Hero -> Popüler Markalar grid -> Öne Çıkan Ürünler.
   - Spacing: mobilde sıkı (`space-y-4` / `space-y-6` dengeli).
2) `src/components/home/home-hero-banners.tsx`:
   - Kadın/Erkek hizalarını kesinleştir (Kadın sol, Erkek sağ).
   - Erkek wrapper: `ml-auto flex flex-col w-[240px] sm:w-[320px] max-w-[70%] items-end text-right`
   - Subtitle: `leading-snug text-white/85 drop-shadow-sm`
   - Linkleri `/hub/kadin` `/hub/erkek`
   - Overlay `pointer-events-none` olmalı (tıklama linke gitsin).
3) `src/components/home/home-brand-grid.tsx`:
   - Grid container `overflow-visible` gerekiyorsa ekle (focus ring kesilmesin).
   - CTA tile'ı diğer tile'larla aynı `h-[88px]`.
4) `src/components/home/home-brand-grid-item.tsx`:
   - Tile class'ları: `shadow-sm select-none touch-manipulation` ve focus ring class'ları korunacak.
5) `src/components/home/brand-logo-tile.tsx`:
   - Optical tweaks'i **img node** üzerine taşı.
   - `useRef` ile wrapper al, `useEffect`te `wrapper.querySelector("img")` bul, transform uygula.
   - Bu sayede DevTools `getComputedStyle(img).transform` "none" olmayacak (sadece 3 markada).

---

## 3) Acceptance Criteria (Birebir Kontrol Listesi)
Aşağıdakiler sağlanmadan işi bitmiş sayma:

1) Hero:
   - Erkek başlık + subtitle sağa hizalı, right gap'leri aynı hissediyor.
   - Subtitle okunaklı: `text-white/85` + `leading-snug`
   - Hero image naturalWidth >= 1200 (dev-check uyarı vermiyor).
2) Brand grid:
   - Tüm tile'lar aynı yükseklikte (88px).
   - Logo alanı 72px; D&G / Emporio / MK daha dolu görünüyor.
   - DevTools'ta bu 3 markanın gerçek `<img>` transform'u `none` değil.
   - Focus ring kesilmiyor (overflow hidden ancestor yok ya da ring görünür).
3) Featured:
   - DB'den featured ürünler geliyorsa grid görünüyor, gelmiyorsa UI bozulmuyor.
4) Build:
   - `npm run build` başarılı.

---

## 4) Doğrulama Komutları (Kapanış)
- `npm run build`
- Tarayıcıda `/` aç:
  - Mobil viewport (390x844 gibi)
  - Hero + brand grid + featured görünümü kontrol et.

İşi bitirince:
- Değişen dosyaları listele (path'lerle)
- Neleri neden yaptığını 5–8 maddede özetle
- "Acceptance Criteria" checklist'ini tek tek ✅/❌ olarak raporla

---

# BÖLÜM 2 — SONRADAN VERİLEN PROMPT (HOME LINK FIX)

# ARTI OPTİK — HOME LINK FIX (HUB DEĞİL KATEGORİ)

## Amaç
Home'daki tüm navigasyonları "hub" yerine gerçek route yapısına sabitle:
- Kadın banner → /kadin/gunes-gozlugu
- Erkek banner → /erkek/gunes-gozlugu
- Marka tile'ları → proje standardındaki "brand filtreli liste" sayfası (repo'da hangisi varsa O)

## Mutlak Kural
- "/hub" kelimesi projede artık kullanılmayacak (en azından Home ile ilgili dosyalarda).
- Uydurma route yok: repo'da mevcut olan page/route yapısını tara ve mevcut route'u kullan.

---

## 1) Repo Route Keşfi (ÖNCE)
Aşağıdakileri ara ve raporla:
1) App router path'leri:
- `src/app/**/page.tsx` içinde şu pattern'leri ara:
  - `/search`
  - `/brand`
  - `/brands`
  - `/[gender]`
  - `/[gender]/gunes-gozlugu`
2) Link üreten yerler:
- `src/components/home/home-hero-banners.tsx`
- `src/components/home/home-brand-grid.tsx`
- `src/components/home/home-brand-grid-item.tsx`
- `src/components/home/home-brand-config.ts`

Repo'da "marka tıklayınca nereye gidiyor" daha önce nasıl yapılmışsa onu tespit et:
- Eğer `/search` sayfası var ve brand parametresi destekliyorsa: `/search?brand=<slug>`
- Eğer `[gender]/gunes-gozlugu` içinde brand filtre destekleniyorsa: `/${gender}/gunes-gozlugu?brand=<slug>` (ama sadece gerçekten destekleniyorsa)
- Eğer `/brands/[slug]` gibi sayfa varsa: `/brands/<slug>`
Bulamadığın şeyi uydurma; "Unknown" yaz ve mevcut route'lara göre en güvenli seçeneği seç.

---

## 2) Task A — Hero Banner Link Fix
Dosya: `src/components/home/home-hero-banners.tsx`

Şunları kesin uygula:
- Kadın banner Link href: `"/kadin/gunes-gozlugu"`
- Erkek banner Link href: `"/erkek/gunes-gozlugu"`
- "/hub/…" kullanan tüm yerleri sil/replace et.

---

## 3) Task B — Brand Tile Link Fix
Dosya: `src/components/home/home-brand-grid.tsx` ve/veya `home-brand-grid-item.tsx`

- Brand slug listesi config'den gelsin (zaten var).
- Her brand tile'a tıklanınca **repo'da tespit ettiğin** brand route'una git.

Ek olarak:
- "Tümünü Gör" CTA da aynı liste sayfasına gitmeli:
  - Eğer `/search` varsa: `/search`
  - Eğer `/brands` varsa: `/brands`
  - Hangisi repo'da gerçekse onu kullan.

---

## 4) Task C — Regresyon Kontrol
- `npm run build` çalıştır.
- Home'u açıp banner click:
  - Kadın: /kadin/gunes-gozlugu'e gidiyor mu?
  - Erkek: /erkek/gunes-gozlugu'e gidiyor mu?
- Brand tile click: 1 marka seç ve doğru sayfaya gidiyor mu?

---

## 5) Çıkış Formatı
Bitirince şunları ver:
- Değişen dosyalar listesi
- Hero linkleri final değerleri (2 satır)
- Brand tile link stratejisi (tek cümle + örnek URL)
- Build sonucu

---

# BÖLÜM 3 — UYGULAMA SONUÇLARI (SIRAYLA)

## 3.1 — Hero Fix planı uygulama sonuçları

**Değişen dosyalar:**
- `src/app/page.tsx` — Featured fiyatı kuruşa çevrildi (DB TL/kuruş uyumu); spacing `space-y-4 sm:space-y-6`, Featured bölümü boşsa render edilmiyor.
- `src/app/hub/[gender]/page.tsx` — Oluşturuldu (plan sırasında): `/hub/kadin` ve `/hub/erkek` → `/[gender]/gunes-gozlugu` redirect.
- `src/components/home/home-hero-banners.tsx` — Hero linkleri plan sırasında `/hub/kadin` ve `/hub/erkek` yapıldı; kartlar `rounded-3xl`; overlay zaten `pointer-events-none`.
- `src/components/home/brand-logo-tile.tsx` — Optical transform uygulanan img'lere `willChange = "transform"` eklendi.
- `home-brand-grid.tsx` ve `home-brand-grid-item.tsx` — Zaten plana uygundu (overflow-visible, h-[88px], shadow-sm, select-none, touch-manipulation); değişiklik yok.
- Featured ve HeroImageDevCheck zaten entegreydi; sadece fiyat birimi ve boş durum düzeltildi.

**Özet (5–8 madde):**
1. page.tsx: Featured ürün fiyatı kuruşa normalize edildi; boşsa bölüm gizlendi; spacing plana göre ayarlandı.
2. Hub redirect sayfası eklendi (sonra link fix ile kaldırıldı).
3. Hero banner href'leri önce plana göre /hub/kadin ve /hub/erkek yapıldı.
4. Hero kartlar rounded-3xl yapıldı; overlay pointer-events-none zaten vardı.
5. brand-logo-tile: img node üzerinde transform + willChange eklendi (3 marka: D&G, Emporio Armani, Michael Kors).
6. Brand grid ve grid-item plana uygundu; değişiklik yapılmadı.
7. Featured DB'den isFeatured ile çekiliyor; ProductGrid/ProductCard kullanılıyor; HeroImageDevCheck HomeHeroBanners içinde kullanılıyor.
8. `npm run build` başarılı.

**Acceptance (Hero Fix):**
- Hero: Erkek sağa hizalı, subtitle okunaklı — ✅
- Hero linkleri (plan anında): /hub/kadin, /hub/erkek — ✅ (sonra link fix ile değiştirildi)
- Hero rounded-3xl — ✅
- Brand grid: tile 88px, logo 72px, 3 marka transform — ✅
- Featured: DB'den geliyor, boşsa bölüm yok — ✅
- npm run build başarılı — ✅

---

## 3.2 — Home Link Fix uygulama sonuçları

**Repo route keşfi sonucu:**
- `/search` sayfası var (`src/app/search/page.tsx`). `q` parametresi ile arama; `brand` parametresi yok.
- `/[gender]/gunes-gozlugu` var (`src/app/[gender]/gunes-gozlugu/page.tsx`). Brand query parametresi desteklenmiyor.
- `/brand` veya `/brands` veya `/brands/[slug]` yok.
- Marka tile'lar mevcut projede `/search?q=<marka adı>` kullanıyor (repo standardı). "Tümünü Gör" zaten `/search`.

**Değişen dosyalar:**
- `src/components/home/home-hero-banners.tsx` — Hero href ve BANNER_TEST_IDS `/kadin/gunes-gozlugu` ve `/erkek/gunes-gozlugu` olacak şekilde güncellendi; `/hub/` kaldırıldı.
- `src/app/hub/[gender]/page.tsx` — Silindi (hub artık kullanılmıyor).

**Hero linkleri (final):**
- Kadın banner: `/kadin/gunes-gozlugu`
- Erkek banner: `/erkek/gunes-gozlugu`

**Brand tile link stratejisi:**
Marka tile'ları proje standardına göre `/search` sayfasına `q` ile marka adı gönderiyor. Örnek URL: `/search?q=Ray-Ban`. "Tümünü Gör" CTA `/search` sayfasına gidiyor. Repo'da `/brands` veya `?brand=` ile çalışan ayrı sayfa yok.

**Build sonucu:**
- `npm run build` başarılı (exit 0). Route listesinde `/hub/[gender]` yok.

---

## 3.3 — Tüm işlemlerin birleşik sırası (yapılan değişiklikler kronolojik)

1. **src/app/page.tsx** — Featured fiyat kuruş normalizasyonu; boşsa Featured bölümü gizleme; spacing (space-y-4 sm:space-y-6, mt-6 sm:mt-8).
2. **src/app/hub/[gender]/page.tsx** — (Hero Fix sırasında) oluşturuldu; (Link Fix sırasında) silindi.
3. **src/components/home/home-hero-banners.tsx** — Önce: href'ler /hub/kadin, /hub/erkek; rounded-3xl. Sonra: href'ler /kadin/gunes-gozlugu, /erkek/gunes-gozlugu; BANNER_TEST_IDS güncellendi; overlay pointer-events-none zaten vardı.
4. **src/components/home/brand-logo-tile.tsx** — img node üzerinde transform sonrası willChange = "transform" eklendi.
5. **src/components/home/home-brand-grid.tsx** — Değişiklik yok (overflow-visible, CTA h-[88px], href="/search" zaten vardı).
6. **src/components/home/home-brand-grid-item.tsx** — Değişiklik yok (href `/search?q=${encodeURIComponent(name)}` repo standardı).

**Final durum:**
- Hero: Kadın → `/kadin/gunes-gozlugu`, Erkek → `/erkek/gunes-gozlugu`.
- Brand tile: `/search?q=<marka adı>` (ör. `/search?q=Ray-Ban`). "Tümünü Gör" → `/search`.
- Projede Home ile ilgili dosyalarda "/hub" kullanılmıyor; hub route'u kaldırıldı.
