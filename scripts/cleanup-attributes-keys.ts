/**
 * PR4 — DB attributes "çöp key" cleanup (backup + rollback)
 *
 * product_variants.attributes içindeki şüpheli (uzun/URL/boşluk/garip karakter) key'leri
 * tespit eder, raporlar; --apply ile yedek alıp temizler.
 *
 * Çalıştırma:
 *   npx tsx scripts/cleanup-attributes-keys.ts           # dry-run: sadece rapor
 *   npx tsx scripts/cleanup-attributes-keys.ts --apply   # backup + cleanup
 *
 * Gerekli: .env.local içinde DATABASE_URL
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { sql } from "drizzle-orm";
import { getDbForAdapter } from "../src/db/connection";
import * as fs from "fs";
import * as path from "path";

const REPORT_PATH = path.join(process.cwd(), "docs/forensics/ATTRIBUTE_KEY_CLEANUP_REPORT.md");

// Şüpheli key kuralları (dar, güvenli)
function isSuspiciousKey(key: string): boolean {
  if (key.length >= 60) return true;
  if (/https?:\/\||\?|=|%|&/.test(key)) return true;
  if (/\s/.test(key)) return true;
  if (/[^a-zA-Z0-9_\-]/.test(key)) return true;
  return false;
}

async function getKeyInventory(db: ReturnType<typeof getDbForAdapter>): Promise<{ key: string; cnt: number }[]> {
  const rows = await db.execute(sql`
    SELECT k AS key, COUNT(*)::int AS cnt
    FROM product_variants pv,
         LATERAL jsonb_object_keys(COALESCE(pv.attributes, '{}'::jsonb)) AS k
    GROUP BY k
    ORDER BY cnt DESC
  `);
  return (rows.rows as { key: string; cnt: number }[]).map((r) => ({ key: r.key, cnt: r.cnt }));
}

async function getSampleValues(
  db: ReturnType<typeof getDbForAdapter>,
  key: string,
  limit: number
): Promise<string[]> {
  const rows = await db.execute(sql`
    SELECT pv.attributes->>${key} AS val
    FROM product_variants pv
    WHERE pv.attributes ? ${key}
    LIMIT ${limit}
  `);
  return (rows.rows as { val: string | null }[]).map((r) => (r.val == null ? "(null)" : r.val));
}

async function ensureBackupTable(db: ReturnType<typeof getDbForAdapter>): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS product_variants_attributes_backup (
      variant_id integer PRIMARY KEY REFERENCES product_variants(id) ON DELETE CASCADE,
      attributes_before jsonb NOT NULL,
      created_at timestamp DEFAULT now()
    )
  `);
}

async function backupVariantsWithKey(
  db: ReturnType<typeof getDbForAdapter>,
  badKey: string
): Promise<number> {
  const result = await db.execute(sql`
    INSERT INTO product_variants_attributes_backup (variant_id, attributes_before, created_at)
    SELECT id, attributes, now()
    FROM product_variants
    WHERE attributes ? ${badKey}
    ON CONFLICT (variant_id) DO NOTHING
  `);
  return result.rowCount ?? 0;
}

async function removeKeyFromVariants(
  db: ReturnType<typeof getDbForAdapter>,
  badKey: string
): Promise<number> {
  const result = await db.execute(sql`
    UPDATE product_variants
    SET attributes = attributes - ${badKey}
    WHERE attributes ? ${badKey}
  `);
  return result.rowCount ?? 0;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const db = getDbForAdapter();

  console.log("\n========== PR4 Attributes key cleanup ==========");
  console.log(apply ? "Mod: APPLY (backup + cleanup)" : "Mod: DRY-RUN (sadece rapor)\n");

  const keyInventory = await getKeyInventory(db);
  const suspicious = keyInventory.filter(({ key }) => isSuspiciousKey(key));
  const beforeReport: string[] = [
    "# PR4 — Attribute key cleanup raporu",
    "",
    "## Key envanteri (before)",
    "",
    "| Key | Count |",
    "|-----|-------|",
    ...keyInventory.map(({ key, cnt }) => `| ${key.replace(/\|/g, "\\|")} | ${cnt} |`),
    "",
    "## Şüpheli key'ler (silinecek)",
    "",
  ];

  if (suspicious.length === 0) {
    beforeReport.push("Şüpheli key bulunamadı. Temizlik gerekmiyor.");
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(REPORT_PATH, beforeReport.join("\n") + "\n");
    console.log("Şüpheli key yok. Rapor yazıldı:", REPORT_PATH);
    return;
  }

  const suspiciousDetails: string[] = [];
  for (const { key, cnt } of suspicious) {
    const samples = await getSampleValues(db, key, 3);
    suspiciousDetails.push(`### \`${key}\` (count: ${cnt})`);
    suspiciousDetails.push("");
    suspiciousDetails.push("Örnek değerler:");
    samples.forEach((s) => suspiciousDetails.push(`- \`${s.replace(/`/g, "\\`")}\``));
    suspiciousDetails.push("");
  }

  const reportLines: string[] = [
    ...beforeReport,
    "| Key | Count |",
    "|-----|-------|",
    ...suspicious.map(({ key, cnt }) => `| ${key.replace(/\|/g, "\\|")} | ${cnt} |`),
    "",
    ...suspiciousDetails,
    "---",
    "",
  ];

  if (apply) {
    await ensureBackupTable(db);
    let totalBacked = 0;
    let totalUpdated = 0;
    for (const { key } of suspicious) {
      const backed = await backupVariantsWithKey(db, key);
      totalBacked += backed;
      const updated = await removeKeyFromVariants(db, key);
      totalUpdated += updated;
      console.log(`  ${key}: backup ${backed}, silinen ${updated}`);
    }
    console.log("\nToplam backup satırı (unique variant):", totalBacked);
    console.log("Toplam güncellenen satır:", totalUpdated);

    const keyInventoryAfter = await getKeyInventory(db);
    reportLines.push("## Key envanteri (after cleanup)");
    reportLines.push("");
    reportLines.push("| Key | Count |");
    reportLines.push("|-----|-------|");
    for (const { key: k, cnt } of keyInventoryAfter) {
      reportLines.push(`| ${k.replace(/\|/g, "\\|")} | ${cnt} |`);
    }
    reportLines.push("");

    reportLines.push("## Rollback");
    reportLines.push("");
    reportLines.push("Geri almak için:");
    reportLines.push("```sql");
    reportLines.push("UPDATE product_variants pv");
    reportLines.push("SET attributes = b.attributes_before");
    reportLines.push("FROM product_variants_attributes_backup b");
    reportLines.push("WHERE pv.id = b.variant_id;");
    reportLines.push("```");
    reportLines.push("");
  } else {
    reportLines.push("## Rollback (apply sonrası kullanılacak)");
    reportLines.push("");
    reportLines.push("`--apply` çalıştırıldıktan sonra geri almak için:");
    reportLines.push("```sql");
    reportLines.push("UPDATE product_variants pv");
    reportLines.push("SET attributes = b.attributes_before");
    reportLines.push("FROM product_variants_attributes_backup b");
    reportLines.push("WHERE pv.id = b.variant_id;");
    reportLines.push("```");
    reportLines.push("");
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, reportLines.join("\n"));
  console.log("\nRapor yazıldı:", REPORT_PATH);
  console.log("========== Tamamlandı ==========\n");
}

main().catch((err) => {
  console.error("Hata:", err);
  process.exit(1);
});
