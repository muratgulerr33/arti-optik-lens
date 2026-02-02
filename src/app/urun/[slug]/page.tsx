import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { db } from '@/db/connection';
import { products, productVariants, brands } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { formatPrice } from '@/lib/utils';
import { ProductGallery } from '@/components/product/product-gallery';
import { ProductInfo } from '@/components/product/product-info';
import { ProductSpecs } from '@/components/product/product-specs';
import { AddToCart } from '@/components/product/add-to-cart';
import { StickyProductBar } from '@/components/product/sticky-product-bar';
import { Breadcrumbs } from '@/components/product/breadcrumbs';

// Force dynamic rendering to prevent build-time DB connection
export const dynamic = 'force-dynamic';

const CANONICAL_BASE = 'https://artioptiklens.com.tr';
const genderLabelMap: Record<string, string> = {
  kadin: 'Kadın',
  women: 'Kadın',
  erkek: 'Erkek',
  men: 'Erkek',
  unisex: 'Unisex',
  kids: 'Çocuk',
};
function getGenderLabel(gender: string): string {
  return genderLabelMap[gender?.toLowerCase() ?? ''] ?? gender;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export type ProductVariant = {
  id: number;
  price: string;
  stock: number;
  stockStatus: string | null;
  images: unknown;
  attributes: unknown;
};

export type ProductDetail = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  gender: string;
  brand: { id: number; name: string; slug: string };
  variants: ProductVariant[];
};

// Ürün + tüm varyantları getir (attributes dahil)
async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    const productRow = await db
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
      })
      .from(products)
      .innerJoin(brands, eq(products.brandId, brands.id))
      .where(eq(products.slug, slug))
      .limit(1);

    if (!productRow?.length) return null;

    const productId = productRow[0].id;
    const variantsRows = await db
      .select({
        id: productVariants.id,
        price: productVariants.price,
        stock: productVariants.stock,
        stockStatus: productVariants.stockStatus,
        images: productVariants.images,
        attributes: productVariants.attributes,
      })
      .from(productVariants)
      .where(eq(productVariants.productId, productId));

    const p = productRow[0];
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      gender: p.gender,
      brand: p.brand,
      variants: variantsRows.map((v) => ({
        id: v.id,
        price: String(v.price),
        stock: v.stock,
        stockStatus: v.stockStatus,
        images: v.images,
        attributes: v.attributes,
      })),
    };
  } catch (error) {
    console.error('Database error in getProductBySlug:', error);
    return getMockProduct(slug);
  }
}

function getMockProduct(slug: string): ProductDetail {
  return {
    id: 0,
    name: 'Örnek Güneş Gözlüğü',
    slug,
    description: 'DB bağlantısı yok; örnek ürün gösteriliyor.',
    gender: 'unisex',
    brand: { id: 0, name: 'Marka', slug: 'marka' },
    variants: [
      {
        id: 0,
        price: '15400.00',
        stock: 5,
        stockStatus: 'in_stock',
        images: ['/next.svg'],
        attributes: {
          color_frame: 'Siyah',
          color_lens: 'Yeşil',
          size_bridge: '22',
          size_temple: '150',
          lens_tech: 'Polarize',
        },
      },
    ],
  };
}

function normalizeImages(images: unknown): string[] {
  if (!images || !Array.isArray(images)) return [];
  return images.map((img) => (typeof img === 'string' ? img : (img as { src?: string }).src ?? String(img)));
}

// SEO: generateMetadata
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

    const variant = product.variants[0];
    const stockText =
      !variant || variant.stockStatus === 'out_of_stock' || (variant.stock || 0) === 0
        ? 'Stokta Yok'
        : 'Stokta Var';

    const price =
      variant?.price != null
        ? (() => {
            const p = parseFloat(String(variant.price));
            const kurus = p >= 100_000 ? Math.round(p) : Math.round(p * 100);
            return formatPrice(kurus);
          })()
        : 'Fiyat bilgisi yok';

    const title = `${product.brand.name} ${product.name} Güneş Gözlüğü — ${stockText} | ARTI OPTİK`;
    const description = `${product.brand.name} ${product.name} güneş gözlüğü. ${price}. ${stockText}. Ücretsiz kargo ve kolay iade. ARTI OPTİK'te güvenli alışveriş.`;

    const images = variant ? normalizeImages(variant.images) : [];
    const imageUrl = images[0];

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: imageUrl ? [{ url: String(imageUrl) }] : [],
        type: 'website',
        ...(imageUrl && { other: { 'og:type': 'product' } }),
      },
      alternates: {
        canonical: `https://artioptiklens.com.tr/urun/${slug}`,
      },
    };
  } catch (error) {
    console.error('Database error in generateMetadata:', error);
    return {
      title: 'Ürün | ARTI OPTİK',
      description: 'Ürün bilgileri yükleniyor.',
    };
  }
}

// Page component
export default async function ProductPage({ params }: PageProps) {
  let product: ProductDetail | null = null;
  try {
    const { slug } = await params;
    product = await getProductBySlug(slug);
  } catch (error) {
    console.error('Database error in ProductPage:', error);
    notFound();
  }

  if (!product) {
    notFound();
  }

  const variant = product.variants[0];
  if (!variant) {
    notFound();
  }

  const images = normalizeImages(variant.images);
  const priceNum = parseFloat(variant.price);
  // DB'de fiyat bazen Lira (2190) bazen kuruş (219000) olabiliyor; formatPrice her zaman kuruş bekliyor
  const priceKurus =
    priceNum >= 100_000 ? Math.round(priceNum) : Math.round(priceNum * 100);
  const outOfStock = variant.stockStatus === 'out_of_stock' || (variant.stock || 0) === 0;
  const attributesRecord =
    variant.attributes && typeof variant.attributes === 'object' && !Array.isArray(variant.attributes)
      ? (variant.attributes as Record<string, unknown>)
      : null;

  const genderLabel = getGenderLabel(product.gender);
  const breadcrumbItems = [
    { label: 'Anasayfa', href: '/' },
    { label: `${genderLabel} Güneş Gözlüğü`, href: `/${product.gender}/gunes-gozlugu` },
    { label: product.name },
  ];

  const base = CANONICAL_BASE;
  const breadcrumbListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: {
        '@id': item.href != null ? new URL(item.href, base).toString() : new URL(`/urun/${product.slug}`, base).toString(),
      },
    })),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListJsonLd) }}
      />
      <div className="container mx-auto px-4 pt-4 pb-[calc(96px+env(safe-area-inset-bottom))] xl:pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sol: Galeri (ana resim + thumbnails) */}
        <div className="min-w-0">
          {images.length > 0 ? (
            <ProductGallery images={images} productName={product.name} />
          ) : (
            <div className="aspect-[4/5] bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
              Görsel yok
            </div>
          )}
        </div>

        {/* Sağ: Breadcrumb, Marka, Başlık, Fiyat, Özellikler, Sepete Ekle */}
        <div className="space-y-6 min-w-0">
          <Breadcrumbs items={breadcrumbItems} />
          <ProductInfo
            brand={product.brand.name}
            name={product.name}
            price={priceKurus}
            description={product.description}
          />
          <ProductSpecs attributes={attributesRecord} />
          <div className="hidden xl:block">
            <AddToCart
              productId={product.id}
              variantId={variant.id}
              name={product.name}
              price={priceKurus}
              image={images[0] ?? null}
              slug={product.slug}
              brand={product.brand.name}
              disabled={outOfStock}
            />
          </div>
        </div>
      </div>

      <StickyProductBar
        productId={product.id}
        variantId={variant.id}
        name={product.name}
        price={priceKurus}
        image={images[0] ?? null}
        slug={product.slug}
        brand={product.brand.name}
        disabled={outOfStock}
      />
      </div>
    </div>
  );
}
