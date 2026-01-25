#!/usr/bin/env node
/**
 * assemble-masterpack.mjs
 *
 * Re-assembles a MasterPack from per-DOC files and manifest order.
 *
 * Usage:
 *   node assemble-masterpack.mjs ./out ./00.chatgpt-master-pack-arti-optik-25-01-2026.md
 */
import fs from "node:fs";
import path from "node:path";

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function assemble(outDir, outputPath) {
  const manifestPath = path.join(outDir, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`manifest.json not found in: ${outDir}`);
  }
  const manifest = readJson(manifestPath);

  const parts = [];
  for (const d of manifest.docs) {
    const p = path.join(outDir, d.file);
    if (!fs.existsSync(p)) {
      throw new Error(`Missing DOC file: ${d.file}`);
    }
    let txt = fs.readFileSync(p, "utf8").trimEnd();
    parts.push(txt);
  }

  const output = parts.join("\n\n") + "\n";
  fs.writeFileSync(outputPath, output, "utf8");
  console.log(`✅ Assemble OK → ${outputPath}`);
}

const [,, outDir, outputPath] = process.argv;
if (!outDir || !outputPath) {
  console.error("Usage: node assemble-masterpack.mjs <outDir> <output.md>");
  process.exit(1);
}
assemble(outDir, outputPath);
