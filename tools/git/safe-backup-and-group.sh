#!/usr/bin/env bash
set -euo pipefail

# 0) repo doğrula
git rev-parse --show-toplevel >/dev/null
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

TS="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$HOME/arti-optik-backups/$TS"
mkdir -p "$BACKUP_DIR/groups"
echo "[i] Backup dir: $BACKUP_DIR"

# 1) pre-flight (read-only)
{
  echo "=== git status -sb ==="
  git status -sb
  echo
  echo "=== branch ==="
  git rev-parse --abbrev-ref HEAD
  echo
  echo "=== last 12 commits ==="
  git log --oneline -n 12 --decorate
  echo
  echo "=== git diff --name-only ==="
  git diff --name-only
  echo
  echo "=== untracked (first 200) ==="
  git ls-files --others --exclude-standard | head -n 200
} | tee "$BACKUP_DIR/preflight.txt" >/dev/null

# 2) backup artefact'leri
git rev-parse HEAD > "$BACKUP_DIR/HEAD.txt"
git status -sb > "$BACKUP_DIR/status.txt"
git diff > "$BACKUP_DIR/working-tree.patch" || true
git diff --staged > "$BACKUP_DIR/staged.patch" || true
git ls-files --others --exclude-standard > "$BACKUP_DIR/untracked.txt" || true

# tüm tarihçe bundle
git bundle create "$BACKUP_DIR/repo.bundle" --all

# 3) değişiklik listelerini çıkar (tracked diff + untracked)
git diff --name-status > "$BACKUP_DIR/name-status.txt" || true
git diff --name-only > "$BACKUP_DIR/diff-name-only.txt" || true
git ls-files --others --exclude-standard > "$BACKUP_DIR/untracked-all.txt" || true

# 4) gruplama fonksiyonları
all_paths="$(mktemp)"
cat "$BACKUP_DIR/diff-name-only.txt" "$BACKUP_DIR/untracked-all.txt" 2>/dev/null | sed '/^\s*$/d' | sort -u > "$all_paths"

# delete list (tracked deletions)
deleted_paths="$(mktemp)"
awk '$1=="D"{print $2}' "$BACKUP_DIR/name-status.txt" 2>/dev/null | sed '/^\s*$/d' | sort -u > "$deleted_paths"

# helper: yaz
write_group () {
  local name="$1"; shift
  local outfile="$BACKUP_DIR/groups/$name.copy"
  local delfile="$BACKUP_DIR/groups/$name.delete"
  : > "$outfile"
  : > "$delfile"

  while IFS= read -r p; do
    [[ -z "$p" ]] && continue
    # eğer deleted ise delete listesine
    if grep -qxF "$p" "$deleted_paths"; then
      echo "$p" >> "$delfile"
    else
      echo "$p" >> "$outfile"
    fi
  done < <(cat "$@" 2>/dev/null | sed '/^\s*$/d' | sort -u)

  echo "[i] wrote $outfile and $delfile"
}

# 5) pattern'e göre ayır
A="$(mktemp)"; B="$(mktemp)"; C="$(mktemp)"; D="$(mktemp)"; U="$(mktemp)"

while IFS= read -r p; do
  case "$p" in
    src/app/api/search/route.ts|src/lib/dictionaries.ts|src/app/search/*|tests/e2e/search-*.spec.ts|drizzle/0004_*pg_trgm_search.sql)
      echo "$p" >> "$A" ;;
    src/lib/api/products.ts|src/app/*/gunes-gozlugu/*|src/components/catalog/*|tests/e2e/category-filter-smoke.spec.ts)
      echo "$p" >> "$B" ;;
    src/components/product/product-specs.tsx|scripts/db-xray.ts|scripts/cleanup-attributes-keys.ts|drizzle/0003_*|docs/forensics/*)
      echo "$p" >> "$C" ;;
    public/hero/*|docs/design/*)
      echo "$p" >> "$D" ;;
    *)
      echo "$p" >> "$U" ;;
  esac
done < "$all_paths"

write_group "A-search-system" "$A"
write_group "B-category-filters" "$B"
write_group "C-db-attributes" "$C"
write_group "D-ui-assets" "$D"
write_group "Unknown" "$U"

# 6) rapor üret
cat > "$BACKUP_DIR/grouping-report.md" <<EOF
# Grouping Report ($TS)

## A) Search System (feat/search-system)
- copy: groups/A-search-system.copy
- delete: groups/A-search-system.delete

## B) Category Filters / Catalog (feat/category-filters)
- copy: groups/B-category-filters.copy
- delete: groups/B-category-filters.delete

## C) PDP / Attributes / DB Forensics (chore/db-attributes)
- copy: groups/C-db-attributes.copy
- delete: groups/C-db-attributes.delete
> docs/forensics commit kararı: burada listelendi; PR'da PII/secret yoksa sadece "özet" dosyaları commit önerilir.

## D) UI / Assets / Docs (chore/ui-assets)
- copy: groups/D-ui-assets.copy
- delete: groups/D-ui-assets.delete

## Unknown (manuel karar)
- copy: groups/Unknown.copy
- delete: groups/Unknown.delete
EOF

echo "[ok] DONE. Backup + grouping generated:"
echo " - $BACKUP_DIR"
echo " - $BACKUP_DIR/grouping-report.md"
