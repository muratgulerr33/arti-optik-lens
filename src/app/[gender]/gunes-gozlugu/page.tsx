import { Suspense } from "react"
import { CategoryContent } from "./category-content"
import { getProductsByCategory, type ProductFilters } from "@/lib/api/products"

export const dynamic = "force-dynamic"

const genderMap = { kadin: "kadin", erkek: "erkek", unisex: "unisex" } as const
const genderLabelMap: Record<string, string> = {
  kadin: "Kadın",
  women: "Kadın",
  erkek: "Erkek",
  men: "Erkek",
  unisex: "Unisex",
  kids: "Çocuk",
}
const getGenderLabel = (gender: string) =>
  genderLabelMap[gender?.toLowerCase() ?? ""] ?? gender
const categoryLabel = "Güneş Gözlükleri"
type GenderSlug = keyof typeof genderMap

interface PageProps {
  params: Promise<{ gender: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: PageProps) {
  const { gender } = await params
  const genderLabel = getGenderLabel(gender)
  const title = `${genderLabel} ${categoryLabel} | ARTI OPTİK`
  const description = `${genderLabel} ${categoryLabel} kategorisinde güneş gözlükleri.`
  return { title, description }
}

function parseFiltersFromSearchParams(
  searchParams: { [key: string]: string | string[] | undefined }
): ProductFilters | undefined {
  const get = (key: string) => {
    const v = searchParams[key]
    return Array.isArray(v) ? v[0] : (v as string | undefined)
  }
  const shape = get("shape")?.trim()
  const color_frame = get("color_frame")?.trim()
  const material = get("material")?.trim()
  const color_lens = get("color_lens")?.trim()
  const feature = get("feature")?.trim()
  const size = get("size")?.trim()
  const gender = get("gender")?.trim()
  const model_code = get("model_code")?.trim()
  if (
    !shape &&
    !color_frame &&
    !material &&
    !color_lens &&
    !feature &&
    !size &&
    !gender &&
    !model_code
  )
    return undefined
  const filters: ProductFilters = {}
  if (shape) filters.shape = shape
  if (color_frame) filters.color_frame = color_frame
  if (material) filters.material = material
  if (color_lens) filters.color_lens = color_lens
  if (feature) filters.feature = feature
  if (size) filters.size = size
  if (gender) filters.gender = gender
  if (model_code) filters.model_code = model_code
  return filters
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { gender } = await params
  const rawParams = await searchParams
  const dbGender = genderMap[gender.toLowerCase() as GenderSlug] ?? "unisex"
  const filters = parseFiltersFromSearchParams(rawParams)
  const { products: initialProducts, dbError } = await getProductsByCategory(
    dbGender,
    filters
  )

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
