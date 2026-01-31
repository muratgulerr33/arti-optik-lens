import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function OrdersPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Siparişlerim</h1>
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-12 text-center">
        <ShoppingBag
          className="mb-4 size-12 text-muted-foreground"
          aria-hidden
        />
        <p className="mb-2 text-base font-medium text-foreground">
          Henüz siparişiniz bulunmuyor.
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          Alışverişe başlayarak ilk siparişinizi verebilirsiniz.
        </p>
        <Button asChild>
          <Link href="/">Alışverişe Başla</Link>
        </Button>
      </div>
    </div>
  )
}
