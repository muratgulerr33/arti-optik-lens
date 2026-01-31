import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { products, productVariants, brands, categories } from '@/db/schema';
import { eq, or, ilike, and, sql, desc } from 'drizzle-orm';
import {
  canonicalizeTerm,
  resolveFilter,
  normalizeForSearchVariants,
  stemTrSuffix,
  SHAPE_MAP,
  COLOR_MAP,
  MATERIAL_MAP,
  GENDER_MAP,
} from '@/lib/dictionaries';

export const dynamic = 'force-dynamic';

// Zayıf (generic) tokenlar: sadece gözlük/güneş gibi genel kelimeler; gender weak değil (PASS1'de AND, PASS2'de kaldırılır)
const GENERIC_WEAK_TOKENS = new Set([
  'gozluk',
  'gozlugu',
  'gozlukler',
  'gunes',
  'guneslik',
  'sunglasses',
  'sunglass',
  'glasses',
]);

const MAX_REQUIRED_TERMS = 6;
const MAX_BONUS_PHRASES = 6;
const MAX_TERMS = 12;

/** PASS3 (pg_trgm): Terimi index ile aynı şekilde normalize et — lower + TR ascii + non-alnum. */
function normForTrgm(term: string): string {
  if (typeof term !== 'string' || !term) return '';
  let s = term.trim().toLowerCase();
  s = s.replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u');
  return s.replace(/[^a-z0-9]+/g, '');
}

/** PASS3: Index expression ile aynı normalized expression (translate + regexp_replace). */
function dbNormExpr(
  col: typeof products.name | typeof brands.name | typeof brands.slug
): ReturnType<typeof sql> {
  return sql`regexp_replace(translate(lower(${col}::text), 'çğıöşü', 'cgiosu'), '[^a-z0-9]+', '', 'g')`;
}

/** PASS3: similarity(column_norm, termNorm) >= threshold (pg_trgm). Parametreyi text cast et (unknown -> text). */
function trgmSimilar(
  col: typeof products.name | typeof brands.name | typeof brands.slug,
  termNorm: string,
  threshold: number
): ReturnType<typeof sql> {
  return sql`similarity(${dbNormExpr(col)}, (${termNorm})::text) >= ${threshold}`;
}

const TRGM_THRESHOLD = 0.28;
const BRAND_TRGM_THRESHOLD = 0.35;

// DB kolonunu normalize et: lower + TR ascii + non-alnum kaldır (Ray-Ban -> rayban); tokenNorm zaten tire yok
function normalizedColumnLike(
  col: typeof products.name | typeof brands.name | typeof brands.slug,
  tokenNormNoHyphen: string
) {
  const like = '%' + tokenNormNoHyphen + '%';
  return sql`regexp_replace(replace(replace(replace(replace(replace(replace(lower(${col}::text), 'ç','c'), 'ğ','g'), 'ı','i'), 'ö','o'), 'ş','s'), 'ü','u'), '[^a-z0-9]+', '', 'g') LIKE ${like}`;
}

/** Tek terim (raw+canon) için tüm alanlarda OR koşulu üretir (phrase BONUS / required için ortak). */
function buildTermOrCondition(raw: string, canon: string): ReturnType<typeof sql> {
  const baseVariants = raw.includes(' ')
    ? [canon, canon.replace(/-/g, '')]
    : normalizeForSearchVariants(raw);
  // Alias'tan gelen canon'u da ara (örn. uv400 -> uv; üründe "UV 400" geçebilir)
  const variants = [...new Set([...baseVariants, canon, canon.replace(/-/g, '')])];
  const orParts: ReturnType<typeof sql>[] = [];
  for (const variant of variants) {
    const pattern = `%${variant}%`;
    const tokenNormNoHyphen = variant.replace(/-/g, '');
    orParts.push(
      ilike(products.name, pattern),
      ilike(brands.name, pattern),
      sql`LOWER(REPLACE(${brands.slug}::text, '-', '')) LIKE LOWER(${'%' + tokenNormNoHyphen + '%'})`,
      normalizedColumnLike(products.name, tokenNormNoHyphen),
      normalizedColumnLike(brands.name, tokenNormNoHyphen),
      normalizedColumnLike(brands.slug, tokenNormNoHyphen),
      ilike(products.gender, pattern),
      sql`product_variants.attributes->>'model_numarasi' ILIKE ${pattern}`,
      sql`product_variants.attributes->>'core_model_code' ILIKE ${pattern}`,
      sql`product_variants.attributes->>'urun_kodu' ILIKE ${pattern}`,
      sql`product_variants.attributes->>'lens_tech' ILIKE ${pattern}`,
      sql`product_variants.attributes->>'feature_lens' ILIKE ${pattern}`,
      sql`product_variants.attributes->>'cam_ozelligi' ILIKE ${pattern}`,
      sql`product_variants.attributes::text ILIKE ${pattern}`,
      ilike(productVariants.sku, pattern),
    );
    const normResolved = resolveFilter(variant);
    // Gender: NOT in WHERE (filter); only used in scoreRow as ranking hint
    if (SHAPE_MAP[normResolved]) {
      for (const s of SHAPE_MAP[normResolved]) {
        orParts.push(
          sql`product_variants.attributes->>'shape' ILIKE ${'%' + s + '%'}`
        );
      }
    }
    if (COLOR_MAP[normResolved]) {
      for (const c of COLOR_MAP[normResolved]) {
        orParts.push(
          sql`product_variants.attributes->>'color_frame' ILIKE ${'%' + c + '%'}`
        );
      }
    }
    if (MATERIAL_MAP[normResolved]) {
      for (const m of MATERIAL_MAP[normResolved]) {
        orParts.push(
          sql`product_variants.attributes->>'material' ILIKE ${'%' + m + '%'}`
        );
      }
    }
  }
  return or(...orParts)!;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q')?.trim() || '';
    const limitParam = searchParams.get('limit');
    const defaultLimit = 24;
    const minLimit = 1;
    const maxLimit = 100;
    const limitClamped =
      limitParam != null &&
      limitParam !== '' &&
      Number.isFinite(Number(limitParam))
        ? Math.min(maxLimit, Math.max(minLimit, Number(limitParam)))
        : defaultLimit;

    // Browse mode: q boşsa ürün listesi (created_at desc), limit 24
    if (!q) {
      const browseLimit = Math.min(maxLimit, Math.max(minLimit, limitClamped));
      const browseRows = await db
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
        .orderBy(desc(products.id))
        .limit(browseLimit * 2);
      const seen = new Set<number>();
      const deduped = browseRows.filter((r) => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      });
      const items = deduped.slice(0, browseLimit).map((item) => {
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
          brand: item.brand?.name ?? '',
        };
      }).filter((i) => i.price > 0);
      return NextResponse.json({
        items,
        categories: [],
        fallbackCategory: null,
        fallbackItems: [],
      });
    }

    // Ham tokenize + phrase (bigram, trigram)
    const words = q.split(/\s+/).filter(Boolean);
    const rawPhrases: string[] = [];
    for (let i = 0; i < words.length; i++) {
      rawPhrases.push(words[i]);
      if (i + 1 < words.length) rawPhrases.push(words[i] + ' ' + words[i + 1]);
      if (i + 2 < words.length) rawPhrases.push(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]);
    }
    const unigramCanon = words.map(canonicalizeTerm).filter(Boolean);

    // requiredTerms = sadece strong unigram'lar (max 6) — PASS1'de AND; gender ASLA required'a girmez
    const requiredTerms: { raw: string; canon: string }[] = [];
    for (const w of words) {
      const c = canonicalizeTerm(w);
      if (c && !GENERIC_WEAK_TOKENS.has(c) && !GENDER_MAP[c]) {
        if (!requiredTerms.some((r) => r.canon === c)) requiredTerms.push({ raw: w, canon: c });
        if (requiredTerms.length >= MAX_REQUIRED_TERMS) break;
      }
    }

    // bonusTerms = bigram+trigram (max 6) + weak unigram'lar — sadece OR, asla zorunlu değil
    const bonusTerms: { raw: string; canon: string }[] = [];
    const seenBonus = new Set<string>();
    for (const p of rawPhrases) {
      if (!p.includes(' ')) continue;
      const c = canonicalizeTerm(p);
      if (c && !seenBonus.has(c)) {
        seenBonus.add(c);
        bonusTerms.push({ raw: p, canon: c });
        if (bonusTerms.length >= MAX_BONUS_PHRASES) break;
      }
    }
    for (const w of words) {
      const c = canonicalizeTerm(w);
      if (c && (GENERIC_WEAK_TOKENS.has(c) || GENDER_MAP[c])) bonusTerms.push({ raw: w, canon: c });
    }

    const allCanonTerms = [
      ...requiredTerms.map((r) => r.canon),
      ...bonusTerms.map((b) => b.canon),
    ];
    const filters: {
      color?: string[];
      shape?: string[];
      gender?: string;
    } = {};
    for (const term of [...new Set(allCanonTerms)]) {
      if (COLOR_MAP[term]) filters.color = COLOR_MAP[term];
      if (SHAPE_MAP[term]) filters.shape = SHAPE_MAP[term];
      if (GENDER_MAP[term]) filters.gender = GENDER_MAP[term];
    }

    // requiredTerms boşsa (sadece "gunes gozluk" gibi): bonusTerms ile OR, limit default 24
    const onlyBonus = requiredTerms.length === 0 && bonusTerms.length > 0;
    const limit = onlyBonus ? defaultLimit : limitClamped;

    // Brand lock: query tokenlarından biri brand'e benziyorsa brand_id filter; relax pass'lerde ASLA kaldırma
    const brandTokens = new Set<string>();
    for (const c of unigramCanon) {
      if (c.length >= 4) brandTokens.add(c);
      const stem = stemTrSuffix(c);
      if (stem && stem.length >= 4) brandTokens.add(stem);
    }
    let brandLockId: number | null = null;
    for (const token of brandTokens) {
      const termNorm = normForTrgm(token);
      if (!termNorm) continue;
      try {
        const rows = await db
          .select({ id: brands.id })
          .from(brands)
          .where(
            or(
              trgmSimilar(brands.name, termNorm, BRAND_TRGM_THRESHOLD),
              trgmSimilar(brands.slug, termNorm, BRAND_TRGM_THRESHOLD)
            )!
          )
          .orderBy(
            sql`GREATEST(
              similarity(${dbNormExpr(brands.name)}, (${termNorm})::text),
              similarity(${dbNormExpr(brands.slug)}, (${termNorm})::text)
            ) DESC`
          )
          .limit(1);
        if (rows.length > 0) {
          brandLockId = rows[0].id;
          break;
        }
      } catch {
        // pg_trgm not available
      }
    }

    const hasFilters = !!(
      (filters.color?.length ?? 0) ||
      (filters.shape?.length ?? 0) ||
      filters.gender
    );
    if (!hasFilters && requiredTerms.length === 0 && bonusTerms.length === 0) {
      return NextResponse.json({
        items: [],
        categories: [],
        fallbackCategory: null,
        fallbackItems: [],
      });
    }
    if (!hasFilters && q.length < 2) {
      return NextResponse.json({
        items: [],
        categories: [],
        fallbackCategory: null,
        fallbackItems: [],
      });
    }

    // Brand lock (relax pass'lerde kaldırılmaz), renk ve şekil AND (filtre); gender sadece ranking hint
    const andConditions: ReturnType<typeof sql>[] = [];
    if (brandLockId != null) {
      andConditions.push(eq(products.brandId, brandLockId));
    }
    if (filters.color?.length) {
      andConditions.push(
        or(
          ...filters.color.map(
            (c) =>
              sql`product_variants.attributes->>'color_frame' ILIKE ${'%' + c + '%'}`
          )
        )!
      );
    }

    // Arama terimleri: requiredTerms (AND) veya bonusTerms (OR); phrase BONUS — asla zorunlu değil
    let termConditions: ReturnType<typeof sql>[];
    if (requiredTerms.length === 0) {
      // Sadece bonus: tek büyük OR (0'a düşmesin)
      termConditions =
        bonusTerms.length > 0
          ? [or(...bonusTerms.map((b) => buildTermOrCondition(b.raw, b.canon)))!]
          : [];
    } else {
      // PASS1: requiredTerms AND (her biri token başına OR)
      termConditions = requiredTerms.map((r) => buildTermOrCondition(r.raw, r.canon));
    }

    // Şekil filtresi (AND): Arama çubuğunda şekil kelimesi varsa attributes->>'shape' ile eşleştir
    if (filters.shape?.length) {
      andConditions.push(
        or(
          ...filters.shape.map(
            (s) =>
              sql`product_variants.attributes->>'shape' ILIKE ${'%' + s + '%'}`
          )
        )!
      );
    }

    const hasStructuredFilters = !!(
      filters.gender ||
      (filters.shape?.length ?? 0) ||
      (filters.color?.length ?? 0)
    );

    function buildConditions(
      _relaxGender: boolean,
      terms: ReturnType<typeof sql>[]
    ): ReturnType<typeof sql>[] {
      return [...andConditions, ...terms];
    }

    function runQuery(
      relaxGender: boolean,
      terms: ReturnType<typeof sql>[]
    ): Promise<
      {
        id: number;
        name: string | null;
        slug: string | null;
        brand: { id: number; name: string | null; slug: string | null } | null;
        variant: {
          id: number | null;
          price: string | null;
          images: unknown;
          attributes: unknown;
        } | null;
      }[]
    > {
      const finalConditions = buildConditions(relaxGender, terms);
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
      return baseQuery.limit(limit * 5);
    }

    let allResults = await runQuery(false, termConditions);

    // Multi-pass relax: PASS1 sonuç 0 ise PASS2 — requiredTerms OR, gender kaldır
    if (
      requiredTerms.length > 0 &&
      allResults.length === 0 &&
      (termConditions.length > 0 || andConditions.length > 0)
    ) {
      const pass2TermConditions = [
        or(...requiredTerms.map((r) => buildTermOrCondition(r.raw, r.canon)))!,
      ];
      const pass2Results = await runQuery(true, pass2TermConditions);
      if (pass2Results.length > 0) {
        allResults = pass2Results;
      }
    }

    // PASS3 (pg_trgm): PASS1+PASS2 sonuç 0 ve en az bir requiredTerm uzunluğu >= 4 ise fuzzy similarity
    const longRequiredTerms = requiredTerms.filter((r) => r.canon.length >= 4);
    if (
      allResults.length === 0 &&
      longRequiredTerms.length > 0
    ) {
      try {
        const termNorms = longRequiredTerms.map((r) => normForTrgm(r.canon));
        const pass3FuzzyParts: ReturnType<typeof sql>[] = [];
        for (const termNorm of termNorms) {
          if (!termNorm) continue;
          pass3FuzzyParts.push(
            trgmSimilar(brands.name, termNorm, TRGM_THRESHOLD),
            trgmSimilar(brands.slug, termNorm, TRGM_THRESHOLD),
            trgmSimilar(products.name, termNorm, TRGM_THRESHOLD)
          );
        }
        if (pass3FuzzyParts.length > 0) {
          const pass3Condition = or(...pass3FuzzyParts)!;
          const pass3And = [...andConditions, pass3Condition];
          const termNorm1 = termNorms[0]!;
          const orderBySim = sql`GREATEST(
            similarity(${dbNormExpr(brands.name)}, (${termNorm1})::text),
            similarity(${dbNormExpr(brands.slug)}, (${termNorm1})::text),
            similarity(${dbNormExpr(products.name)}, (${termNorm1})::text)
          ) DESC`;
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
            .where(and(...pass3And))
            .orderBy(orderBySim)
            .limit(limit);
          const pass3Results = await pass3Query;
          if (pass3Results.length > 0) {
            allResults = pass3Results;
          }
        }
      } catch (pass3Err) {
        // pg_trgm yüklü değilse (örn. extension yok) PASS3 atlanır; 500 yerine boş sonuç
        const code = (pass3Err as { cause?: { code?: string }; code?: string })?.cause?.code ?? (pass3Err as { code?: string })?.code;
        if (code === '42883') {
          // function does not exist -> pg_trgm yok
        } else {
          throw pass3Err;
        }
      }
    }

    // Puanlama: requiredTerm +2, bonusTerm +1, exact brand match +3 (PASS2 "Google vari" relax)
    function scoreRow(
      item: (typeof allResults)[0],
      reqTerms: { raw: string; canon: string }[],
      bonusTermsList: { raw: string; canon: string }[]
    ): number {
      const name = (item.name ?? '').toLowerCase().replace(/-/g, '');
      const brandName = (item.brand?.name ?? '').toLowerCase().replace(/-/g, '');
      const brandSlug = (item.brand?.slug ?? '').toLowerCase().replace(/-/g, '');
      const attrsText = JSON.stringify(item.variant?.attributes ?? {}).toLowerCase();
      let total = 0;
      for (const { canon } of reqTerms) {
        const t = canon.toLowerCase().replace(/-/g, '');
        if (
          name.includes(t) ||
          brandName.includes(t) ||
          brandSlug.includes(t) ||
          attrsText.includes(t)
        ) {
          total += 2;
        }
      }
      for (const { canon } of bonusTermsList) {
        const t = canon.toLowerCase().replace(/-/g, '');
        if (
          name.includes(t) ||
          brandName.includes(t) ||
          brandSlug.includes(t) ||
          attrsText.includes(t)
        ) {
          total += 1;
        }
      }
      // Exact brand match (slug/name normalized) +3
      for (const { canon } of reqTerms) {
        const t = canon.toLowerCase().replace(/-/g, '');
        if (brandSlug === t || brandName === t) {
          total += 3;
          break;
        }
      }
      // Gender match (ranking hint only): +2
      const itemGender = (item as { gender?: string }).gender ?? '';
      for (const { canon } of bonusTermsList) {
        if (GENDER_MAP[canon] && itemGender === GENDER_MAP[canon]) {
          total += 2;
          break;
        }
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
      .sort(
        (a, b) =>
          scoreRow(b, requiredTerms, bonusTerms) - scoreRow(a, requiredTerms, bonusTerms)
      )
      .slice(0, limit);

    const items = searchResults
      .map((item) => {
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
          brand: item.brand?.name ?? '',
        };
      })
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
