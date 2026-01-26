import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-display text-2xl font-bold tracking-tighter">
              ARTI OPTİK
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Türkiye&apos;nin en seçkin lüks güneş gözlüğü koleksiyonları. Yetkili satıcı garantisiyle.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold tracking-widest text-xs uppercase mb-4">Koleksiyonlar</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">Yeni Gelenler</Link></li>
              <li><Link href="#" className="hover:text-primary">Erkek</Link></li>
              <li><Link href="#" className="hover:text-primary">Kadın</Link></li>
              <li><Link href="#" className="hover:text-primary">Unisex</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold tracking-widest text-xs uppercase mb-4">Müşteri Hizmetleri</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">Sipariş Takibi</Link></li>
              <li><Link href="#" className="hover:text-primary">İade ve Değişim</Link></li>
              <li><Link href="#" className="hover:text-primary">Sıkça Sorulan Sorular</Link></li>
              <li><Link href="#" className="hover:text-primary">İletişim</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold tracking-widest text-xs uppercase mb-4">Yasal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">Gizlilik Politikası</Link></li>
              <li><Link href="#" className="hover:text-primary">Mesafeli Satış Sözleşmesi</Link></li>
              <li><Link href="#" className="hover:text-primary">Çerez Politikası</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-xs text-muted-foreground">
          &copy; 2026 Artı Optik. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}