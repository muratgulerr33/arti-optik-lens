<a id="doc-14"></a>
# DOC-14: 14.ChatGPT-bridge-instructions.md

---
# 14. ChatGPT Bridge Instructions

Bu doküman, ChatGPT AI'nin Cursor'a "projede yaşıyormuş" gibi doğru bağlamla, uydurma yapmadan, %100 uygulanabilir promptlar üretmesini sağlayacak köprü dokümanıdır. Amaç: ChatGPT → Cursor akışını standartlaştırmak ve hata oranını minimize etmek.

**Last verified from package.json:** 2025-01-27  
**Proje:** arti-optik-next  
**Next.js:** 16.1.1  
**React:** 19.2.3

**Evidence:** `package.json` (dependencies: next@16.1.1, react@19.2.3, react-dom@19.2.3)

---

## 1. Purpose

Bu doküman şunları garanti eder:

1. **Uydurma Engelleme:** ChatGPT hiçbir zaman "repo'da yok" endpoint/route/component/field uydurmaz
2. **Doğru Prompt Üretimi:** Her prompt mevcut dokümantasyon (01-13) ile kanıtlanır, referans verilir
3. **Hızlı Döngü:** Standart format ile task intake → uygulama → review sürecini hızlandırır
4. **Deterministik Sonuçlar:** Her task'ta aynı kalite kapıları, aynı test süreçleri
5. **Small PR Yaklaşımı:** Büyük işleri parçalayarak AI-friendly PR boyutları sağlar
6. **Evidence-Based Development:** Her karar ve değişiklik mevcut dokümantasyon ile kanıtlanır
7. **Rollback Güvenliği:** Riskli değişikliklerde rollback planı zorunlu
8. **Tutarlı Kalite:** DoD checklist, risk planı, rollback stratejisi ile hata oranını düşürür

**Evidence:** `02.architecture-lock.md` (hard constraints), `08.api-contracts-frontend.md` (uydurma yasağı), `06.frontend-standards-2026.md` (DoD), `07.component-inventory.md` (component envanteri), `10.tasks-playbook.md` (task format standardizasyonu)

---

## 2. ChatGPT Role Definition

### 2.1 Rol Dağılımı

**ChatGPT (Brain / Architect / QA Reviewer):**
- Task request'i alır, analiz eder
- Mevcut dokümantasyonu (01-13) referans alır
- Plan oluşturur (Cursor Uygulama Paketi formatında)
- Risk ve rollback stratejisi belirler
- Assumption/Unknown'ları işaretler
- **Hiçbir zaman "repo'da yok" endpoint/route/component/field uydurmaz**

**Cursor (Implementer):**
- ChatGPT'den gelen planı uygular
- Dosya değişikliklerini yapar
- Small PR'lar oluşturur (5-7 dosya max)
- DoD checklist'i takip eder

**Murti (Decision Maker + Tester):**
- Task request'i hazırlar
- Uygulama sonrası manuel test yapar (smoke checklist)
- PR review yapar
- Karar verir: approve/reject/request changes

### 2.2 ChatGPT'nin Sorumlulukları

1. **Dokümantasyon Okuma:** Tüm ilgili dokümanları (01-13) okur, referans verir
2. **Plan Oluşturma:** Prompt Output Contract formatında plan üretir
3. **Risk Değerlendirme:** Riskli değişiklikleri işaretler, rollback planı önerir
4. **Assumption Yönetimi:** Bilinmeyen durumları "Unknown" veya "Assumption" olarak işaretler
5. **Evidence Sağlama:** Her karar için doküman/section referansı verir

**Evidence:** `10.tasks-playbook.md` (section 2: Operating Model)

---

## 3. Source of Truth (Documents & Priority Order)

ChatGPT, aşağıdaki dokümanları **öncelik sırasına göre** referans almalıdır. Çelişki durumunda üst sıradaki doküman kazanır ve "Decision record (15)" açılır.

### 3.1 Öncelik Sırası

| Öncelik | Doküman | Kapsam | Kullanım |
|---------|---------|--------|----------|
| 1 | `02.architecture-lock.md` | Hard constraints, yasaklar, mimari kararlar | Route path değişikliği, ORM seçimi, state management, framework constraints |
| 2 | `04.design-system.md` | Design tokens, UI components, styling kuralları | Renk sistemi, component kullanımı, theme system |
| 3 | `05.native-ux-rules.md` | Native UX patterns, feedback, mobile-first | Toast pattern, button states, mobile navigation, touch interactions |
| 4 | `08.api-contracts-frontend.md` | API endpoint contracts, field shapes, uydurma yasağı | Endpoint kullanımı, response shape, Server Action contracts |
| 5 | `03.routes-and-navigation-map.md` | Route table, navigation links, dynamic params | Route path'leri, link verme, navigation patterns |
| 6 | `09.data-fetching-cache-rules.md` | Data fetching, cache, ISR, mutation patterns | RSC vs Client fetch, cache invalidation, optimistic UI |
| 7 | `06.frontend-standards-2026.md` | Coding standards, DoD, quality gates | TypeScript, component structure, accessibility, error handling |
| 8 | `07.component-inventory.md` | Component envanteri, kullanım yerleri | Mevcut component'leri kullanma, duplicate önleme |
| 9 | `10.tasks-playbook.md` | Task format, PR size, DoD checklist | Task packaging, small PR rule, DoD |
| 10 | `11.qa-test-matrix.md` | Test senaryoları, exit criteria | Smoke tests, QA checklist |
| 11 | `12.release-prod-checklist.md` | Release checklist, post-release verification | Release gates, rollback plan |
| 12 | `01.project-brief.md` | Proje genel bakış, tech stack | Proje context, teknoloji seçimleri |
| 13 | `13.security-and-deps.md` | Security rules, dependency policy | Security guardrails, dependency updates |

### 3.2 Çelişki Çözümü

Çelişki durumunda:
1. Üst sıradaki doküman kazanır
2. "Decision record (15)" açılır (eğer yoksa oluşturulur)
3. Çelişki ve çözüm dokümante edilir
4. Murti onayı gerekir (riskli değişiklikler için)

**Evidence:** `02.architecture-lock.md` (section 2: Non-Negotiables), `10.tasks-playbook.md` (section 2.3: Source of Truth)

---

## 4. Non-Negotiables (Hard Constraints)

Aşağıdaki kurallar **asla ihlal edilemez**. ChatGPT bu kuralları her prompt'ta kontrol etmelidir.

### 4.0 V1 Scope Lock

- **V1 = Sadece Online Storefront + Sadece GÜNEŞ GÖZLÜĞÜ**
- **Lens/Numaralı Ürün:** Online satılmaz (V1 dışı, sadece mağaza/POS - V2)
- **POS:** Tamamen V2 (placeholder/feature-flag, V1 scope'tan çıkarılmış)
- **ChatGPT uyarısı:** V1 scope dışı ürün tipi (lens/numara) veya POS özelliği için prompt üretilmemelidir

**Evidence:** `01.project-brief.md` (V1 SCOPE LOCK), `08.api-contracts-frontend.md` (V1 Scope Lock), `09.data-fetching-cache-rules.md` (V1 Scope Lock)

### 4.1 Route & Navigation

- **Route path'leri değiştirilemez:** `/urun/[slug]`, `/account/*`, `/checkout`, `/cart` gibi mevcut route'lar değiştirilemez
- **Dynamic route pattern korunmalı:** `[slug]`, `[id]` gibi dynamic segment pattern'leri değiştirilemez
- **RESERVED_SLUGS kontrolü:** Yeni top-level sayfa açılırsa slug `RESERVED_SLUGS` array'ine eklenmeli
- **Link verme:** Route map'e uygun link'ler verilmeli, kırık link yok

**Evidence:** `02.architecture-lock.md` (section 2.1: Framework & Routing), `03.routes-and-navigation-map.md` (section 8.1: Dynamic Route Params)

### 4.2 Design System & Styling

- **Core UI colors token kullanımı:** Component içinde rastgele `#hex`, `rgb(...)` veya keyfi Tailwind palette class'ları ile core UI rengi verilmemelidir
- **Brand Primary değiştirilemez:** `--primary: #ff2357` değeri değişecekse karar kaydı (15) ile yapılmalıdır
- **Status colors exception:** `success / warning / info` gibi durum renkleri şu an Tailwind palette ile uygulanıyor olabilir (geçici istisna)
- **shadcn/ui New York style:** `components.json` config değiştirilemez
- **Theme system:** next-themes kullanılmalı, `attribute="class"` pattern korunmalı

**Evidence:** `04.design-system.md` (section 9.1: Non-Negotiables), `02.architecture-lock.md` (section 2.5: Styling & Design System)

### 4.3 Native UX Patterns

- **PDP bottom nav hidden:** `/urun/[slug]` sayfalarında bottom nav gizlenir (bilinçli istisna)
- **Add-to-cart feedback standardı:** Button state "Eklendi ✓" (2s timeout) + toast "Ürün sepete eklendi"
- **Toast position:** `position="top-center"` sabit, değiştirilemez
- **Sticky action bar:** Ürün detay sayfalarında kritik CTA her zaman görünür olmalı
- **Safe area support:** iOS home indicator alanına uyum zorunlu

**Evidence:** `05.native-ux-rules.md` (section 2.1: Critical CTA Visibility, section 3.1: Critical Action Feedback Pattern, section 12.1: Product Detail Page - Bottom Nav Hidden)

### 4.4 API & Data Contracts

- **Endpoint uydurma yasağı:** Mevcut endpoint'ler dışında yeni endpoint eklenemez (bu doküman güncellenmeli)
- **Field uydurma yasağı:** API response shape'lerinde yeni field eklenemez (contract bozulur)
- **Server Action contract:** Server Action input/output shape'leri değiştirilemez
- **Breaking change prosedürü:** Contract değişirse versioning/feature flag planı zorunlu

**Evidence:** `08.api-contracts-frontend.md` (section 10: Breaking-Change Rules), `02.architecture-lock.md` (section 2.8: API & Data Fetching)

### 4.5 Architecture Constraints

- **App Router zorunlu:** `pages/` klasörü oluşturulmamalı
- **Server Components varsayılan:** Client Component'e geçiş sadece `"use client"` ile
- **Drizzle ORM zorunlu:** Prisma veya başka ORM kullanılamaz
- **Context API zorunlu:** Redux, Zustand gibi external state library'leri kullanılamaz
- **Archive klasörü exclude:** `archive/**` klasörü build/typecheck dışı

**Evidence:** `02.architecture-lock.md` (section 2: Non-Negotiables)

### 4.6 Component Usage

- **Yeni component yazmadan önce inventory kontrolü:** Mevcut component'ler kullanılmalı, duplicate component açılmamalı
- **Core UI sadece design system layer'dan:** `src/components/ui/*` klasöründeki component'ler tek kaynak
- **Aynı amaç için duplicate component açmak yasak:** İstisna: A/B test (karar kaydı gerekir)

**Evidence:** `07.component-inventory.md` (section 2: Inventory Rules), `04.design-system.md` (section 3.1: Base Components)

---

## 5. Assumptions & Unknowns Policy

### 5.1 "Unknown" Ne Zaman Yazılır?

- **Codebase'de kanıt yok:** Grep/codebase search sonuçsuz
- **Dokümantasyonda belirtilmemiş:** 01-13 dokümanlarında bilgi yok
- **Test edilmemiş:** Manuel test yapılmamış, assumption yapılamaz

**Format:**
```
**Unknown:** [Açıklama] (kanıt: codebase search sonuçsuz / dokümantasyonda yok)
```

**Evidence:** `02.architecture-lock.md` (section 10.4: Error Handling - "Unknown: error boundary pattern'i kullanılmıyor")

### 5.2 "Assumption" Ne Zaman Yazılır?

- **Mantıklı çıkarım:** Mevcut pattern'lerden çıkarılabilir
- **Best practice:** Industry standard'a uygun
- **Düşük risk:** Yanlış olması durumunda kolay düzeltilebilir

**Format:**
```
**Assumption:** [Açıklama]
**Reasoning:** [Neden bu assumption yapıldı]
**Evidence:** [İlgili pattern/kanıt]
```

**Evidence:** `02.architecture-lock.md` (section 6.4: Environment Variables - "Assumption: `.gitignore` dosyası kontrol edilmedi")

### 5.3 Her Assumption İçin "Reasoning" Şartı

Her assumption mutlaka "Reasoning" ile desteklenmelidir. Reasoning yoksa assumption yazılamaz.

**Evidence:** `02.architecture-lock.md` (assumption pattern'leri)

### 5.4 Yüksek Risk Assumption'lar

Aşağıdaki durumlarda assumption yapılmamalı, Murti onayı gerekir:
- Route path değişikliği
- API contract değişikliği
- Auth/cookie/session değişikliği
- Cache stratejisi değişikliği
- Database schema değişikliği

**Evidence:** `10.tasks-playbook.md` (section 2.13: Escalation Rules)

---

## 6. Prompt Output Contract (ChatGPT → Cursor)

ChatGPT her promptu aşağıdaki yapıda üretir. Bu format **zorunludur** ve değiştirilemez.

### 6.1 Prompt Yapısı

```markdown
## Goal
[Kısa, net hedef - 1-2 cümle]

## Context (docs refs)
- `02.architecture-lock.md` (section X: ...)
- `04.design-system.md` (section Y: ...)
- [Diğer ilgili doküman referansları]

## Plan (steps)
1. [Adım 1 - dosya bazlı]
2. [Adım 2 - dosya bazlı]
3. [Adım 3 - dosya bazlı]

## Files to touch (explicit paths)
- `src/components/product/product-view.tsx` - [Değişiklik açıklaması]
- `src/app/checkout/page.tsx` - [Değişiklik açıklaması]
- [Maksimum 5-7 dosya]

## Implementation notes
- [Özel dikkat edilmesi gereken noktalar]
- [Pattern kullanımı]
- [Edge case'ler]

## DoD
- [ ] `npm run lint` PASS
- [ ] `npm run build` PASS
- [ ] Manuel smoke: [SMK-XX] çalışıyor
- [ ] [Diğer DoD maddeleri]

## Risk & rollback
- **Risk:** [Risk açıklaması]
- **Rollback:** [Geri dönüş planı]

## Assumptions / Unknowns
- **Assumption:** [Açıklama] (Reasoning: ...)
- **Unknown:** [Açıklama] (kanıt: ...)

## Evidence checklist
- [ ] `02.architecture-lock.md` (section X) referans verildi
- [ ] `08.api-contracts-frontend.md` (section Y) referans verildi
- [ ] [Diğer evidence maddeleri]
```

### 6.2 Zorunlu Bölümler

1. **Goal:** Mutlaka olmalı, kısa ve net
2. **Context (docs refs):** En az 2-3 doküman referansı
3. **Plan (steps):** Dosya bazlı, adım adım
4. **Files to touch:** Maksimum 5-7 dosya (small PR rule)
5. **DoD:** En az 3-5 madde
6. **Risk & rollback:** Riskli değişikliklerde zorunlu
7. **Assumptions / Unknowns:** Varsa mutlaka belirtilmeli
8. **Evidence checklist:** En az 3-5 evidence referansı

**Evidence:** `10.tasks-playbook.md` (section 2.6: Prompt Output Contract)

---

## 7. Task Packaging (Files, Steps, DoD, Risk)

### 7.1 Small/Medium/Large Task Bölme

**Small Task (1-3 dosya):**
- Tek component değişikliği
- Tek route değişikliği
- Tek utility fonksiyonu ekleme

**Medium Task (4-7 dosya):**
- Feature ekleme (component + route + action)
- Refactor (birkaç ilgili dosya)
- Bug fix (birkaç ilgili dosya)

**Large Task (8+ dosya):**
- **Yasak:** Large task'lar küçük PR'lara bölünmeli
- Örnek: "Checkout flow iyileştirme" → "Address form iyileştirme" + "Payment method seçimi" + "Order summary"

### 7.2 "One PR = One Intent" Kuralı

Her PR tek bir intent içermeli:
- ✅ "PDP add-to-cart UX iyileştirme"
- ❌ "PDP UX iyileştirme + Checkout bug fix + Footer link cleanup"

### 7.3 "Cleanup Ayrı PR" Kuralı

Refactor/cleanup işlemleri feature PR'larından ayrı olmalı:
- ✅ Feature PR: "Yeni favori butonu ekleme"
- ✅ Cleanup PR: "Unused component'leri kaldırma"

**Evidence:** `10.tasks-playbook.md` (section 2.7: Task Packaging, section 3: Small PR Rule)

---

## 8. UI/UX Guardrails (Native + Design System)

### 8.1 Design Tokens

- **Core UI colors:** CSS variables / design tokens üzerinden yönetilmelidir
- **Token kullanımı:** `bg-primary`, `text-foreground`, `border-input` gibi token'lar kullanılmalı
- **Exception (Status Colors):** `success / warning / info` şu an Tailwind palette ile (geçici istisna)

**Evidence:** `04.design-system.md` (section 2.1: Colors, section 9.1: Non-Negotiables)

### 8.2 Component Contracts

- **shadcn/ui pattern:** Radix UI + CVA + Tailwind pattern korunmalı
- **Variant yönetimi:** CVA ile variant yönetimi yapılmalı
- **Component kullanımı:** Yeni UI deseni eklemeden önce mevcut component'i kullan

**Evidence:** `04.design-system.md` (section 3.1: Base Components), `07.component-inventory.md` (section 2: Inventory Rules)

### 8.3 Feedback Patterns

- **Toast:** Sadece kritik aksiyonlarda toast (sepete ekleme, sipariş oluşturma)
- **Button state:** Add-to-cart pattern: "Eklendi ✓" (2s timeout) + toast
- **Loading state:** Kritik form submit'lerde `isLoading` + "İşleniyor..." text
- **Error display:** Inline error - `text-destructive bg-destructive/10`

**Evidence:** `05.native-ux-rules.md` (section 3: Interaction & Feedback Rules)

### 8.4 Mobile Patterns

- **Bottom nav:** Mobile'da 5 tab (Home, Categories, Cart, Wishlist, Profile)
- **PDP bottom nav hidden:** `/urun/[slug]` sayfalarında bottom nav gizlenir
- **Sticky action bar:** Ürün detay sayfalarında kritik CTA her zaman görünür
- **Touch targets:** Minimum `h-11` (44px)
- **Safe area:** `env(safe-area-inset-bottom)` kullanılmalı

**Evidence:** `05.native-ux-rules.md` (section 4: Mobile-First Patterns, section 2.2: Touch Target Sizes)

---

## 9. Routes & API Contract Guardrails

### 9.1 Route Map Uyumu

- **Link verme:** Route map'e uygun link'ler verilmeli (`03.routes-and-navigation-map.md`)
- **Dynamic params:** `[slug]`, `[id]` pattern'leri korunmalı
- **RESERVED_SLUGS:** Yeni top-level sayfa açılırsa slug `RESERVED_SLUGS` array'ine eklenmeli

**Evidence:** `03.routes-and-navigation-map.md` (section 8.1: Dynamic Route Params, section 9.4: Gaps)

### 9.2 Endpoint Uydurma Yasağı

- **Mevcut endpoint'ler:** Sadece `08.api-contracts-frontend.md`'de listelenen endpoint'ler kullanılabilir
- **Yeni endpoint:** Yeni endpoint eklemek için bu doküman güncellenmeli ve Murti onayı gerekir
- **Contract değişikliği:** Breaking change varsa versioning/feature flag planı zorunlu

**Evidence:** `08.api-contracts-frontend.md` (section 10: Breaking-Change Rules, section 5: API Inventory)

### 9.3 Field Uydurma Yasağı

- **Response shape:** API response shape'leri değiştirilemez
- **Server Action contract:** Server Action input/output shape'leri değiştirilemez
- **Yeni field:** Yeni field eklemek için contract dokümante edilmeli

**Evidence:** `08.api-contracts-frontend.md` (section 10: Breaking-Change Rules, section 7: Contracts by Feature)

---

## 10. Data/Cache Guardrails

### 10.1 RSC vs Client Fetch Decision Tree

**Default: Server Components (RSC)**
- Initial page data (kategoriler, ürün listesi, ürün detay)
- SEO-critical content (metadata, product details)
- Auth-required data (user-specific initial data)

**Client Fetch: Sadece Gerekli Durumlarda**
- Interaktif/polling: Real-time data, infinite scroll pagination
- User-triggered: Search overlay, filter changes
- Optimistic UI: Mutation sonrası immediate feedback

**Evidence:** `09.data-fetching-cache-rules.md` (section 3: Fetch Decision Tree)

### 10.2 Cache/Revalidate Kuralları

- **API route cache:** Bazı route'lar `force-dynamic` + `no-store` kullanır (örn: products route)
- **Cache invalidation:** Mutation sonrası `revalidatePath` ile cache invalidate edilir
- **revalidateTag:** Kullanılmıyor, sadece `revalidatePath` kullanılıyor

**Evidence:** `09.data-fetching-cache-rules.md` (section 6: Caching & Revalidation Strategy, section 6.4: Cache Invalidation)

### 10.3 Mutation + UI Update Standardı

- **Optimistic UI (Favorites):** Client state hemen güncellenir, server action çağrılır, hata durumunda rollback
- **Cart:** Client state direkt güncellenir (localStorage sync), optimistic update yok
- **Feedback:** Mutation sonrası Sonner toast ile feedback gösterilir

**Evidence:** `09.data-fetching-cache-rules.md` (section 8: Mutations & Optimistic UI)

---

## 11. Quality Gates

### 11.1 Lint & Build

- **Lint:** `npm run lint` hatasız geçmeli
- **Build:** `npm run build` başarılı olmalı
- **TypeScript:** Build sırasında TypeScript kontrol ediliyor, hata olmamalı

**Evidence:** `06.frontend-standards-2026.md` (section 12: Definition of Done), `package.json` (scripts: lint, build)

### 11.2 Smoke Flows

- **SMK-01:** Home → Category → Product → Add to Cart
- **SMK-02:** Search → Product Detail
- **SMK-03:** Cart → Checkout → Order Success
- **SMK-04:** Login → Account → Wishlist
- **SMK-05:** Product Detail → Add to Favorites
- **SMK-06:** Empty Cart Flow
- **SMK-07:** Empty Search Results
- **SMK-08:** Protected Route Access (Unauthenticated)

**Evidence:** `11.qa-test-matrix.md` (section 3: Smoke Tests)

### 11.3 A11y Checks

- **Focus ring:** Tüm interactive elementlerde `focus-visible:ring-2` görünür
- **Keyboard navigation:** Tab order logical, Escape key çalışır
- **Screen reader:** ARIA labels, semantic HTML kullanılır
- **Color contrast:** WCAG AA minimum (4.5:1 normal text)

**Evidence:** `06.frontend-standards-2026.md` (section 4: Accessibility Standards), `11.qa-test-matrix.md` (section 6: Accessibility Checklist)

---

## 12. How to Review Cursor Output

Murti'nin yapacağı review checklist:

### 12.1 Diff Kontrolü (Dosya Bazlı)

- [ ] Değişen dosyalar maksimum 5-7 dosya (small PR rule)
- [ ] Her dosya değişikliği mantıklı ve gerekli
- [ ] Gereksiz değişiklik yok (formatting, whitespace)

**Evidence:** `10.tasks-playbook.md` (section 3: Small PR Rule)

### 12.2 UI Smoke (PDP/Cart/Checkout)

- [ ] SMK-01: Add to cart çalışıyor (toast + button state)
- [ ] SMK-03: Checkout akışı çalışıyor (loading state, success redirect)
- [ ] SMK-05: Favorites toggle çalışıyor (optimistic update)

**Evidence:** `11.qa-test-matrix.md` (section 3: Smoke Tests)

### 12.3 API Contract Bozulmadı

- [ ] Endpoint contract'ları bozulmamış (`08.api-contracts-frontend.md`)
- [ ] Field uydurma yok
- [ ] Server Action contract'ları bozulmamış

**Evidence:** `08.api-contracts-frontend.md` (section 10: Breaking-Change Rules)

### 12.4 Bottom Nav İstisnası Korundu

- [ ] `/urun/[slug]` sayfalarında bottom nav gizleniyor
- [ ] Sticky action bar görünür

**Evidence:** `05.native-ux-rules.md` (section 12.1: Product Detail Page - Bottom Nav Hidden)

### 12.5 Evidence Referansları

- [ ] En az 3-5 doküman referansı verilmiş
- [ ] Evidence referansları doğru (section/heading bazlı, satır numarası yok)

**Evidence:** Bu doküman (section 6: Prompt Output Contract)

---

## 13. Escalation Rules

Şu durumlarda Murti onayı şart:

### 13.1 Yeni Dependency Ekleme

- Yeni major dependency eklemeden önce karar kaydı (15) + spike
- Security patches ve minor updates approval gerektirmez

**Evidence:** `02.architecture-lock.md` (section 2.10: Build & Environment), `13.security-and-deps.md` (section 9: Dependency Policy)

### 13.2 Route Path Değişimi

- Mevcut route path'lerini değiştirmek yasak
- Yeni route eklemek serbest (App Router pattern'i takip edilmeli)

**Evidence:** `02.architecture-lock.md` (section 2.1: Framework & Routing, section 4.1: Forbidden Changes)

### 13.3 API Contract Breaking Change

- Endpoint/field contract değişikliği
- Versioning/feature flag planı zorunlu

**Evidence:** `08.api-contracts-frontend.md` (section 10: Breaking-Change Rules)

### 13.4 Theme/Token Değişimi

- Design token'ları değiştirmek yasak
- Brand Primary değişecekse karar kaydı (15) ile yapılmalıdır

**Evidence:** `04.design-system.md` (section 9.1: Non-Negotiables), `02.architecture-lock.md` (section 2.5: Styling & Design System)

### 13.5 Auth/Cookie/Session Değişimi

- NextAuth.js config değişikliği
- Cookie flags değişikliği
- Session strategy değişikliği

**Evidence:** `02.architecture-lock.md` (section 2.4: Authentication), `13.security-and-deps.md` (section 4: Authentication & Session Security)

### 13.6 Cache Stratejisi Değişimi

- ISR kullanımı (şu an kullanılmıyor)
- Cache invalidation pattern değişikliği
- `revalidateTag` kullanımı (şu an sadece `revalidatePath`)

**Evidence:** `09.data-fetching-cache-rules.md` (section 6: Caching & Revalidation Strategy, section 7: ISR / Revalidate Rules)

---

## 14. Examples (3–5 "Perfect Prompts")

### 14.1 Example 1: PDP Add-to-Cart UX İyileştirme

```markdown
## Goal
Ürün detay sayfasında sepete ekleme butonunun UX'ini iyileştirmek: button state feedback süresini optimize etmek ve toast mesajını güncellemek.

## Context (docs refs)
- `05.native-ux-rules.md` (section 3.1: Critical Action Feedback Pattern)
- `04.design-system.md` (section 3.1: Base Components - Button)
- `07.component-inventory.md` (section 5.1: Product Components - ProductView)

## Plan (steps)
1. `src/components/product/product-view.tsx` - Button state timeout'u 2s'den 1.5s'ye düşür
2. `src/components/product/product-view.tsx` - Toast mesajını "Ürün sepete eklendi" → "Sepete eklendi" olarak kısalt

## Files to touch (explicit paths)
- `src/components/product/product-view.tsx` - Button state timeout ve toast mesajı güncellemesi

## Implementation notes
- Mevcut pattern korunmalı: `setIsAdded(true)` + `toast.success()` + `setTimeout(() => setIsAdded(false), 2000)`
- Sadece timeout değeri ve toast mesajı değişecek
- Button state pattern'i (`05.native-ux-rules.md` section 3.1) korunmalı

## DoD
- [ ] `npm run lint` PASS
- [ ] `npm run build` PASS
- [ ] Manuel smoke: SMK-01 (Add to cart) çalışıyor
- [ ] Button state "Eklendi ✓" 1.5s sonra reset oluyor
- [ ] Toast mesajı "Sepete eklendi" gösteriliyor

## Risk & rollback
- **Risk:** Düşük - sadece timeout ve mesaj değişikliği
- **Rollback:** `setTimeout` değerini 2000'e, toast mesajını "Ürün sepete eklendi"ye geri al

## Assumptions / Unknowns
- **Assumption:** 1.5s timeout kullanıcı deneyimini bozmayacak (Reasoning: 2s'den sadece 0.5s kısa, hala yeterli feedback süresi)

## Evidence checklist
- [ ] `05.native-ux-rules.md` (section 3.1) referans verildi
- [ ] `04.design-system.md` (section 3.1) referans verildi
- [ ] `07.component-inventory.md` (section 5.1) referans verildi
```

### 14.2 Example 2: Broken Footer Link Cleanup

```markdown
## Goal
Footer'da kırık link olan `/sss` linkini kaldırmak veya route oluşturmak.

## Context (docs refs)
- `03.routes-and-navigation-map.md` (section 9.4: Gaps - Broken Navigation Link)
- `07.component-inventory.md` (section 4: Layout Components - Footer)
- `03.routes-and-navigation-map.md` (section 5.2: Footer Navigation)

## Plan (steps)
1. `src/components/app/Footer.tsx` - `/sss` linkini kaldır (route yok, 404 riski)
2. Alternatif: `/support` linkine yönlendir (varsa)

## Files to touch (explicit paths)
- `src/components/app/Footer.tsx` - `/sss` linkini kaldır veya `/support`'a yönlendir

## Implementation notes
- Footer'da "Müşteri Hizmetleri" bölümünde `/sss` linki var (line 61)
- Route yok, 404 riski var
- `/support` route'u var, alternatif olarak kullanılabilir

## DoD
- [ ] `npm run lint` PASS
- [ ] `npm run build` PASS
- [ ] Manuel smoke: Footer linkleri çalışıyor
- [ ] `/sss` linki kaldırıldı veya `/support`'a yönlendiriliyor
- [ ] 404 hatası yok

## Risk & rollback
- **Risk:** Çok düşük - sadece link kaldırma/değiştirme
- **Rollback:** `/sss` linkini geri ekle

## Assumptions / Unknowns
- **Assumption:** `/sss` route'u oluşturulmayacak (Reasoning: `03.routes-and-navigation-map.md`'de route yok, gap olarak işaretlenmiş)

## Evidence checklist
- [ ] `03.routes-and-navigation-map.md` (section 9.4) referans verildi
- [ ] `07.component-inventory.md` (section 4) referans verildi
- [ ] `03.routes-and-navigation-map.md` (section 5.2) referans verildi
```

### 14.3 Example 3: Cart Provider Hydration Bugfix

```markdown
## Goal
Cart provider'da localStorage hydration sırasında SSR/client mismatch hatasını düzeltmek.

## Context (docs refs)
- `09.data-fetching-cache-rules.md` (section 3.3: Provider State - localStorage Hydration)
- `07.component-inventory.md` (section 6: Providers & State Modules - CartProvider)
- `06.frontend-standards-2026.md` (section 6.2: State Management)

## Plan (steps)
1. `src/components/cart/cart-provider.tsx` - `hydrated` flag kontrolünü güçlendir
2. `src/components/cart/cart-provider.tsx` - SSR sırasında localStorage'a erişim yapılmadığından emin ol

## Files to touch (explicit paths)
- `src/components/cart/cart-provider.tsx` - Hydration logic iyileştirmesi

## Implementation notes
- Mevcut pattern: `useState(false)` → `useEffect` içinde `setHydrated(true)`
- SSR/client mismatch önlemek için `hydrated` flag kullanılıyor
- `typeof window !== "undefined"` kontrolü eklenebilir

## DoD
- [ ] `npm run lint` PASS
- [ ] `npm run build` PASS
- [ ] Manuel smoke: SMK-01 (Add to cart) çalışıyor
- [ ] Cart state localStorage'dan doğru hydrate ediliyor
- [ ] SSR/client mismatch hatası yok

## Risk & rollback
- **Risk:** Orta - state management değişikliği, cart state bozulabilir
- **Rollback:** Önceki hydration logic'e geri dön

## Assumptions / Unknowns
- **Assumption:** `typeof window !== "undefined"` kontrolü yeterli olacak (Reasoning: Next.js standard pattern)

## Evidence checklist
- [ ] `09.data-fetching-cache-rules.md` (section 3.3) referans verildi
- [ ] `07.component-inventory.md` (section 6) referans verildi
- [ ] `06.frontend-standards-2026.md` (section 6.2) referans verildi
```

### 14.4 Example 4: Category Page Empty State Ekleme

```markdown
## Goal
Kategori sayfasında ürün yoksa empty state component'i eklemek.

## Context (docs refs)
- `05.native-ux-rules.md` (section 7.2: Empty States)
- `03.routes-and-navigation-map.md` (section 2: Route Table - `/[slug]`)
- `07.component-inventory.md` (section 5.3: Catalog Components - LoadMoreGrid)

## Plan (steps)
1. `src/app/[slug]/page.tsx` - Ürün listesi boşsa empty state kontrolü ekle
2. Yeni empty state component oluştur: `src/components/catalog/empty-product-list.tsx` (veya mevcut component kullan)

## Files to touch (explicit paths)
- `src/app/[slug]/page.tsx` - Empty state kontrolü
- `src/components/catalog/empty-product-list.tsx` - Yeni empty state component (veya mevcut component)

## Implementation notes
- Mevcut empty state pattern'leri: `src/app/search/page.tsx` (empty search), `src/app/checkout/page.tsx` (empty cart)
- Pattern: "Ürün bulunamadı" + "Kategorilere Git" button
- Component inventory kontrolü: Mevcut empty state component var mı?

## DoD
- [ ] `npm run lint` PASS
- [ ] `npm run build` PASS
- [ ] Manuel smoke: Kategori sayfası (ürün yok) empty state gösteriyor
- [ ] Empty state component mevcut pattern'lere uygun
- [ ] "Kategorilere Git" button çalışıyor

## Risk & rollback
- **Risk:** Düşük - sadece UI ekleme
- **Rollback:** Empty state kontrolünü kaldır

## Assumptions / Unknowns
- **Unknown:** Mevcut empty state component var mı? (kanıt: `07.component-inventory.md` section 10.2 - Empty state component'leri görülmedi)

## Evidence checklist
- [ ] `05.native-ux-rules.md` (section 7.2) referans verildi
- [ ] `03.routes-and-navigation-map.md` (section 2) referans verildi
- [ ] `07.component-inventory.md` (section 5.3) referans verildi
```

### 14.5 Example 5: Search Overlay Debounce Optimizasyonu

```markdown
## Goal
Search overlay'de debounce süresini optimize etmek (300ms'den 250ms'ye düşürmek).

## Context (docs refs)
- `09.data-fetching-cache-rules.md` (section 11.4: Debouncing - Search)
- `07.component-inventory.md` (section 5.6: Search Components - SearchOverlay)
- `08.api-contracts-frontend.md` (section 7.6: Search - Endpoint contract)

## Plan (steps)
1. `src/components/search/search-overlay.tsx` - `DEBOUNCE_MS` constant'ını 300'den 250'ye düşür

## Files to touch (explicit paths)
- `src/components/search/search-overlay.tsx` - Debounce süresi güncellemesi

## Implementation notes
- Mevcut pattern: `DEBOUNCE_MS = 300` constant kullanılıyor
- Sadece constant değeri değişecek
- API contract değişmeyecek, sadece client-side debounce süresi

## DoD
- [ ] `npm run lint` PASS
- [ ] `npm run build` PASS
- [ ] Manuel smoke: SMK-02 (Search → Product Detail) çalışıyor
- [ ] Debounce 250ms çalışıyor (network tab'de kontrol)
- [ ] Search sonuçları doğru gösteriliyor

## Risk & rollback
- **Risk:** Çok düşük - sadece debounce süresi değişikliği
- **Rollback:** `DEBOUNCE_MS` değerini 300'e geri al

## Assumptions / Unknowns
- **Assumption:** 250ms debounce kullanıcı deneyimini bozmayacak (Reasoning: 300ms'den sadece 50ms kısa, hala yeterli debounce süresi)

## Evidence checklist
- [ ] `09.data-fetching-cache-rules.md` (section 11.4) referans verildi
- [ ] `07.component-inventory.md` (section 5.6) referans verildi
- [ ] `08.api-contracts-frontend.md` (section 7.6) referans verildi
```

**Evidence:** `10.tasks-playbook.md` (section 2.14: Examples), bu doküman (section 14: Examples)

---

## 15. Evidence Index

En önemli kanıt dosyaları ve referanslar:

1. **02.architecture-lock.md** - Hard constraints, yasaklar, mimari kararlar (section 2: Non-Negotiables)
2. **04.design-system.md** - Design tokens, UI components, styling kuralları (section 9.1: Non-Negotiables)
3. **05.native-ux-rules.md** - Native UX patterns, feedback, mobile-first (section 3.1: Critical Action Feedback Pattern)
4. **08.api-contracts-frontend.md** - API endpoint contracts, uydurma yasağı (section 10: Breaking-Change Rules)
5. **03.routes-and-navigation-map.md** - Route table, navigation links, dynamic params (section 8.1: Dynamic Route Params)
6. **09.data-fetching-cache-rules.md** - Data fetching, cache, ISR, mutation patterns (section 3: Fetch Decision Tree)
7. **06.frontend-standards-2026.md** - Coding standards, DoD, quality gates (section 12: Definition of Done)
8. **07.component-inventory.md** - Component envanteri, kullanım yerleri (section 2: Inventory Rules)
9. **10.tasks-playbook.md** - Task format, PR size, DoD checklist (section 2.6: Prompt Output Contract)
10. **11.qa-test-matrix.md** - Test senaryoları, exit criteria (section 3: Smoke Tests)
11. **12.release-prod-checklist.md** - Release checklist, post-release verification (section 13: Post-Release Verification)
12. **01.project-brief.md** - Proje genel bakış, tech stack (section 5: Tech Stack)
13. **13.security-and-deps.md** - Security rules, dependency policy (section 9: Dependency Policy)
14. **package.json** - Dependencies, scripts, project name
15. **src/app/layout.tsx** - Root layout, provider hierarchy
16. **src/components/product/product-view.tsx** - Add to cart pattern, toast usage
17. **src/components/cart/cart-provider.tsx** - Cart state, localStorage hydration
18. **src/components/favorites/favorites-provider.tsx** - Optimistic UI, rollback pattern
19. **src/app/api/products/route.ts** - Products API, cursor pagination
20. **src/actions/checkout.ts** - Checkout server action, Zod validation

**Evidence:** Tüm yukarıdaki dosyalar codebase'de mevcut ve kanıt olarak kullanıldı

---

## 16. Local DB Setup Checklist

### 16.1 Environment + DB Start

**Quick Start Checklist:**

1. **Environment:** `.env.local` dosyasında `DATABASE_URL=postgresql://postgres:postgres@localhost:5433/artioplik` tanımlı
2. **Docker:** `docker compose up -d` ile Postgres container başlatıldı (port 5433)
3. **Extensions:** `npm run db:extensions` çalıştırıldı (ltree enabled)
4. **Generate:** `npm run db:generate` çalıştırıldı (migration dosyaları oluşturuldu)
5. **Migrate:** `npm run db:migrate` çalıştırıldı (schema oluşturuldu)
6. **Seed:** `npm run seed:brands` çalıştırıldı (18 marka eklendi)

**Verification:**
```bash
docker exec -it arti-optik-postgres psql -U postgres -d artioplik -c "SELECT COUNT(*) FROM brands;"
```

**Expected:** 18 marka (Ray-Ban, Oakley, Prada, vb.)

**Evidence:** `docker-compose.yml` (ports: "5433:5432"), `package.json` (scripts: db:extensions, db:generate, db:migrate, seed:brands), `tools/seed/seed-brands.mjs`

---

## 17. Seed Policy + Idempotency

### 17.1 Seed Dosyaları Commit Politikası

**Kural:** Gerçek seed dosyaları repo'ya commit edilmez (PII/size/izin riski).

**Repo'da sadece sample tutulur:**
- `tools/seed/input/v1-seed.sample.json` (sample format, gerçek veri yok)

**Evidence:** `tools/seed/input/v1-seed.sample.json` (sample file), `.gitignore` (seed files ignore pattern)

### 17.2 Seed Scripts Idempotency

**Kural:** Seed scripts idempotent olmalıdır. Tekrar çalıştırınca duplicate hata vermemeli ve yeni kayıt eklemeyecek.

**Örnek: `seed:brands`**
- İlk çalıştırmada markalar eklenir
- İkinci çalıştırmada duplicate hata vermez, mevcut kayıtlar korunur
- `INSERT ... ON CONFLICT DO NOTHING` veya benzeri pattern kullanılır

**Pattern:**
```typescript
// Idempotent insert pattern
await db.insert(brands).values(brandData).onConflictDoNothing();
```

**Evidence:** `tools/seed/seed-brands.mjs` (idempotent pattern), `package.json` (scripts: seed:brands)

### 17.3 Seed Import Notu

**Not:** Seed import (ürün import) bu task'ta yapılmayacak; sadece policy + altyapı dokümana işlenecek. V1 seed dosyası dış projeden geliyor.

**Evidence:** `tools/seed/input/v1-seed.sample.json` (sample format only)

---

**Not:** Bu doküman, repo'nun mevcut durumuna göre oluşturulmuştur. Yeni route'lar, API endpoint'leri, component'ler veya cache kuralları eklendiğinde bu doküman güncellenmelidir.

---

## LOCKED STATE — Product Sync + Images Cutover (2026-01-13)

Bu bölüm, ürün senkronizasyonu ve görsel yapısının kilitli (locked) durumunu dokümante eder. Bu tarihten itibaren görsel ve slug yapısı değiştirilmeyecek; yeni değişiklikler ayrı bir "Change Log" satırı ile eklenir.

### 1) Current State (Sayılar)

- `publish + instock = 244`
- `publish + outofstock = 30`
- `publish total = 274`

**Not:** Bu bölüm ARTI OPTİK V1 için geçerli değildir. V1'de sadece güneş gözlüğü ürünleri bulunur.

### 2) Invariants (Asla bozulmayacak kurallar)

- DB fiyat birimi **kuruş**
- Kaynaktan TL gelirse DB'ye yazarken **TL * 100**
- `sale_price` daima **NULL**
- DB yazma operasyonu: **plan.sql (ROLLBACK)** → count kontrol → **apply.sql (COMMIT)**

### 3) Images (WP bağı koparıldı)

- DB `products.images` sadece `"/products/<slug>/<file>.webp"` formatında
- External / WP link sayısı: **0**
- Parity: DB `images` sayısı == `public/products/<slug>/*.webp` sayısı (**mismatch 0**)
- UI kanıtı: galerisi olan ürünlerde kapak + detay arası geçiş çalışıyor
- Public naming kuralı:
  - Kapak: `<slug>.webp`
  - Galeri: aynı klasördeki diğer tüm `.webp` dosyaları (örn `-olcu`, `-kivam`, `-genis-aci` gibi suffix'ler)

### 4) Scripts / Outputs (kritik envanter)

- `scripts/verify-public-product-images-and-generate-sql.ts`  
  - galeri tespit mantığı: "kapak dışındaki tüm `.webp`"
- Üretilen çıktılar (repo içinde):
  - `old-products/gallery-audit.csv`
  - `old-products/gallery-paths-plan.sql`
  - `old-products/gallery-paths-apply.sql`
  - `old-products/db-schema-summary.md`
  - `old-products/db-schema.mmd`

### 5) Category slug SEO fixes (+ redirect)

- DB slug update: Eski projeye ait kategori slug'ları temizlendi
- `next.config.ts` içinde redirect'ler var (Next.js `permanent: true` redirect → 308 Permanent Redirect)

**Evidence:** `next.config.ts` (lines 27-36: `permanent: true` ile 308 Permanent Redirect tanımları)

### 6) Source slug patch (mapping yerine kaynağı düzeltme)

- Script: `scripts/patch-eroshopa-source-slugs.ts`
- Çıktı:
  - `old-products/eroshopa-products.final.patched.json`
  - `old-products/source-slug-patch-report.csv`
- Patch edilen wc_id'ler:
  - 292, 293, 294, 268 → DB slug'larla aynı hale getirildi
- Not: Kaynak dosyada önceden var olan duplicate slug (2 kez) mevcut; patch bunu üretmedi.

### 7) Health-check komutları (kopyala-çalıştır)

Bu komutları master-pack'e ekle (3 dosyada da aynı):

```bash
# publish stock dağılımı
docker exec -i YOUR_DB_CONTAINER psql -U YOUR_DB_USER -d YOUR_DB_NAME -c "
SELECT stock_status, COUNT(*)
FROM products
WHERE status='publish'
GROUP BY stock_status
ORDER BY COUNT(*) DESC;
"

# external image var mı?
docker exec -i YOUR_DB_CONTAINER psql -U YOUR_DB_USER -d YOUR_DB_NAME -c "
SELECT
  COUNT(*) FILTER (WHERE EXISTS (
    SELECT 1 FROM jsonb_array_elements(images) x
    WHERE (x->>'src') LIKE 'http%' OR (x->>'src') LIKE '%wp-content%'
  )) AS has_external
FROM products
WHERE status='publish' AND stock_status='instock';
"

# images boş mu?
docker exec -i YOUR_DB_CONTAINER psql -U YOUR_DB_USER -d YOUR_DB_NAME -c "
SELECT
  COUNT(*) AS total_instock,
  COUNT(*) FILTER (WHERE images IS NULL OR jsonb_array_length(images)=0) AS images_empty
FROM products
WHERE status='publish' AND stock_status='instock';
"
```

### 8) Unknowns / Not Done

- Ürün açıklamalarıyla kaynak açıklamalarının "eşitlendi" iddiası — **Unknown/Not done** (henüz yapılmadıysa)

---

## 2026-01-16 — Category & UI Locks (A-F)

### A) DB Category Tree Lock (Final Tree v2 / 2026-01-16)

#### What we locked
- Top-level kategori sayısı: **3** (Kadın, Erkek, Unisex)
- Max depth: **2** (Level-1: gender, Level-2: gender.sunglasses)
- Final kategori ağacı yapısı (top-level + child'lar)

#### Why
- ARTI OPTİK V1'de sadece güneş gözlüğü ürünleri bulunur
- Kategori derinliği 2 seviye ile sınırlandırılmıştır (V1 Lock)
- Shape/style bilgisi kategori değil, attribute olarak saklanır

#### How to verify (commands)
```bash
# Top-level listesi
docker exec -i YOUR_DB_CONTAINER psql -U YOUR_DB_USER -d YOUR_DB_NAME -c \
  "SELECT slug FROM categories WHERE parent_wc_id IS NULL ORDER BY slug;"

# Ağaç yapısı (parent-child)
docker exec -i YOUR_DB_CONTAINER psql -U YOUR_DB_USER -d YOUR_DB_NAME -c "
  SELECT parent.slug AS parent_slug, child.slug AS child_slug
  FROM categories parent
  LEFT JOIN categories child ON child.parent_wc_id = parent.wc_id
  WHERE parent.parent_wc_id IS NULL
  ORDER BY parent.slug, child.slug;"
```

#### Expected outputs (paste from evidence pack)
**ARTI OPTİK V1 DB Tree (Top-level = 3, Depth = 2, Total categories = 3)**

Top-level slugs (Hub):
- `kadin` (women)
- `erkek` (men)
- `unisex` (unisex)

Depth=2 child'lar:
- `kadin` → `kadin.gunes-gozlugu` (Kadın Güneş Gözlüğü)
- `erkek` → `erkek.gunes-gozlugu` (Erkek Güneş Gözlüğü)
- `unisex` → `unisex.gunes-gozlugu` (Unisex Güneş Gözlüğü)

**Notlar:**
- V1'de sadece güneş gözlüğü ürünleri bulunur
- Shape/style bilgisi kategori değil, `product_variants.attributes.shape` attribute olarak saklanır
- Hub sayfaları kategori-index mantığıyla çalışır

#### Evidence (ARTI OPTİK V1)
- ✅ Top-level: 3 (kadin, erkek, unisex)
- ✅ Depth: 2, Total categories: 3
- ✅ DB tree örnek çıktı (parent->child):
  - kadin: kadin.gunes-gozlugu
  - erkek: erkek.gunes-gozlugu
  - unisex: unisex.gunes-gozlugu

#### Footguns / gotchas
- Policy hidden-if-empty olan bir facet 0 ürünse UI'da görünmez (örnek: jenerik kategori 0 ürünse UI'da gizlenir)
- Slug'lar değiştirilmemeli (URL'ler kırılır)
- Parent-child ilişkisi `parent_wc_id` ile tutulur, slug bazlı değil

---

### B) Category Lock DoD (Legacy template — Not applicable to ARTI OPTİK V1)

Bu bölüm legacy template'ten kalmadır; **category lock (legacy script) bu repoda yoktur** ve v2 baseline metrikleri ARTI OPTİK V1 için geçerli değildir.

**V1 kaynakları (doğru referanslar):**
- DOC-01 (V1 taxonomy lock)
- DOC-03 (routes + hub map)
- Bu dokümandaki **A) DB Category Tree Lock** bölümü

---

### C) Guardrail Forbidden Rules Lock

#### What we locked
- **RULE-1:** V1'de sadece güneş gözlüğü ürünleri bulunur (lens/numara V1 dışı)
- **RULE-2:** `kadin` hub altında sadece kadın için uygun güneş gözlüğü ürünleri olmalı
- **RULE-3:** `erkek` hub altında sadece erkek için uygun güneş gözlüğü ürünleri olmalı
- **RULE-4:** `unisex` hub altında unisex güneş gözlüğü ürünleri olmalı
- Tüm publish+instock ürünler kontrol edilir
- İhlal varsa script FAIL eder (exit code 1)
- Exception dosyası: `locks/guardrail-exceptions.json` (RULE-1/2/3/4 için istisna tanımlanabilir)

#### Why
- Import/manuel hataların tekrar etmesini önlemek
- V1 scope lock tutarlılığı: Sadece güneş gözlüğü ürünleri V1'de online satılır
- Hub intent tutarlılığı: Her hub altında doğru gender intent'li ürünler olmalı

#### How to verify (commands)
```bash
npm run guardrail:forbidden
```

#### Expected outputs (paste from evidence pack)
```
🚀 Guardrail Forbidden Rules Check başlatılıyor...

📥 Kategoriler çekiliyor...
  ✅ 3 kategori, 3 hub bulundu (kadin, erkek, unisex)
  ✅ Kategori -> hub mapping oluşturuldu

📥 Publish + instock ürünleri çekiliyor...
  ✅ 244 ürün bulundu

📥 Ürün-kategori ilişkileri çekiliyor...
  ✅ 487 ürün-kategori ilişkisi bulundu

  ✅ Exceptions dosyası yüklendi: 0 istisna

🔍 Guardrail kuralları kontrol ediliyor...

  ✅ Kontrol tamamlandı: 0 ihlal bulundu

============================================================
✅ GUARDRAIL KONTROLÜ BAŞARILI
============================================================
✅ Hiçbir ihlal bulunamadı. Tüm kurallar geçti.
```

#### Evidence (ARTI OPTİK V1)
- ✅ Guardrail kuralları ARTI OPTİK V1 scope lock'a uygundur
- ✅ 3 hub (kadin, erkek, unisex) bulunur
- ✅ Sadece güneş gözlüğü ürünleri V1'de online satılır
- ✅ Exceptions dosyası: `locks/guardrail-exceptions.json` (istisna tanımlanabilir)

#### Footguns / gotchas
- İhlal varsa `exports/guardrail-violations.csv` dosyasına yazılır
- Exception eklemek için `locks/guardrail-exceptions.json` kullanılır (format: `{"RULE-1": ["product-slug"], "RULE-2": [], "RULE-3": []}`)
- Script READ-ONLY, veri değiştirmez
- Intent hesaplama: `src/lib/intent-heuristics.ts` fonksiyonu kullanılır (slug, name, categorySlugs parametreleri ile)

---

### D) UI Lock: Empty Category Hide + Category Name Normalize

#### What we locked
- Boş kategoriler UI'da gizlenir (hidden-if-empty policy)
  - Top-level list: `rollup_publish > 0` (child'larda ürün varsa top-level görünür)
  - Child filter list: `direct_publish > 0`
- Kategori isimleri UI'da normalize edilir
  - FULL CAPS category name → UI'da TR uyumlu Title Case normalize (slug değişmez)
  - DB name (Woo'dan gelen) olduğu gibi kalabilir; UI düzeltir

#### Why
- Boş kategoriler navigation'ı karıştırır
- İsim tutarlılığı: UI'da Title Case, DB'de slug formatı korunur

#### How to verify (commands)
- UI'da navigation'ı kontrol et: Boş kategoriler görünmemeli
- Hub Map'te `policy: "hidden-if-empty"` olan kategorileri kontrol et

#### Expected outputs (paste from evidence pack)
- Policy hidden-if-empty olan bir facet 0 ürünse UI'da görünmez (örnek: jenerik kategori 0 ürünse UI'da gizlenir)
- Kategori isimleri UI'da normalize edilir (TR uyumlu Title Case)

#### Evidence (2026-01-16)
- ✅ Empty category policy: Top-level list için `rollup_publish > 0`, Child filter list için `direct_publish > 0`
- ✅ Policy hidden-if-empty olan kategoriler UI'da gizlenir (0 ürün)
- ✅ Hub Map'te `policy: "hidden-if-empty"` olan kategoriler UI'da gizlenir
- ✅ Kategori isimleri UI'da normalize edilir (TR uyumlu Title Case)

#### Footguns / gotchas
- `getChildCategoriesByParentWcId` filtresi `direct_publish > 0` kontrolü yapar
- Hub Map'te `policy` alanı manuel tanımlanır, DB'den otomatik çekilmez
- Slug değiştirilmemeli (URL'ler kırılır)
- Top-level kategoriler için rollup hesaplaması yapılır (child'lardaki ürünler toplanır)

---

### E) UI Lock: Rollup Listing + Pagination (Unique-first)

#### What we locked
- Rollup listing:
  - Top-level sayfada sub yoksa parent + child rollup ürünleri listelenir
  - sub seçilirse sadece o child ürünleri
- Pagination bugfix:
  - JOIN duplicate satırları yüzünden `LIMIT` unique ürünleri düşürüyordu (8 ürün bug'ı)
  - Fix: **unique-first / 2-step** (önce unique product id listesi → sonra detay fetch)
- "Load more" cursor/hasMore üretimi unique ürün sayısına bağlı kilitlendi

#### Why
- JOIN yüzünden aynı ürün birden fazla satır geliyordu (ürün birden fazla kategoriye bağlı)
- `LIMIT` JOIN satırlarına uygulanıyordu, unique ürün sayısı düşüyordu
- 2-step query ile önce unique product ID'leri çekilir, sonra detaylar getirilir

#### How to verify (commands)
- Hub sayfasını aç (`/hub/kadin`, `/hub/erkek`, `/hub/unisex`)
- "Daha fazla yükle" butonu görünmeli
- 20+ ürün görünmeli (önceki bug: ~8 ürün görünüyordu)

#### Expected outputs (paste from evidence pack)
**Kanıt:** `exports/pagination-evidence.md` (full documentation)

**Fix yaklaşımı:**
1. Step 1: Scope içinde distinct product ID'lerini çek (GROUP BY + LIMIT)
2. Step 2: Bu ID'lerle products tablosundan detayları getir

**Değişiklikler:**
- `src/db/queries/catalog.ts`: `getProductsCursor` fonksiyonu 2-step query'ye dönüştürüldü

#### Evidence (2026-01-16)
- ✅ Pagination fix: Unique-first 2-step query implementasyonu (`src/db/queries/catalog.ts`)
- ✅ JOIN duplicate bug'ı çözüldü: Önce unique product ID'leri çekilir (GROUP BY), sonra detaylar getirilir
- ✅ Kanıt: `exports/pagination-evidence.md` (full documentation)
- ✅ `npm run build` => PASS

#### Footguns / gotchas
- `?sub=<child>` ile child kategori seçilince rollup değil, sadece o child'ın ürünleri gösterilir
- Cursor pagination unique ürünlere göre çalışır, JOIN satırlarına değil
- Backward compatibility korundu (API contract değişmedi)

---

### F) UI Lock: Hub Map (Config-first) + hub:verify

#### What we locked
- Hub Map (`src/config/hub-map.ts`) tek kaynak (DB'den bağımsız)
- Hub'lar "user journey" (keşfet), DB "storage" (Hub UI DB'den bağımsızdır)
- Hub'lar: `kadin`, `erkek`, `unisex` (ARTI OPTİK V1)
- Ürün tipi: `gunes-gozlugu` (ARTI OPTİK V1)
- POS: Tamamen V2 placeholder (V1 scope'tan çıkarılmış)
- `npm run hub:verify` PASS zorunlu
- 0 publish kategori hub-map'te görünmez (policy hidden-if-empty)

#### Why
- Hub Map navigation'ın data kaynağı (hardcoded array kaldırıldı)
- Slug tutarsızlıkları URL'leri kırıyordu
- Boş kategoriler hub-map'te olmamalı (UI'da zaten gizli)

#### How to verify (commands)
```bash
npm run hub:verify
```

#### Expected outputs (paste from evidence pack)
```
🔍 Hub Map Doğrulama başlatılıyor...

📥 Hub Map'ten kategori slug'ları çekiliyor...
  ✅ 23 kategori slug'ı Hub Map'te bulundu

📥 Veritabanından kategori slug'ları çekiliyor...
  ✅ 26 kategori slug'ı DB'de bulundu

🔍 Hub Map slug'larının DB'de varlığı kontrol ediliyor...
  ✅ Tüm Hub Map slug'ları DB'de mevcut!

✅ Hub Map doğrulama PASS
```

#### Evidence (2026-01-16)
- ✅ `npm run hub:verify` => PASS
- ✅ Hub Map'te 3 hub var: `kadin`, `erkek`, `unisex` (ARTI OPTİK V1)
- ✅ Ürün tipi: `gunes-gozlugu` (ARTI OPTİK V1)
- ✅ Policy hidden-if-empty olan kategoriler hub-map'te YOK (DB'de kalsa bile UI'da policy'ye göre gizli)
- ✅ Parent-child ilişkisi Hub Map'te `note` alanında tanımlanır: `"{parent-slug} alt kategorisi"` (örnek: jenerik kategori alt kategorisi)

#### Footguns / gotchas
- Hub Map'te 3 hub var: `kadin`, `erkek`, `unisex` (ARTI OPTİK V1)
- Ürün tipi: `gunes-gozlugu` (ARTI OPTİK V1)
- Policy hidden-if-empty olan kategoriler hub-map'te yok (DB'de kalsa bile UI'da gizli)
- Parent-child ilişkisi Hub Map'te `note` alanında tanımlanır: `"{parent-slug} alt kategorisi"`
- Slug değiştirilirse hem Hub Map hem DB güncellenmeli
- `DesktopNavigation` artık Hub Map'ten besleniyor (hardcoded array kaldırıldı)
- Hub Map config-first yaklaşımı: UI navigation DB'den otomatik türetilmez, `src/config/hub-map.ts` tek kaynak

---

## Changelog (16.01.2026)

- DB 9→5 top-level cleanup tamam
- Pagination unique-first fix ile LoadMore düzeldi
- Empty category hide + Name normalize eklendi
- Hub Map config-first + hub:verify eklendi
- Guardrail PASS

---
