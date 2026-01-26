#!/usr/bin/env node

/**
 * Marka Seed Script
 * V1 için 18 markayı brands tablosuna ekler
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as schemaModule from '../../src/db/schema';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing in .env.local');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Schema'yı düzgün import et (default export içinde)
const schema = schemaModule.default || schemaModule;

const db = drizzle(pool, { schema });

// V1 için 18 marka listesi
const BRAND_SEEDS = [
  { name: 'Ray-Ban', slug: 'ray-ban' },
  { name: 'Oakley', slug: 'oakley' },
  { name: 'Prada', slug: 'prada' },
  { name: 'Gucci', slug: 'gucci' },
  { name: 'Versace', slug: 'versace' },
  { name: 'Tom Ford', slug: 'tom-ford' },
  { name: 'Dior', slug: 'dior' },
  { name: 'Chanel', slug: 'chanel' },
  { name: 'Persol', slug: 'persol' },
  { name: 'Maui Jim', slug: 'maui-jim' },
  { name: 'Costa Del Mar', slug: 'costa-del-mar' },
  { name: 'Warby Parker', slug: 'warby-parker' },
  { name: 'Oliver Peoples', slug: 'oliver-peoples' },
  { name: 'Moscot', slug: 'moscot' },
  { name: 'Cutler and Gross', slug: 'cutler-and-gross' },
  { name: 'Jacques Marie Mage', slug: 'jacques-marie-mage' },
  { name: 'Mykita', slug: 'mykita' },
];

async function seedBrands() {
  console.log('🌱 Marka seed başlatılıyor...');
  
  try {
    // Batch insert ile idempotent seed (slug conflict'inde atla)
    const rows = BRAND_SEEDS.map(brand => ({
      name: brand.name,
      slug: brand.slug,
      isActive: true,
    }));

    await db
      .insert(schema.brands)
      .values(rows)
      .onConflictDoNothing({ target: schema.brands.slug });
    
    console.log(`\n✨ Seed tamamlandı! (Idempotent - tekrar çalıştırılabilir)`);
    console.log(`   Toplam marka: ${BRAND_SEEDS.length}`);
  } catch (error) {
    console.error('❌ Seed hatası:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedBrands();
