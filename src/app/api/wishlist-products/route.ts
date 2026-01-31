import { NextRequest, NextResponse } from "next/server"
import { getProductsByIds } from "@/lib/products"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const idsParam = request.nextUrl.searchParams.get("ids")?.trim() ?? ""
    const productIds = idsParam
      ? idsParam.split(",").map((s) => parseInt(s, 10)).filter((n) => !Number.isNaN(n))
      : []

    const { products: list, dbError } = await getProductsByIds(productIds)

    return NextResponse.json({
      products: list,
      dbError,
    })
  } catch (err) {
    console.error("wishlist-products API error:", err)
    return NextResponse.json(
      { products: [], dbError: true },
      { status: 500 }
    )
  }
}
