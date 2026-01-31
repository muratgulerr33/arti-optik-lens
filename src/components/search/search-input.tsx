"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const qFromUrl = searchParams.get("q") ?? ""
  const [query, setQuery] = useState(qFromUrl)

  // URL'de ?q=... varsa input dolu gelmeli (senkron)
  useEffect(() => {
    setQuery(qFromUrl)
  }, [qFromUrl])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = query.trim()
    if (value) {
      router.push(`/search?q=${encodeURIComponent(value)}`)
    } else {
      router.push("/search")
    }
  }

  const handleClear = () => {
    setQuery("")
    router.push("/search")
  }

  return (
    <form className="relative flex-1" onSubmit={handleSubmit} data-testid="header-search-form">
      <Input
        type="text"
        placeholder="Marka veya model ara"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="relative z-10 h-11 pr-10"
        data-testid="search-input"
        aria-label="Ürün Ara"
      />
      {query.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2"
          onClick={handleClear}
          aria-label="Temizle"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </form>
  )
}
