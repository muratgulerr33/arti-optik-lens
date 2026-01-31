#!/usr/bin/env node

/**
 * Aktif markaların ürün sayılarını listeler (sadece okuma).
 * Örnek çıktı: Ray-Ban: 20 tane
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL .env.local içinde tanımlı olmalı.');
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL.replace(/^postgres:\/\//, 'postgresql://');
const pool = new Pool({ connectionString });

const sql = `
  SELECT b.name, COUNT(p.id)::int AS product_count
  FROM brands b
  INNER JOIN products p ON p.brand_id = b.id
  WHERE b.is_active = true
  GROUP BY b.id, b.name
  ORDER BY product_count DESC
`;

async function run() {
  try {
    const { rows } = await pool.query(sql);
    if (rows.length === 0) {
      console.log('Aktif ürünü olan marka bulunamadı.');
      return;
    }
    console.log('Aktif ürünü olan markalar (ürün sayısına göre):\n');
    for (const r of rows) {
      console.log(`${r.name}: ${r.product_count} tane`);
    }
    console.log(`\nToplam: ${rows.length} marka`);
  } catch (err) {
    console.error('Sorgu hatası:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
