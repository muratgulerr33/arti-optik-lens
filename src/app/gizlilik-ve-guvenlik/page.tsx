import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Gizlilik ve Güvenlik | ARTI OPTİK LENS",
  description:
    "Kişisel veriler, hesap güvenliği ve ödeme güvenliği hakkında bilgilendirme.",
}

export default function GizlilikVeGuvenlikPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl space-y-16 px-6 py-12">
        <article className="space-y-16">
          <header className="space-y-4 border-b pb-8">
            <h1 className="font-display text-4xl font-bold tracking-tighter md:text-6xl">
              Gizlilik ve güvenlik
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              Son güncelleme: 02 Şubat 2026
            </p>
            <p className="font-body max-w-2xl text-base text-muted-foreground">
              ARTI OPTİK LENS&apos;te amaç basit: siparişini doğru şekilde tamamlamak
              ve seni yarı yolda bırakmamak. Bu sayfada hangi veriyi neden
              aldığımızı, nasıl koruduğumuzu ve hangi haklara sahip olduğunu
              netçe anlatıyoruz.
            </p>
          </header>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">
                Hangi verileri toplarız?
              </h2>
            </div>
            <ul className="list-disc space-y-2 pl-5 font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              <li>
                <strong className="text-foreground">Hesap/üyelik:</strong> ad-soyad,
                telefon, adres bilgileri (sipariş için)
              </li>
              <li>
                <strong className="text-foreground">Sipariş:</strong> ürün,
                teslimat, fatura/teslimat bilgileri
              </li>
              <li>
                <strong className="text-foreground">Teknik:</strong> cihaz tarayıcı
                bilgileri, hata kayıtları (siteyi stabil tutmak için)
              </li>
            </ul>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">
                Neden işleriz?
              </h2>
            </div>
            <ul className="list-disc space-y-2 pl-5 font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              <li>Siparişi almak, hazırlamak, teslim etmek</li>
              <li>İade/iptal süreçlerini yönetmek</li>
              <li>Dolandırıcılık/şüpheli işlemleri önlemek</li>
              <li>Müşteri desteği sağlamak</li>
            </ul>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">
                Ödeme güvenliği
              </h2>
            </div>
            <p className="font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              Ödemeler kart ile güvenli altyapı üzerinden alınır (kart bilgilerini
              biz saklamayız). 3D Secure / bankacılık doğrulaması gibi kontroller
              devreye girebilir. Şüpheli durumda siparişi doğrulama amaçlı
              iletişime geçebiliriz.
            </p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">
                Verileri ne kadar tutarız?
              </h2>
            </div>
            <p className="font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              &quot;Gerekli olduğu süre boyunca&quot; prensibi: sipariş ve destek
              süreçleri için gerekli süre + mevzuat gereklilikleri. Süresi dolan
              kayıtlar mümkün olduğunda silinir/anonimleştirilir.
            </p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">
                Kimlerle paylaşırız?
              </h2>
            </div>
            <ul className="list-disc space-y-2 pl-5 font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              <li>
                Kargo/teslimat için taşıyıcı firmalar (adres teslimi için gerekli
                kadar)
              </li>
              <li>
                Ödeme altyapısı sağlayıcıları (ödeme işlemi için gerekli kadar)
              </li>
              <li>Yasal zorunluluklar (resmî talep halinde)</li>
            </ul>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">Hakların</h2>
            </div>
            <p className="font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              Verine erişme, düzeltme, silme talep etme, işlemeye itiraz etme vb.
              Talep için en hızlı yol: /support sayfası üzerinden bize ulaş.
            </p>
          </section>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="font-display tracking-tighter">
                Yardım
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 font-body text-sm text-muted-foreground md:text-base">
              <p>
                Soruların mı var? Destek ekibimiz size ulaşmanız için burada.
              </p>
              <Button variant="outline" asChild>
                <Link href="/support">Destek & İletişim</Link>
              </Button>
            </CardContent>
          </Card>
        </article>
      </div>
    </main>
  )
}
