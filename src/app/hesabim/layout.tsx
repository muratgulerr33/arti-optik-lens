import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AccountSidebar } from "@/components/account/account-sidebar"

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <AccountSidebar />
        <main className="md:col-span-3">{children}</main>
      </div>
    </div>
  )
}
