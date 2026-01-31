#!/usr/bin/env node
/**
 * Phase 2 — Audit: backup listelerinden path'leri al, repo'da var mı kontrol et.
 * MUST_RECOVER vs OPTIONAL ayrımı, IGNORE (generated) listesi.
 * Output: docs/recovery/AUDIT_<timestamp>.md
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const REPO = process.env.REPO || process.cwd();
const BACKUP_DIR = process.env.BACKUP_DIR || "/Users/apple/arti-optik-backups/20260131-025419";

function sh(cmd) {
  return execSync(cmd, { cwd: REPO, stdio: ["ignore", "pipe", "pipe"] }).toString("utf8");
}

function readLines(p) {
  if (!fs.existsSync(p)) return [];
  return fs
    .readFileSync(p, "utf8")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function uniq(arr) {
  return [...new Set(arr)];
}

/** IGNORE (generated + wishlist) — bunları must recover'a sokma */
function isIgnore(pathStr) {
  if (pathStr === ".DS_Store") return true;
  if (pathStr.startsWith("node_modules/") || pathStr === "node_modules") return true;
  if (pathStr.startsWith(".next/") || pathStr === ".next") return true;
  if (pathStr.startsWith("test-results/") || pathStr.startsWith("playwright-report/")) return true;
  if (pathStr.startsWith("coverage/")) return true;
  if (pathStr.startsWith("docs/forensics/screens/")) return true;
  // Wishlist backup'ta yoktu — audit'te IGNORE
  if (pathStr.includes("/wishlist/") || pathStr.includes("\\wishlist\\")) return true;
  if (pathStr.includes("/favorites/") || pathStr.includes("\\favorites\\")) return true;
  if (pathStr.startsWith("src/app/hesabim/wishlist/")) return true;
  if (pathStr.startsWith("src/app/actions/wishlist.")) return true;
  if (pathStr.includes("/api/") && pathStr.includes("wishlist")) return true;
  return false;
}

/** MUST_RECOVER: src/**, public/**, tools/**, drizzle/**, package.json, package-lock.json, next.config.* */
function isMustRecover(pathStr) {
  if (pathStr.startsWith("src/")) return true;
  if (pathStr.startsWith("public/")) return true;
  if (pathStr.startsWith("tools/")) return true;
  if (pathStr.startsWith("drizzle/")) return true;
  if (pathStr === "package.json" || pathStr === "package-lock.json") return true;
  if (pathStr.startsWith("next.config.")) return true;
  return false;
}

// Backup listelerini oku
const allPaths = [];
const listFiles = [
  path.join(BACKUP_DIR, "diff-name-only.txt"),
  path.join(BACKUP_DIR, "untracked.txt"),
  path.join(BACKUP_DIR, "untracked-all.txt"),
];
for (const f of listFiles) {
  if (fs.existsSync(f)) allPaths.push(...readLines(f));
}
const groupsDir = path.join(BACKUP_DIR, "groups");
if (fs.existsSync(groupsDir)) {
  for (const name of fs.readdirSync(groupsDir)) {
    if (name.endsWith(".copy")) {
      allPaths.push(...readLines(path.join(groupsDir, name)));
    }
  }
}

// Normalize, tekilleştir
let wanted = uniq(
  allPaths
    .map((s) => s.replace(/^"+|"+$/g, "").replace(/^\.\//, ""))
    .filter(Boolean)
);

const ignored = wanted.filter(isIgnore);
wanted = wanted.filter((p) => !isIgnore(p));

// Repo'da var mı: git ls-files + working tree
const repoFiles = new Set(
  sh("git ls-files")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
);
// Untracked but on disk — say as exists for "do we have the file" purpose
try {
  const untracked = sh("git ls-files --others --exclude-standard")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  untracked.forEach((f) => repoFiles.add(f));
} catch (_) {}

const missing = wanted.filter((p) => !repoFiles.has(p));
const exists = wanted.filter((p) => repoFiles.has(p));

const mustRecover = missing.filter(isMustRecover);
const optional = missing.filter((p) => !isMustRecover(p));

const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const outDir = path.join(REPO, "docs", "recovery");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, `AUDIT_${stamp}.md`);

const report = [];
report.push(`# Recovery Audit — ${stamp}`);
report.push("");
report.push(`REPO: ${REPO}`);
report.push(`BACKUP_DIR: ${BACKUP_DIR}`);
report.push("");
report.push("## Özet");
report.push("| Metrik | Sayı |");
report.push("|--------|------|");
report.push(`| Backup listesinden path (ignore hariç) | ${wanted.length} |`);
report.push(`| EXISTS (repo'da var) | ${exists.length} |`);
report.push(`| MISSING | ${missing.length} |`);
report.push(`| **MUST_RECOVER** | **${mustRecover.length}** |`);
report.push(`| OPTIONAL | ${optional.length} |`);
report.push(`| IGNORE (generated) | ${ignored.length} |`);
report.push("");
report.push("## IGNORE (generated) — geri getirme");
report.push("Bu path'ler rapor amaçlı; must recover'a dahil edilmedi.");
for (const p of ignored.slice(0, 200)) report.push(`- ${p}`);
if (ignored.length > 200) report.push(`- ... (${ignored.length - 200} more)`);
report.push("");
report.push("## MUST_RECOVER (missing)");
for (const p of mustRecover) report.push(`- ${p}`);
report.push("");
report.push("## OPTIONAL (missing)");
for (const p of optional.slice(0, 300)) report.push(`- ${p}`);
if (optional.length > 300) report.push(`- ... (${optional.length - 300} more)`);
report.push("");
report.push("## EXISTS (örnek, ilk 100)");
for (const p of exists.slice(0, 100)) report.push(`- ${p}`);
if (exists.length > 100) report.push(`- ... (${exists.length - 100} more)`);

fs.writeFileSync(outPath, report.join("\n"), "utf8");
console.log(`WROTE: ${outPath}`);
console.log(`MUST_RECOVER missing count: ${mustRecover.length}`);
