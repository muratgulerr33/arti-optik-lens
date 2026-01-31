#!/usr/bin/env node
/**
 * Phase 3 — Restore: AUDIT'tan MUST_RECOVER path'lerini al,
 * origin → bundle → history sırasıyla dene. UNRESOLVED listesi.
 * Output: docs/recovery/RESTORE_<timestamp>.md
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const REPO = process.env.REPO || process.cwd();
const AUDIT = process.env.AUDIT;
const DRY = (process.env.DRY_RUN || "1") !== "0";

function sh(cmd) {
  return execSync(cmd, { cwd: REPO, stdio: ["ignore", "pipe", "pipe"] }).toString("utf8");
}

if (!AUDIT || !fs.existsSync(AUDIT)) {
  console.error("AUDIT env missing or file not found. Example: AUDIT=docs/recovery/AUDIT_....md");
  process.exit(1);
}

const md = fs.readFileSync(AUDIT, "utf8").split(/\r?\n/);
const missing = [];
let inSection = false;
for (const line of md) {
  if (line.trim() === "## MUST_RECOVER (missing)") {
    inSection = true;
    continue;
  }
  if (inSection && line.startsWith("## ")) break;
  if (inSection) {
    const m = line.match(/^- (.+)$/);
    if (m) missing.push(m[1].trim());
  }
}

// Plan sırası: origin branch priority, sonra bundle, sonra history
const originRefs = [
  "origin/feat/search-system",
  "origin/feat/category-filters",
  "origin/feat/pdp-detail-card",
  "origin/feat/home-sections",
];
// origin/chore/* — mevcut remote chore branch'leri
try {
  const chore = sh("git branch -r | grep 'origin/chore/' | sed 's/^[[:space:]]*//'").trim();
  if (chore) originRefs.push(...chore.split(/\n/).map((s) => s.trim()).filter(Boolean));
} catch (_) {}
const bundleRefs = ["bundle/chore-track-core", "bundle/main"];
const allRefs = [...originRefs, ...bundleRefs];

function refHasPath(ref, filePath) {
  try {
    execSync(`git cat-file -e "${ref}:${filePath}"`, { cwd: REPO, stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function checkout(ref, filePath) {
  if (DRY) return;
  execSync(`git checkout ${ref} -- "${filePath}"`, { cwd: REPO, stdio: "pipe" });
}

function tryHistory(filePath) {
  try {
    const sha = sh(`git rev-list --all -- "${filePath}" | head -n 1`).trim();
    if (!sha) return null;
    if (!DRY) execSync(`git checkout ${sha} -- "${filePath}"`, { cwd: REPO, stdio: "pipe" });
    return sha;
  } catch {
    return null;
  }
}

const found = [];
const unresolved = [];

for (const filePath of missing) {
  let done = false;
  for (const ref of allRefs) {
    if (refHasPath(ref, filePath)) {
      checkout(ref, filePath);
      found.push({ file: filePath, via: ref });
      done = true;
      break;
    }
  }
  if (!done) {
    const sha = tryHistory(filePath);
    if (sha) {
      found.push({ file: filePath, via: `history:${sha}` });
      done = true;
    }
  }
  if (!done) unresolved.push(filePath);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const outDir = path.join(REPO, "docs", "recovery");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, `RESTORE_${stamp}.md`);

const out = [];
out.push(`# Restore Missing Report — ${stamp}`);
out.push(`DRY_RUN: ${DRY}`);
out.push(`AUDIT: ${AUDIT}`);
out.push("");
out.push(`## Restored (${found.length})`);
for (const x of found) out.push(`- ${x.file}  (via: ${x.via})`);
out.push("");
out.push(`## UNRESOLVED (${unresolved.length})`);
for (const f of unresolved) out.push(`- ${f}`);

fs.writeFileSync(outPath, out.join("\n"), "utf8");
console.log(`WROTE: ${outPath}`);
console.log(`restored=${found.length} unresolved=${unresolved.length}`);
