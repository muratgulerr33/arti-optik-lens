#!/usr/bin/env node
/**
 * split-masterpack.mjs
 *
 * Splits a single MasterPack markdown file into per-DOC files using anchors:
 *   <a id="doc-01"></a>
 *
 * Output:
 *   outDir/
 *     doc-01.md
 *     doc-02.md
 *     ...
 *     manifest.json
 *
 * Usage:
 *   node split-masterpack.mjs ./00.chatgpt-master-pack-19-01-2026.md ./out
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function countLines(s) {
  // consistent line counting across platforms
  return s.length === 0 ? 0 : s.split(/\r\n|\r|\n/).length;
}

function extractTitle(docText, fallback) {
  // Try to find "# DOC-xx: something" within first 40 lines
  const head = docText.split(/\r\n|\r|\n/).slice(0, 40).join("\n");
  const m = head.match(/^#\s*DOC-\d{2}:\s*(.+?)\s*$/m);
  if (m?.[1]) return m[1].trim();
  // Fallback: first markdown H1
  const m2 = head.match(/^#\s+(.+?)\s*$/m);
  if (m2?.[1]) return m2[1].trim();
  return fallback;
}

function splitMasterPack(inputPath, outDir) {
  const raw = fs.readFileSync(inputPath, "utf8");
  const anchorRe = /<a\s+id="doc-(\d{2})"\s*><\/a>/g;

  const matches = [];
  for (const m of raw.matchAll(anchorRe)) {
    matches.push({ id: m[1], index: m.index });
  }

  if (matches.length === 0) {
    throw new Error('No DOC anchors found. Expected lines like: <a id="doc-01"></a>');
  }

  ensureDir(outDir);

  const docs = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = (i + 1 < matches.length) ? matches[i + 1].index : raw.length;
    const id = matches[i].id;
    const content = raw.slice(start, end).trimEnd() + "\n";

    const fileName = `doc-${id}.md`;
    const filePath = path.join(outDir, fileName);
    fs.writeFileSync(filePath, content, "utf8");

    const buf = Buffer.from(content, "utf8");
    docs.push({
      id,
      file: fileName,
      title: extractTitle(content, fileName),
      sha256: sha256(buf),
      bytes: buf.length,
      lines: countLines(content),
    });
  }

  const manifest = {
    source: path.basename(inputPath),
    generatedAt: new Date().toISOString(),
    docs,
  };

  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(`✅ Split OK: ${docs.length} docs → ${outDir}`);
  console.log(`🧾 manifest.json created`);
}

const [,, inputPath, outDir] = process.argv;

if (!inputPath || !outDir) {
  console.error("Usage: node split-masterpack.mjs <input.md> <outDir>");
  process.exit(1);
}

splitMasterPack(inputPath, outDir);
