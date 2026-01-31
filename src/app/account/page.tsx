import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default async function AccountPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  const name =
    (session.user?.name as string | null) ?? "Üye"
  const email =
    (session.user?.email as string | null) ?? ""

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Profilim</h1>
      <Card className="max-w-lg">
        <CardHeader className="pb-2">
          <p className="text-sm text-muted-foreground">Hesap bilgileri</p>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-medium text-foreground">{name}</p>
          {email ? (
            <p className="text-sm text-muted-foreground">{email}</p>
          ) : null}
        </CardContent>
      </Card>
      <p className="mt-4 text-muted-foreground">
        Hoşgeldin, {name}.
      </p>
    </div>
  )
}
