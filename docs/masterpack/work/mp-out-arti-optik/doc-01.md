ARTI OPTİK Next, ARTI OPTİK’in online mağazası + admin paneli + mağaza içi POS modülünü tek sistemde birleştiren full-stack e-ticaret uygulamasıdır. Checkout sadece kredi kartı (PayTR) ile çalışır; kargo Yurtiçi Kargo entegrasyonu ile yönetilir. Mağazada barkod ile hızlı satış (POS) yapılır ve stok online ile aynı anda güncellenir.

**Evidence:** `README.md` (lines 9-60), `docker-compose.yml`, `package.json` (scripts)

---

## V1 SCOPE LOCK (Kesin Kararlar - Değiştirilemez)

**V1 = Sadece Online Storefront + Sadece GÜNEŞ GÖZLÜĞÜ**

### V1 Ürün Kapsamı
- **Güneş Gözlüğü:** V1'de sadece güneş gözlüğü online satılır
- **Lens/Numaralı Ürün:** Online satılmaz (V1 dışı, sadece mağaza/POS - V2)
- **Kontakt Lens:** Online satılmaz (V1 dışı)

### V1 Özellik Kapsamı
- **POS:** Tamamen V2 (placeholder/feature-flag, V1 scope'tan çıkarılmış)
- **Checkout:** Sadece kredi kartı (PayTR)
- **Kargo:** Yurtiçi Kargo entegrasyonu
- **Keşfet = Hub:** Hub sayfası kategori-index kapısı

### V1 Domain & SEO
- **Domain:** artioptiklens.com.tr (canonical base, SEO için tek kaynak)
- **Canonical URLs:** Tüm canonical URL'ler `https://artioptiklens.com.tr` base'i kullanır

### V2 Placeholder/Feature-Flag
- **POS modülü:** Mağaza içi barkod ile hızlı satış - V2'de aktif olacak, V1'de feature-flag ile kapalı

---

## V1 Kategori/Hub Stratejisi

### Temel Kural: Attributes ≠ Category
- **Marka, materyal, lens tipi, renk = Filtre (attribute), kategori değil**
- Bu özellikler kategori ağacına eklenmez, sadece filtre olarak kullanılır

### V1 Category/Hub Modeli

**Seviye-1 (Root/Gender):**
- Kadın (women)
- Erkek (men)
- Unisex
- Kids: Opsiyonel ama V1 UI'da kapalı (dokümanda "disabled")

**Ürün Tipi:**
- Güneş Gözlüğü (Sunglasses) - V1'de tek ürün tipi

**Stil/Form Seti (V1 Kilitli Başlangıç Listesi):**
- Round (Yuvarlak)
- Square (Kare)
- Aviator (Pilot)
- Wayfarer
- Geometric (Geometrik)
- Oversize
- Rectangular + Cat-eye: "V1'de hazır ama ürün kapsaması yoksa UI'da gizli/disabled" notu ile

### URL Standardı (Patlamasın Diye Tek Standart)

**Hub Kapısı:**
- `/hub/{gender}` - Örn: `/hub/kadin`, `/hub/erkek`, `/hub/unisex`

**Listeleme:**
- `/kategori/{gender}/gunes-gozlugu` - Örn: `/kategori/kadin/gunes-gozlugu`

**Stil Listeleme:**
- `/kategori/{gender}/gunes-gozlugu/{style}` - Örn: `/kategori/kadin/gunes-gozlugu/aviator`

**Ürün Detay:**
- `/urun/{slug}` - Örn: `/urun/ray-ban-original-wayfarer`

**Not:** Bu prefix'li yapı reserved slug çakışmasını azaltır ve ileride genişlerken kırılmayı önler.

### V1 Marka Listesi (Lock)

Ray-Ban, Oakley, Prada, Miu Miu, Chanel, Versace, Dolce & Gabbana, Gucci, Tom Ford, Burberry, Swarovski, Michael Kors, Emporio Armani, Armani Exchange, Calvin Klein, Vogue, Lacoste, Persol

---

### 10.2 Architecture
- ✅ App Router yapısı kurulu
- ✅ Component katmanı organize edilmiş
- ✅ Database schema tanımlı (Drizzle)
- ✅ Auth sistemi kurulu (NextAuth.js v5)
- ✅ Theme sistemi (dark/light mode)
- ✅ Mobile-first responsive design

**Evidence:** `src/app/` (route structure), `src/components/` (component organization), `src/db/schema.ts`, `src/auth.ts`, `src/components/theme/`

### 10.3 Component Maturity
- **Assumption:** Component library (shadcn/ui) kullanılıyor, temel UI bileşenleri mevcut
- Component sayısı: ~50+ (ui/, catalog/, product/, cart/, vb.)
- Storybook yok

**Evidence:** `src/components/ui/` (15 files), `components.json` (shadcn config), No storybook config found

---

## 11. Known Gaps / Risks

### 11.1 Testing
- Test framework kurulu değil
- Unit test yok
- E2E test yok
- Integration test yok

**Evidence:** No test files found

### 11.2 Environment Configuration
- `.env*` dosyaları gitignore'da (secret management belirsiz)
- Production environment variables dokümante edilmemiş

**Evidence:** `.env*` files not found in repo (expected, gitignored)

### 11.3 Error Handling
- Global error boundary yok (sadece not-found.tsx var)
- API error responses standardize edilmemiş (assumption)

**Evidence:** `src/app/not-found.tsx` exists, no `error.tsx` found in root app/

### 11.4 Performance Monitoring
- Analytics entegrasyonu yok (assumption)
- Performance monitoring yok (assumption)

**Evidence:** No analytics/performance monitoring code found

### 11.5 Documentation
- API endpoint'leri dokümante edilmemiş
- Component API'leri dokümante edilmemiş
- Deployment process dokümante edilmiş (`docs/04-deploy-kamatera-pm2.md`)

**Evidence:** `docs/` directory exists, API docs not found

---

## 12. Open Questions

1. Production deployment süreci tam olarak nasıl? (PM2 config, build optimizations)
2. CDN kullanılıyor mu? (Image optimization için)
3. Payment gateway entegrasyonu hangi aşamada? (Checkout sayfası var ama payment processing belirsiz)
4. Email service entegrasyonu var mı? (Order confirmations, password reset)
5. SEO stratejisi nedir? (Metadata, sitemap, robots.txt)
6. Analytics tool entegrasyonu planlanıyor mu? (Google Analytics, vb.)
7. Error logging/monitoring service kullanılıyor mu? (Sentry, LogRocket, vb.)
8. Backup stratejisi nedir? (Database backups, snapshot management)
9. Multi-language support planlanıyor mu? (i18n)
10. Admin panel'de başka özellikler planlanıyor mu? (Product management, user management)

---

## 13. Evidence Index

1. **Package.json:** `package.json` - Dependencies, scripts, project name
2. **README:** `README.md` - Setup instructions, External Catalog Import (V2/Unknown) import guide
3. **Next.js Config:** `next.config.ts` - Image optimization, timezone
4. **TypeScript Config:** `tsconfig.json` - Compiler options, paths
5. **Drizzle Config:** `drizzle.config.ts` - Database connection, schema path
6. **Database Schema:** `src/db/schema.ts` - Tables: products, categories, users, orders, etc.
7. **Auth Setup:** `src/auth.ts` - NextAuth.js configuration, credentials provider
8. **App Router Structure:** `src/app/` - Route organization, page components
9. **Component Library:** `components.json` - shadcn/ui configuration
10. **Tailwind Config:** `tailwind.config.ts` - Content paths, theme extensions
11. **PostCSS Config:** `postcss.config.mjs` - Tailwind v4 plugin
12. **Docker Compose:** `docker-compose.yml` - PostgreSQL 16 container
13. **External Catalog Import (V2/Unknown) Import:** `scripts/woo-import.ts` - Import script implementation
14. **API Routes:** `src/app/api/products/route.ts`, `src/app/api/search/route.ts` - Internal APIs
15. **Global Styles:** `src/app/globals.css` - CSS variables, theme tokens
16. **Root Layout:** `src/app/layout.tsx` - Providers, theme, structure
17. **Home Page:** `src/app/page.tsx` - Server Component, data fetching
18. **ESLint Config:** `eslint.config.mjs` - Linting rules
19. **Project Docs:** `docs/01-frontend-project-doc-v1.md` - Project goals, tech stack
20. **External Catalog Import (V2/Unknown) Docs:** `docs/03-woo-import-guide.md` - Import process documentation
---
