/** Deterministic brand slugs for Home "Popular Brands" grid. Only brands with logo files in public/brands/ are listed. */
export const HOME_BRAND_SLUGS = [
  "ray-ban",
  "prada",
  "versace",
  "dolce-gabbana",
  "tom-ford",
  "emperio-armani",
  "michael-kors",
] as const;

export const HOME_BRAND_DISPLAY_NAMES: Record<(typeof HOME_BRAND_SLUGS)[number], string> = {
  "ray-ban": "Ray-Ban",
  prada: "Prada",
  versace: "Versace",
  "dolce-gabbana": "Dolce & Gabbana",
  "tom-ford": "Tom Ford",
  "emperio-armani": "Emporio Armani",
  "michael-kors": "Michael Kors",
};
