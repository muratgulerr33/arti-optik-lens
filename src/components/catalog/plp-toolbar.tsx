"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FilterSheet } from "./filter-sheet"
import { SortSheet } from "./sort-sheet"
import { cn } from "@/lib/utils"

interface PLPToolbarProps {
  totalCount: number
}

export function PLPToolbar({ totalCount }: PLPToolbarProps) {
  const searchParams = useSearchParams()
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [sortSheetOpen, setSortSheetOpen] = useState(false)

  // Count active filters
  const activeFilters = {
    gender: searchParams.get("gender"),
    minPrice: searchParams.get("minPrice"),
    maxPrice: searchParams.get("maxPrice"),
    inStock: searchParams.get("inStock"),
  }
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length

  return (
    <>
      <div
        className={cn(
          "sticky top-[var(--app-header-h)] z-30",
          "bg-background/80 backdrop-blur",
          "border-b",
          "px-4 py-3"
        )}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left: Result count */}
          <span className="text-sm text-muted-foreground">
            {totalCount} ürün
          </span>

          {/* Right: Sort + Filter buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortSheetOpen(true)}
              className="min-h-11 h-11"
            >
              Sırala
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilterSheetOpen(true)}
              className="min-h-11 h-11 relative"
            >
              Filtrele
              {activeFilterCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 size-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <FilterSheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen} />
      <SortSheet open={sortSheetOpen} onOpenChange={setSortSheetOpen} />
    </>
  )
}
