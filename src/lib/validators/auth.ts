import { z } from "zod"

const isDev = process.env.NODE_ENV === "development"

// Adaptive Name Schema
// Development: Relaxed validation (allows numbers/symbols for testing)
// Production: Strict regex (only Turkish letters and spaces to prevent XSS/SQLi)
const nameSchema = isDev
  ? z.string().min(2, "İsim en az 2 karakter olmalı.")
  : z
      .string()
      .min(2, "İsim en az 2 karakter olmalı.")
      .regex(
        /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/,
        "Geçersiz karakter kullanmayınız. Sadece harf ve boşluk kullanabilirsiniz."
      )

// Email Schema
export const emailSchema = z
  .string()
  .min(1, "Email gereklidir.")
  .email("Geçerli bir email adresi giriniz.")

// Password Schema
export const passwordSchema = z
  .string()
  .min(6, "Şifre en az 6 karakter olmalıdır.")

// Login Schema
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

// Register Schema
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
