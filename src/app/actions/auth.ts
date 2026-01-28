"use server"

import { db } from "@/db/connection"
import { users } from "@/db/schema"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Validation
  if (!name || !email || !password) {
    return { error: "Tüm alanlar zorunludur" }
  }

  if (password.length < 6) {
    return { error: "Şifre en az 6 karakter olmalıdır" }
  }

  // Check if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existingUser.length > 0) {
    return { error: "Bu email adresi zaten kullanılıyor" }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Insert user
  try {
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: "user",
    })
    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Kayıt sırasında bir hata oluştu" }
  }
}
