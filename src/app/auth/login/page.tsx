"use client"

import { Suspense } from "react"
import { AuthCard } from "@/components/auth/auth-card"
import { Card } from "@/components/ui/card"

function LoginContent() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <AuthCard />
    </div>
  )
}

export default function LoginPage() {
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
      <LoginContent />
    </Suspense>
  )
}
