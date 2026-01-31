import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default async function AddressesPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Adreslerim</h1>
      <Card className="max-w-lg">
        <CardHeader className="pb-2">
          <p className="text-sm font-medium text-foreground">Kayıtlı Adres</p>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Murat Güler</p>
          <p>0555 123 45 67</p>
          <p>Örnek Mah. Örnek Sok. No: 12/3</p>
          <p>Mezitli, Mersin</p>
        </CardContent>
      </Card>
    </div>
  )
}
