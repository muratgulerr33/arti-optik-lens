import { db } from "@/db/connection";
import { products, productVariants, brands } from "@/db/schema";
import { eq, and, ilike, desc, sql } from "drizzle-orm";

export type SearchProduct = {
  title: string;
  price: number;
  image: string;
  slug: string;
  brand: string;
};

/**
 * Search sayfası ve API için ürün listesi.
 * - brand: marka slug (brands.slug)
 * - q: metin arama (products.name, brands.name)
 * - İkisi de yoksa: default güneş gözlüğü listesi (en yeni ürünler, V1 scope)
 */
export async function getSearchProducts(options: {
  brand?: string;
  q?: string;
  limit?: number;
}): Promise<SearchProduct[]> {
  const limit = Math.min(options.limit ?? 20, 50);
  const conditions: ReturnType<typeof sql>[] = [];

  if (options.brand?.trim()) {
    conditions.push(eq(brands.slug, options.brand.trim()));
  }
  if (options.q?.trim()) {
    const pattern = `%${options.q.trim()}%`;
    conditions.push(
      sql`(${ilike(products.name, pattern)} OR ${ilike(brands.name, pattern)})`
    );
  }

  try {
    let baseQuery = db
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
      .innerJoin(productVariants, eq(products.id, productVariants.productId));

    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions)) as typeof baseQuery;
    }

    const rows = await baseQuery
      .orderBy(desc(products.createdAt))
      .limit(conditions.length > 0 ? limit * 3 : limit);

    const seen = new Set<number>();
    const list: typeof rows = [];
    for (const r of rows) {
      if (seen.has(r.pId)) continue;
      seen.add(r.pId);
      list.push(r);
      if (list.length >= limit) break;
    }

    return list.map((r) => {
      const imgs = Array.isArray(r.variantImages) ? r.variantImages : [];
      const firstImg = imgs[0];
      const image =
        typeof firstImg === "string"
          ? firstImg
          : (firstImg as { src?: string })?.src ?? "/placeholder-product.jpg";
      const priceNum = Number(r.variantPrice ?? 0);
      const priceKurus =
        priceNum >= 100_000 ? Math.round(priceNum) : Math.round(priceNum * 100);
      return {
        title: r.name,
        price: priceKurus,
        image: image || "/placeholder-product.jpg",
        slug: r.slug,
        brand: r.brandName,
      };
    });
  } catch {
    return [];
  }
}
