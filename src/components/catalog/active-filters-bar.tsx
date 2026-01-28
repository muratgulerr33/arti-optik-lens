"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function ActiveFiltersBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeFilters: Array<{ key: string; label: string; value: string }> = []

  // Gender filter
  const gender = searchParams.get("gender")
  if (gender) {
    const genderLabels: Record<string, string> = {
      kadin: "Kadın",
      erkek: "Erkek",
      unisex: "Unisex",
    }
    activeFilters.push({
      key: "gender",
      label: genderLabels[gender] || gender,
      value: gender,
    })
  }

  // Price filter
  const minPrice = searchParams.get("minPrice")
  const maxPrice = searchParams.get("maxPrice")
  if (minPrice || maxPrice) {
    const min = minPrice ? `${parseInt(minPrice) / 100}₺` : ""
    const max = maxPrice ? `${parseInt(maxPrice) / 100}₺` : ""
    activeFilters.push({
      key: "price",
      label: `${min}${min && max ? "–" : ""}${max}`,
      value: `${minPrice || ""}-${maxPrice || ""}`,
    })
  }

  // Stock filter
  const inStock = searchParams.get("inStock")
  if (inStock === "1") {
    activeFilters.push({
      key: "inStock",
      label: "Stokta",
      value: "1",
    })
  }

  if (activeFilters.length === 0) {
    return null
  }

  const removeFilter = (filterKey: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (filterKey === "price") {
      params.delete("minPrice")
      params.delete("maxPrice")
    } else {
      params.delete(filterKey)
    }

    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div
      className={cn(
        "sticky top-[calc(var(--app-header-h)+3.75rem)] z-30",
        "bg-background/80 backdrop-blur",
        "border-b",
        "px-4 py-2"
      )}
    >
      <div className="flex items-center gap-2 overflow-x-auto max-w-7xl mx-auto scrollbar-hide">
        {activeFilters.map((filter) => (
          <Badge
            key={`${filter.key}-${filter.value}`}
            variant="secondary"
            className="min-h-11 h-11 px-3 py-2 gap-2 shrink-0 cursor-pointer"
            onClick={() => removeFilter(filter.key)}
          >
            <span>{filter.label}</span>
            <X className="size-3.5" />
          </Badge>
        ))}
      </div>
    </div>
  )
}
