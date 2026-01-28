import { Suspense } from "react"
import { CategoryContent } from "./category-content"
import { db } from "@/db/connection"
import { products, productVariants, brands } from "@/db/schema"
import { asc, eq } from "drizzle-orm"

export const dynamic = "force-dynamic"

const genderMap = { kadin: "kadin", erkek: "erkek", unisex: "unisex" } as const
type GenderSlug = keyof typeof genderMap

interface PageProps {
  params: Promise<{ gender: string }>
}

async function getProductsByGender(gender: string): Promise<{
  products: { title: string; price: number; image: string; slug: string; brand: string }[]
  dbError: boolean
}> {
  try {
    const dbGender = genderMap[gender.toLowerCase() as GenderSlug] ?? "unisex"
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
      .where(eq(products.gender, dbGender))
      .orderBy(asc(products.id))
      .limit(500)
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
    console.error("Category products fetch error:", err)
    return { products: [], dbError: true }
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { gender } = await params
  const { products: initialProducts, dbError } = await getProductsByGender(gender)

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="text-muted-foreground">Yükleniyor...</div>
        </div>
      }
    >
      <CategoryContent gender={gender} products={initialProducts} dbError={dbError} />
    </Suspense>
  )
}
