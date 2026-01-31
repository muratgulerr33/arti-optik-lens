import { db } from "@/db/connection"
import { products, productVariants, brands } from "@/db/schema"
import { eq, inArray } from "drizzle-orm"

export type ProductListEntry = {
  title: string
  price: number
  image: string
  slug: string
  brand: string
}

/**
 * Favori listesi vb. için ürün ID'leriyle liste döner.
 * ProductCard ile uyumlu formatta (title, price, image, slug, brand).
 */
export async function getProductsByIds(
  productIds: number[]
): Promise<{ products: ProductListEntry[]; dbError: boolean }> {
  if (productIds.length === 0) {
    return { products: [], dbError: false }
  }
  try {
    const rows = await db
      .select({
        pId: products.id,
        name: products.name,
        slug: products.slug,
        brandName: brands.name,
        variantPrice: productVariants.price,
        variantImages: productVariants.images,
      })
      .from(products)
      .innerJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(productVariants, eq(products.id, productVariants.productId))
      .where(inArray(products.id, productIds))

    const seen = new Set<number>()
    const list: typeof rows = []
    for (const r of rows) {
      if (seen.has(r.pId)) continue
      seen.add(r.pId)
      list.push(r)
    }
    const productsList = list.map((r) => {
      const imgs = Array.isArray(r.variantImages) ? r.variantImages : []
      const firstImg = imgs[0]
      const image =
        typeof firstImg === "string"
          ? firstImg
          : (firstImg as { src?: string })?.src ?? "/placeholder-product.jpg"
      return {
        title: r.name,
        price: Number(r.variantPrice ?? 0),
        image: image || "/placeholder-product.jpg",
        slug: r.slug,
        brand: r.brandName,
      }
    })
    return { products: productsList, dbError: false }
  } catch (err) {
    console.error("getProductsByIds error:", err)
    return { products: [], dbError: true }
  }
}
