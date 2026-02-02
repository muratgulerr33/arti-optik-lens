import { db } from "@/db/connection";
import { products, productVariants, brands } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { HomeHeroBanners } from "@/components/home/home-hero-banners";
import { HomeValueProps } from "@/components/home/home-value-props";
import { HomeBrandGrid } from "@/components/home/home-brand-grid";
import { FrameShapeChipSlider } from "@/components/home/frame-shape-chip-slider";
import { SectionHeader } from "@/components/home/section-header";
import { ProductGrid } from "@/components/catalog/product-grid";
import { ProductCard } from "@/components/catalog/product-card";

export const dynamic = "force-dynamic";

type FeaturedProduct = {
  id: number;
  title: string;
  price: number;
  image: string;
  slug: string;
  brand: string;
};

async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
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
      .innerJoin(productVariants, eq(products.id, productVariants.productId))
      .where(eq(productVariants.isFeatured, true))
      .limit(8);
    return rows.map((r) => {
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
        id: r.pId,
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

async function getLatestProducts(limit: number): Promise<FeaturedProduct[]> {
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
      .innerJoin(productVariants, eq(products.id, productVariants.productId))
      .orderBy(desc(products.createdAt))
      .limit(limit * 2);
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
        id: r.pId,
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

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  const displayProducts =
    featuredProducts.length > 0 ? featuredProducts : await getLatestProducts(8);

  return (
    <div className="container mx-auto space-y-6 px-4 py-8 sm:space-y-8">
      <HomeHeroBanners />
      <HomeValueProps />
      <HomeBrandGrid />
      <FrameShapeChipSlider />
      {displayProducts.length > 0 && (
        <section
          aria-label="Öne çıkan ürünler"
          className="mt-6 border-t border-foreground/5 pt-6 sm:mt-8"
        >
          <SectionHeader
            title="Öne Çıkan Ürünler"
            href="/search"
            hrefLabel="Tümünü Gör"
            ariaLabel="Tüm ürünleri gör"
          />
          <ProductGrid>
            {displayProducts.map((product) => (
              <ProductCard
                key={product.slug}
                id={product.id}
                title={product.title}
                price={product.price}
                image={product.image}
                slug={product.slug}
                brand={product.brand}
              />
            ))}
          </ProductGrid>
        </section>
      )}
    </div>
  );
}
