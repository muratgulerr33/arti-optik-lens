-- PR4: Backup table for product_variants.attributes cleanup rollback
CREATE TABLE IF NOT EXISTS "product_variants_attributes_backup" (
  "variant_id" integer PRIMARY KEY NOT NULL REFERENCES "product_variants"("id") ON DELETE CASCADE,
  "attributes_before" jsonb NOT NULL,
  "created_at" timestamp
);
