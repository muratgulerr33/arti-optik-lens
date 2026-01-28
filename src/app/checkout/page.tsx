"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCartStore, type CartItem } from "@/store/cart-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckoutAddressForm } from "@/components/checkout/address-form"
import { toast } from "sonner"

const FREE_SHIPPING_THRESHOLD_KURUS = 2000_00 // 2000 TL
const SHIPPING_FEE_KURUS = 50_00 // 50 TL

function formatPrice(kurus: number): string {
  return (kurus / 100).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function CheckoutContent() {
  const { items, getCartTotal, clearCart } = useCartStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const cartTotal = getCartTotal()
  const shipping =
    cartTotal >= FREE_SHIPPING_THRESHOLD_KURUS ? 0 : SHIPPING_FEE_KURUS
  const total = cartTotal + shipping

  async function handleMockPay() {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1500))
    toast.success("Sipariş alındı (MOCK)")
    clearCart()
    window.location.href = "/checkout/success"
  }

  if (items.length === 0) {
    return (
      <Card className="mx-auto max-w-md p-8 text-center">
        <p className="mb-4 text-muted-foreground">Sepetiniz boş.</p>
        <Button asChild>
          <Link href="/">Alışverişe devam et</Link>
        </Button>
      </Card>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Ödeme</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="p-4 md:col-span-2 bg-background">
          <CheckoutAddressForm />
        </Card>

        <Card className="p-4 bg-background">
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Sipariş özeti
          </h2>
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <CheckoutRow key={item.id} item={item} />
            ))}
          </ul>
          <div className="mt-3 space-y-2 border-t pt-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Sepet tutarı</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Kargo</span>
              <span>
                {shipping === 0
                  ? "Ücretsiz"
                  : formatPrice(SHIPPING_FEE_KURUS)}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-base font-semibold text-foreground">
              <span>Toplam</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <Button
            className="mt-4 w-full"
            size="lg"
            onClick={handleMockPay}
            disabled={isSubmitting}
            id="checkout-submit"
          >
            {isSubmitting ? "Ödeme işleniyor..." : "Ödemeyi Tamamla"}
          </Button>
        </Card>
      </div>
    </div>
  )
}

function CheckoutRow({ item }: { item: CartItem }) {
  const img = item.image ?? "/placeholder-product.jpg"
  const lineTotal = item.price * item.quantity

  return (
    <li className="flex gap-3 py-3">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
        <Image
          src={img}
          alt={item.name}
          fill
          className="object-cover"
          sizes="56px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.name}</p>
        <p className="text-muted-foreground text-xs">{item.brand}</p>
        <p className="text-sm">
          {item.quantity} × {formatPrice(item.price)} = {formatPrice(lineTotal)}
        </p>
      </div>
    </li>
  )
}

export default function CheckoutPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] py-8">
      <CheckoutContent />
    </main>
  )
}
