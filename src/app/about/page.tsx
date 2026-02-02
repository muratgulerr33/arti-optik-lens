import type { Metadata } from "next"
import Link from "next/link"
import { Phone, Instagram, Facebook, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Hakkımızda | Artı Optik",
  description:
    "ARTI OPTİK LENS — Mersin'de göz konforu ve stili bir arada. Güneş gözlüğü, güvenli alışveriş, hızlı destek.",
}

const TEL = "tel:+903242390059"
const INSTAGRAM_URL = "https://instagram.com/artioptikmersin"
const FACEBOOK_URL = "https://facebook.com/artioptikmersin"
const MAP_URL = "https://maps.app.goo.gl/tAQuCv9Az6gK2bAh7"
const MAPS_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3195.013606196081!2d34.613497712017036!3d36.79422416791948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1527f36d9b4a5bc1%3A0x465a4f4607784319!2sArti%20Optik%20Lens!5e0!3m2!1str!2str!4v1769985343003!5m2!1str!2str"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl space-y-16 px-6 py-12">
        <article className="space-y-16">
          <header className="space-y-4 border-b pb-8">
            <h1 className="font-display text-4xl font-bold tracking-tighter md:text-6xl">
              Biz Kimiz?
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              Son güncelleme: 02 Şubat 2026
            </p>
            <p className="font-body max-w-2xl text-base text-muted-foreground">
              Biz <strong>ARTI OPTİK LENS</strong> olarak Mersin&apos;de, gözünüzün
              konforunu ve stilini aynı çizgide buluşturan bir optik mağazayız.
              İşimiz sadece ürün satmak değil; doğru seçimi kolaylaştırmak,
              alışverişi güvenli kılmak ve sizi &quot;iyi ki buradan aldım&quot;
              dedirtmek.
            </p>
            <nav
              className="mt-2 flex flex-wrap gap-3"
              aria-label="Hızlı iletişim"
            >
              <Button variant="outline" size="icon" asChild>
                <Link
                  href={TEL}
                  aria-label="Telefon ile ara"
                  title="Telefon ile ara"
                >
                  <Phone className="size-5" aria-hidden />
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  title="Instagram"
                >
                  <Instagram className="size-5" aria-hidden />
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  title="Facebook"
                >
                  <Facebook className="size-5" aria-hidden />
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link
                  href={MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Yol tarifi al"
                  title="Yol tarifi al"
                >
                  <MapPin className="size-5" aria-hidden />
                </Link>
              </Button>
            </nav>
          </header>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">
                Ne sunuyoruz?
              </h2>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Hizmetler
              </span>
            </div>
            <ul className="list-disc space-y-2 pl-5 font-body text-base text-muted-foreground">
              <li>
                <strong className="text-foreground">Güneş gözlüğü seçimi:</strong> Yüz tipinize ve kullanım
                alışkanlığınıza göre yardımcı oluruz.
              </li>
              <li>
                <strong className="text-foreground">Güvenli alışveriş:</strong> Ödemeler kart ile güvenli
                altyapı üzerinden alınır.
              </li>
              <li>
                <strong className="text-foreground">Hızlı destek:</strong> Sipariş öncesi ve sonrası bize
                kolayca ulaşırsınız.
              </li>
            </ul>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">
                Bizim için önemli olan 3 şey
              </h2>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Değerler
              </span>
            </div>
            <ol className="list-decimal space-y-2 pl-5 font-body text-base text-muted-foreground">
              <li>
                <strong className="text-foreground">Net bilgi:</strong> Ürün, fiyat, teslimat ve iade
                süreçlerini açık ve anlaşılır yazarız.
              </li>
              <li>
                <strong className="text-foreground">Ulaşılabilirlik:</strong> Mesaj attığınızda &quot;boşlukta
                kalmasın&quot; istersiniz — biz de bunu önemseriz.
              </li>
              <li>
                <strong className="text-foreground">Tutarlılık:</strong> Bugün iyi, yarın kötü değil; her
                siparişte aynı özen.
              </li>
            </ol>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">
                Mağazamız
              </h2>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Adres
              </span>
            </div>
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="font-display tracking-tighter">
                  Mağazamız
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 font-body text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Adres:</strong> Turgutreis Mahallesi, İstiklal Caddesi, IMC
                  Hastanesi yanı, Akdeniz/Mersin <strong className="text-foreground">33010</strong>
                </p>
                <p>
                  <strong className="text-foreground">Telefon:</strong> (0324) 239 00 59
                </p>
                <p>
                  <strong className="text-foreground">Instagram / Facebook:</strong> @artioptikmersin
                </p>
                <p className="flex items-center gap-2">
                  <strong className="text-foreground">Yol tarifi:</strong>
                  <Button variant="outline" size="icon" asChild>
                    <Link
                      href={MAP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Yol tarifi al"
                      title="Yol tarifi al"
                    >
                      <MapPin className="size-5" aria-hidden />
                    </Link>
                  </Button>
                </p>
                <p className="font-medium text-foreground">Çalışma saatleri</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Hafta içi: <strong className="text-foreground">08:00 – 18:00</strong></li>
                  <li>Cumartesi: <strong className="text-foreground">08:00 – 13:00</strong></li>
                  <li>Pazar: <strong className="text-foreground">Kapalı</strong></li>
                </ul>
                <p>
                  <strong className="text-foreground">İşletme sahibi:</strong> Mahmut Turmuş
                </p>
              </CardContent>
            </Card>
          </section>

          <Card className="overflow-hidden">
            <div className="relative w-full bg-card aspect-[16/9]">
              <iframe
                src={MAPS_EMBED_SRC}
                title="ARTI OPTİK LENS Harita"
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </Card>
        </article>
      </div>
    </main>
  )
}
