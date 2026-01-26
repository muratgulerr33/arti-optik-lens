#!/usr/bin/env node

/**
 * PostgreSQL Extensions Enable Script
 * Veritabanında gerekli extension'ları etkinleştirir
 * 
 * Usage: 
 *   tsx tools/db/enable-extensions.mjs
 * 
 * Extensions:
 *   - ltree: Kategori ağacı için path-based hierarchy desteği
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing in .env.local');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const extensions = [
  'ltree', // Kategori ağacı için
];

async function enableExtensions() {
  console.log('🔧 PostgreSQL extensions etkinleştiriliyor...\n');
  
  const client = await pool.connect();
  
  try {
    for (const ext of extensions) {
      try {
        await client.query(`CREATE EXTENSION IF NOT EXISTS ${ext};`);
        console.log(`✅ Extension '${ext}' etkinleştirildi`);
      } catch (error) {
        console.error(`❌ Extension '${ext}' etkinleştirilemedi:`, error.message);
        throw error;
      }
    }
    
    console.log('\n✨ Tüm extensions başarıyla etkinleştirildi!');
  } catch (error) {
    console.error('❌ Extension hatası:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

enableExtensions();
