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
  title: "Cayma ve İade Koşulları | ARTI OPTİK LENS",
  description:
    "Cayma hakkı, iade süreci ve ücret iadesi hakkında bilgilendirme.",
}

export default function CaymaVeIadeKosullariPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl space-y-16 px-6 py-12">
        <article className="space-y-16">
          <header className="space-y-4 border-b pb-8">
            <h1 className="font-display text-4xl font-bold tracking-tighter md:text-6xl">
              Cayma ve iade koşulları
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              Son güncelleme: 02 Şubat 2026
            </p>
            <p className="font-body max-w-2xl text-base text-muted-foreground">
              Fikrin değişebilir — normal. Süreci zorlaştırmak yerine
              netleştiriyoruz.
            </p>
          </header>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">
                Cayma hakkı (14 gün)
              </h2>
            </div>
            <p className="font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              Mesafeli satışlarda, ürünü teslim aldığın tarihten itibaren 14 gün
              içinde cayma hakkını kullanabilirsin. Cayma talebini iletmenin en
              hızlı yolu: /support
            </p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">
                İade adımları
              </h2>
            </div>
            <ol className="list-decimal space-y-2 pl-5 font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              <li>
                /support üzerinden &quot;iade&quot; diye yaz (sipariş numaranı
                ekle)
              </li>
              <li>
                Ürünü mümkünse orijinal kutusu/aksesuarları ile hazırla
              </li>
              <li>Yönlendirdiğimiz iade adımlarına göre gönder</li>
            </ol>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">
                Ücret iadesi
              </h2>
            </div>
            <p className="font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              Cayma talebin onaylanıp süreç tamamlandığında iade, ödeme yaptığın
              yöntemle yapılır. Banka/kart süreçleri nedeniyle hesabına
              yansıması değişebilir.
            </p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">
                Kargo/geri gönderim masrafı
              </h2>
            </div>
            <p className="font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              İade için yönlendirdiğimiz taşıyıcı ve yöntem kullanıldığında,
              tüketiciye ek iade kargo bedeli yansıtmayız. Farklı yöntem/taşıyıcı
              seçilirse süreç ve masraf değişebilir (önceden konuşuruz).
            </p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">
                İade kabul koşulları (makul çerçeve)
              </h2>
            </div>
            <ul className="list-disc space-y-2 pl-5 font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              <li>Ürün kullanılmamış, tekrar satılabilir durumda olmalı</li>
              <li>Aksesuar/kutu/etiketler mümkünse tam olmalı</li>
              <li>
                Kişiye özel üretilen ürünler veya hijyen nedeniyle iadesi uygun
                olmayan ürünler gibi bazı istisnalar olabilir (duruma göre
                netleştiririz)
              </li>
            </ul>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold">
                Ayıplı/hasarlı/yanlış ürün
              </h2>
            </div>
            <p className="font-body text-sm text-muted-foreground md:text-base leading-relaxed">
              Böyle bir durumda &quot;cayma&quot; beklemeden direkt bize yaz:
              çözümü hızlandırırız. Fotoğraf/video istenebilir (süreç için).
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
                İade veya cayma ile ilgili sorun mu var? Destek ekibimiz size
                yardımcı olmak için burada.
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
