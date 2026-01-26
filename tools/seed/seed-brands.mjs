#!/usr/bin/env node

/**
 * Marka Seed Script
 * V1 için 18 markayı brands tablosuna ekler
 */

import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as schema from '../../src/db/schema.js';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing in .env.local');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

// V1 için 18 marka listesi
const brandList = [
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
    let inserted = 0;
    let skipped = 0;
    
    for (const brand of brandList) {
      try {
        await db.insert(schema.brands).values({
          name: brand.name,
          slug: brand.slug,
          isActive: true,
        });
        inserted++;
        console.log(`✅ ${brand.name} eklendi`);
      } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
          skipped++;
          console.log(`⏭️  ${brand.name} zaten mevcut, atlandı`);
        } else {
          throw error;
        }
      }
    }
    
    console.log(`\n✨ Seed tamamlandı!`);
    console.log(`   Eklendi: ${inserted}`);
    console.log(`   Atlandı: ${skipped}`);
  } catch (error) {
    console.error('❌ Seed hatası:', error);
    process.exit(1);
  }
}

seedBrands();
