import type { Metadata } from "next";
import { Suspense } from "react";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { FavoritesProvider } from "@/components/favorites/favorites-provider";
import { CartProvider } from "@/components/cart/cart-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeaderProvider } from "@/components/header/header-provider";
import { SearchProvider } from "@/components/search/search-provider";

import { fontDisplay, fontBody, fontNumbers } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  title: "Artı Optik | Premium Eyewear",
  description: "Dünyanın en seçkin güneş gözlüğü markaları.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-body text-foreground antialiased",
          fontDisplay.variable,
          fontBody.variable,
          fontNumbers.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <FavoritesProvider>
              <CartProvider>
                <Suspense fallback={<div className="h-16 bg-background border-b" />}>
                  <HeaderProvider>
                    <SearchProvider>
                      <Header />
                      <main className="pt-16">{children}</main>
                      <Footer />
                    </SearchProvider>
                  </HeaderProvider>
                </Suspense>
              </CartProvider>
            </FavoritesProvider>
          </AuthProvider>

          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}