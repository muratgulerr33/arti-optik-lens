"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md p-8 text-center bg-background">
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Siparişiniz alındı
        </h1>
        <p className="mb-6 text-muted-foreground">
          Teşekkür ederiz. Siparişiniz (MOCK) başarıyla oluşturuldu.
        </p>
        <Button asChild>
          <Link href="/">Alışverişe devam et</Link>
        </Button>
      </Card>
    </main>
  )
}
