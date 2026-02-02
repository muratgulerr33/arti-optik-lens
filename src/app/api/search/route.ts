import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { products, productVariants, brands, categories } from '@/db/schema';
import { eq, or, ilike, and, sql, desc } from 'drizzle-orm';
import {
  normalizeForMatch,
  canonicalizeTerm,
  getFilterDbValues,
  SHAPE_MAP as DICT_SHAPE_MAP,
} from '@/lib/dictionaries';

export const dynamic = 'force-dynamic';

// --- Full Spectrum Smart Search: Sözlükler (renk + cinsiyet tespiti; shape SSOT dictionaries) ---
const COLOR_MAP: Record<string, string> = {
  siyah: 'siyah',
  kara: 'siyah',
  black: 'siyah',
  beyaz: 'beyaz',
  white: 'beyaz',
  gold: 'altin',
  altin: 'altin',
  sari: 'altin',
  gumus: 'gumus',
  gri: 'gumus',
  silver: 'gumus',
  mavi: 'mavi',
  blue: 'mavi',
  kahve: 'kahverengi',
  kahverengi: 'kahverengi',
  brown: 'kahverengi',
  kirmizi: 'kirmizi',
  red: 'kirmizi',
  bordo: 'kirmizi',
};

/** Cinsiyet tokenı mı (sadece skor bonusu, filtre yok). */
const GENDER_MAP: Record<string, string> = {
  erkek: 'erkek',
  bay: 'erkek',
  men: 'erkek',
  man: 'erkek',
  erk: 'erkek',
  kadin: 'kadin',
  bayan: 'kadin',
  women: 'kadin',
  woman: 'kadin',
  kdn: 'kadin',
  unisex: 'unisex',
};

/** PR10: Stopwords / weak tokens — canonical form; requiredTerms'a alınmaz (bonus/skor için kalır). */
const STOPWORDS_CANON = new Set<string>([
  'gozluk',
  'gunes',
]);

function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c');
}

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

function mapRowToItem(
  item: {
    id: number;
    name: string | null;
    slug: string | null;
    brand: { name: string };
    variant: { price: unknown; images: unknown } | null;
  }
) {
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
    id: item.id,
    title: item.name,
    price,
    image,
    slug: item.slug,
    brand: item.brand.name,
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q')?.trim() || '';
    const shapeParam = searchParams.get('shape')?.trim() || '';
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10)),
      MAX_LIMIT
    );

    // D) Browse mode: q boşken son ürünleri döndür; shape param varsa sadece shape filtresi ile döndür
    if (!q) {
      const shapeCanonical = shapeParam ? canonicalizeTerm(shapeParam) : '';
      const shapeDbValues =
        shapeCanonical && shapeCanonical in DICT_SHAPE_MAP
          ? getFilterDbValues(shapeCanonical, 'shape')
          : [];

      if (shapeDbValues.length > 0) {
        const shapeRows = await db
          .select({
            id: products.id,
            name: products.name,
            slug: products.slug,
            brand: { name: brands.name },
            variant: {
              price: productVariants.price,
              images: productVariants.images,
            },
          })
          .from(products)
          .innerJoin(brands, eq(products.brandId, brands.id))
          .leftJoin(productVariants, eq(products.id, productVariants.productId))
          .where(
            or(
              ...shapeDbValues.map(
                (val) =>
                  sql`product_variants.attributes::text ILIKE ${'%' + val + '%'}`
              )!
            )
          )
          .orderBy(desc(products.id))
          .limit(limit * 2);

        const seen = new Set<number>();
        const deduped = shapeRows.filter((r) => {
          if (seen.has(r.id)) return false;
          seen.add(r.id);
          return true;
        });
        const items = deduped
          .slice(0, limit)
          .map((row) => mapRowToItem(row as Parameters<typeof mapRowToItem>[0]))
          .filter((item) => item.price > 0);

        return NextResponse.json({
          items,
          categories: [],
          fallbackCategory: null,
          fallbackItems: [],
        });
      }

      const browseRows = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          brand: { name: brands.name },
          variant: {
            price: productVariants.price,
            images: productVariants.images,
          },
        })
        .from(products)
        .innerJoin(brands, eq(products.brandId, brands.id))
        .leftJoin(productVariants, eq(products.id, productVariants.productId))
        .orderBy(desc(products.id))
        .limit(limit * 2);

      const seen = new Set<number>();
      const deduped = browseRows.filter((r) => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      });
      const items = deduped
        .slice(0, limit)
        .map((row) => mapRowToItem(row as Parameters<typeof mapRowToItem>[0]))
        .filter((item) => item.price > 0);

      return NextResponse.json({
        items,
        categories: [],
        fallbackCategory: null,
        fallbackItems: [],
      });
    }

    // Brand phrase lock: tüm query normalize edilip marka eşleşirse brand_id filtresi (PASS2/PASS3'te kaldırılmaz)
    const queryNorm = normalizeForMatch(q);
    let lockedBrandId: number | null = null;
    let fullQueryExactBrandMatch = false;
    if (queryNorm.length >= 2) {
      const brandRows = await db
        .select({ id: brands.id, name: brands.name, slug: brands.slug })
        .from(brands);
      const exactMatch = brandRows.find(
        (b) =>
          normalizeForMatch(b.slug ?? '') === queryNorm ||
          normalizeForMatch(b.name) === queryNorm
      );
      if (exactMatch) {
        lockedBrandId = exactMatch.id;
        fullQueryExactBrandMatch = true;
      } else {
        try {
          const simRows = await db
            .select({ id: brands.id })
            .from(brands)
            .where(
              or(
                sql`similarity(regexp_replace(translate(lower(${brands.slug}), 'çğıöşü', 'cgiosu'), '[^a-z0-9]+', '', 'g'), ${queryNorm}) >= 0.35`,
                sql`similarity(regexp_replace(translate(lower(${brands.name}), 'çğıöşü', 'cgiosu'), '[^a-z0-9]+', '', 'g'), ${queryNorm}) >= 0.35`
              )!
            )
            .orderBy(
              sql`greatest(
                similarity(regexp_replace(translate(lower(${brands.slug}), 'çğıöşü', 'cgiosu'), '[^a-z0-9]+', '', 'g'), ${queryNorm}),
                similarity(regexp_replace(translate(lower(${brands.name}), 'çğıöşü', 'cgiosu'), '[^a-z0-9]+', '', 'g'), ${queryNorm})
              ) desc`
            )
            .limit(1);
          if (simRows.length > 0) lockedBrandId = simRows[0].id;
        } catch {
          // pg_trgm yoksa atla
        }
      }
    }

    // Sorgu analizi: kelimelere böl; shape/color SSOT dictionaries, gender sadece skor
    const words = q.split(/\s+/).filter(Boolean);
    const filters: {
      color?: string;
      shapeDbValues?: string[];
      gender?: string;
    } = {};
    const searchTerms: string[] = [];
    const genderTerms: string[] = [];

    // URL'den gelen shape param (örn. /search?shape=koseli) — canonicalize edip filtreye ekle
    if (shapeParam) {
      const shapeCanonical = canonicalizeTerm(shapeParam);
      if (shapeCanonical && shapeCanonical in DICT_SHAPE_MAP) {
        filters.shapeDbValues = getFilterDbValues(shapeCanonical, 'shape');
      }
    }

    // PR11: Tüm sorgu phrase alias → shape (örn. "kedi gozu" → kedi-gozu → cat-eye)
    const phraseCanonical = canonicalizeTerm(q);
    const phraseIsShape =
      phraseCanonical && phraseCanonical in DICT_SHAPE_MAP;
    if (phraseIsShape && !shapeParam) {
      filters.shapeDbValues = getFilterDbValues(phraseCanonical, 'shape');
    }

    for (const word of words) {
      if (phraseIsShape) continue;
      const norm = normalizeWord(word);
      if (COLOR_MAP[norm]) {
        filters.color = COLOR_MAP[norm];
      }
      const shapeCanonical = canonicalizeTerm(word);
      const isShape = shapeCanonical && shapeCanonical in DICT_SHAPE_MAP;
      if (isShape && !shapeParam) {
        filters.shapeDbValues = getFilterDbValues(shapeCanonical, 'shape');
      }
      if (GENDER_MAP[norm]) {
        filters.gender = GENDER_MAP[norm];
        genderTerms.push(word);
        // Gender filtre değil, requiredTerms'a ekleme
        continue;
      }
      // Shape kelimesi filtre olarak kullanıldı, required term değil
      if (isShape) continue;
      searchTerms.push(word);
    }

    // PR12: Tam sorgu similarity marka kilitlemediyse, ilk arama terimi ile dene (örn. "rayben erkek" → "rayben" ile Ray-Ban)
    if (
      lockedBrandId == null &&
      searchTerms.length > 0 &&
      normalizeForMatch(searchTerms[0]).length >= 2
    ) {
      try {
        const firstTermNorm = normalizeForMatch(searchTerms[0]);
        const simRows = await db
          .select({ id: brands.id })
          .from(brands)
          .where(
            or(
              sql`similarity(regexp_replace(translate(lower(${brands.slug}), 'çğıöşü', 'cgiosu'), '[^a-z0-9]+', '', 'g'), ${firstTermNorm}) >= 0.35`,
              sql`similarity(regexp_replace(translate(lower(${brands.name}), 'çğıöşü', 'cgiosu'), '[^a-z0-9]+', '', 'g'), ${firstTermNorm}) >= 0.35`
            )!
          )
          .orderBy(
            sql`greatest(
              similarity(regexp_replace(translate(lower(${brands.slug}), 'çğıöşü', 'cgiosu'), '[^a-z0-9]+', '', 'g'), ${firstTermNorm}),
              similarity(regexp_replace(translate(lower(${brands.name}), 'çğıöşü', 'cgiosu'), '[^a-z0-9]+', '', 'g'), ${firstTermNorm})
            ) desc`
          )
          .limit(1);
        if (simRows.length > 0) {
          lockedBrandId = simRows[0].id;
          fullQueryExactBrandMatch = false;
        }
      } catch {
        // pg_trgm yoksa atla
      }
    }

    const hasFilters = !!(
      filters.color ||
      (filters.shapeDbValues && filters.shapeDbValues.length > 0)
    );
    if (!hasFilters && searchTerms.length === 0 && !lockedBrandId) {
      return NextResponse.json({
        items: [],
        categories: [],
        fallbackCategory: null,
        fallbackItems: [],
      });
    }
    if (!hasFilters && searchTerms.length > 0 && searchTerms.join(' ').length < 2) {
      return NextResponse.json({
        items: [],
        categories: [],
        fallbackCategory: null,
        fallbackItems: [],
      });
    }

    // Tam sorgu bir marka ile tam eşleştiyse (exact brand phrase), term koşulu istemiyoruz; sadece brand_id yeterli.
    // Similarity lock (örn. "rayben erkek" → Ray-Ban) ise searchTerms kalır; markayı kilitleyen token required'dan çıkarılır.
    const searchTermsFinal =
      lockedBrandId != null && fullQueryExactBrandMatch ? [] : searchTerms;

    // PR12: Brand lock ile kilitlenen token required olmasın (canon === lockedBrandFromCanon → skip)
    let lockedBrandFromCanon: string | null = null;
    if (
      lockedBrandId != null &&
      !fullQueryExactBrandMatch &&
      searchTerms.length > 0
    ) {
      lockedBrandFromCanon = canonicalizeTerm(searchTerms[0]);
    }

    // PR10: requiredTerms = stopwords ve length<3 hariç; bunlar AND koşuluna girmez (bonus/skor kalır)
    const requiredTerms = searchTermsFinal.filter((term) => {
      const canon = canonicalizeTerm(term);
      if (lockedBrandFromCanon != null && canon === lockedBrandFromCanon) return false;
      return canon.length >= 3 && !STOPWORDS_CANON.has(canon);
    });

    // Sadece stopwords/generic ise (örn. "gunes gozlugu") browse ile doldur
    const andConditions: ReturnType<typeof sql>[] = [];
    if (lockedBrandId != null) {
      andConditions.push(eq(products.brandId, lockedBrandId));
    }
    if (filters.color) {
      andConditions.push(
        sql`product_variants.attributes::text ILIKE ${'%' + filters.color + '%'}`
      );
    }

    // A) Brand normalize + B) PASS2 ILIKE: Sadece requiredTerms için AND (PR10: stopwords hariç)
    const termConditions: ReturnType<typeof sql>[] = [];
    for (const term of requiredTerms) {
      const termNorm = normalizeForMatch(term);
      const pattern = `%${term}%`;
      termConditions.push(
        or(
          sql`regexp_replace(translate(lower(${brands.slug}), 'çğıöşü', 'cgiosu'), '[^a-z0-9]+', '', 'g') = ${termNorm}`,
          sql`regexp_replace(translate(lower(${brands.name}), 'çğıöşü', 'cgiosu'), '[^a-z0-9]+', '', 'g') = ${termNorm}`,
          sql`regexp_replace(translate(lower(${products.name}), 'çğıöşü', 'cgiosu'), '[^a-z0-9]+', '', 'g') LIKE ${'%' + termNorm + '%'}`,
          ilike(products.name, pattern),
          ilike(brands.name, pattern),
          ilike(categories.name, pattern),
          ilike(productVariants.sku, pattern),
          sql`product_variants.attributes::text ILIKE ${pattern}`
        )!
      );
    }

    // Şekil filtresi (SSOT: getFilterDbValues -> DB değerleri)
    if (filters.shapeDbValues && filters.shapeDbValues.length > 0) {
      andConditions.push(
        or(
          ...filters.shapeDbValues.map(
            (val) =>
              sql`product_variants.attributes::text ILIKE ${'%' + val + '%'}`
          )
        )!
      );
    }

    // PR10: Sadece stopwords kaldıysa ve başka filtre yoksa browse döndür
    if (requiredTerms.length === 0 && andConditions.length === 0) {
      const browseRows = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          brand: { name: brands.name },
          variant: {
            price: productVariants.price,
            images: productVariants.images,
          },
        })
        .from(products)
        .innerJoin(brands, eq(products.brandId, brands.id))
        .leftJoin(productVariants, eq(products.id, productVariants.productId))
        .orderBy(desc(products.id))
        .limit(limit * 2);
      const seenBrowse = new Set<number>();
      const dedupedBrowse = browseRows.filter((r) => {
        if (seenBrowse.has(r.id)) return false;
        seenBrowse.add(r.id);
        return true;
      });
      const browseItems = dedupedBrowse
        .slice(0, limit)
        .map((row) => mapRowToItem(row as Parameters<typeof mapRowToItem>[0]))
        .filter((item) => item.price > 0);
      return NextResponse.json({
        items: browseItems,
        categories: [],
        fallbackCategory: null,
        fallbackItems: [],
      });
    }

    const finalConditions: ReturnType<typeof sql>[] = [
      ...andConditions,
      ...(requiredTerms.length > 0 ? termConditions : []),
    ];

    let baseQuery = db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        gender: products.gender,
        brand: {
          id: brands.id,
          name: brands.name,
          slug: brands.slug,
        },
        variant: {
          id: productVariants.id,
          price: productVariants.price,
          images: productVariants.images,
          attributes: productVariants.attributes,
        },
      })
      .from(products)
      .innerJoin(brands, eq(products.brandId, brands.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productVariants, eq(products.id, productVariants.productId));

    if (finalConditions.length > 0) {
      baseQuery = baseQuery.where(and(...finalConditions)) as typeof baseQuery;
    }

    let allResults = await baseQuery.limit(limit * 5);

    // B) PASS3: PASS1+PASS2 0 dönerse pg_trgm similarity dene (typo tolerans); brand lock ASLA kaldırılmaz
    const termNormFull = normalizeForMatch(q);
    if (allResults.length === 0 && termNormFull.length >= 2) {
      try {
        const pass3Conditions: ReturnType<typeof sql>[] = [
          or(
            sql`similarity(regexp_replace(translate(lower(${brands.slug}), 'çğıöşü', 'cgiosu'), '[^a-z0-9]+', '', 'g'), ${termNormFull}) >= 0.35`,
            sql`similarity(regexp_replace(translate(lower(${brands.name}), 'çğıöşü', 'cgiosu'), '[^a-z0-9]+', '', 'g'), ${termNormFull}) >= 0.35`,
            sql`similarity(regexp_replace(translate(lower(${products.name}), 'çğıöşü', 'cgiosu'), '[^a-z0-9]+', '', 'g'), ${termNormFull}) >= 0.28`
          )!,
        ];
        if (lockedBrandId != null) {
          pass3Conditions.unshift(eq(products.brandId, lockedBrandId));
        }
        const pass3Query = db
          .select({
            id: products.id,
            name: products.name,
            slug: products.slug,
            gender: products.gender,
            brand: {
              id: brands.id,
              name: brands.name,
              slug: brands.slug,
            },
            variant: {
              id: productVariants.id,
              price: productVariants.price,
              images: productVariants.images,
              attributes: productVariants.attributes,
            },
          })
          .from(products)
          .innerJoin(brands, eq(products.brandId, brands.id))
          .innerJoin(categories, eq(products.categoryId, categories.id))
          .leftJoin(productVariants, eq(products.id, productVariants.productId))
          .where(and(...pass3Conditions))
          .orderBy(
            sql`greatest(
              similarity(regexp_replace(translate(lower(${brands.slug}), 'çğıöşü', 'cgiosu'), '[^a-z0-9]+', '', 'g'), ${termNormFull}),
              similarity(regexp_replace(translate(lower(${brands.name}), 'çğıöşü', 'cgiosu'), '[^a-z0-9]+', '', 'g'), ${termNormFull}),
              similarity(regexp_replace(translate(lower(${products.name}), 'çğıöşü', 'cgiosu'), '[^a-z0-9]+', '', 'g'), ${termNormFull})
            ) desc`
          )
          .limit(limit * 5);
        allResults = await pass3Query;
      } catch {
        // pg_trgm yoksa veya hata: PASS1/PASS2 sonucu dön (zaten 0)
      }
    }

    // Puanlama: isim başlangıcı (4) > isim içeriği (3) > marka (2) > özellikler (1); cinsiyet eşleşmesi bonus
    function scoreRow(
      item: (typeof allResults)[0],
      terms: string[],
      preferredGender: string | undefined
    ): number {
      const name = (item.name ?? '').toLowerCase();
      const brandName = (item.brand?.name ?? '').toLowerCase();
      const attrsText = JSON.stringify(item.variant?.attributes ?? {}).toLowerCase();
      const itemGender = (item as { gender?: string | null }).gender ?? '';
      let total = 0;
      for (const t of terms) {
        const term = t.toLowerCase();
        if (name.startsWith(term)) total += 4;
        else if (name.includes(term)) total += 3;
        else if (brandName.includes(term)) total += 2;
        else if (attrsText.includes(term)) total += 1;
      }
      if (preferredGender && itemGender && itemGender === preferredGender) {
        total += 2;
      }
      return total;
    }

    const seen = new Set<number>();
    const searchResults = allResults
      .filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      })
      .sort((a, b) => scoreRow(b, searchTermsFinal, filters.gender) - scoreRow(a, searchTermsFinal, filters.gender))
      .slice(0, limit);

    const items = searchResults
      .map((item) => mapRowToItem(item as Parameters<typeof mapRowToItem>[0]))
      .filter((item) => item.price > 0);

    return NextResponse.json({
      items,
      categories: [],
      fallbackCategory: null,
      fallbackItems: [],
    });
  } catch (error) {
    console.error('Search API error:', error);
    const cause = error instanceof Error ? error.cause : null;
    const code = (cause as { code?: string })?.code ?? (error as { code?: string })?.code;
    const isConnectionError = code === 'ECONNREFUSED';
    return NextResponse.json(
      {
        items: [],
        categories: [],
        fallbackCategory: null,
        fallbackItems: [],
      },
      { status: isConnectionError ? 200 : 500 }
    );
  }
}
