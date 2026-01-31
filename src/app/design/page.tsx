"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Moon, Sun, Palette, Type, MousePointerClick, FileText, Package, Zap, CheckCircle2, AlertCircle } from "lucide-react"
import { formatPrice } from "@/lib/utils"

export default function DesignPage() {
  const { resolvedTheme, setTheme } = useTheme()
  const [tokenValues, setTokenValues] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)
  const [toggleLocked, setToggleLocked] = useState(false)
  const [a11yCheck, setA11yCheck] = useState<{
    buttonHeights: Record<string, number>
    inputHeight: number
    hasFocusVisible: boolean
  }>({
    buttonHeights: {},
    inputHeight: 0,
    hasFocusVisible: false,
  })
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const readTokenValue = (tokenName: string): string => {
    if (typeof window === 'undefined') return ''
    const html = document.documentElement
    const computed = getComputedStyle(html)
    return computed.getPropertyValue(tokenName).trim() || ''
  }

  useEffect(() => {
    if (!mounted) return
    
    // Read token values from computed styles
    const tokens: Record<string, string> = {
      primary: readTokenValue('--primary'),
      background: readTokenValue('--background'),
      colorBackground: readTokenValue('--color-background'),
      card: readTokenValue('--card'),
      destructive: readTokenValue('--destructive'),
      secondary: readTokenValue('--secondary'),
    }
    // Use setTimeout to defer state update and avoid synchronous setState in effect
    setTimeout(() => {
      setTokenValues(tokens)
    }, 0)
  }, [mounted, resolvedTheme])

  // A11y/Interaction Check
  useEffect(() => {
    if (!mounted) return

    const checkA11y = () => {
      // Check button heights
      const buttonHeights: Record<string, number> = {}
      const buttonSizes = ['default', 'sm', 'xs', 'icon']
      buttonSizes.forEach(size => {
        const btn = document.querySelector(`[data-size="${size}"]`) as HTMLElement
        if (btn) {
          const height = btn.getBoundingClientRect().height
          buttonHeights[size] = height
        }
      })

      // Check input height
      const input = document.querySelector('[data-slot="input"]') as HTMLElement
      const inputHeight = input ? input.getBoundingClientRect().height : 0

      // Check focus-visible styles (simple heuristic)
      const testBtn = document.querySelector('[data-slot="button"]') as HTMLElement
      let hasFocusVisible = false
      if (testBtn) {
        testBtn.focus()
        const computed = window.getComputedStyle(testBtn)
        const hasRing = computed.outlineWidth !== '0px' || computed.boxShadow !== 'none'
        hasFocusVisible = hasRing
        testBtn.blur()
      }

      setA11yCheck({
        buttonHeights,
        inputHeight,
        hasFocusVisible,
      })
    }

    // Run check after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(checkA11y, 500)
    return () => clearTimeout(timeoutId)
  }, [mounted])

  // Hydration mismatch'i kesin bitirmek için mounted olmadan render etme
  if (!mounted) {
    return <div className="min-h-screen bg-background" />
  }

  const isDark = mounted && resolvedTheme === "dark"

  const toggleTheme = () => {
    // Spam click engeli
    if (toggleLocked) return
    
    // DOM'dan gerçek state'i oku
    const isCurrentlyDark = typeof document !== 'undefined' && document.documentElement.classList.contains("dark")
    
    // Lock'u aktif et
    setToggleLocked(true)
    
    // Theme'i değiştir
    setTheme(isCurrentlyDark ? "light" : "dark")
    
    // 250ms sonra lock'u kaldır
    setTimeout(() => {
      setToggleLocked(false)
    }, 250)
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        
        {/* HEADER WITH THEME TOGGLE */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b pb-8">
          <div className="space-y-2">
            <Badge variant="outline" className="tracking-widest uppercase text-xs">
              Artı Optik Design System v1.0
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tighter">
              Living <span className="text-primary">Style</span> Guide
            </h1>
            <p className="font-body text-muted-foreground text-base max-w-2xl">
              Final design system with DM Sans (Tech Luxury) typography. 
              Ferrari Red + Espresso Dark palette. Native App interface feel.
            </p>
          </div>
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="lg"
            className="gap-2 font-medium"
            disabled={toggleLocked}
            aria-disabled={toggleLocked}
          >
            {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
            {toggleLocked ? "Switching…" : (isDark ? "Light Mode" : "Dark Mode")}
          </Button>
        </header>

        {/* SECTION 1: COLOR PALETTE */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Palette className="size-6 text-primary" />
            <h2 className="font-display text-3xl font-semibold">Color Palette</h2>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">The DNA</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Primary */}
            <Card className="overflow-hidden border-2 border-primary/20">
              <div className="h-32 bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display text-xl font-bold tracking-tighter">
                  Ferrari Red
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-sm font-mono">--primary</CardTitle>
                <CardDescription className="text-xs font-mono">
                  {tokenValues.primary || 'oklch(0.56 0.235 27.3)'}
                </CardDescription>
                <p className="text-xs text-muted-foreground mt-1">
                  ✓ Same vivid red in both Light & Dark modes
                </p>
              </CardHeader>
            </Card>

            {/* Secondary */}
            <Card className="overflow-hidden border-2">
              <div className="h-32 bg-secondary flex items-center justify-center border">
                <span className="text-secondary-foreground font-display text-xl font-bold">
                  Muted Grey
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-sm font-mono">--secondary</CardTitle>
                <CardDescription className="text-xs">
                  {tokenValues.secondary || 'oklch(0.94 0.012 95)'}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Background */}
            <Card className="overflow-hidden border-2">
              <div className="h-32 bg-background flex items-center justify-center border-2 border-dashed">
                <span className="text-foreground font-display text-xl font-bold" suppressHydrationWarning>
                  {mounted ? (isDark ? "Espresso" : "Pudra") : "Pudra"}
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-sm font-mono">--background</CardTitle>
                <CardDescription className="text-xs font-mono">
                  {tokenValues.background || (isDark ? "oklch(0.20 0.012 55)" : "oklch(0.975 0.016 95)")}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card */}
            <Card className="overflow-hidden border-2">
              <div className="h-32 bg-card flex items-center justify-center border">
                <span className="text-card-foreground font-display text-xl font-bold">
                  Surface
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-sm font-mono">--card</CardTitle>
                <CardDescription className="text-xs">
                  {tokenValues.card || (isDark ? "oklch(0.235 0.010 55)" : "oklch(1 0 0)")}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Destructive */}
            <Card className="overflow-hidden border-2">
              <div className="h-32 bg-destructive flex items-center justify-center">
                <span className="text-destructive-foreground font-display text-xl font-bold">
                  Error
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-sm font-mono">--destructive</CardTitle>
                <CardDescription className="text-xs">
                  {tokenValues.destructive || tokenValues.primary || 'oklch(0.56 0.235 27.3)'}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Muted */}
            <Card className="overflow-hidden border-2">
              <div className="h-32 bg-muted flex items-center justify-center border">
                <span className="text-muted-foreground font-display text-xl font-bold">
                  Muted
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-sm font-mono">--muted</CardTitle>
                <CardDescription className="text-xs">Subtle backgrounds</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Primary Color Consistency Notice */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Primary Color Consistency
              </CardTitle>
              <CardDescription>
                The Ferrari Red (Shadcn Red) remains exactly the same vivid color in both Light and Dark modes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Light Mode</p>
                  <div className="h-16 bg-primary rounded-md flex items-center justify-center">
                    <span className="text-primary-foreground font-mono text-xs">
                      {tokenValues.primary || 'oklch(0.56 0.235 27.3)'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Dark Mode</p>
                  <div className="h-16 bg-primary rounded-md flex items-center justify-center">
                    <span className="text-primary-foreground font-mono text-xs">
                      {tokenValues.primary || 'oklch(0.58 0.225 27.3)'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SECTION 2: TYPOGRAPHY */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Type className="size-6 text-primary" />
            <h2 className="font-display text-3xl font-semibold">Typography Scale</h2>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">The Voice</span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Display Font: DM Sans</CardTitle>
              <CardDescription>
                Tech Luxury / Native App Feel • Used for headings and hero text
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">H1</p>
                <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tighter">
                  Ferrari Red & Espresso Dark
                </h1>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">H2</p>
                <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tighter">
                  Premium Eyewear Collection
                </h2>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">H3</p>
                <h3 className="font-display text-3xl font-semibold tracking-tight">
                  Luxury Design System
                </h3>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">H4</p>
                <h4 className="font-display text-2xl font-medium">
                  Artı Optik Brand Guidelines
                </h4>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>Style Note:</strong> DM Sans provides a modern, clean aesthetic with 
                  excellent readability. Perfect for native app interfaces and contemporary luxury brands.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Body Font: Plus Jakarta Sans</CardTitle>
              <CardDescription>Used for paragraphs, UI text, and body content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-body text-base leading-relaxed">
                Artı Optik, modern teknolojiyi geleneksel optik ustalığıyla birleştirir. 
                Her çerçeve, özenle seçilmiş malzemelerden üretilir ve mükemmel bir 
                görsel deneyim sunar. Bu metin okunabilirlik testi için yazılmıştır.
              </p>
              <p className="font-body text-sm leading-relaxed text-muted-foreground">
                Küçük boyutlu metin örneği. Bu font, uzun okuma metinleri için optimize edilmiştir 
                ve göz yormayan geometrik yapıya sahiptir.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Numbers Font: Manrope</CardTitle>
              <CardDescription>Used for pricing, numerical data, and financial information with tabular-nums</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                    Pricing Example
                  </p>
                  <div className="font-numbers text-4xl font-bold text-primary tabular-nums">
                    {formatPrice(15450 * 100)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Regular</p>
                    <p className="font-numbers text-2xl font-semibold tabular-nums">{formatPrice(2500 * 100)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Sale</p>
                    <p className="font-numbers text-2xl font-semibold text-destructive tabular-nums line-through">
                      {formatPrice(3200 * 100)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Final</p>
                    <p className="font-numbers text-2xl font-bold text-primary tabular-nums">{formatPrice(2500 * 100)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Letter Spacing</CardTitle>
              <CardDescription>Tracking utilities for luxury feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">tracking-tighter</p>
                <p className="font-display text-2xl tracking-tighter">
                  Tighter spacing for impact
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">tracking-widest</p>
                <p className="font-display text-xl tracking-widest uppercase">
                  Widest spacing for elegance
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SECTION 3: BUTTON MATRIX */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <MousePointerClick className="size-6 text-primary" />
            <h2 className="font-display text-3xl font-semibold">Button Matrix</h2>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">The Interaction</span>
          </div>

          <div className="space-y-8">
            {/* Default Variants */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl font-semibold">All Variants</h3>
                <Badge variant="outline" className="text-xs">
                  Primary: Same in both modes
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Button variant="default" className="w-full">Default</Button>
                  <p className="text-xs text-muted-foreground text-center">Solid Red</p>
                  <p className="text-xs text-primary/70 text-center font-mono">
                    {tokenValues.primary || 'oklch(0.56 0.235 27.3)'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Button variant="secondary" className="w-full">Secondary</Button>
                  <p className="text-xs text-muted-foreground text-center">Grey/Muted</p>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">Outline</Button>
                  <p className="text-xs text-muted-foreground text-center">Border Only</p>
                </div>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full">Ghost</Button>
                  <p className="text-xs text-muted-foreground text-center">Text Only</p>
                </div>
                <div className="space-y-2">
                  <Button variant="link" className="w-full">Link</Button>
                  <p className="text-xs text-muted-foreground text-center">Underlined</p>
                </div>
                <div className="space-y-2">
                  <Button variant="destructive" className="w-full">Destructive</Button>
                  <p className="text-xs text-muted-foreground text-center">Error State</p>
                </div>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="font-display text-xl font-semibold mb-4">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="default" size="xs">Extra Small</Button>
                <Button variant="default" size="sm">Small</Button>
                <Button variant="default" size="default">Default</Button>
                <Button variant="default" size="lg">Large</Button>
              </div>
            </div>

            {/* States */}
            <div>
              <h3 className="font-display text-xl font-semibold mb-4">States</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Normal</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="default">Normal</Button>
                    <Button variant="outline">Normal</Button>
                    <Button variant="ghost">Normal</Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Hover (simulated)</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="default" className="hover:bg-primary/90">Hover</Button>
                    <Button variant="outline" className="hover:bg-accent">Hover</Button>
                    <Button variant="ghost" className="hover:bg-accent">Hover</Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Disabled</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="default" disabled>Disabled</Button>
                    <Button variant="outline" disabled>Disabled</Button>
                    <Button variant="ghost" disabled>Disabled</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: FORM ELEMENTS */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <FileText className="size-6 text-primary" />
            <h2 className="font-display text-3xl font-semibold">Form Elements</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Input Field</CardTitle>
                <CardDescription>Click to see the ring color (Primary Red focus state)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input type="email" placeholder="ornek@email.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Disabled Input</label>
                  <Input type="text" placeholder="Disabled" disabled />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Textarea</CardTitle>
                <CardDescription>Multi-line text input</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow,border-color] duration-motion ease-motion-out placeholder:text-muted-foreground hover:border-ring/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-[var(--disabled-opacity)]"
                    placeholder="Mesajınızı buraya yazın..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Checkbox</CardTitle>
                <CardDescription>Selection controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Accept terms and conditions
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="newsletter" defaultChecked />
                  <label
                    htmlFor="newsletter"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Subscribe to newsletter
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="disabled" disabled />
                  <label
                    htmlFor="disabled"
                    className="text-sm font-medium leading-none text-muted-foreground"
                  >
                    Disabled checkbox
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SECTION 5: NATIVE APP INTERACTION SYSTEM */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Zap className="size-6 text-primary" />
            <h2 className="font-display text-3xl font-semibold">Native App Interaction System</h2>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Touch • Focus • Motion</span>
          </div>

          {/* Touch Target Matrix */}
          <Card>
            <CardHeader>
              <CardTitle>Touch Target Matrix</CardTitle>
              <CardDescription>
                All interactive controls meet the 44px minimum touch target requirement (WCAG 2.5.5)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="relative inline-block">
                    <div className="absolute -inset-2 border-2 border-dashed border-primary/30 rounded-md pointer-events-none">
                      <div className="absolute top-0 left-0 w-11 h-11 border-2 border-primary/50 rounded-md" />
                      <div className="absolute bottom-0 right-0 text-xs text-primary/70 font-mono">
                        44px
                      </div>
                    </div>
                    <Button variant="default" size="default" data-size="default">
                      Default Button
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Height: {a11yCheck.buttonHeights.default ? `${Math.round(a11yCheck.buttonHeights.default)}px` : 'Checking...'}
                    {a11yCheck.buttonHeights.default && a11yCheck.buttonHeights.default >= 44 ? (
                      <span className="text-green-600 ml-2">✓</span>
                    ) : (
                      <span className="text-red-600 ml-2">✗</span>
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="relative inline-block">
                    <div className="absolute -inset-2 border-2 border-dashed border-primary/30 rounded-md pointer-events-none">
                      <div className="absolute top-0 left-0 w-11 h-11 border-2 border-primary/50 rounded-md" />
                      <div className="absolute bottom-0 right-0 text-xs text-primary/70 font-mono">
                        44px
                      </div>
                    </div>
                    <Button variant="default" size="sm" data-size="sm">
                      Small Button
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Height: {a11yCheck.buttonHeights.sm ? `${Math.round(a11yCheck.buttonHeights.sm)}px` : 'Checking...'}
                    {a11yCheck.buttonHeights.sm && a11yCheck.buttonHeights.sm >= 44 ? (
                      <span className="text-green-600 ml-2">✓</span>
                    ) : (
                      <span className="text-red-600 ml-2">✗</span>
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="relative inline-block">
                    <div className="absolute -inset-2 border-2 border-dashed border-primary/30 rounded-md pointer-events-none">
                      <div className="absolute top-0 left-0 w-11 h-11 border-2 border-primary/50 rounded-md" />
                      <div className="absolute bottom-0 right-0 text-xs text-primary/70 font-mono">
                        44px
                      </div>
                    </div>
                    <Button variant="default" size="icon" data-size="icon">
                      <MousePointerClick className="size-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Size: {a11yCheck.buttonHeights.icon ? `${Math.round(a11yCheck.buttonHeights.icon)}px` : 'Checking...'}
                    {a11yCheck.buttonHeights.icon && a11yCheck.buttonHeights.icon >= 44 ? (
                      <span className="text-green-600 ml-2">✓</span>
                    ) : (
                      <span className="text-red-600 ml-2">✗</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> Small and extra-small buttons use invisible hit area expansion via pseudo-elements to maintain visual size while meeting accessibility requirements.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Focus Ring Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Focus Ring System</CardTitle>
              <CardDescription>
                Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Tab</kbd> to navigate and see the focus ring. Only appears on keyboard navigation (focus-visible), not mouse clicks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Primary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Input type="text" placeholder="Focus me with Tab" className="w-48" />
                <Button variant="secondary">Secondary</Button>
              </div>
              <div className="pt-4 border-t space-y-2">
                <p className="text-xs text-muted-foreground">
                  <strong>Focus Ring Features:</strong>
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>2px ring with 2px offset for clear separation</li>
                  <li>Subtle 1px outline for dark mode clarity</li>
                  <li>Only visible on keyboard navigation (focus-visible)</li>
                  <li>Consistent across all interactive components</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Motion Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Motion & Micro-interactions</CardTitle>
              <CardDescription>
                Hover and press to experience native app feel with subtle animations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Hover States</p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="default">Hover Me</Button>
                    <Button variant="outline">Hover Me</Button>
                    <Button variant="ghost">Hover Me</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Shadow elevation increases on hover for tactile feedback
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Pressed States</p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="default">Press Me</Button>
                    <Button variant="outline">Press Me</Button>
                    <Button variant="ghost">Press Me</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Subtle scale-down (0.99) + shadow decrease for tactile response
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <p className="text-xs text-muted-foreground">
                  <strong>Motion Tokens:</strong>
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Fast: 120ms (pressed micro-interactions)</li>
                  <li>Default: 180ms (standard transitions)</li>
                  <li>Slow: 240ms (complex animations)</li>
                  <li>Easing: Native app feel (cubic-bezier curves)</li>
                  <li>Reduced motion: Automatically respects user preferences</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* A11y/Interaction Check Panel */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {a11yCheck.hasFocusVisible && 
                 Object.values(a11yCheck.buttonHeights).every(h => h >= 44) &&
                 a11yCheck.inputHeight >= 44 ? (
                  <CheckCircle2 className="size-5 text-green-600" />
                ) : (
                  <AlertCircle className="size-5 text-yellow-600" />
                )}
                A11y/Interaction Check
              </CardTitle>
              <CardDescription>
                Runtime verification of accessibility and interaction requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Touch Targets (≥44px)</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Default Button:</span>
                      <span className={a11yCheck.buttonHeights.default && a11yCheck.buttonHeights.default >= 44 ? 'text-green-600' : 'text-red-600'}>
                        {a11yCheck.buttonHeights.default ? `${Math.round(a11yCheck.buttonHeights.default)}px` : 'Checking...'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Small Button:</span>
                      <span className={a11yCheck.buttonHeights.sm && a11yCheck.buttonHeights.sm >= 44 ? 'text-green-600' : 'text-red-600'}>
                        {a11yCheck.buttonHeights.sm ? `${Math.round(a11yCheck.buttonHeights.sm)}px` : 'Checking...'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Icon Button:</span>
                      <span className={a11yCheck.buttonHeights.icon && a11yCheck.buttonHeights.icon >= 44 ? 'text-green-600' : 'text-red-600'}>
                        {a11yCheck.buttonHeights.icon ? `${Math.round(a11yCheck.buttonHeights.icon)}px` : 'Checking...'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Input Field:</span>
                      <span className={a11yCheck.inputHeight >= 44 ? 'text-green-600' : 'text-red-600'}>
                        {a11yCheck.inputHeight ? `${Math.round(a11yCheck.inputHeight)}px` : 'Checking...'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Focus System</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Focus-visible styles:</span>
                      <span className={a11yCheck.hasFocusVisible ? 'text-green-600' : 'text-red-600'}>
                        {a11yCheck.hasFocusVisible ? '✓ Detected' : '✗ Not detected'}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        <strong>Keyboard Navigation:</strong> Press Tab to test focus rings. They should only appear on keyboard navigation, not mouse clicks.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SECTION 5: COMPONENTS IN CONTEXT */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Package className="size-6 text-primary" />
            <h2 className="font-display text-3xl font-semibold">Components in Context</h2>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Real Usage</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Product Card 1 */}
            <Card className="overflow-hidden border-2 shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-64 bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Product Image</span>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <Badge variant="outline" className="mb-2 text-xs tracking-widest uppercase">
                      Ray-Ban
                    </Badge>
                    <CardTitle className="font-display text-2xl tracking-tight">
                      Wayfarer Ferrari Ed.
                    </CardTitle>
                  </div>
                  <Badge variant="secondary" className="font-numbers">New</Badge>
                </div>
                <CardDescription className="font-body text-sm">
                  Classic design meets luxury materials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground line-through">{formatPrice(8750 * 100)}</p>
                    <p className="font-numbers text-2xl font-bold text-primary tabular-nums">
                      {formatPrice(6990 * 100)}
                    </p>
                  </div>
                </div>
                <Button className="w-full" size="lg">
                  Add to Cart
                </Button>
              </CardContent>
            </Card>

            {/* Product Card 2 */}
            <Card className="overflow-hidden border-2 shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-64 bg-gradient-to-br from-secondary/30 to-muted flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Product Image</span>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <Badge variant="outline" className="mb-2 text-xs tracking-widest uppercase">
                      Oakley
                    </Badge>
                    <CardTitle className="font-display text-2xl tracking-tight">
                      Holbrook Premium
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="font-body text-sm">
                  Sporty elegance with premium finish
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <p className="font-numbers text-2xl font-bold text-primary tabular-nums">
                    {formatPrice(12450 * 100)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Details
                  </Button>
                  <Button className="flex-1">Buy Now</Button>
                </div>
              </CardContent>
            </Card>

            {/* Product Card 3 */}
            <Card className="overflow-hidden border-2 shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-64 bg-gradient-to-br from-destructive/20 to-muted flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Product Image</span>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <Badge variant="outline" className="mb-2 text-xs tracking-widest uppercase">
                      Persol
                    </Badge>
                    <CardTitle className="font-display text-2xl tracking-tight">
                      Vintage Collection
                    </CardTitle>
                  </div>
                  <Badge variant="destructive" className="font-numbers">Sale</Badge>
                </div>
                <CardDescription className="font-body text-sm">
                  Timeless Italian craftsmanship
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground line-through">{formatPrice(15900 * 100)}</p>
                    <p className="font-numbers text-2xl font-bold text-primary tabular-nums">
                      {formatPrice(11900 * 100)}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" className="w-full">
                  View Details
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* RUNTIME CHECK SECTION */}
        <section className="space-y-6">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-primary">🔍</span>
                Runtime Token Verification
              </CardTitle>
              <CardDescription>
                Live token values from getComputedStyle - Check browser console for detailed logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-muted-foreground">--background</p>
                    {tokenValues.background !== tokenValues.colorBackground && (
                      <Badge variant="destructive" className="text-xs">Mismatch</Badge>
                    )}
                  </div>
                  <p className="text-sm font-mono bg-background p-2 rounded border">
                    {tokenValues.background || 'Loading...'}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-muted-foreground">--color-background</p>
                    {tokenValues.background !== tokenValues.colorBackground && (
                      <Badge variant="destructive" className="text-xs">Mismatch</Badge>
                    )}
                  </div>
                  <p className="text-sm font-mono bg-background p-2 rounded border">
                    {tokenValues.colorBackground || 'Loading...'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Computed backgroundColor</p>
                  <p className="text-sm font-mono bg-background p-2 rounded border">
                    {mounted && typeof window !== 'undefined'
                      ? getComputedStyle(document.querySelector('.bg-background') ?? document.body).backgroundColor
                      : 'Loading...'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">--card</p>
                  <p className="text-sm font-mono bg-card p-2 rounded border">
                    {tokenValues.card || 'Loading...'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">--primary</p>
                  <p className="text-sm font-mono bg-primary text-primary-foreground p-2 rounded">
                    {tokenValues.primary || 'Loading...'}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t space-y-2">
                <p className="text-xs text-muted-foreground">
                  <strong>Dark Mode Check:</strong> {isDark ? 'Active' : 'Inactive'} • 
                  Class location: <code className="text-xs">document.documentElement</code>
                </p>
                {tokenValues.background && tokenValues.colorBackground && (
                  <p className={`text-xs ${tokenValues.background !== tokenValues.colorBackground ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                    <strong>Token Sync:</strong> {tokenValues.background === tokenValues.colorBackground ? '✓ In sync' : '✗ Mismatch detected'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FOOTER */}
        <footer className="border-t pt-8 mt-16">
          <p className="text-center text-sm text-muted-foreground font-body">
            Artı Optik Design System v1.0 • DM Sans (Tech Luxury) • Ferrari Red + Espresso Dark Palette
          </p>
        </footer>

      </div>
    </div>
  )
}
