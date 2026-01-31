/**
 * TR harf sadeleştirme: ç->c, ğ->g, ı->i, ö->o, ş->s, ü->u
 */
function trToAscii(s: string): string {
  return s
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
}

/**
 * Katman 1: trim, lower, TR sadeleştirme, boşlukları '-', alfanumerik olmayan karakterleri temizle (tek tire/boşluk bırak).
 */
export function normalizeBasic(value: string): string {
  if (typeof value !== 'string') return ''
  let s = value.trim().toLowerCase()
  s = trToAscii(s)
  s = s.replace(/\s+/g, '-')
  // Gereksiz karakterleri temizle: non-alnum ve tire dışındakileri boşluk yap, sonra tek tire
  s = s.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return s
}

/**
 * Katman 2: harf tekrarlarını tekilleştir (gunnes -> gunes, damlla -> damla).
 */
export function collapseRepeats(value: string): string {
  if (typeof value !== 'string' || !value) return ''
  let s = value
  let prev = ''
  let out = ''
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c !== prev) {
      out += c
      prev = c
    }
  }
  return out
}

/** TR suffix list: lar/ler, nin/nın->nin, nun/nün->nun, in/ın->in, un/ün->un (input already normalized). */
const TR_SUFFIXES = ['lar', 'ler', 'nin', 'nun', 'in', 'un'];

/**
 * Turkish suffix stemming: apply after normalizeBasic + collapseRepeats.
 * Only for long words (len >= 6). If stem length >= 4, return stem variant.
 */
export function stemTrSuffix(value: string): string | null {
  if (typeof value !== 'string' || value.length < 6) return null
  const lower = value.toLowerCase()
  for (const suffix of TR_SUFFIXES) {
    if (lower.endsWith(suffix)) {
      const stem = lower.slice(0, -suffix.length)
      if (stem.length >= 4) return stem
      return null
    }
  }
  return null
}

// --- SSOT: Alias -> canonical (normalize edilmiş key) ---
export const TERM_ALIASES: Record<string, string> = {
  // gender
  kad: 'kadin',
  kdn: 'kadin',
  kdin: 'kadin',
  bayan: 'kadin',
  woman: 'kadin',
  women: 'kadin',
  lady: 'kadin',
  female: 'kadin',
  erk: 'erkek',
  erke: 'erkek',
  bay: 'erkek',
  men: 'erkek',
  man: 'erkek',
  male: 'erkek',
  uni: 'unisex',
  unisex: 'unisex',
  cocuk: 'kids',
  kids: 'kids',
  kid: 'kids',
  child: 'kids',
  junior: 'kids',
  // generic (weak)
  gozluk: 'gozluk',
  gozlugu: 'gozluk',
  gozlukler: 'gozluk',
  gunes: 'gunes',
  guneslik: 'gunes',
  sunglasses: 'gunes',
  sunglass: 'gunes',
  glasses: 'gunes',
  glass: 'gunes',
  // shape
  dam: 'damla',
  daml: 'damla',
  damlaa: 'damla',
  damlla: 'damla',
  aviator: 'damla',
  pilot: 'damla',
  yuv: 'yuvarlak',
  yuva: 'yuvarlak',
  yuvar: 'yuvarlak',
  yuvarlk: 'yuvarlak',
  round: 'yuvarlak',
  kos: 'koseli',
  kose: 'koseli',
  koseli: 'koseli',
  kare: 'koseli',
  square: 'koseli',
  dikdort: 'rectangular',
  dikd: 'rectangular',
  rect: 'rectangular',
  dikdortgen: 'rectangular',
  rectangular: 'rectangular',
  cat: 'cat-eye',
  cateye: 'cat-eye',
  cekik: 'cat-eye',
  kedi: 'cat-eye',
  kedigozu: 'cat-eye',
  'kedi-gozu': 'cat-eye',
  butterfly: 'kelebek',
  kelebek: 'kelebek',
  geo: 'geometric',
  geometrik: 'geometric',
  geometric: 'geometric',
  altigen: 'geometric',
  hex: 'geometric',
  oval: 'oval',
  // feature
  pol: 'polarize',
  polar: 'polarize',
  polarize: 'polarize',
  polarized: 'polarize',
  uv400: 'uv',
  'uv-400': 'uv',
  uv_400: 'uv',
  uv: 'uv',
  'ray-ban': 'rayban',
  rayban: 'rayban',
  grad: 'degrade',
  gradyan: 'degrade',
  gradient: 'degrade',
  degrade: 'degrade',
  // color / material
  blk: 'black',
  blck: 'black',
  black: 'black',
  syh: 'siyah',
  siyah: 'siyah',
  kara: 'siyah',
  beyaz: 'white',
  white: 'white',
  gold: 'altin',
  altin: 'altin',
  sari: 'altin',
  gumus: 'gri',
  gri: 'gri',
  silver: 'gri',
  mavi: 'mavi',
  blue: 'mavi',
  kahve: 'kahverengi',
  kahverengi: 'kahverengi',
  brown: 'kahverengi',
  kirmizi: 'kirmizi',
  red: 'kirmizi',
  bordo: 'kirmizi',
  yesil: 'yesil',
  green: 'yesil',
  transparent: 'transparent',
  seffaf: 'transparent',
  multi: 'multi',
  metal: 'metal',
  metl: 'metal',
  celik: 'metal',
  titanyum: 'metal',
  plastik: 'plastic',
  plastic: 'plastic',
  asetat: 'plastic',
  acetate: 'plastic',
  karisik: 'mixed',
  mixed: 'mixed',
}

/**
 * Terimi canonical forma getirir: normalizeBasic -> collapseRepeats -> TERM_ALIASES lookup.
 * Alias yoksa stem varyantını (raybanlar -> rayban) TERM_ALIASES için dener.
 */
export function canonicalizeTerm(input: string): string {
  if (typeof input !== 'string' || !input.trim()) return ''
  const normalized = normalizeBasic(input)
  if (!normalized) return ''
  const collapsed = collapseRepeats(normalized)
  const key = collapsed || normalized
  const fromAlias = TERM_ALIASES[key] ?? TERM_ALIASES[normalized]
  if (fromAlias) return fromAlias
  const stem = stemTrSuffix(key)
  if (stem) {
    const fromStem = TERM_ALIASES[stem]
    if (fromStem) return fromStem
  }
  return key
}

/**
 * Arama için token varyantları: [basic, collapsed, stemmed] — OR ile kullanılacak.
 */
export function normalizeForSearchVariants(value: string): string[] {
  const basic = normalizeBasic(value)
  if (!basic) return []
  const collapsed = collapseRepeats(basic)
  const set = new Set<string>([basic])
  if (collapsed && collapsed !== basic) set.add(collapsed)
  const stem = stemTrSuffix(collapsed || basic)
  if (stem) set.add(stem)
  return [...set]
}

// --- SSOT: Filtre değerleri (DB'deki attributes ile eşleşecek) ---

export const SHAPE_MAP: Record<string, string[]> = {
  damla: ['Damla', 'Pilot', 'Aviator'],
  aviator: ['Damla', 'Pilot', 'Aviator'],
  pilot: ['Damla', 'Pilot', 'Aviator'],
  yuvarlak: ['Yuvarlak', 'Round'],
  round: ['Yuvarlak', 'Round'],
  koseli: ['Kare', 'Köşeli', 'Square'],
  kare: ['Kare', 'Köşeli', 'Square'],
  square: ['Kare', 'Köşeli', 'Square'],
  rectangular: ['Dikdörtgen', 'Rectangular'],
  dikdortgen: ['Dikdörtgen', 'Rectangular'],
  oval: ['Oval'],
  'cat-eye': ['Çekik', 'Cat Eye', 'Kedi Gözü'],
  cekik: ['Çekik', 'Cat Eye', 'Kedi Gözü'],
  kedi: ['Çekik', 'Cat Eye', 'Kedi Gözü'],
  kelebek: ['Kelebek', 'Butterfly'],
  butterfly: ['Kelebek', 'Butterfly'],
  geometric: ['Geometrik', 'Geometric', 'Altıgen', 'Sekizgen'],
  altigen: ['Geometrik', 'Geometric', 'Altıgen', 'Sekizgen'],
}

export const COLOR_MAP: Record<string, string[]> = {
  siyah: ['Siyah', 'Black'],
  kara: ['Siyah', 'Black'],
  black: ['Siyah', 'Black'],
  beyaz: ['Beyaz', 'White'],
  white: ['Beyaz', 'White'],
  altin: ['Altın', 'Gold', 'Sarı'],
  gold: ['Altın', 'Gold', 'Sarı'],
  sari: ['Altın', 'Gold', 'Sarı'],
  gri: ['Gümüş', 'Silver', 'Gri'],
  gumus: ['Gümüş', 'Silver', 'Gri'],
  silver: ['Gümüş', 'Silver', 'Gri'],
  mavi: ['Mavi', 'Blue'],
  blue: ['Mavi', 'Blue'],
  kahverengi: ['Kahverengi', 'Brown'],
  brown: ['Kahverengi', 'Brown'],
  kirmizi: ['Kırmızı', 'Red'],
  red: ['Kırmızı', 'Red'],
  bordo: ['Kırmızı', 'Red', 'Bordo'],
  yesil: ['Yeşil', 'Green'],
  green: ['Yeşil', 'Green'],
  transparent: ['Şeffaf', 'Transparent'],
  seffaf: ['Şeffaf', 'Transparent'],
  multi: ['Çok Renkli', 'Multi'],
}

export const MATERIAL_MAP: Record<string, string[]> = {
  metal: ['Metal', 'Çelik', 'Titanyum'],
  plastik: ['Plastik', 'Asetat', 'Kemik', 'Polikarbonat'],
  plastic: ['Plastik', 'Asetat', 'Kemik', 'Polikarbonat'],
  asetat: ['Plastik', 'Asetat', 'Kemik', 'Polikarbonat'],
  celik: ['Metal', 'Çelik', 'Titanyum'],
  titanyum: ['Metal', 'Çelik', 'Titanyum'],
  karisik: ['Karışık', 'Mixed'],
  mixed: ['Karışık', 'Mixed'],
}

export const GENDER_MAP: Record<string, string> = {
  erkek: 'erkek',
  kadin: 'kadin',
  unisex: 'unisex',
  kids: 'kids',
}

/** DB'de lens_tech / feature_lens / cam_ozelligi ile eşleşecek değerler (SSOT). */
export const FEATURE_MAP: Record<string, string[]> = {
  polarize: ['Polarize', 'Polarized', 'Polar'],
  polarized: ['Polarize', 'Polarized', 'Polar'],
  uv: ['UV400', 'UV 400', 'UV-400', 'UV'],
  uv400: ['UV400', 'UV 400', 'UV-400', 'UV'],
  degrade: ['Degrade', 'Gradyan', 'Gradient'],
  gradyan: ['Degrade', 'Gradyan', 'Gradient'],
}

export type FilterType =
  | 'shape'
  | 'color_frame'
  | 'material'
  | 'color_lens'
  | 'feature'
  | 'gender'
  | 'size'

/**
 * Filtre/arama terimlerini canonical forma getirir (SSOT). Map lookup için canonicalizeTerm kullan.
 */
export function resolveFilter(value: string): string {
  if (typeof value !== 'string') return ''
  return canonicalizeTerm(value)
}

/**
 * Canonical terim + filtre tipi ile DB'de aranacak değer listesini döndürür (SSOT).
 * Kategori filtreleri ve arama tarafında tek kaynak.
 */
export function getFilterDbValues(value: string, type: FilterType): string[] {
  if (typeof value !== 'string' || !value.trim()) return []
  const canonical = canonicalizeTerm(value)
  if (!canonical) return []

  switch (type) {
    case 'shape':
      return SHAPE_MAP[canonical] ?? [canonical]
    case 'color_frame':
    case 'color_lens':
      return COLOR_MAP[canonical] ?? [canonical]
    case 'material':
      return MATERIAL_MAP[canonical] ?? [canonical]
    case 'feature':
      return FEATURE_MAP[canonical] ?? [canonical]
    case 'gender':
      return GENDER_MAP[canonical] ? [GENDER_MAP[canonical]] : [canonical]
    case 'size':
      return [canonical]
    default:
      return [canonical]
  }
}
