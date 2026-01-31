-- Wishlist / Favorites: user-product many-to-many (unique per user)
CREATE TABLE IF NOT EXISTS "wishlist_items" (
	"user_id" uuid NOT NULL,
	"product_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "wishlist_items_user_id_product_id_pk" PRIMARY KEY("user_id","product_id")
);
--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wishlist_user_idx" ON "wishlist_items" USING btree ("user_id");
