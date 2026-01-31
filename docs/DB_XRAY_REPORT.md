# Veritabanı X-Ray Raporu — Ürün ve Nitelik Analizi

**Tarih:** Script çıktısına göre üretilmiştir.  
**Amaç:** Arama ve filtreleme tutarsızlıklarını (örn. "Damla" aranıyor ama bulunamıyor) analiz etmek için veritabanındaki gerçek veriyi raporlamak.

---

## 1. Kategori Analizi (Ürün sayısı / kategori)

| Kategori               | Slug                   | Path (ltree)           | Ürün sayısı |
|------------------------|------------------------|------------------------|-------------|
| Unisex Güneş Gözlüğü   | unisex-gunes-gozlugu   | unisex.gunes.gozlugu   | 59          |
| Erkek Güneş Gözlüğü    | erkek-gunes-gozlugu    | erkek.gunes.gozlugu    | 33          |
| Kadın Güneş Gözlüğü    | kadin-gunes-gozlugu    | kadin.gunes.gozlugu    | 27          |

**Toplam:** 119 ürün (kategoriler arası tekrar yok; her ürün tek kategoriye bağlı).

---

## 2. Şekil (Shape) Envanteri — `product_variants.attributes->>'shape'`

| Değer (DB'deki gerçek) | Varyant sayısı |
|------------------------|----------------|
| Köşeli                 | 86             |
| Çekik                  | 19             |
| Damla                  | 15             |
| Geometrik              | 13             |
| Oval                   | 8              |
| *(null/boş)*           | 5              |
| Yuvarlak               | 3              |
| Altıgen                | 1              |

### Türkçe / İngilizce uyumsuzluk (kritik)

- Veritabanında **şekil değerleri tamamen Türkçe**: Damla, Yuvarlak, Köşeli, Çekik, Geometrik, Oval, Altıgen. **"Aviator"**, **"Round"**, **"Cat Eye"** gibi İngilizce değerler **hiç yok**.
- **Damla:** DB'de 15 varyant var. Arama API'sindeki `SHAPE_MAP` "damla" / "aviator" aramasını `['Damla', 'Pilot', 'Aviator']` ile eşliyor; SQL tarafında `ILIKE` kullanıldığı için "Damla" ile eşleşir. Yani **arama sonuçları** "Damla" için doğru çalışabilir.
- **Kategori sayfası filtreleri** (`/gunes-gozlugu?shape=...`) ise `src/lib/api/products.ts` içinde **tam eşleşme** (`attributes->>'shape' = $deger`) kullanıyor. Bu yüzden URL'de mutlaka **DB'deki değer** yazılmalı: `shape=Damla` doğru, `shape=Aviator` yanlış (DB'de "Aviator" yok).
- **Öneri:** Filtre linkleri ve URL parametreleri her zaman **DB'deki Türkçe değerlerle** (Damla, Köşeli, Yuvarlak, Çekik, vb.) üretilmeli; İngilizce kullanıcı arayüzü gösterilecekse arayüzde İngilizce etiket, URL'de Türkçe değer kullanılabilir.

---

## 3. Çerçeve (Shape) ve Kategori İlişkisi

Her şekil değerinin hangi kategoride kaç ürünle temsil edildiği:

| Şekil     | Unisex Güneş Gözlüğü | Erkek Güneş Gözlüğü | Kadın Güneş Gözlüğü |
|-----------|----------------------|----------------------|----------------------|
| Köşeli    | 39                   | 31                   | 16                   |
| Çekik     | 6                    | —                    | 13                   |
| Damla     | 6                    | 9                    | —                    |
| Geometrik | 9                    | —                    | 4                    |
| Oval      | 5                    | 1                    | 2                    |
| Yuvarlak  | 1                    | 1                    | 1                    |
| Altıgen   | 1                    | —                    | —                    |
| *(null)*  | 3                    | 2                    | —                    |

Damla şekli özellikle **Erkek** ve **Unisex** kategorilerinde; **Kadın** kategorisinde Damla yok.

---

## 4. Renk (color_frame) Analizi — `product_variants.attributes->>'color_frame'`

| Değer (DB'deki gerçek) | Varyant sayısı |
|------------------------|----------------|
| Siyah                  | 74             |
| Kahverengi             | 29             |
| Gri                    | 19             |
| Sarı                   | 8              |
| Mavi                   | 5              |
| Altın                  | 2              |
| Gümüş                  | 2              |
| Pembe                  | 2              |
| Yeşil                  | 2              |
| Beyaz                  | 2              |
| Bej                    | 2              |
| Kırmızı                | 1              |
| *(null/boş)*           | 2              |

### Türkçe / İngilizce

- Renkler de **tamamen Türkçe** (Siyah, Kahverengi, Gri, vb.). **"Black"**, **"Brown"** gibi değerler veritabanında yok.
- Arama ve filtre mantığı shape ile tutarlı: arama API'si TR/EN mapping ile ILIKE kullanıyor; kategori sayfası filtreleri tam eşleşme kullandığı için URL parametrelerinde **Türkçe renk değerleri** (örn. `color_frame=Siyah`) kullanılmalı.

---

## 5. Marka ve Cinsiyet Dağılımı

### Marka bazında toplam ürün

| Marka            | Toplam ürün |
|------------------|-------------|
| Ray-Ban          | 22          |
| Dolce & Gabbana  | 15          |
| Prada            | 15          |
| Tom Ford         | 15          |
| Michael Kors     | 13          |
| Versace          | 13          |
| Emporio Armani   | 9           |
| Gucci            | 9           |
| Armani Exchange  | 8           |

### Marka × Cinsiyet (ürün sayısı)

| Marka            | erkek | kadin | unisex |
|------------------|-------|-------|--------|
| Armani Exchange  | 6     | —     | 2      |
| Dolce & Gabbana  | 3     | 5     | 7      |
| Emporio Armani   | 5     | —     | 4      |
| Gucci            | 1     | 1     | 7      |
| Michael Kors     | —     | 9     | 4      |
| Prada            | 3     | 4     | 8      |
| Ray-Ban          | 4     | —     | 18     |
| Tom Ford         | 7     | 5     | 3      |
| Versace          | 4     | 3     | 6      |

---

## Özet ve Öneriler

1. **Şekil (shape):** DB'de sadece Türkçe (Damla, Yuvarlak, Köşeli, Çekik, Geometrik, Oval, Altıgen). "Damla" 15 varyantta mevcut; arama "Damla"/"Aviator" için mapping ile çalışır, ancak **kategori filtresi URL'de mutlaka Türkçe değer** (örn. `shape=Damla`) olmalı.
2. **Renk (color_frame):** Aynı mantık; DB tamamen Türkçe, filtre parametreleri Türkçe verilmeli.
3. **Null/boş attribute:** 5 varyantta `shape`, 2 varyantta `color_frame` null/boş; istenirse seed veya normalizasyonla doldurulabilir.
4. Rapor, `npx tsx scripts/db-xray.ts` çalıştırılarak tekrar üretilebilir.
