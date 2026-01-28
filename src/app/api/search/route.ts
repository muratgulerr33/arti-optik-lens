import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { products, productVariants, brands } from '@/db/schema';
import { eq, or, ilike } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q')?.trim() || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '8', 10), 20);

    // Empty query - return empty results
    if (!q || q.length < 2) {
      return NextResponse.json({
        items: [],
        categories: [],
        fallbackCategory: null,
        fallbackItems: [],
      });
    }

    // Search in products (name) and brands (name)
    // Get products with their first variant (for price and image)
    const allResults = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        brand: {
          id: brands.id,
          name: brands.name,
          slug: brands.slug,
        },
        variant: {
          id: productVariants.id,
          price: productVariants.price,
          images: productVariants.images,
        },
      })
      .from(products)
      .innerJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(
        productVariants,
        eq(products.id, productVariants.productId)
      )
      .where(
        or(
          ilike(products.name, `%${q}%`),
          ilike(brands.name, `%${q}%`)
        )
      )
      .limit(limit * 3); // Get more to account for multiple variants per product

    // Deduplicate by product ID, keeping first variant
    const seen = new Set<number>()
    const searchResults = allResults.filter((item) => {
      if (seen.has(item.id)) {
        return false
      }
      seen.add(item.id)
      return true
    }).slice(0, limit)

    // Transform results to match ProductCard interface
    const items = searchResults
      .map((item) => {
        // Get first variant's price and image (DB price is already integer kuruş)
        const variant = item.variant;
        const price = variant?.price != null ? Number(variant.price) : 0;
        const images = variant?.images;
        const image =
          images && Array.isArray(images) && images.length > 0
            ? typeof images[0] === 'string'
              ? images[0]
              : (images[0] as { src?: string }).src || String(images[0])
            : '/placeholder-image.jpg';

        return {
          title: item.name,
          price,
          image,
          slug: item.slug,
          brand: item.brand.name,
        };
      })
      .filter((item) => item.price > 0); // Only include items with valid price

    return NextResponse.json({
      items,
      categories: [],
      fallbackCategory: null,
      fallbackItems: [],
    });
  } catch (error) {
    console.error('Search API error:', error);
    // Return empty arrays on error (as per plan requirements)
    return NextResponse.json(
      {
        items: [],
        categories: [],
        fallbackCategory: null,
        fallbackItems: [],
      },
      { status: 500 }
    );
  }
}
