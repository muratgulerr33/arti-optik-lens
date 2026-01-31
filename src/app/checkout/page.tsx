import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/db/connection"
import { addresses } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { CheckoutContent } from "./checkout-content"

export default async function CheckoutPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/checkout")
  }
  const userId = session.user.id

  const userAddresses = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(desc(addresses.updatedAt))
    .limit(1)

  const address = userAddresses[0]
    ? {
        id: userAddresses[0].id,
        title: userAddresses[0].title,
        fullName: userAddresses[0].fullName,
        phone: userAddresses[0].phone,
        city: userAddresses[0].city,
        district: userAddresses[0].district,
        addressLine: userAddresses[0].addressLine,
      }
    : null

  return (
    <main className="min-h-[calc(100vh-4rem)] py-8">
      <CheckoutContent initialAddress={address} />
    </main>
  )
}
