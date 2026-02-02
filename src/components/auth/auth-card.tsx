"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Roboto } from "next/font/google"
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@/lib/validators/auth"
import { registerUser } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const roboto = Roboto({ weight: ["400", "500"], subsets: ["latin"] })

type Tab = "login" | "register"

/** Resmi Google "G" logosu – renkli SVG path'leri (lucide değil) */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-5 shrink-0", className)}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

/** Resmi Facebook "f" logosu – beyaz (lucide değil) */
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

export function AuthCard() {
  const searchParams = useSearchParams()
  const urlTab = searchParams.get("tab")
  const initialTab: Tab =
    urlTab === "register" ? "register" : "login"
  const [tab, setTab] = useState<Tab>(initialTab)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const rawCallback =
    searchParams.get("callbackUrl") ?? searchParams.get("returnTo") ?? "/account"
  // callbackUrl must be internal path only; never full URL or nested
  const callbackUrl =
    typeof rawCallback === "string" &&
    rawCallback.startsWith("/") &&
    !rawCallback.includes("://") &&
    !rawCallback.toLowerCase().startsWith("http")
      ? rawCallback
      : "/account"

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  function handleSocialClick() {
    toast.info("Yakında aktif olacak")
  }

  async function onLoginSubmit(data: LoginInput) {
    setError(null)
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl,
        redirect: false,
      })
      if (result?.error) {
        setError("Hatalı email veya şifre")
        setIsLoading(false)
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError("Giriş sırasında bir hata oluştu")
      setIsLoading(false)
    }
  }

  async function onRegisterSubmit(data: RegisterInput) {
    setError(null)
    setIsLoading(true)
    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("email", data.email)
    formData.append("password", data.password)
    const result = await registerUser(formData)
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }
    if (result?.success) {
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      if (signInResult?.error) {
        setError("Giriş yapılamadı. Lütfen giriş sayfasından deneyin.")
        setIsLoading(false)
        return
      }
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <Card className="w-full max-w-md p-6">
      {/* Tabs: Giriş Yap | Yeni Üyelik */}
      <div className="mb-6 flex border-b border-border">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={cn(
            "flex-1 border-b-2 px-4 py-2 text-center font-medium transition-colors",
            tab === "login"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Giriş Yap
        </button>
        <button
          type="button"
          onClick={() => setTab("register")}
          className={cn(
            "flex-1 border-b-2 px-4 py-2 text-center font-medium transition-colors",
            tab === "register"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Yeni Üyelik
        </button>
      </div>

      {/* 1. Form (aktif tab'a göre) */}
      {tab === "login" ? (
        <form
          onSubmit={loginForm.handleSubmit(onLoginSubmit)}
          className="space-y-4"
        >
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="auth-email">E-posta</Label>
            <Input
              id="auth-email"
              type="email"
              placeholder="ornek@email.com"
              aria-invalid={!!loginForm.formState.errors.email}
              {...loginForm.register("email")}
            />
            {loginForm.formState.errors.email && (
              <p className="text-sm text-destructive">
                {loginForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-password">Şifre</Label>
            <Input
              id="auth-password"
              type="password"
              placeholder="Şifrenizi girin"
              aria-invalid={!!loginForm.formState.errors.password}
              {...loginForm.register("password")}
            />
            {loginForm.formState.errors.password && (
              <p className="text-sm text-destructive">
                {loginForm.formState.errors.password.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>
        </form>
      ) : (
        <form
          onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
          className="space-y-4"
        >
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="auth-name">Ad Soyad</Label>
            <Input
              id="auth-name"
              type="text"
              placeholder="Adınız ve soyadınız"
              aria-invalid={!!registerForm.formState.errors.name}
              {...registerForm.register("name")}
            />
            {registerForm.formState.errors.name && (
              <p className="text-sm text-destructive">
                {registerForm.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-reg-email">E-posta</Label>
            <Input
              id="auth-reg-email"
              type="email"
              placeholder="ornek@email.com"
              aria-invalid={!!registerForm.formState.errors.email}
              {...registerForm.register("email")}
            />
            {registerForm.formState.errors.email && (
              <p className="text-sm text-destructive">
                {registerForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-reg-password">Şifre</Label>
            <Input
              id="auth-reg-password"
              type="password"
              placeholder="En az 6 karakter"
              aria-invalid={!!registerForm.formState.errors.password}
              {...registerForm.register("password")}
            />
            {registerForm.formState.errors.password && (
              <p className="text-sm text-destructive">
                {registerForm.formState.errors.password.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Kaydediliyor..." : "Kayıt Ol"}
          </Button>
        </form>
      )}

      {/* 2. "veya" ayıracı */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-sm text-muted-foreground">veya</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* 3. Social butonlar */}
      <div className="space-y-3">
        <Button
          type="button"
          className="h-11 w-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-white dark:text-gray-700 dark:hover:bg-gray-100"
          style={roboto.style}
          onClick={handleSocialClick}
        >
          <GoogleIcon className="mr-2" />
          Google ile Giriş
        </Button>
        <Button
          type="button"
          className="h-11 w-full border-0 bg-[#1877F2] text-white hover:bg-[#1864D9]"
          onClick={handleSocialClick}
        >
          <FacebookIcon className="mr-2 text-white" />
          Facebook ile Giriş
        </Button>
      </div>
    </Card>
  )
}
