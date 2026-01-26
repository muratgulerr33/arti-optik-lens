#!/usr/bin/env node

/**
 * Marka Seed Script
 * V1 için 17 markayı brands tablosuna ekler
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

// V1 için 17 marka listesi
const BRAND_SEEDS = [
  { name: 'Ray-Ban', slug: 'ray-ban' },
  { name: 'Oakley', slug: 'oakley' },
  { name: 'Prada', slug: 'prada' },
  { name: 'Miu Miu', slug: 'miu-miu' },
  { name: 'Versace', slug: 'versace' },
  { name: 'Dolce & Gabbana', slug: 'dolce-gabbana' },
  { name: 'Gucci', slug: 'gucci' },
  { name: 'Tom Ford', slug: 'tom-ford' },
  { name: 'Burberry', slug: 'burberry' },
  { name: 'Swarovski', slug: 'swarovski' },
  { name: 'Michael Kors', slug: 'michael-kors' },
  { name: 'Emporio Armani', slug: 'emporio-armani' },
  { name: 'Armani Exchange', slug: 'armani-exchange' },
  { name: 'Calvin Klein', slug: 'calvin-klein' },
  { name: 'Vogue Eyewear', slug: 'vogue-eyewear' },
  { name: 'Lacoste', slug: 'lacoste' },
  { name: 'Persol', slug: 'persol' },
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

    // Idempotent insert: slug unique constraint'i üzerinde conflict kontrolü
    // Not: PostgreSQL'de ON CONFLICT sadece bir unique constraint üzerinde çalışır
    // Slug zaten varsa (name de muhtemelen aynıdır), o satırı atla
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
