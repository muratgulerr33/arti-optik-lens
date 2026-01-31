# RECOVERY_PLAN — Geri Dönüş ve Küçük Adım Düzeltme

**İlke:** Destructive komut yok. Tüm adımlar geri alınabilir. Güvenli yedek önce.

**Yasak (kullanıcı ONAYI olmadan çalıştırılmayacak):**  
`git reset --hard`, `git clean -fd`, `git checkout -- .`, `git restore .` (tüm repo), `git stash pop/drop`, `docker stop arti-optik-postgres`.

---

## 1) Güvenli yedek (komutları yaz, ÇALIŞTIRMA — kullanıcı isterse kendisi çalıştırır)

```bash
git branch backup-20260128-pre-recovery
tar -czvf ../arti-optik-next-backup-20260128.tar.gz . --exclude=node_modules --exclude=.next
```

İsteğe bağlı: `git stash push -u -m "pre-recovery-20260128"` (untracked dahil; pop/drop yasak, sadece gerekiyorsa kullanıcı karar versin).

---

## 2) “Anasayfa template → projeye bağla” hedefi

Mevcut bileşenler **var**; sadece ana sayfa ve (isteğe bağlı) layout’ta **kullanılmıyor**. Restore değil **reconstruction** önerilir.

**Kanıt (hangi bileşenler kullanılacak):**

- **Komut:** `sed -n '1,35p' src/components/home/home-hero-banners.tsx`  
  **Dosya + satır:** [src/components/home/home-hero-banners.tsx](src/components/home/home-hero-banners.tsx) satır 24: `export function HomeHeroBanners()`.

- **Komut:** `sed -n '1,40p' src/components/home/home-brand-grid.tsx`  
  **Dosya + satır:** [src/components/home/home-brand-grid.tsx](src/components/home/home-brand-grid.tsx) satır 9: `export function HomeBrandGrid()`.

- **Komut:** `sed -n '1,25p' src/components/layout/header.tsx`  
  **Dosya + satır:** [src/components/layout/header.tsx](src/components/layout/header.tsx) satır 12: `export function Header()`.

- **Komut:** `sed -n '1,20p' src/components/layout/footer.tsx`  
  **Dosya + satır:** [src/components/layout/footer.tsx](src/components/layout/footer.tsx) satır 3: `export function Footer()`.

---

## 3) Seçenek A — En küçük: sadece anasayfayı Home bileşenleriyle doldur

**Hedef:** [src/app/page.tsx](src/app/page.tsx) içeriğini create-next-app şablonundan, `HomeHeroBanners` + `HomeBrandGrid` render edecek hale getir.

**Önerilen diff (uygularken dosyayı bu hâle getir):**

```diff
--- a/src/app/page.tsx
+++ b/src/app/page.tsx
@@ -1,65 +1,16 @@
-import Image from "next/image";
-
-export default function Home() {
-  return (
-    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
-      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
-        <Image
-          className="dark:invert"
-          src="/next.svg"
-          alt="Next.js logo"
-          width={100}
-          height={20}
-          priority
-        />
-        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
-          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
-            To get started, edit the page.tsx file.
-          </h1>
-          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
-            Looking for a starting point or more instructions? Head over to{" "}
-            <a
-              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
-              className="font-medium text-zinc-950 dark:text-zinc-50"
-            >
-              Templates
-            </a>{" "}
-            or the{" "}
-            <a
-              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
-              className="font-medium text-zinc-950 dark:text-zinc-50"
-            >
-              Learning
-            </a>{" "}
-            center.
-          </p>
-        </div>
-        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
-          <a
-            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
-            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
-            target="_blank"
-            rel="noopener noreferrer"
-          >
-            <Image
-              className="dark:invert"
-              src="/vercel.svg"
-              alt="Vercel logomark"
-              width={16}
-              height={16}
-            />
-            Deploy Now
-          </a>
-          <a
-            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
-            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
-            target="_blank"
-            rel="noopener noreferrer"
-          >
-            Documentation
-          </a>
-        </div>
-      </main>
-    </div>
-  );
-}
+import { HomeHeroBanners } from "@/components/home/home-hero-banners";
+import { HomeBrandGrid } from "@/components/home/home-brand-grid";
+
+export default function Home() {
+  return (
+    <div className="container mx-auto space-y-10 px-4 py-8">
+      <HomeHeroBanners />
+      <HomeBrandGrid />
+    </div>
+  );
+}
```

**Yapıldıktan sonra (rapor sadece doküman; kod davranışı bu raporla değiştirilmedi):**  
`npm run dev` ile / sayfasını kontrol et; `npm run build` auth/db hataları yüzünden hâlâ başarısız olacaktır — bu değişiklik sadece anasayfa içeriğini düzeltir, build’i düzeltmez.

**Önerilen commit mesajı:** `feat: wire homepage with HomeHeroBanners and HomeBrandGrid`

---

## 4) Seçenek B — Layout’ta Header + Footer (navbar/footer görünür)

**Hedef:** [src/app/layout.tsx](src/app/layout.tsx) içinde `children`’ı Header ve Footer ile sarmala.

**Önerilen diff:**

```diff
--- a/src/app/layout.tsx
+++ b/src/app/layout.tsx
@@ -1,5 +1,6 @@
 import type { Metadata } from "next";
 import { Toaster } from "sonner";
+import { Header } from "@/components/layout/header";
+import { Footer } from "@/components/layout/footer";
 import { ThemeProvider } from "@/components/theme/theme-provider";
 ... (diğer importlar aynı)
                 <HeaderProvider>
-                  <SearchProvider>{children}</SearchProvider>
+                  <SearchProvider>
+                    <Header />
+                    {children}
+                    <Footer />
+                  </SearchProvider>
                 </HeaderProvider>
```

**Not:** `Header` "use client" kullanıyor; layout server component. Next.js’te client bileşenleri layout’ta kullanılabilir — sadece import edip JSX’te kullanmak yeterli. Bu diff, dosyanın ilgili kısmının mantıksal değişimini gösterir; satır numaraları mevcut layout’a göre uyarlanmalıdır.

**Yapıldıktan sonra:**  
`npm run dev` ile tüm sayfalarda üst/alt çubuk görünmeli. Build yine auth/db nedeniyle fail olabilir.

**Önerilen commit mesajı:** `feat: add Header and Footer to root layout`

---

## 5) Sıra önerisi ve “küçük adım”

1. **Önce yedek:** Yukarıdaki yedek komutları (branch + isteğe bağlı tar) kullanıcı çalıştırsın.
2. **Seçenek A:** Sadece `src/app/page.tsx` değiştir → anasayfa Home bileşenleriyle dolar. Tek dosya, küçük adım.
3. **Seçenek B:** İstenirse `src/app/layout.tsx`’e Header/Footer ekle → tüm sayfalarda navbar/footer görünür. A ve B birlikte de yapılabilir; her biri ayrı commit edilebilir.
4. **Build/lint:** Bu plan sadece anasayfa/layout “bağlama”yı hedefler. Build’in düzelmesi için auth/db (getDbForAdapter, users/accounts/sessions/verificationTokens) ayrı bir iş paketi; bu recovery planı onu kapsamaz.

---

## 6) Destructive olmayan, geri alınabilir adımlar

- Yedek branch + tar: geri almak için yeni branch’e geçmek veya tar’ı açmak yeterli.
- page.tsx / layout.tsx değişikliği: `git checkout -- src/app/page.tsx` veya `git checkout -- src/app/layout.tsx` ile **sadece o dosya** eski haline döner (kullanıcı yedekten sonra bunu bilinçli yapabilir; tüm repo `git checkout -- .` yasak).

**Kayıp var mı?**  
Forensik kanıtına göre: **Kayıp yok.** Bileşenler dosya sisteminde var; sadece ana sayfa ve layout’ta kullanılmıyor. “Eksik” sanılması, bu bileşenlerin hiç render edilmemesinden kaynaklanıyor — “dosya var ama kullanılmıyor” durumu raporda kanıtlandı.  
**RECOVERY2 Phase 2:** `git fsck` ile bir dangling commit (ddacf80) bulundu; içinde page.tsx değişimi var. Geri yükleme denemesi yapılmadı.

**Bilinmeyenler:**  
- Tarayıcıda / veya /search’te tam hangi hata göründüğü bu planda varsayılmadı.  
- DB down iken API/UI davranışı test edilmedi (docker stop onaysız).

---

## 7) RECOVERY2 uygulama özeti

**Yapılan adımlar:**  
1. **Phase 0–2:** Snapshot ve kanıt komutları çalıştırıldı; çıktılar [COMMAND_LOG.md](COMMAND_LOG.md) ve [FORENSIC_REPORT.md](FORENSIC_REPORT.md) ile uyumlu.  
2. **Phase 3:** [src/app/page.tsx](src/app/page.tsx) sadece `HomeHeroBanners` + `HomeBrandGrid` gösterecek şekilde değiştirildi. **Commit:** `0613504` — *feat: wire homepage to home components*.  
3. **Phase 4:** [src/app/layout.tsx](src/app/layout.tsx) içinde `Header` ve `Footer` eklendi. **Commit:** `e886616` — *feat: add Header and Footer to root layout*.  
4. **Phase 5:** `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → **500**. Build/auth kırık olabileceği planda belirtildi; bu iş paketi kapsamı dışında.

**YASAK KOMUTLAR (değişmedi):**  
`git reset --hard`, `git clean -fd`, `git checkout -- .`, `git restore .` (tüm repo), `git stash pop/drop`, `docker stop arti-optik-postgres`.
