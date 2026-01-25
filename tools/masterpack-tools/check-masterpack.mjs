#!/usr/bin/env node
/**
 * check-masterpack.mjs
 *
 * Recomputes hashes of DOC files and reports changes vs manifest.json.
 *
 * Usage:
 *   node check-masterpack.mjs ./out
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function check(outDir) {
  const manifestPath = path.join(outDir, "manifest.json");
  if (!fs.existsSync(manifestPath)) throw new Error(`manifest.json not found in: ${outDir}`);

  const manifest = readJson(manifestPath);
  const changed = [];
  const missing = [];

  for (const d of manifest.docs) {
    const p = path.join(outDir, d.file);
    if (!fs.existsSync(p)) {
      missing.push(d.file);
      continue;
    }
    const txt = fs.readFileSync(p, "utf8");
    const h = sha256(Buffer.from(txt, "utf8"));
    if (h !== d.sha256) {
      changed.push({ id: d.id, file: d.file, title: d.title, was: d.sha256, now: h });
    }
  }

  if (missing.length) {
    console.log("❌ Missing files:");
    for (const f of missing) console.log("  -", f);
  }

  if (changed.length) {
    console.log("⚠️  Changed files:");
    for (const c of changed) console.log(`  - DOC-${c.id} ${c.file} (${c.title})`);
    process.exitCode = 2;
  } else if (!missing.length) {
    console.log("✅ No changes detected (hashes match manifest).");
  }
}

const [,, outDir] = process.argv;
if (!outDir) {
  console.error("Usage: node check-masterpack.mjs <outDir>");
  process.exit(1);
}
check(outDir);
