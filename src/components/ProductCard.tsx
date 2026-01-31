import Link from "next/link";
import { ShoppingBag, Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* MOBİL MENÜ (Hamburger) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menüyü Aç</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="flex flex-col gap-4 mt-8">
              <Link href="/kadin/gunes-gozlugu" className="text-lg font-medium">Kadın</Link>
              <Link href="/erkek/gunes-gozlugu" className="text-lg font-medium">Erkek</Link>
              <Link href="/koleksiyonlar" className="text-lg font-medium">KOLEKSİYONLAR</Link>
            </nav>
          </SheetContent>
        </Sheet>

        {/* LOGO (Lüks Font) */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-display text-2xl font-bold tracking-tighter">
            ARTI OPTİK
          </span>
        </Link>

        {/* MASAÜSTÜ MENÜ */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/kadin/gunes-gozlugu" className="tracking-widest hover:text-primary transition-colors">
            Kadın
          </Link>
          <Link href="/erkek/gunes-gozlugu" className="tracking-widest hover:text-primary transition-colors">
            Erkek
          </Link>
          <Link href="/koleksiyonlar" className="tracking-widest hover:text-primary transition-colors">
            KOLEKSİYONLAR
          </Link>
        </nav>

        {/* SAĞ İKONLAR */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
          </Button>
        </div>
      </div>
    </header>
  );
}