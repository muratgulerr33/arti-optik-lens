import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Fiyatı kuruş cinsinden alır, TRY metni döner (ondalıksız). */
export function formatPrice(kurus: number): string {
  return (kurus / 100).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

/** Ürün adını ekranda göstermek için biçimler; şu an metin aynen döner. */
export function formatProductName(title: string): string {
  return title.trim()
}
