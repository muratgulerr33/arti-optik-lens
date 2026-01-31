import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Fiyatı kuruş cinsinden alır, "23.900 TL" formatında döner.
 * - Sembol (₺) kullanmaz
 * - Ondalık yok
 */
export function formatPrice(kurus: number): string {
  const tl = kurus / 100
  const formatted = tl.toLocaleString("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return `${formatted} TL`
}

/** Ürün adını ekranda göstermek için biçimler; şu an metin aynen döner. */
export function formatProductName(title: string): string {
  return title.trim()
}
