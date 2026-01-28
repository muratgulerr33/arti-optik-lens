import Link from "next/link"

export function Footer() {
  return (
    <footer className="py-6 border-t">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center gap-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/hakkimizda" className="hover:text-foreground transition-colors">
              Hakkımızda
            </Link>
            <Link href="/iletisim" className="hover:text-foreground transition-colors">
              İletişim
            </Link>
            <Link href="/gizlilik" className="hover:text-foreground transition-colors">
              Gizlilik Politikası
            </Link>
            <Link href="/kullanim-kosullari" className="hover:text-foreground transition-colors">
              Kullanım Koşulları
            </Link>
          </div>
          <p className="text-center">
            © {new Date().getFullYear()} ARTI OPTİK. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  )
}
