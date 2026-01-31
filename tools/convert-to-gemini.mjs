#!/usr/bin/env node
/**
 * Convert docs to "Gemini" wording:
 * - Copies input files into an output directory (does NOT modify originals)
 * - Rewrites common platform/tool mentions: ChatGPT/Cursor/Codex -> Gemini
 * - Optionally renames file names containing chatgpt/cursor/codex -> gemini
 * - By default, skips fenced code blocks (``` / ~~~) to avoid breaking code
 *
 * Usage examples:
 *   node tools/convert-to-gemini.mjs --in docs/masterpack --out docs/masterpack-gemini
 *   node tools/convert-to-gemini.mjs --files docs/a.md docs/b.md --out docs/gemini
 *   node tools/convert-to-gemini.mjs --in docs --out docs-gemini --also-code-fences
 *   node tools/convert-to-gemini.mjs --in docs --out docs-gemini --dry-run
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_EXTS = new Set([".md", ".mdx", ".txt"]);

function die(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {
    inDir: null,
    outDir: null,
    files: [],
    exts: new Set(DEFAULT_EXTS),
    dryRun: false,
    alsoCodeFences: false,
    renameFiles: true,
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];

    if (a === "--in") {
      args.inDir = argv[++i] ?? null;
    } else if (a === "--out") {
      args.outDir = argv[++i] ?? null;
    } else if (a === "--files") {
      // Collect until next flag or end
      while (argv[i + 1] && !argv[i + 1].startsWith("--")) {
        args.files.push(argv[++i]);
      }
    } else if (a === "--ext") {
      const raw = argv[++i] ?? "";
      args.exts = new Set(
        raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => (s.startsWith(".") ? s : `.${s}`))
      );
    } else if (a === "--dry-run") {
      args.dryRun = true;
    } else if (a === "--also-code-fences") {
      args.alsoCodeFences = true;
    } else if (a === "--no-rename") {
      args.renameFiles = false;
    } else if (a === "--help" || a === "-h") {
      console.log(`
convert-to-gemini.mjs

--in <dir>            Input directory (recursive)
--files <...paths>    Specific files list
--out <dir>           Output directory (required)
--ext ".md,.mdx"      Extensions to include (default: .md,.mdx,.txt)
--dry-run             Print planned actions, write nothing
--also-code-fences    Also replace inside fenced code blocks (riskier)
--no-rename           Do not rename file names
`);
      process.exit(0);
    }
  }

  if (!args.outDir) die("--out is required");
  if (!args.inDir && args.files.length === 0) die("Provide --in <dir> or --files <...>");

  return args;
}

function matchCaseLike(source, replacementBase) {
  // Preserve basic casing style: UPPER, Capitalized, lower
  if (source.toUpperCase() === source) return replacementBase.toUpperCase();
  if (source[0] && source[0].toUpperCase() === source[0]) {
    return replacementBase[0].toUpperCase() + replacementBase.slice(1);
  }
  return replacementBase.toLowerCase();
}

function applyReplacementsToText(text) {
  const rules = [
    // Most specific first
    { re: /\bChatGPT\s+Codex\b/gi, to: "Gemini" },
    { re: /\bOpenAI\s+Codex\b/gi, to: "Gemini" },
    { re: /\bCursor\s*IDE\b/gi, to: "Gemini" },
    { re: /\bChatGPT\b/gi, to: "Gemini" },
    { re: /\bCursor\b/gi, to: "Gemini" },
    { re: /\bCodex\b/gi, to: "Gemini" },
    // Some common “Cursor’da / Cursor'da” like forms (Turkish apostrophe variants)
    { re: /\bCursor[’']da\b/gi, to: "Gemini'de" },
    { re: /\bCursor[’']dan\b/gi, to: "Gemini'den" },
    { re: /\bCursor[’']a\b/gi, to: "Gemini'ye" },
  ];

  let out = text;
  for (const { re, to } of rules) {
    out = out.replace(re, (m) => matchCaseLike(m, to));
  }
  return out;
}

function rewriteMarkdown(content, { alsoCodeFences }) {
  const lines = content.split(/\r?\n/);
  let inFence = false;
  let fenceMarker = null;

  const outLines = lines.map((line) => {
    const fenceMatch = line.match(/^\s*(```+|~~~+)\s*/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0]; // ` or ~
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (fenceMarker === marker) {
        inFence = false;
        fenceMarker = null;
      }
      // Keep fence line as-is
      return line;
    }

    if (inFence && !alsoCodeFences) {
      return line;
    }
    return applyReplacementsToText(line);
  });

  return outLines.join("\n");
}

function renameFileBasename(basename) {
  // Only touch the filename, not directories.
  // chatgpt/cursor/codex -> gemini (case-aware-ish)
  let name = basename;

  const repl = (re, base) => {
    name = name.replace(re, (m) => matchCaseLike(m, base));
  };

  repl(/chatgpt/gi, "gemini");
  repl(/cursor/gi, "gemini");
  repl(/codex/gi, "gemini");

  return name;
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function listFilesRecursive(rootDir) {
  const result = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        await walk(full);
      } else if (e.isFile()) {
        result.push(full);
      }
    }
  }
  await walk(rootDir);
  return result;
}

async function ensureDir(dir, dryRun) {
  if (dryRun) return;
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const outDirAbs = path.resolve(args.outDir);
  const inDirAbs = args.inDir ? path.resolve(args.inDir) : null;

  if (!args.dryRun) {
    await ensureDir(outDirAbs, false);
  }

  let inputFiles = [];
  if (args.files.length > 0) {
    inputFiles = args.files.map((p) => path.resolve(p));
  } else {
    const all = await listFilesRecursive(inDirAbs);
    inputFiles = all.filter((p) => args.exts.has(path.extname(p).toLowerCase()));
  }

  if (inputFiles.length === 0) die("No input files matched your filters.");

  // Safety: refuse if outDir is inside inDir (can cause recursive copy surprises)
  if (inDirAbs) {
    const rel = path.relative(inDirAbs, outDirAbs);
    if (rel && !rel.startsWith("..") && !path.isAbsolute(rel)) {
      die("Output directory must NOT be inside input directory.");
    }
  }

  const planned = [];

  for (const srcAbs of inputFiles) {
    const relPath = inDirAbs ? path.relative(inDirAbs, srcAbs) : path.basename(srcAbs);
    const relDir = path.dirname(relPath);
    const srcBase = path.basename(relPath);

    const outBase = args.renameFiles ? renameFileBasename(srcBase) : srcBase;
    const outRel = path.join(relDir, outBase);
    const dstAbs = path.join(outDirAbs, outRel);

    planned.push({ srcAbs, dstAbs });
  }

  // Show plan
  console.log(`\n📦 Converting ${planned.length} file(s) -> ${outDirAbs}`);
  console.log(`   - rename files: ${args.renameFiles ? "ON" : "OFF"}`);
  console.log(`   - replace in code fences: ${args.alsoCodeFences ? "ON" : "OFF"}`);
  console.log(`   - dry-run: ${args.dryRun ? "ON" : "OFF"}\n`);

  // Execute
  for (const { srcAbs, dstAbs } of planned) {
    const dstDir = path.dirname(dstAbs);
    const content = await fs.readFile(srcAbs, "utf8");
    const rewritten = rewriteMarkdown(content, { alsoCodeFences: args.alsoCodeFences });

    if (args.dryRun) {
      console.log(`DRY  ${srcAbs}  ->  ${dstAbs}`);
      continue;
    }

    await ensureDir(dstDir, false);

    // If destination exists, avoid overwriting silently: add suffix
    let finalDst = dstAbs;
    if (await exists(finalDst)) {
      const ext = path.extname(finalDst);
      const base = path.basename(finalDst, ext);
      const dir = path.dirname(finalDst);
      let n = 2;
      while (await exists(path.join(dir, `${base}.${n}${ext}`))) n++;
      finalDst = path.join(dir, `${base}.${n}${ext}`);
    }

    await fs.writeFile(finalDst, rewritten, "utf8");
    console.log(`✅ ${srcAbs}  ->  ${finalDst}`);
  }

  console.log(`\n🎯 Done.\n`);
}

main().catch((e) => {
  console.error("\n❌ Unhandled error:\n", e);
  process.exit(1);
});
