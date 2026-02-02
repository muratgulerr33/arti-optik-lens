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
  title: "Ödeme ve Teslimat | ARTI OPTİK LENS",
  description:
    "Ödeme yöntemleri, kargo süreci ve teslimat kuralları.",
}

export default function OdemeVeTeslimatPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl space-y-16 px-6 py-12">
        <article className="space-y-16">
          <header className="space-y-4 border-b pb-8">
            <h1 className="font-display text-4xl font-bold tracking-tighter md:text-6xl">
              Ödeme ve teslimat
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              Son güncelleme: 02 Şubat 2026
            </p>
            <p className="font-body max-w-2xl text-base text-muted-foreground">
              Ödemeyi güvenle alırız, ürünü özenle paketleriz, süreci şeffaf
              yönetiriz. Bu sayfa &quot;siparişim ne olacak?&quot; sorusunun kısa
              cevabı.
            </p>
          </header>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">
                Ödeme yöntemleri
              </h2>
            </div>
            <ul className="list-disc space-y-2 pl-5 font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              <li>
                <strong className="text-foreground">Online ödeme:</strong> kredi
                kartı (PayTR)
              </li>
              <li>Kapıda ödeme yok</li>
              <li>Sipariş onayı, ödeme başarılı olduktan sonra oluşur</li>
            </ul>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">
                Kargo & teslimat
              </h2>
            </div>
            <ul className="list-disc space-y-2 pl-5 font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              <li>
                <strong className="text-foreground">Kargo:</strong> Yurtiçi Kargo
              </li>
              <li>
                <strong className="text-foreground">Kargo ücreti:</strong> sabit
                kargo (tutar checkout&apos;ta net gösterilir)
              </li>
              <li>
                Teslimat adresi: sipariş sırasında yazdığın adrese teslim
              </li>
            </ul>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">
                Hazırlık süresi
              </h2>
            </div>
            <p className="font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              Sipariş, ödeme onayından sonra hazırlığa alınır. Resmî
              tatil/yoğunluk durumlarında süre uzayabilir (olursa destekten haber
              veririz).
            </p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">
                Teslimat anında kontrol
              </h2>
            </div>
            <p className="font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              Pakette ezilme/hasar görürsen mümkünse teslim almadan tutanak iste.
              Ürün hasarlı/yanlış geldiyse: /support üzerinden hızlıca yaz.
            </p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">
                Adres ve alıcı bilgisi
              </h2>
            </div>
            <p className="font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              Adresin eksik/hatalıysa teslimat gecikebilir. Gerekirse doğrulamak
              için telefonla ulaşabiliriz.
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
                Sipariş veya teslimatla ilgili sorun mu var? Destek ekibimiz
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
