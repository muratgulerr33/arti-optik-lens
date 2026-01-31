-- pg_trgm (zaten kuruluysa sorun değil)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- brands.name normalized trigram
CREATE INDEX IF NOT EXISTS idx_brands_name_trgm_norm
ON brands USING gin (
  (regexp_replace(translate(lower(name),'çğıöşü','cgiosu'),'[^a-z0-9]+','','g')) gin_trgm_ops
);

-- brands.slug normalized trigram
CREATE INDEX IF NOT EXISTS idx_brands_slug_trgm_norm
ON brands USING gin (
  (regexp_replace(translate(lower(slug),'çğıöşü','cgiosu'),'[^a-z0-9]+','','g')) gin_trgm_ops
);

-- products.name normalized trigram
CREATE INDEX IF NOT EXISTS idx_products_name_trgm_norm
ON products USING gin (
  (regexp_replace(translate(lower(name),'çğıöşü','cgiosu'),'[^a-z0-9]+','','g')) gin_trgm_ops
);
