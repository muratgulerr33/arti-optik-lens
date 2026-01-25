import type { Metadata } from "next";
import { 
  fontDisplay, 
  fontBody, 
  fontNumbers 
} from "@/lib/fonts";
import "./globals.css";
import { cn } from "@/lib/utils";

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
          "min-h-screen bg-background font-body antialiased",
          fontDisplay.variable,
          fontBody.variable,
          fontNumbers.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}