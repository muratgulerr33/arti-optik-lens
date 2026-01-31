import type { Metadata } from "next"
import { Suspense } from "react"
import SearchClient from "./search-client"

export const metadata: Metadata = {
  title: "Ara | ARTI OPTİK",
  description: "Marka veya model ara",
  robots: {
    index: false,
    follow: true,
  },
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; brand?: string }>
}) {
  const params = await searchParams
  const q = typeof params.q === "string" ? params.q.trim() : ""
  const brand = typeof params.brand === "string" ? params.brand.trim() : ""
  const initialQuery = q || brand || ""

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="text-muted-foreground text-center pt-8">
              Yükleniyor...
            </div>
          </div>
        </div>
      }
    >
      <SearchClient initialQuery={initialQuery} />
    </Suspense>
  )
}
