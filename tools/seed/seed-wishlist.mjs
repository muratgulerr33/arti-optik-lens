#!/usr/bin/env node

/**
 * Wishlist Seed Script
 * E2E / smoke test için: test kullanıcısı oluşturur ve favori ürünleri ekler.
 * Ön koşul: db:migrate (wishlist_items tablosu), users ve products tablolarında kayıt.
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as schemaModule from "../../src/db/schema";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing in .env.local");
}

const schema = schemaModule.default ?? schemaModule;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

const WISHLIST_TEST_EMAIL = "wishlist-test@example.com";
const WISHLIST_TEST_PASSWORD = "test1234";
const WISHLIST_TEST_NAME = "Wishlist Test";
const WISHLIST_PRODUCT_LIMIT = 5;

async function seedWishlist() {
  console.log("Wishlist seed baslatiliyor...");

  try {
    let userId;

    const existing = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, WISHLIST_TEST_EMAIL))
      .limit(1);

    if (existing.length > 0) {
      userId = existing[0].id;
      console.log("  Test kullanici mevcut:", WISHLIST_TEST_EMAIL);
    } else {
      const hashed = await bcrypt.hash(WISHLIST_TEST_PASSWORD, 10);
      const [inserted] = await db
        .insert(schema.users)
        .values({
          email: WISHLIST_TEST_EMAIL,
          password: hashed,
          name: WISHLIST_TEST_NAME,
        })
        .returning({ id: schema.users.id });
      if (!inserted?.id) throw new Error("User insert failed");
      userId = inserted.id;
      console.log("  Test kullanici olusturuldu:", WISHLIST_TEST_EMAIL);
    }

    const productRows = await db
      .select({ id: schema.products.id })
      .from(schema.products)
      .limit(WISHLIST_PRODUCT_LIMIT);

    if (productRows.length === 0) {
      console.log("  Uyari: products tablosu bos; favori eklenmedi.");
      return;
    }

    const productIds = productRows.map((r) => r.id);
    for (const productId of productIds) {
      await db
        .insert(schema.wishlistItems)
        .values({ userId, productId })
        .onConflictDoNothing({
          target: [schema.wishlistItems.userId, schema.wishlistItems.productId],
        });
    }

    console.log("  Favori eklenen urun sayisi:", productIds.length);
    console.log("Wishlist seed tamamlandi.");
  } catch (err) {
    console.error("Wishlist seed hatasi:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedWishlist();
