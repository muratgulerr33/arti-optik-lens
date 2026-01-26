import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { db } from '@/db/connection';
import { products, productVariants, brands } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Force dynamic rendering to prevent build-time DB connection
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Ürün detayını getir
async function getProductBySlug(slug: string) {
  try {
    const product = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        gender: products.gender,
        brand: {
          id: brands.id,
          name: brands.name,
          slug: brands.slug,
        },
        variant: {
          id: productVariants.id,
          price: productVariants.price,
          stock: productVariants.stock,
          stockStatus: productVariants.stockStatus,
          images: productVariants.images,
        },
      })
      .from(products)
      .innerJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(productVariants, eq(products.id, productVariants.productId))
      .where(eq(products.slug, slug))
      .limit(1);

    if (!product || product.length === 0) {
      return null;
    }

    return product[0];
  } catch (error) {
    // DB connection error during build - return null to prevent build failure
    console.error('Database error in getProductBySlug:', error);
    return null;
  }
}

// Metadata generate (stok durumu ile)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      return {
        title: 'Ürün Bulunamadı | ARTI OPTİK',
        description: 'Aradığınız ürün bulunamadı.',
      };
    }

  const stockText = product.variant?.stockStatus === 'out_of_stock' || (product.variant?.stock || 0) === 0
    ? 'Stokta Yok'
    : 'Stokta Var';
  
  const price = product.variant?.price 
    ? parseFloat(product.variant.price.toString()).toLocaleString('tr-TR', { 
        style: 'currency', 
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : 'Fiyat bilgisi yok';

  const title = `${product.brand.name} ${product.name} Güneş Gözlüğü — ${stockText} | ARTI OPTİK`;
  
  const description = `${product.brand.name} ${product.name} güneş gözlüğü. ${price}. ${stockText}. Ücretsiz kargo ve kolay iade. ARTI OPTİK'te güvenli alışveriş.`;

  const imageUrl = product.variant?.images && Array.isArray(product.variant.images) && product.variant.images.length > 0
    ? product.variant.images[0]
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: String(imageUrl) }] : [],
      type: 'website',
      ...(imageUrl && {
        other: {
          'og:type': 'product',
        },
      }),
    },
    alternates: {
      canonical: `https://artioptiklens.com.tr/urun/${slug}`,
    },
  };
  } catch (error) {
    // DB connection error during build - return generic metadata
    console.error('Database error in generateMetadata:', error);
    return {
      title: 'Ürün | ARTI OPTİK',
      description: 'Ürün bilgileri yükleniyor.',
    };
  }
}

// Page component
export default async function ProductPage({ params }: PageProps) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      notFound();
    }

  const stockText = product.variant?.stockStatus === 'out_of_stock' || (product.variant?.stock || 0) === 0
    ? 'Stokta Yok'
    : 'Stokta Var';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      <p className="text-lg mb-2">Marka: {product.brand.name}</p>
      <p className="text-xl font-semibold mb-2">
        {product.variant?.price 
          ? parseFloat(product.variant.price.toString()).toLocaleString('tr-TR', { 
              style: 'currency', 
              currency: 'TRY',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
          : 'Fiyat bilgisi yok'}
      </p>
      <p className={`text-lg mb-4 ${stockText === 'Stokta Yok' ? 'text-red-600' : 'text-green-600'}`}>
        {stockText}
      </p>
      {product.description && (
        <p className="text-gray-700 mb-4">{product.description}</p>
      )}
      {(() => {
        const images = product.variant?.images;
        if (images && Array.isArray(images) && images.length > 0) {
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={typeof img === 'string' ? img : (img as { src?: string }).src || String(img)}
                  alt={`${product.name} - Görsel ${idx + 1}`}
                  className="w-full h-auto rounded"
                />
              ))}
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
  } catch (error) {
    // DB connection error - show not found
    console.error('Database error in ProductPage:', error);
    notFound();
  }
}
