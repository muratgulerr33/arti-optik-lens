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

export default function SearchPage() {
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
      <SearchClient />
    </Suspense>
  )
}
