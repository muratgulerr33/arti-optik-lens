<a id="doc-04"></a>
# DOC-04: 04.design-system.md

---
# 04.design-system.md

Bu doküman, ARTI OPTİK Next projesinin design system'ini, UI bileşenlerini, stil rehberini ve tasarım kararlarını tanımlar. Amaç: AI asistanların (Cursor/ChatGPT) tutarlı UI/UX tasarımı yapmasını sağlamak ve tasarım kararlarını merkezi bir yerde toplamak.

**Son Güncelleme:** 2025-01-27  
**Proje:** arti-optik-next  
**Next.js:** 16.1.1  
**React:** 19.2.3

**ÖNEMLİ:** Theme/token sistemi ve interaction kuralları için **tek kaynak** doküman: **[Design Rules v1.0](../../../design/design-rules-v1.md)**. Bu doküman (DOC-04) genel design system overview'ı içerir; detaylı theme/token/interaction kuralları Design Rules v1.0'da bulunur.

---

## 1. Design System Overview

Proje, shadcn/ui (New York style) tabanlı bir design system kullanıyor. Tailwind CSS v4 ile CSS variables (oklch formatında) üzerinden dark/light theme desteği sağlanıyor. Radix UI primitives ile erişilebilir bileşenler, class-variance-authority (cva) ile variant yönetimi, framer-motion ile animasyonlar kullanılıyor. Mobile-first yaklaşım benimsenmiş, native app hissi veren dokunsal etkileşimler ön planda.

**Evidence:** `package.json` (tailwindcss@4, class-variance-authority@0.7.1, framer-motion@12.23.26, @radix-ui/*, sonner@2.0.7), `src/app/globals.css` (CSS variables, oklch colors), `components.json` (shadcn/ui config)

---

## 2. Design Tokens

**Not:** Detaylı token listesi, theme sistemi ve interaction kuralları için **[Design Rules v1.0](../../../design/design-rules-v1.md)** dokümanına bakın. Bu bölüm genel overview içerir.

### 2.1 Colors

Renk sistemi CSS variables üzerinden yönetiliyor. OKLCH formatı kullanılıyor (lightness, chroma, hue). Primary renk: `#ff2357` (pembe/kırmızı ton). Dark ve light theme için ayrı değişkenler tanımlı.

**Detaylar:** Tüm token değerleri, background mapping, color-scheme ve token yapısı için [Design Rules v1.0 - Section 2: Theme & Tokens](../../../design/design-rules-v1.md#2-theme--tokens-source-of-truth) bölümüne bakın.

**Light Theme Variables:**
- `--background`: `oklch(0.985 0 0)` (kırık beyaz)
- `--foreground`: `oklch(0.141 0.005 285.823)` (koyu gri)
- `--primary`: `#ff2357` (sabit hex)
- `--primary-foreground`: `oklch(0.985 0 0)` (beyaz yazı)
- `--secondary`: `oklch(0.967 0.001 286.375)` (açık gri)
- `--muted`: `oklch(0.967 0.001 286.375)`
- `--destructive`: `oklch(0.6 0.23 15)` (Primary ile uyumlu pink-red hybrid)
- `--destructive-foreground`: `oklch(0.985 0 0)` (beyaz yazı)
- `--border`: `oklch(0.92 0.004 286.32)`
- `--ring`: `oklch(0.712 0.194 13.428)` (focus ring)

**Dark Theme Variables:**
- `--background`: `oklch(0.17 0.005 285.85)` (açık koyu)
- `--foreground`: `oklch(0.985 0 0)` (açık)
- `--primary`: `#ff2357` (aynı)
- `--destructive`: `oklch(0.704 0.191 22.216)` (daha açık kırmızı)
- `--border`: `oklch(1 0 0 / 10%)` (şeffaf beyaz)

**Semantic Mapping:**
- Primary: `#ff2357` (CTA butonlar, linkler, vurgular)
- Destructive: `oklch(0.6 0.23 15)` (Error/silme işlemleri, Primary rengi ile uyumlu modern ton)
- Muted: İkincil metin, disabled durumlar
- Secondary: İkincil butonlar, arka planlar
- Accent: Hover states, vurgular

**Background Softening Note:**
Background token değerleri native/eye comfort (göz yormayan) amacıyla yumuşatıldı. Light mode `--background` kırık beyaza (`oklch(0.985 0 0)`), dark mode `--background` daha açık tona (`oklch(0.17 0.005 285.85)`) çekildi. Card/surface token'larına dokunulmadı; yalnızca global background değişti.

**Evidence:** `src/app/globals.css` (lines 14, 48: `:root --background` ve `.dark --background`), `tailwind.config.ts` (theme extend yok, CSS variables kullanılıyor)

---

### 2.2 Typography

Geist font ailesi (Google Fonts) kullanılıyor. Next.js `next/font/google` ile optimize edilmiş yükleme. Sans-serif için Geist, monospace için Geist Mono.

**Font Families:**
- `--font-geist-sans`: Geist (sans-serif, varsayılan)
- `--font-geist-mono`: Geist Mono (kod, monospace)

**Font Loading:**
- `display: "swap"` ile performans optimizasyonu
- CSS variable'lar üzerinden erişim: `var(--font-geist-sans)`

**Base Typography:**
- Body: `font-sans` (Geist), default text size (Tailwind base)
- Headings: Font weight ve size Tailwind utilities ile (`text-lg`, `font-semibold`, etc.)
- Monospace: `font-mono` (Geist Mono)

**Evidence:** `src/app/layout.tsx` (lines 20-30, Geist import), `src/app/globals.css` (lines 7-9, font variables), `tailwind.config.ts` (lines 11-14, fontFamily extend)

---

### 2.3 Spacing

Tailwind CSS default spacing scale kullanılıyor (0.25rem increment: 0, 0.25, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96). Custom spacing tanımı yok.

**Common Patterns:**
- Container padding: `px-4 sm:px-5 md:px-6 lg:px-8 2xl:px-12`
- Component gaps: `gap-2`, `gap-3`, `gap-4`
- Section spacing: `py-4`, `py-6`, `py-8`

**Evidence:** `src/components/app/page-transition.tsx` (line 72, container padding), `src/components/layout/DesktopHeader.tsx` (line 13, container padding), `tailwind.config.ts` (spacing extend yok)

---

### 2.4 Border Radius

Base radius: `--radius: 0.65rem` (10.4px). Türetilmiş değerler:
- `--radius-lg`: `var(--radius)` (0.65rem)
- `--radius-md`: `calc(var(--radius) - 2px)` (8.4px)
- `--radius-sm`: `calc(var(--radius) - 4px)` (6.4px)

**Usage Patterns:**
- Buttons: `rounded-md` (default), `rounded-xl` (theme toggle), `rounded-2xl` (mobile actions)
- Cards: `rounded-xl`
- Inputs: `rounded-md`
- Drawer: `rounded-t-2xl` (top corners)

**Evidence:** `src/app/globals.css` (lines 13, 127-129, radius variables), `src/components/ui/button.tsx` (line 7, rounded-md), `src/components/ui/theme-toggle.tsx` (line 25, rounded-xl), `src/components/ui/drawer.tsx` (line 36, rounded-t-2xl)

---

### 2.5 Shadows

Tailwind CSS default shadow scale kullanılıyor. Custom shadow tanımı yok. En yaygın kullanımlar:
- `shadow-sm`: Küçük elevation (cards, buttons)
- `shadow-lg`: Dialog, modal overlay
- `shadow-[custom]`: Custom shadow (örn: `shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]`)

**Evidence:** `src/components/ui/dialog.tsx` (line 42, shadow-lg), `src/components/product/product-view.tsx` (line 268, custom shadow), `tailwind.config.ts` (shadow extend yok)

---

### 2.6 Breakpoints

Tailwind CSS default breakpoints kullanılıyor:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px (desktop/mobile ayrımı için kritik)
- `2xl`: 1536px

**Mobile/Desktop Pattern:**
- Mobile: `< xl` (1280px altı)
- Desktop: `xl:` ve üzeri
- Mobile bottom nav: `xl:hidden`
- Desktop header: `hidden xl:flex`

**Evidence:** `tailwind.config.ts` (breakpoints extend yok, default), `src/components/app/mobile-bottom-nav.tsx` (line 84, xl:hidden), `src/components/layout/DesktopHeader.tsx` (line 12, hidden xl:flex), `src/app/layout.tsx` (line 77, hidden xl:block)

---

## 3. UI Components

### 3.1 Base Components

shadcn/ui tabanlı bileşenler `src/components/ui/` altında. Radix UI primitives + CVA (class-variance-authority) ile variant yönetimi.

#### Button (`src/components/ui/button.tsx`)

**Variants (CVA):**
- `default`: `bg-primary text-primary-foreground hover:bg-primary/90`
- `destructive`: `bg-destructive text-destructive-foreground`
- `outline`: `border border-input bg-background hover:bg-accent`
- `secondary`: `bg-secondary text-secondary-foreground`
- `ghost`: `hover:bg-accent hover:text-accent-foreground`
- `link`: `text-primary underline-offset-4 hover:underline`

**Sizes:**
- `default`: `h-10 px-4 py-2`
- `sm`: `h-9 rounded-md px-3`
- `lg`: `h-11 rounded-md px-8`
- `icon`: `h-10 w-10`

**States:**
- Default: Normal görünüm
- Hover: `hover:bg-primary/90` (opacity değişimi)
- Active: `active:scale-95` (pressable prop ile)
- Disabled: `disabled:pointer-events-none disabled:opacity-50`
- Focus: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`

**A11y:**
- Keyboard navigation: Native button element
- Focus ring: `focus-visible:ring-2 focus-visible:ring-ring`
- ARIA: `aria-label` prop desteği

**Do/Don't:**
- ✅ `asChild` prop ile Radix Slot kullan (composition)
- ✅ `pressable` prop ile dokunsal feedback ekle
- ❌ Link görünümü için `variant="link"` kullan, `<a>` tag'i kullanma
- ❌ Disabled state'te `pointer-events-none` zaten var, ekstra wrapper gerekmez

**Evidence:** `src/components/ui/button.tsx` (lines 6-64)

#### Input (`src/components/ui/input.tsx`)

**Base Styles:**
- `h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm`
- `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- `disabled:cursor-not-allowed disabled:opacity-50`
- `placeholder:text-muted-foreground`

**States:**
- Default: Border, background, padding
- Focus: Ring 2px, ring-offset
- Disabled: Cursor not-allowed, opacity 50%
- Placeholder: Muted foreground color

**A11y:**
- Native input element (forwardRef)
- Focus ring: `focus-visible:ring-2`
- Placeholder: Semantic color

**Do/Don't:**
- ✅ `forwardRef` kullan (form library entegrasyonu için)
- ✅ `type` prop'u geç (email, password, etc.)
- ❌ Custom wrapper div ekleme, direkt Input kullan
- ❌ Inline styles kullanma, className ile extend et

**Evidence:** `src/components/ui/input.tsx` (lines 4-25)

#### Badge (`src/components/ui/badge.tsx`)

**Variants (CVA):**
- `default`: `bg-primary text-primary-foreground`
- `secondary`: `bg-secondary text-secondary-foreground`
- `destructive`: `bg-destructive text-destructive-foreground`
- `outline`: `text-foreground` (border only)
- `success`: `bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20` *(Geçici istisna: Status colors şu an Tailwind palette ile, ileride tokenlaştırılacak)*
- `warning`: `bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20` *(Geçici istisna: Status colors şu an Tailwind palette ile, ileride tokenlaştırılacak)*
- `info`: `bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20` *(Geçici istisna: Status colors şu an Tailwind palette ile, ileride tokenlaştırılacak)*
- `dot`: `h-2 w-2 rounded-full p-0` (notification dot)

**Base:**
- `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold`
- `focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`

**Usage:**
- Cart count: `variant="default"` (primary background)
- Notification dot: `variant="dot"`
- Status indicators: `success`, `warning`, `info`

**Evidence:** `src/components/ui/badge.tsx` (lines 4-41), `src/components/app/mobile-bottom-nav.tsx` (lines 123-128, cart badge)

#### Dialog (`src/components/ui/dialog.tsx`)

**Base:** Radix UI Dialog primitive. Overlay: `bg-black/80`, fade animasyon. Content: `max-w-lg`, center, zoom + slide animasyon.

**Components:**
- `Dialog`: Root (controlled state)
- `DialogTrigger`: Açma butonu
- `DialogContent`: Ana içerik (overlay + content)
- `DialogHeader`: Başlık alanı
- `DialogTitle`: Başlık (ARIA required)
- `DialogDescription`: Açıklama (ARIA required)
- `DialogFooter`: Alt buton alanı
- `DialogClose`: Kapatma butonu (X icon)

**Animations:**
- Overlay: `fade-in-0` / `fade-out-0`
- Content: `zoom-in-95` / `zoom-out-95` + `slide-in-from-left-1/2`

**A11y:**
- Radix UI accessibility built-in
- `DialogTitle` ve `DialogDescription` zorunlu (ARIA)
- Focus trap, escape key, outside click

**Evidence:** `src/components/ui/dialog.tsx` (lines 1-127)

#### Drawer (`src/components/ui/drawer.tsx`)

**Base:** Vaul library (mobile drawer). Bottom-up slide animasyon. `max-h-[85dvh]`, rounded top corners.

**Components:**
- `Drawer`: Root
- `DrawerTrigger`: Açma butonu
- `DrawerContent`: Ana içerik (overlay + content)
- `DrawerHeader`: Başlık alanı
- `DrawerTitle`: Başlık (ARIA)
- `DrawerDescription`: Açıklama (ARIA)
- `DrawerFooter`: Alt alan

**Pattern:**
- Mobile cart: Drawer kullanılıyor
- Handle bar: `mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted`
- Backdrop blur: `bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-xl`

**Evidence:** `src/components/ui/drawer.tsx` (lines 1-108), `src/components/app/mobile-bottom-nav.tsx` (lines 82-238, cart drawer)

#### Accordion (`src/components/ui/accordion.tsx`)

**Base:** Radix UI Accordion. ChevronDown icon ile expand/collapse. Animasyon: `animate-accordion-up` / `animate-accordion-down`.

**Components:**
- `Accordion`: Root (type: "single" | "multiple")
- `AccordionItem`: Item wrapper
- `AccordionTrigger`: Tıklanabilir başlık
- `AccordionContent`: İçerik (collapsible)

**Evidence:** `src/components/ui/accordion.tsx` (lines 1-56)

#### Avatar (`src/components/ui/avatar.tsx`)

**Components:**
- `Avatar`: Container (`rounded-full`, `h-10 w-10`)
- `AvatarImage`: `<img>` (aspect-square)
- `AvatarFallback`: Fallback (initials, `bg-muted`)

**Usage:**
- Profile picture: Mobile bottom nav
- User initials: Fallback text

**Evidence:** `src/components/ui/avatar.tsx` (lines 1-54), `src/components/app/mobile-bottom-nav.tsx` (lines 179-192, profile avatar)

#### Skeleton (`src/components/ui/skeleton.tsx`)

**Base:** `animate-pulse rounded-md bg-muted`. Loading state placeholder.

**Evidence:** `src/components/ui/skeleton.tsx` (lines 1-16)

**Evidence:** `src/components/ui/` directory, `package.json` (@radix-ui/*, class-variance-authority, tailwind-merge)

---

### 3.2 Layout Components

#### Header (`src/components/layout/header.tsx`)

Mobile header. Sticky top, `h-14`, border-bottom. Sol: Back button (ChevronLeft) veya boş. Orta: Title veya brand link ("CİNSELHOBİ"). Sağ: Search, cart, menu actions. Scroll state'e göre görünüm değişir.

**States:**
- Home: Back button yok
- Scrolled: Shadow, border değişimi
- Category page: Catalog controls gösterilir

**Evidence:** `src/components/layout/header.tsx` (lines 1-238)

#### DesktopHeader (`src/components/layout/DesktopHeader.tsx`)

Desktop header. `h-16`, border-bottom. Sol: Brand link. Orta: DesktopNavigation (kategori menüsü). Sağ: Search input, user, favorites, cart, theme toggle.

**Evidence:** `src/components/layout/DesktopHeader.tsx` (lines 1-65)

#### MobileBottomNav (`src/components/app/mobile-bottom-nav.tsx`)

Fixed bottom navigation. `xl:hidden` (sadece mobile). 5 tab: Home, Categories, Cart (drawer), Wishlist, Profile. Active state: Dot indicator üstte. Cart: Badge ile count gösterimi. Profile: Avatar veya icon. Drawer pattern ile cart açılır.

**Evidence:** `src/components/app/mobile-bottom-nav.tsx` (lines 1-241)

#### Footer (`src/components/app/Footer.tsx`)

Desktop footer. `hidden xl:block`. Legal links, copyright.

**Evidence:** `src/app/layout.tsx` (line 78, Footer import)

**Evidence:** `src/components/layout/` directory, `src/components/app/Footer.tsx`, `src/app/layout.tsx` (lines 71-80)

---

### 3.3 Feature Components

#### ProductCard (`src/components/product/product-card.tsx`)

Ürün kartı. Aspect ratio `4/5`, rounded-xl. Image: Hover'da gallery rotation (1s interval). Press-preview: Mobilde 150ms long-press ile 2. resim gösterimi. Quick add: Sağ alt köşe, Plus icon. Favorite: Sağ üst, FavoriteButton. Title: ALL CAPS ise lowercase + capitalize. Price: Bold, formatPrice.

**Interactions:**
- Desktop hover: Gallery rotation
- Mobile press: Preview (150ms delay)
- Quick add: Sepete ekleme (onQuickAdd callback veya default addItem)

**Evidence:** `src/components/product/product-card.tsx` (lines 1-272)

#### CartView (`src/components/cart/cart-view.tsx`)

Sepet görünümü. Drawer variant (mobile) veya page variant. Item list, quantity controls, remove, subtotal.

**Evidence:** `src/components/cart/cart-view.tsx` (usage in mobile-bottom-nav.tsx line 235)

#### SearchOverlay (`src/components/search/search-overlay.tsx`)

Arama overlay. Full-screen, keyboard shortcut (Cmd/Ctrl+K), real-time search results.

**Evidence:** `src/components/search/search-overlay.tsx` (usage in layout.tsx line 73)

**Evidence:** `src/components/product/` directory, `src/components/cart/` directory, `src/components/search/` directory

---

## 4. Design Patterns

### 4.1 Navigation Patterns

**Mobile Navigation:**
- Fixed bottom nav (`xl:hidden`): 5 tab, active dot indicator, cart drawer
- Sticky top header: Back button, title, actions
- Tab scroll preservation: `tab-scroll.ts` ile scroll position kaydedilir

**Desktop Navigation:**
- Fixed top header (`hidden xl:flex`): Brand, category menu, search, actions
- Horizontal menu: DesktopNavigation component

**Pattern Rules:**
- Mobile: Bottom nav + top header
- Desktop: Top header only
- Cart: Mobile'de drawer, desktop'ta page
- Active state: Visual indicator (dot, color change)

**Evidence:** `src/components/app/mobile-bottom-nav.tsx` (lines 38-241), `src/components/layout/header.tsx` (lines 46-238), `src/components/layout/DesktopHeader.tsx` (lines 10-65), `src/components/app/tab-scroll.ts` (scroll preservation)

---

### 4.2 Product Display Patterns

**Product Card:**
- Grid layout: Responsive columns (mobile: 2, tablet: 3, desktop: 4-5)
- Aspect ratio: 4/5 (portrait)
- Image gallery: Hover rotation (desktop), press preview (mobile)
- Quick actions: Favorite (sağ üst), Quick add (sağ alt)
- Title normalization: ALL CAPS → lowercase + capitalize

**Product Detail Page:**
- Sticky action bar: Bottom fixed, price + "Sepete Ekle" button
- Image gallery: Horizontal scroll, thumbnails
- Description: Expandable (read more/less)
- Related products: Grid below

**Grid Patterns:**
- Cursor-based pagination: Infinite scroll, "Load More" button
- Filtering: Price range, stock status, subcategories
- Sorting: Newest, price asc/desc, name asc

**Evidence:** `src/components/product/product-card.tsx` (lines 17-272), `src/components/product/product-view.tsx` (lines 50-321), `src/components/catalog/load-more-grid.tsx` (pagination)

---

### 4.3 Form Patterns

**Input Pattern:**
- Base: Input component (`src/components/ui/input.tsx`)
- Validation: react-hook-form + Zod (Server Actions'da)
- Error display: Unknown (form component'lerde görülmedi)

**Form Components:**
- Address form: `src/components/account/address-form.tsx`
- Login/Signup: `src/components/auth/login-form.tsx`, `signup-form.tsx`

**Evidence:** `src/components/ui/input.tsx`, `src/components/account/address-form.tsx`, `package.json` (react-hook-form@7.69.0, @hookform/resolvers@5.2.2, zod@4.2.1)

---

### 4.4 Feedback Patterns

**Toast Notifications:**
- Library: Sonner (`sonner@2.0.7`)
- Mount: `src/app/layout.tsx` line 82: `<Toaster position="top-center" richColors />`
- Usage: `toast.success("Ürün sepete eklendi")` (product-view.tsx line 81)

**Sepete Ekleme Pattern:**
1. Button click → `addItem()` çağrılır
2. Local state: `setIsAdded(true)` (button text: "Eklendi ✓", green background)
3. Toast: `toast.success("Ürün sepete eklendi")`
4. Timeout: 2s sonra state reset (`setIsAdded(false)`)

**Loading States:**
- Skeleton component: `src/components/ui/skeleton.tsx`
- Button loading: Unknown (loading prop görülmedi)

**Error States:**
- Unknown (error handling pattern görülmedi)

**Empty States:**
- Unknown (empty state component görülmedi)

**Evidence:** `src/app/layout.tsx` (line 82, Toaster), `src/components/product/product-view.tsx` (lines 62-83, add to cart + toast), `package.json` (sonner@2.0.7), `src/components/ui/skeleton.tsx`

---

## 5. Theme System

**Detaylar:** Theme sistemi, dark mode implementation, hydration-safe rendering ve toggle stabilizasyonu için **[Design Rules v1.0 - Section 3 & 4](../../../design/design-rules-v1.md#3-dark-mode-tailwind-v4--next-themes)** bölümüne bakın.

**Library:** next-themes (`next-themes@0.4.6`)

**Provider:** `src/components/theme/theme-provider.tsx`
- Wrapper: NextThemesProvider
- Config: `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`

**Toggle:** `src/components/theme/theme-toggle.tsx`
- Button: `h-11 w-11`, rounded-xl, border
- Icon: Emoji (🌙 dark, 🌞 light)
- State: `resolvedTheme` (dark/light)
- A11y: `aria-label="Toggle theme"`

**CSS Variables:**
- Light theme: `:root` (globals.css lines 12-45)
- Dark theme: `.dark` (globals.css lines 47-79)
- Transition: `disableTransitionOnChange` ile anlık geçiş (göz yormayı engeller)

**Theme Colors:**
- Primary: `#ff2357` (her iki theme'de aynı)
- Background/Foreground: Ters (light: beyaz/koyu, dark: koyu/açık)
- Border: Light'da solid, dark'ta şeffaf (`oklch(1 0 0 / 10%)`)

**Evidence:** `src/components/theme/theme-provider.tsx` (lines 1-11), `src/components/theme/theme-toggle.tsx` (lines 1-34), `src/app/globals.css` (lines 12-79, theme variables), `src/app/layout.tsx` (lines 59-64, ThemeProvider config), `package.json` (next-themes@0.4.6)

---

## 6. Mobile-First Design

**Breakpoint Strategy:**
- Mobile: `< xl` (1280px altı)
- Desktop: `xl:` ve üzeri
- Pattern: `xl:hidden` (mobile only), `hidden xl:flex` (desktop only)

**Touch Interactions:**
- Press preview: ProductCard'ta 150ms long-press ile 2. resim gösterimi
- Active scale: `active:scale-[0.98]` veya `active:scale-95` (button feedback)
- Touch callout disable: `[-webkit-touch-callout:none]` (image area)
- Safe area: `env(safe-area-inset-bottom)` (notch support)

**Mobile Patterns:**
- Bottom navigation: Fixed, 5 tab, drawer pattern (cart)
- Sticky header: Back button, title, actions
- Full-screen overlays: Search, cart drawer
- Page transitions: Horizontal slide (framer-motion)

**Responsive Container:**
- Max width: `max-w-screen-2xl`
- Padding: `px-4 sm:px-5 md:px-6 lg:px-8 2xl:px-12`

**Evidence:** `src/components/app/mobile-bottom-nav.tsx` (xl:hidden), `src/components/product/product-card.tsx` (lines 121-170, press preview), `src/components/app/page-transition.tsx` (line 72, container padding), `tailwind.config.ts` (breakpoints)

---

## 7. Animation & Transitions

**Library:** framer-motion (`framer-motion@12.23.26`)

**Page Transitions:**
- Component: `src/components/app/page-transition.tsx`
- Pattern: Horizontal slide (left/right based on tab index)
- Animation: Spring (`stiffness: 300, damping: 35, bounce: 0`)
- Reduced motion: `useReducedMotion()` hook ile disable
- Frozen router: Exit animasyonu sırasında state freeze (FrozenRouter)

**Component Animations:**
- Accordion: `animate-accordion-up` / `animate-accordion-down` (tw-animate-css)
- Dialog: Fade + zoom + slide (Radix UI data attributes)
- Drawer: Bottom-up slide (Vaul)
- Button press: `active:scale-95` (transform)

**Animation Utilities:**
- `tw-animate-css`: `package.json` (tw-animate-css@1.4.0)
- Import: `src/app/globals.css` line 2: `@import "tw-animate-css";`

**Evidence:** `src/components/app/page-transition.tsx` (lines 1-162, framer-motion), `package.json` (framer-motion@12.23.26, tw-animate-css@1.4.0), `src/app/globals.css` (line 2, tw-animate-css import), `src/components/ui/accordion.tsx` (line 46, animate-accordion)

---

## 8. Accessibility Guidelines

**ARIA Usage:**
- Dialog/Drawer: `DialogTitle`, `DialogDescription` zorunlu (Radix UI)
- Navigation: `aria-label`, `aria-current="page"` (active tab)
- Buttons: `aria-label` (icon-only buttons)
- Theme toggle: `aria-label="Toggle theme"`

**Keyboard Navigation:**
- Focus ring: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` (tüm interactive elements)
- Tab order: Native HTML semantics
- Escape key: Dialog/Drawer kapatma (Radix UI built-in)

**Screen Reader:**
- Radix UI: Built-in accessibility (Dialog, Accordion, etc.)
- Visually hidden: `@radix-ui/react-visually-hidden` (package.json line 23)
- Semantic HTML: Native elements (button, input, etc.)

**Touch Targets:**
- Minimum size: `h-10` (40px) veya `min-h-11` (44px)
- Spacing: Adequate gap between interactive elements

**Detaylar:** 44px touch target, focus ring sistemi, motion tokens ve interaction kuralları için **[Design Rules v1.0 - Section 5: Interaction Rules](../../../design/design-rules-v1.md#5-interaction-rules-2026-native-app-feel)** bölümüne bakın.

**Evidence:** `src/components/ui/dialog.tsx` (DialogTitle, DialogDescription), `src/components/app/mobile-bottom-nav.tsx` (aria-label, aria-current), `src/components/theme/theme-toggle.tsx` (aria-label), `package.json` (@radix-ui/react-visually-hidden), `src/components/ui/button.tsx` (focus-visible:ring)

---

## 9. Design System Constraints

### 9.1 Non-Negotiables

**Color System:**
- **Core UI colors** (background/foreground/border/ring/primary/secondary/accent/muted vb.) **CSS variables / design tokens** üzerinden yönetilmelidir.
  - Component içinde rastgele `#hex`, `rgb(...)` veya keyfi Tailwind palette class'ları ile core UI rengi verilmemelidir.
- **Brand Primary** mevcut token değerine bağlıdır (örn. `--primary: #ff2357`). Bu değer değişecekse **karar kaydı** ile yapılmalıdır.
- **Exception (Status Colors):** `success / warning / info` gibi **durum renkleri** şu an bazı komponentlerde (örn. Badge variants) **Tailwind palette** ile uygulanıyor olabilir (örn. `bg-green-500/15`).
  - Bu kullanım **izinli geçici istisnadır** ve ileride tokenlaştırılacaktır. (Not olarak "Future Considerations" bölümüne eklenmiştir.)
- Dark/Light theme her iki modda da desteklenmeli

**Component Library:**
- shadcn/ui pattern korunmalı (Radix UI + CVA + Tailwind)
- Yeni UI component'ler `src/components/ui/` altında olmalı
- Variant yönetimi CVA ile yapılmalı

**Theme System:**
- next-themes kullanılmalı, başka theme library kullanılamaz
- `attribute="class"` pattern korunmalı (`.dark` class)
- Theme toggle sadece `src/components/theme/theme-toggle.tsx` kullanılmalı

**Mobile/Desktop Pattern:**
- Mobile: Bottom nav + top header (`xl:hidden` / `hidden xl:flex`)
- Desktop: Top header only
- Breakpoint: `xl` (1280px) mobile/desktop ayrımı

**Evidence:** `src/app/globals.css` (primary #ff2357), `src/components/ui/button.tsx` (CVA pattern), `src/components/theme/theme-provider.tsx` (next-themes), `src/components/app/mobile-bottom-nav.tsx` (xl:hidden)

---

### 9.2 Best Practices

**Component Composition:**
- `asChild` pattern kullan (Radix Slot ile composition)
- `forwardRef` kullan (form library entegrasyonu için)
- `cn()` utility kullan (tailwind-merge ile class birleştirme)

**State Management:**
- Context API: Cart, Favorites, Search, Auth, Theme
- Provider'lar sadece `src/app/layout.tsx` içinde

**Performance:**
- Image optimization: Next.js Image component
- Font optimization: `next/font/google` (display: swap)
- Code splitting: Next.js App Router automatic

**Touch Interactions:**
- Active scale: `active:scale-[0.98]` veya `active:scale-95`
- Press feedback: Visual state change (örn: "Eklendi ✓")
- Safe area: `env(safe-area-inset-*)` kullan

**Evidence:** `src/components/ui/button.tsx` (asChild, forwardRef), `src/lib/utils.ts` (cn function), `src/app/layout.tsx` (providers), `src/components/product/product-card.tsx` (Image component, active:scale)

---

## 10. Component Usage Examples

**Button with Icon:**
```tsx
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

<Button variant="ghost" size="icon" aria-label="Sepet">
  <Icons.cart className="h-5 w-5" />
</Button>
```

**Product Card:**
```tsx
import { ProductCard } from "@/components/product/product-card";

<ProductCard
  productId={1}
  slug="urun-slug"
  title="Ürün Adı"
  price={10000} // kuruş
  images={["/image.jpg"]}
  isNew={true}
  isFavorite={false}
/>
```

**Toast Notification:**
```tsx
import { toast } from "sonner";

toast.success("Ürün sepete eklendi");
```

**Dialog:**
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Başlık</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

**Evidence:** `src/components/layout/DesktopHeader.tsx` (Button usage), `src/components/product/product-card.tsx` (ProductCard export), `src/components/product/product-view.tsx` (toast.success), `src/components/ui/dialog.tsx` (Dialog components)

---

## 11. Future Considerations

**Color System:**
- Primary renk kontrast kontrolü: `primary` + `primary-foreground` kontrast ratio kontrolü (WCAG AA/AAA)
- Semantic color expansion: Success, warning, info renkleri için daha tutarlı palette

**Component Library:**
- Form components: Textarea, Select, Checkbox, Radio, Switch (şu an sadece Input var)
- Loading states: Button loading spinner pattern
- Error states: Form validation error display pattern
- Empty states: Empty state component (ürün yok, sepet boş, etc.)

**Accessibility:**
- Skip links: Ana içeriğe atlama linki
- Focus management: Modal açıldığında focus trap
- Screen reader announcements: Dynamic content değişikliklerinde live region

**Animation:**
- Micro-interactions: Hover, click feedback iyileştirmeleri
- Skeleton loading: Daha detaylı skeleton patterns

**Mobile:**
- Pull-to-refresh: Liste sayfalarında
- Swipe gestures: Ürün kartlarında swipe actions

**Color System:**
- TODO: Status colors (success/warning/info) for badges/alerts should be tokenized (e.g., `--success`, `--warning`, `--info`) and mapped consistently across components.

**Evidence:** `src/components/ui/input.tsx` (sadece Input var, diğer form components yok), `src/components/product/product-view.tsx` (loading state yok), `src/app/globals.css` (primary kontrast kontrolü yok), `src/components/ui/badge.tsx` (status colors Tailwind palette ile)

---

## Evidence Index

1. **[Design Rules v1.0](../../../design/design-rules-v1.md)** - Theme/token sistemi ve interaction kuralları (tek kaynak doküman)
2. `package.json` - Dependencies (tailwindcss@4, class-variance-authority, framer-motion, sonner, next-themes, @radix-ui/*)
3. `tailwind.config.ts` - Theme config (fontFamily extend, breakpoints default)
4. `src/app/globals.css` - CSS variables (oklch colors, radius, theme variables)
5. `src/app/layout.tsx` - Root layout (ThemeProvider, Toaster, font loading)
6. `src/components/ui/button.tsx` - Button component (CVA variants, sizes, states)
7. `src/components/ui/input.tsx` - Input component (base styles, focus ring)
8. `src/components/ui/badge.tsx` - Badge component (variants including success/warning/info)
9. `src/components/ui/dialog.tsx` - Dialog component (Radix UI, animations)
10. `src/components/ui/drawer.tsx` - Drawer component (Vaul, mobile pattern)
11. `src/components/ui/accordion.tsx` - Accordion component (Radix UI)
12. `src/components/ui/avatar.tsx` - Avatar component (image + fallback)
13. `src/components/ui/skeleton.tsx` - Skeleton component (loading state)
14. `src/components/theme/theme-provider.tsx` - Theme provider (next-themes)
14. `src/components/theme/theme-toggle.tsx` - Theme toggle button
15. `src/components/layout/header.tsx` - Mobile header
16. `src/components/layout/DesktopHeader.tsx` - Desktop header
17. `src/components/app/mobile-bottom-nav.tsx` - Mobile bottom navigation
18. `src/components/app/page-transition.tsx` - Page transition animations (framer-motion)
19. `src/components/product/product-card.tsx` - Product card component
20. `src/components/product/product-view.tsx` - Product detail view (toast usage)
21. `src/components/cart/cart-provider.tsx` - Cart context (addItem function)
22. `src/components/cart/add-to-cart-bar.tsx` - Add to cart bar component
23. `src/lib/utils.ts` - Utility functions (cn helper)
---
