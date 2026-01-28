"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * V1: Adres formu – defaultValue ile dolu, görsel doluluk için.
 * Validasyon ve Kaydet davranışı sonraki aşamada.
 */
export function CheckoutAddressForm() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Teslimat Adresi</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="checkout-name">Ad Soyad</Label>
          <Input
            id="checkout-name"
            name="name"
            defaultValue="Murat Güler"
            className="w-full bg-background text-foreground"
            aria-describedby="checkout-name-hint"
          />
          <p id="checkout-name-hint" className="text-xs text-muted-foreground">
            Teslimat için iletişim adı
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="checkout-phone">Telefon</Label>
          <Input
            id="checkout-phone"
            name="phone"
            type="tel"
            defaultValue="0555 123 45 67"
            className="w-full bg-background text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="checkout-city">İl</Label>
          <Input
            id="checkout-city"
            name="city"
            defaultValue="Mersin"
            className="w-full bg-background text-foreground"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="checkout-district">İlçe</Label>
          <Input
            id="checkout-district"
            name="district"
            defaultValue="Mezitli"
            className="w-full bg-background text-foreground"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="checkout-address">Açık Adres</Label>
          <Input
            id="checkout-address"
            name="address"
            defaultValue="Örnek Mah. Örnek Sok. No: 12/3"
            className="w-full bg-background text-foreground"
            aria-describedby="checkout-address-hint"
          />
          <p
            id="checkout-address-hint"
            className="text-xs text-muted-foreground"
          >
            Mahalle, sokak, bina no, daire
          </p>
        </div>
      </div>
    </div>
  )
}
