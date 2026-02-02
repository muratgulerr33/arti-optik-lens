import type { Metadata } from "next"
import Link from "next/link"
import { Phone, Instagram, Facebook, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Destek & İletişim | Artı Optik",
  description:
    "Sipariş öncesi ve sonrası destek. Telefon, Instagram, Facebook ve adres bilgileri.",
}

const TEL = "tel:+903242390059"
const INSTAGRAM_URL = "https://instagram.com/artioptikmersin"
const FACEBOOK_URL = "https://facebook.com/artioptikmersin"
const MAP_URL = "https://maps.app.goo.gl/tAQuCv9Az6gK2bAh7"
const MAPS_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3195.013606196081!2d34.613497712017036!3d36.79422416791948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1527f36d9b4a5bc1%3A0x465a4f4607784319!2sArti%20Optik%20Lens!5e0!3m2!1str!2str!4v1769985343003!5m2!1str!2str"

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl space-y-16 px-6 py-12">
        <article className="space-y-16">
          <header className="space-y-4 border-b pb-8">
            <h1 className="font-display text-4xl font-bold tracking-tighter md:text-6xl">
              Destek & İletişim
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              Son güncelleme: 02 Şubat 2026
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

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
            <div className="space-y-8">
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-3xl font-semibold">
                    Adres
                  </h2>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    Konum
                  </span>
                </div>
                <p className="font-body text-base text-muted-foreground">
                  Turgutreis Mahallesi, İstiklal Caddesi
                  <br />
                  IMC Hastanesi yanı, Akdeniz / Mersin — <strong className="text-foreground">33010</strong>
                </p>
                <p className="font-body text-sm text-muted-foreground">
                  <strong className="text-foreground">Plus Code:</strong> QJV8+MC Akdeniz, Mersin
                </p>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-3xl font-semibold">
                    Çalışma Saatleri
                  </h2>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    Saatler
                  </span>
                </div>
                <ul className="list-disc space-y-1 pl-5 font-body text-base text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Hafta içi:</strong> 08:00 – 18:00
                  </li>
                  <li>
                    <strong className="text-foreground">Cumartesi:</strong> 08:00 – 13:00
                  </li>
                  <li>
                    <strong className="text-foreground">Pazar:</strong> Kapalı
                  </li>
                </ul>
              </section>
            </div>

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
          </div>
        </article>
      </div>
    </main>
  )
}
