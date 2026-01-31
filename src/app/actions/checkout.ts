"use server"

import { auth } from "@/auth"
import { db } from "@/db/connection"
import { addresses, orders, orderItems } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

export type SaveAddressData = {
  title: string
  fullName: string
  phone: string
  city: string
  district: string
  addressLine: string
}

export async function saveAddress(data: SaveAddressData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Oturum açmanız gerekiyor." }
  }
  const userId = session.user.id

  try {
    const existing = await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId))
      .orderBy(desc(addresses.updatedAt))
      .limit(1)

    const payload = {
      userId,
      title: data.title,
      fullName: data.fullName,
      phone: data.phone,
      city: data.city,
      district: data.district,
      addressLine: data.addressLine,
      updatedAt: new Date(),
    }

    if (existing.length > 0) {
      await db
        .update(addresses)
        .set(payload)
        .where(eq(addresses.id, existing[0].id))
      return { success: true, addressId: existing[0].id }
    }
    const [inserted] = await db
      .insert(addresses)
      .values({
        userId,
        title: data.title,
        fullName: data.fullName,
        phone: data.phone,
        city: data.city,
        district: data.district,
        addressLine: data.addressLine,
      })
      .returning({ id: addresses.id })
    return { success: true, addressId: inserted?.id ?? undefined }
  } catch (err) {
    console.error("saveAddress error:", err)
    return { error: "Adres kaydedilirken bir hata oluştu." }
  }
}

export type CreateOrderItem = {
  productId: number
  quantity: number
  price: number
}

export async function createOrder(
  addressId: string,
  items: CreateOrderItem[],
  totalAmount: number
) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Oturum açmanız gerekiyor." }
  }
  const userId = session.user.id

  if (!addressId || !items?.length || totalAmount <= 0) {
    return { error: "Geçersiz sipariş bilgisi." }
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          userId,
          addressId,
          totalAmount,
          status: "pending",
        })
        .returning({ id: orders.id })

      if (!order?.id) throw new Error("Sipariş oluşturulamadı.")

      for (const item of items) {
        await tx.insert(orderItems).values({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })
      }
      return { orderId: order.id }
    })
    return { success: true, orderId: result.orderId }
  } catch (err) {
    console.error("createOrder error:", err)
    return { error: "Sipariş oluşturulurken bir hata oluştu." }
  }
}
