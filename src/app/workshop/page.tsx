import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * FONT WORKSHOP SAYFASI
 * 4 Display Font Adayını Yan Yana Karşılaştırma
 * 
 * Bu sayfa, Artı Optik için 4 farklı display font seçeneğini
 * aynı içerikle karşılaştırarak görsel seçim yapmanıza yardımcı olur.
 */

const fontConfigs = [
  {
    id: "cormorant",
    name: "Cormorant Garamond",
    style: "Lüks Miras",
    fontClass: "font-cormorant",
    description: "Klasik serif, zamansız lüks",
    color: "text-rose-700",
  },
  {
    id: "dm",
    name: "DM Sans",
    style: "Tech Luxury",
    fontClass: "font-dm",
    description: "Native app hissi, modern teknoloji",
    color: "text-blue-600",
  },
  {
    id: "outfit",
    name: "Outfit",
    style: "Gelecek Minimalist",
    fontClass: "font-outfit",
    description: "Sade, gelecek odaklı",
    color: "text-slate-700",
  },
  {
    id: "figtree",
    name: "Figtree",
    style: "Dostane Premium",
    fontClass: "font-figtree",
    description: "Sıcak, erişilebilir lüks",
    color: "text-amber-700",
  },
];

export default function WorkshopPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Başlık Bölümü */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-cormorant text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Font Workshop
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Artı Optik için 4 farklı display font seçeneğini karşılaştırın.
            Aynı içerik, farklı karakterler.
          </p>
        </div>

        {/* Grid: 1 col mobile, 2 col tablet, 4 col desktop */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {fontConfigs.map((config) => (
            <div
              key={config.id}
              className="flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Badge ve Font Adı */}
              <div className="flex items-center justify-between border-b pb-3">
                <Badge variant="outline" className="text-xs font-medium">
                  {config.style}
                </Badge>
                <span className="text-xs font-medium text-muted-foreground">
                  {config.name}
                </span>
              </div>

              {/* Örnek Başlık - Ana Karşılaştırma Noktası */}
              <div className="space-y-2">
                <h2
                  className={cn(
                    "text-2xl font-semibold leading-tight tracking-tight",
                    config.fontClass
                  )}
                >
                  Zamansız Stil, Modern Vizyon
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {config.description}
                </p>
              </div>

              {/* Primary Button - CTA Karşılaştırması */}
              <Button
                className={cn(
                  "w-full font-semibold uppercase tracking-wider transition-all",
                  config.fontClass
                )}
                variant="default"
              >
                SEPETE EKLE
              </Button>

              {/* Product Card Mockup - Gerçek Kullanım Senaryosu */}
              <Card className="overflow-hidden border-2">
                <div className="relative aspect-square w-full bg-muted">
                  {/* Placeholder Image */}
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted via-muted/80 to-muted/60">
                    <div className="text-center">
                      <div className="mx-auto mb-3 h-20 w-20 rounded-full bg-primary/10 ring-2 ring-primary/20" />
                      <p className="text-xs font-medium text-muted-foreground">
                        Ürün Görseli
                      </p>
                    </div>
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle
                    className={cn(
                      "text-lg font-semibold leading-tight",
                      config.fontClass
                    )}
                  >
                    Ray-Ban Aviator Classic
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-baseline justify-between">
                    <span className="font-numbers text-2xl font-bold text-foreground">
                      2.499 ₺
                    </span>
                    <span className="font-numbers text-sm text-muted-foreground line-through">
                      3.299 ₺
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Font Detayları */}
              <div className="mt-auto space-y-2 border-t pt-4">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Font Ailesi:</span>
                    <span className="font-medium">{config.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Karakter:</span>
                    <span className="font-medium">{config.style}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kullanım:</span>
                    <span className="font-medium">Display / Başlık</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Karşılaştırma Notları ve Öneriler */}
        <div className="mt-12 space-y-6">
          <div className="rounded-xl border bg-muted/30 p-6">
            <h3 className="mb-4 font-semibold text-lg">Karşılaştırma Notları</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-semibold text-foreground min-w-[140px]">
                  Cormorant Garamond:
                </span>
                <span>
                  Klasik lüks markalar için ideal. Serif karakteri zamansız bir
                  his verir. Yüksek kaliteli, geleneksel lüks markalar için
                  mükemmel.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground min-w-[140px]">
                  DM Sans:
                </span>
                <span>
                  Modern teknoloji markaları için uygun. Native mobil uygulama
                  deneyimi sunar. Temiz, profesyonel ve çağdaş bir görünüm.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground min-w-[140px]">
                  Outfit:
                </span>
                <span>
                  Minimalist ve gelecek odaklı. Sade tasarımlar için mükemmel.
                  Geniş karakter aralığı ile okunabilirlik yüksek.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground min-w-[140px]">
                  Figtree:
                </span>
                <span>
                  Dostane ve erişilebilir. Premium ama samimi bir ton. Genç ve
                  dinamik bir kitleye hitap eder.
                </span>
              </li>
            </ul>
          </div>

          {/* Kullanım Önerileri */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="mb-3 font-semibold text-lg">Seçim Kriterleri</h3>
            <div className="grid gap-4 text-sm md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-medium text-foreground">
                  Lüks & Klasik Marka İmajı
                </h4>
                <p className="text-muted-foreground">
                  <strong>Cormorant Garamond</strong> - Geleneksel lüks, yüksek
                  kalite vurgusu
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-medium text-foreground">
                  Modern & Teknolojik
                </h4>
                <p className="text-muted-foreground">
                  <strong>DM Sans</strong> - Çağdaş, profesyonel, native app
                  deneyimi
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-medium text-foreground">
                  Minimalist & Gelecekçi
                </h4>
                <p className="text-muted-foreground">
                  <strong>Outfit</strong> - Sade, temiz, gelecek odaklı
                  tasarım
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-medium text-foreground">
                  Dostane & Erişilebilir
                </h4>
                <p className="text-muted-foreground">
                  <strong>Figtree</strong> - Samimi, genç, dinamik kitle
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
