import { db } from "@/db/connection"
import { products, productVariants, brands } from "@/db/schema"
import { asc, eq, and, sql } from "drizzle-orm"
import {
  canonicalizeTerm,
  getFilterDbValues,
  type FilterType,
} from "@/lib/dictionaries"

export type ProductFilters = {
  shape?: string
  color_frame?: string
  material?: string
  color_lens?: string
  feature?: string
  size?: string
  gender?: string
  model_code?: string
}

export type CategoryProduct = {
  id: number
  title: string
  price: number
  image: string
  slug: string
  brand: string
}

/** URL'den gelen çoklu değeri ayır: önce `,` dene; yoksa `|`; yoksa tek değer. */
function splitFilterValue(value: string): string[] {
  const trimmed = value.trim()
  if (!trimmed) return []
  if (trimmed.includes(",")) {
    return trimmed.split(",").map((s) => s.trim()).filter(Boolean)
  }
  if (trimmed.includes("|")) {
    return trimmed.split("|").map((s) => s.trim()).filter(Boolean)
  }
  return [trimmed]
}

/** Tek filtre tipi için DB değer listesini topla (canonicalize + getFilterDbValues). */
function collectDbValues(rawValue: string, type: FilterType): string[] {
  const parts = splitFilterValue(rawValue)
  const all: string[] = []
  for (const part of parts) {
    const canonical = canonicalizeTerm(part)
    if (!canonical) continue
    const dbValues = getFilterDbValues(canonical, type)
    all.push(...dbValues)
  }
  return [...new Set(all)]
}

/**
 * Kategori sayfası için ürünleri getirir. Filtreler (shape, color_frame, material, color_lens, feature, size, gender, model_code)
 * URL'den gelir ve product_variants.attributes (JSONB) / products.gender üzerinde SQL WHERE koşullarına dönüşür.
 * SSOT: dictionaries.ts (canonicalizeTerm + getFilterDbValues).
 */
export async function getProductsByCategory(
  gender: string,
  filters?: ProductFilters
): Promise<{ products: CategoryProduct[]; dbError: boolean }> {
  try {
    // Gender: sayfa route'tan gelir; filters.gender varsa SSOT ile çözüp onu kullan
    const genderFilter = filters?.gender?.trim()
      ? getFilterDbValues(canonicalizeTerm(filters.gender), "gender")[0]
      : null
    const dbGender = genderFilter ?? gender
    const conditions: ReturnType<typeof sql>[] = [eq(products.gender, dbGender)]

    if (filters) {
      if (filters.shape) {
        const dbShapes = collectDbValues(filters.shape, "shape")
        if (dbShapes.length > 0) {
          conditions.push(
            sql`(
              ${sql.join(
                dbShapes.map(
                  (s) =>
                    sql`product_variants.attributes->>'shape' ILIKE ${"%" + s + "%"}`
                ),
                sql` OR `
              )}
            )`
          )
        }
      }
      if (filters.color_frame) {
        const dbColors = collectDbValues(filters.color_frame, "color_frame")
        if (dbColors.length > 0) {
          conditions.push(
            sql`(
              ${sql.join(
                dbColors.map(
                  (c) =>
                    sql`product_variants.attributes->>'color_frame' ILIKE ${"%" + c + "%"}`
                ),
                sql` OR `
              )}
            )`
          )
        }
      }
      if (filters.material) {
        const dbMaterials = collectDbValues(filters.material, "material")
        if (dbMaterials.length > 0) {
          conditions.push(
            sql`(
              ${sql.join(
                dbMaterials.map(
                  (m) =>
                    sql`product_variants.attributes->>'material' ILIKE ${"%" + m + "%"}`
                ),
                sql` OR `
              )}
            )`
          )
        }
      }
      if (filters.color_lens) {
        const dbLensColors = collectDbValues(filters.color_lens, "color_lens")
        if (dbLensColors.length > 0) {
          conditions.push(
            sql`(
              ${sql.join(
                dbLensColors.map(
                  (c) =>
                    sql`product_variants.attributes->>'color_lens' ILIKE ${"%" + c + "%"}`
                ),
                sql` OR `
              )}
            )`
          )
        }
      }
      if (filters.feature?.trim()) {
        const dbFeatures = collectDbValues(filters.feature, "feature")
        if (dbFeatures.length > 0) {
          conditions.push(
            sql`(
              ${sql.join(
                dbFeatures.flatMap((f) => [
                  sql`product_variants.attributes->>'lens_tech' ILIKE ${"%" + f + "%"}`,
                  sql`product_variants.attributes->>'feature_lens' ILIKE ${"%" + f + "%"}`,
                  sql`product_variants.attributes->>'cam_ozelligi' ILIKE ${"%" + f + "%"}`,
                ]),
                sql` OR `
              )}
            )`
          )
        }
      }
      if (filters.size?.trim()) {
        const dbSizes = collectDbValues(filters.size, "size")
        if (dbSizes.length > 0) {
          conditions.push(
            sql`(
              ${sql.join(
                dbSizes.flatMap((s) => [
                  sql`product_variants.attributes->>'size' ILIKE ${"%" + s + "%"}`,
                  sql`product_variants.attributes->>'ekartman' ILIKE ${"%" + s + "%"}`,
                ]),
                sql` OR `
              )}
            )`
          )
        }
      }
      if (filters.model_code?.trim()) {
        const pattern = `%${filters.model_code.trim()}%`
        conditions.push(
          sql`product_variants.attributes->>'model_numarasi' ILIKE ${pattern}`
        )
      }
    }

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
      .innerJoin(productVariants, eq(products.id, productVariants.productId))
      .where(and(...conditions))
      .orderBy(asc(products.id))
      .limit(500)

    const seen = new Set<number>()
    const list: typeof rows = []
    for (const r of rows) {
      if (seen.has(r.pId)) continue
      seen.add(r.pId)
      list.push(r)
    }

    const productsList: CategoryProduct[] = list.map((r) => {
      const imgs = Array.isArray(r.variantImages) ? r.variantImages : []
      const firstImg = imgs[0]
      const image =
        typeof firstImg === "string"
          ? firstImg
          : (firstImg as { src?: string })?.src ?? "/placeholder-product.jpg"
      return {
        id: r.pId,
        title: r.name,
        price: Number(r.variantPrice ?? 0),
        image: image || "/placeholder-product.jpg",
        slug: r.slug,
        brand: r.brandName,
      }
    })

    return { products: productsList, dbError: false }
  } catch (err) {
    console.error("getProductsByCategory error:", err)
    return { products: [], dbError: true }
  }
}
