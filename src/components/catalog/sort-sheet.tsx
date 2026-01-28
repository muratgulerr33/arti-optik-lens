"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { X, Check } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SortSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const sortOptions = [
  { value: "newest", label: "En Yeni" },
  { value: "price_asc", label: "Fiyat (Artan)" },
  { value: "price_desc", label: "Fiyat (Azalan)" },
]

export function SortSheet({ open, onOpenChange }: SortSheetProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sort") || "newest"

  const handleSortSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "newest") {
      params.delete("sort")
    } else {
      params.set("sort", value)
    }
    router.push(`?${params.toString()}`, { scroll: false })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[50dvh] flex flex-col p-0">
        {/* Top Bar */}
        <SheetHeader className="flex flex-row items-center justify-between px-4 py-3 border-b">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Kapat</span>
          </Button>
          <SheetTitle className="flex-1 text-center">Sırala</SheetTitle>
          <div className="w-11" /> {/* Spacer */}
        </SheetHeader>

        {/* Body - Sort Options */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortSelect(option.value)}
              className={cn(
                "w-full flex items-center justify-between min-h-11 h-11 px-4 rounded-md",
                "hover:bg-accent transition-colors",
                "text-left"
              )}
            >
              <span className="text-base">{option.label}</span>
              {currentSort === option.value && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
