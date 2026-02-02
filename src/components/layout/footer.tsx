import Link from "next/link"

const linkClass =
  "text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm py-2 block text-sm"

export function Footer() {
  return (
    <footer className="py-6 border-t bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm text-muted-foreground">
          <div>
            <h3 className="font-semibold tracking-tight text-foreground mb-3">
              Kurumsal
            </h3>
            <ul className="space-y-1">
              <li>
                <Link href="/about" className={linkClass}>
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/gizlilik-ve-guvenlik" className={linkClass}>
                  Gizlilik ve Güvenlik
                </Link>
              </li>
              <li>
                <Link href="/mesafeli-satis-sozlesmesi" className={linkClass}>
                  Mesafeli Satış Sözleşmesi
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold tracking-tight text-foreground mb-3">
              Müşteri Hizmetleri
            </h3>
            <ul className="space-y-1">
              <li>
                <Link href="/support" className={linkClass}>
                  Destek & İletişim
                </Link>
              </li>
              <li>
                <Link href="/odeme-ve-teslimat" className={linkClass}>
                  Ödeme & Teslimat
                </Link>
              </li>
              <li>
                <Link href="/cayma-ve-iade-kosullari" className={linkClass}>
                  Cayma & İade Koşulları
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ARTI OPTİK. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  )
}
