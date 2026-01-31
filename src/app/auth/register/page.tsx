"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"

/**
 * Register sayfası: Unified Auth yapısına yönlendir.
 * /auth/login?tab=register ile aynı kartı gösterir.
 */
function RegisterRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/checkout"
  useEffect(() => {
    router.replace(
      `/auth/login?tab=register&callbackUrl=${encodeURIComponent(callbackUrl)}`
    )
  }, [router, callbackUrl])
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
        </div>
      </Card>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
          <Card className="w-full max-w-md p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-32 rounded bg-muted" />
              <div className="h-10 w-full rounded bg-muted" />
              <div className="h-10 w-full rounded bg-muted" />
              <div className="h-10 w-full rounded bg-muted" />
            </div>
          </Card>
        </div>
      }
    >
      <RegisterRedirect />
    </Suspense>
  )
}
