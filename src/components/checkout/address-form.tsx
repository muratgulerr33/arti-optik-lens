"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { saveAddress, type SaveAddressData } from "@/app/actions/checkout"

export type AddressRecord = {
  id: string
  title: string
  fullName: string
  phone: string
  city: string
  district: string
  addressLine: string
} | null

type CheckoutAddressFormProps = {
  initialData?: AddressRecord
  onSaved?: (addressId: string) => void
}

export function CheckoutAddressForm({ initialData, onSaved }: CheckoutAddressFormProps) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const data: SaveAddressData = {
      title: (formData.get("title") as string) || (initialData?.title ?? "Ev"),
      fullName: (formData.get("fullName") as string) || "",
      phone: (formData.get("phone") as string) || "",
      city: (formData.get("city") as string) || "",
      district: (formData.get("district") as string) || "",
      addressLine: (formData.get("addressLine") as string) || "",
    }
    if (!data.fullName?.trim() || !data.phone?.trim() || !data.city?.trim() || !data.district?.trim() || !data.addressLine?.trim()) {
      toast.error("Tüm adres alanlarını doldurun.")
      return
    }
    startTransition(async () => {
      const result = await saveAddress(data)
      if (result.error) {
        toast.error(result.error)
        return
      }
      if (result.addressId) onSaved?.(result.addressId)
      toast.success("Adres kaydedildi.")
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Teslimat Adresi</h2>
      <input type="hidden" name="title" value="Ev" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="checkout-name">Ad Soyad</Label>
          <Input
            id="checkout-name"
            name="fullName"
            defaultValue={initialData?.fullName ?? ""}
            placeholder="Ad Soyad"
            className="w-full bg-background text-foreground border-input"
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
            defaultValue={initialData?.phone ?? ""}
            placeholder="0555 123 45 67"
            className="w-full bg-background text-foreground border-input"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="checkout-city">İl</Label>
          <Input
            id="checkout-city"
            name="city"
            defaultValue={initialData?.city ?? ""}
            placeholder="İl"
            className="w-full bg-background text-foreground border-input"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="checkout-district">İlçe</Label>
          <Input
            id="checkout-district"
            name="district"
            defaultValue={initialData?.district ?? ""}
            placeholder="İlçe"
            className="w-full bg-background text-foreground border-input"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="checkout-address">Açık Adres</Label>
          <Input
            id="checkout-address"
            name="addressLine"
            defaultValue={initialData?.addressLine ?? ""}
            placeholder="Mahalle, sokak, bina no, daire"
            className="w-full bg-background text-foreground border-input"
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
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {isPending ? "Kaydediliyor..." : "Kaydet"}
      </Button>
    </form>
  )
}
