"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

interface FilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FilterSheet({ open, onOpenChange }: FilterSheetProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize from URL params
  const genderParam = searchParams.get("gender")
  const minPriceParam = searchParams.get("minPrice")
  const maxPriceParam = searchParams.get("maxPrice")
  const inStockParam = searchParams.get("inStock")

  // Local state for filter selections (init from URL)
  const [gender, setGender] = useState<string[]>(() =>
    genderParam ? [genderParam] : []
  )
  const [minPrice, setMinPrice] = useState(() =>
    minPriceParam ? (parseInt(minPriceParam) / 100).toString() : ""
  )
  const [maxPrice, setMaxPrice] = useState(() =>
    maxPriceParam ? (parseInt(maxPriceParam) / 100).toString() : ""
  )
  const [inStock, setInStock] = useState(() => inStockParam === "1")

  const handleGenderToggle = (value: string) => {
    // V1: Single selection only
    setGender((prev) => (prev.includes(value) ? [] : [value]))
  }

  const handleReset = () => {
    setGender([])
    setMinPrice("")
    setMaxPrice("")
    setInStock(false)
  }

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Gender
    if (gender.length > 0) {
      params.set("gender", gender[0]) // V1: single selection
    } else {
      params.delete("gender")
    }

    // Price (convert TL to kuruş)
    if (minPrice) {
      const minPriceKurus = Math.round(parseFloat(minPrice) * 100).toString()
      params.set("minPrice", minPriceKurus)
    } else {
      params.delete("minPrice")
    }

    if (maxPrice) {
      const maxPriceKurus = Math.round(parseFloat(maxPrice) * 100).toString()
      params.set("maxPrice", maxPriceKurus)
    } else {
      params.delete("maxPrice")
    }

    // Stock
    if (inStock) {
      params.set("inStock", "1")
    } else {
      params.delete("inStock")
    }

    router.push(`?${params.toString()}`, { scroll: false })
    onOpenChange(false)
  }

  const hasActiveFilters =
    gender.length > 0 || minPrice || maxPrice || inStock

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] flex flex-col p-0">
        {/* Top Bar */}
        <SheetHeader className="flex flex-row items-center justify-between px-4 py-3 border-b shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Kapat</span>
          </Button>
          <SheetTitle className="flex-1 text-center">Filtrele</SheetTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={!hasActiveFilters}
            className="min-h-11 h-11"
          >
            Sıfırla
          </Button>
        </SheetHeader>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-6">
          {/* Gender Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Cinsiyet</Label>
            <div className="space-y-3">
              {[
                { value: "kadin", label: "Kadın" },
                { value: "erkek", label: "Erkek" },
                { value: "unisex", label: "Unisex" },
              ].map((option) => (
                <div key={option.value} className="flex items-center gap-3">
                  <Checkbox
                    id={`gender-${option.value}`}
                    checked={gender.includes(option.value)}
                    onCheckedChange={() => handleGenderToggle(option.value)}
                    className="min-h-11 h-11"
                  />
                  <Label
                    htmlFor={`gender-${option.value}`}
                    className="text-base min-h-11 flex items-center cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Price Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Fiyat (₺)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="min-h-11 h-11"
              />
              <span className="text-muted-foreground">–</span>
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="min-h-11 h-11"
              />
            </div>
          </div>

          <Separator />

          {/* Stock Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="inStock"
                checked={inStock}
                onCheckedChange={(checked) => setInStock(checked === true)}
                className="min-h-11 h-11"
              />
              <Label
                htmlFor="inStock"
                className="text-base min-h-11 flex items-center cursor-pointer"
              >
                Stokta
              </Label>
            </div>
          </div>
        </div>

        {/* Bottom Fixed CTA */}
        <SheetFooter className="sticky bottom-0 border-t bg-background/95 backdrop-blur px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)] shrink-0">
          <Button
            onClick={handleApply}
            className="w-full min-h-11 h-11"
            size="lg"
          >
            Sonuçları Gör
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
