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
  title: "Mesafeli Satış Sözleşmesi | ARTI OPTİK LENS",
  description:
    "Mesafeli satış sözleşmesi genel şartları.",
}

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl space-y-16 px-6 py-12">
        <article className="space-y-16">
          <header className="space-y-4 border-b pb-8">
            <h1 className="font-display text-4xl font-bold tracking-tighter md:text-6xl">
              Mesafeli satış sözleşmesi
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              Son güncelleme: 02 Şubat 2026
            </p>
            <p className="font-body max-w-2xl text-base text-muted-foreground">
              Bu metin, siparişin sırasında gördüğün ön bilgilendirme ve sipariş
              özetiyle birlikte çalışır. Amacımız: &quot;sonradan sürpriz&quot;
              olmaması.
            </p>
          </header>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">Taraflar</h2>
            </div>
            <ul className="list-disc space-y-2 pl-5 font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              <li>
                <strong className="text-foreground">Satıcı:</strong> ARTI OPTİK
                LENS (Mersin)
              </li>
              <li>
                <strong className="text-foreground">Alıcı:</strong> Siparişi
                veren kullanıcı (üyelik/checkout bilgileri)
              </li>
              <li>
                <strong className="text-foreground">İletişim:</strong> /support
                sayfası
              </li>
            </ul>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">Konu</h2>
            </div>
            <p className="font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              Sözleşmenin konusu: internet üzerinden ürün satışı ve teslimi
            </p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">
                Ürün, fiyat, sipariş özeti
              </h2>
            </div>
            <p className="font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              Ürün adı/adedi, satış bedeli, kargo bedeli, toplam tutar; sipariş
              adımında ve sipariş onayında gösterilir
            </p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">Ödeme</h2>
            </div>
            <ul className="list-disc space-y-2 pl-5 font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              <li>Ödeme yöntemi: kredi kartı (PayTR)</li>
              <li>Ödeme onaylanmadan sipariş tamamlanmış sayılmaz</li>
            </ul>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">Teslimat</h2>
            </div>
            <ul className="list-disc space-y-2 pl-5 font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              <li>Taşıyıcı: Yurtiçi Kargo</li>
              <li>Teslimat, alıcının belirttiği adrese yapılır</li>
              <li>Adres hatası/gecikme durumlarında iletişime geçilebilir</li>
            </ul>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">
                Cayma hakkı
              </h2>
            </div>
            <ul className="list-disc space-y-2 pl-5 font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              <li>14 gün içinde cayma hakkı kullanılabilir</li>
              <li>Cayma bildirimi /support üzerinden yapılabilir</li>
              <li>
                İade adımları ve iade süreci /cayma-ve-iade-kosullari sayfasında
                açıklanır
              </li>
            </ul>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">
                Uyuşmazlık
              </h2>
            </div>
            <p className="font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              Tüketici uyuşmazlıklarında ilgili tüketici hakem heyeti/tüketici
              mahkemeleri başvuru mercileridir
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
                Sözleşme veya siparişle ilgili sorun mu var? Destek ekibimiz
                burada.
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
