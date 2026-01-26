
Aşağıdaki metni **Cursor’a tek parça** yapıştır. (Design token kurallarını sen ekleyeceksin; Cursor otomatik yerleştirecek.)

---

## Cursor Prompt — Design Tokens & Rules (V1 Lock)

1. **Goal**

* ARTI OPTİK masterpack içinde **Design System** dokümanına (DOC-04) benim vereceğim “design token rules + theme tokens” içeriğini doğru yere ekle.
* V1 için tasarım kurallarını **kilitle**: token isimleri, kullanım kuralları, yasaklar, DoD (kontrol listesi).

2. **Context (Source of Truth)**

* Masterpack ana dosya: `docs/masterpack/00.chatgpt-master-pack-arti-optik-25-01-2026.md`
* Çalışma kopyaları: `docs/masterpack/work/mp-out-arti-optik/doc-04.md` (asıl edit buraya)
* Tasarım tokenları gerçek kaynak: `src/app/globals.css` (CSS custom properties)
* UI standartları: `docs/masterpack/work/mp-out-arti-optik/doc-06.md` (frontend standards), `doc-05.md` (native UX)

3. **Input (benim vereceğim içerik)**

* Aşağıdaki blok **BENIM_TOKEN_BLOĞUM**: (ben bu sohbetten sonra yapıştıracağım)
* İçerik iki parçalı olacak:

  * A) “Design Token Rules” (kullanım kuralları / yasaklar / naming)
  * B) “Theme Tokens List” (token isimleri + anlamları)

4. **Plan**

* (1) `doc-04.md` içinde uygun bölümü bul:

  * “Design Tokens” / “Theme” / “CSS Variables” benzeri başlık.
* (2) Yoksa şu yapıyı ekle (DOC-04 içinde):

  * `## Design Token Rules (V1 Lock)`
  * `## Theme Tokens (V1 List)`
  * `## Token Usage Examples (Do / Don’t)`
  * `## DoD: Token Change Checklist`
* (3) Benim verdiğim token bloğunu **hiç anlamını bozmadan** yerleştir:

  * Rules kısmı → `Design Token Rules (V1 Lock)`
  * Token listesi → `Theme Tokens (V1 List)`
* (4) `src/app/globals.css` dosyasını aç:

  * Oradaki tüm `--token-name` custom property’lerini listele
  * Benim verdiğim token listesiyle **eşleşmeyen** varsa:

    * dokümana “Missing / Unknown Tokens” diye ekle
    * kesin uydurma yapma
* (5) Kuralları masterpack diliyle uyumlu yaz:

  * “Değiştirilemez”, “yasak”, “zorunlu”, “Unknown” formatı korunacak
* (6) Sonunda doğrulama komutlarını çalıştır:

  * `node tools/masterpack-tools/check-masterpack.mjs "docs/masterpack/work/mp-out-arti-optik"`
  * `node tools/masterpack-tools/assemble-masterpack.mjs "docs/masterpack/work/mp-out-arti-optik" "docs/masterpack/00.chatgpt-master-pack-arti-optik-25-01-2026.md"`
  * ardından `git diff` ile değişen yerleri özetle

5. **Files to touch**

* `docs/masterpack/work/mp-out-arti-optik/doc-04.md` (mutlaka)
* (gerekirse referans için sadece oku) `src/app/globals.css`
* (gerekirse) `docs/masterpack/00.chatgpt-master-pack-arti-optik-25-01-2026.md` assemble çıktısı

6. **Implementation Notes**

* Token isimleri birebir aynı kalmalı (case/dash/underscore değişmez).
* Yeni token icat etmek yok.
* V1’de token değişimi gerekiyorsa “Unknown + reason” yaz ve değiştirme.
* Örneklerde shadcn/ui + tailwind v4 kullanımına uygun anlat.

7. **DoD**

* DOC-04 içine içerik eklenmiş olacak
* globals.css token listesi ile doküman tutarlı olacak
* Masterpack check + assemble başarılı olacak
* “Unknown/Missing tokens” bölümü net olacak

8. **Assumptions / Unknowns**

* Benim token bloğum gelene kadar placeholder koyma.
* Eğer DOC-04 içinde en uygun yer belirsizse: en üstte Design System girişinden sonra ekle.

9. **My Input Block (paste after this line)**
   `<<<BENIM_TOKEN_BLOĞUM>>>`

---
