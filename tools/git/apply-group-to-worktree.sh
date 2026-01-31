#!/usr/bin/env bash
# Niyet bazlı branch için tek grubu temiz worktree'e uygular.
# Kullanım: ./apply-group-to-worktree.sh <BACKUP_DIR> <GROUP> <WORKTREE_DIR> <BRANCH>
# Örnek:   ./apply-group-to-worktree.sh "$HOME/arti-optik-backups/20260131-025419" A-search-system _wt-search-system feat/search-system
set -euo pipefail

if [[ $# -lt 4 ]]; then
  echo "Kullanım: $0 <BACKUP_DIR> <GROUP> <WORKTREE_DIR> <BRANCH>"
  echo "Örnek:   $0 \"\$HOME/arti-optik-backups/<TIMESTAMP>\" A-search-system _wt-search-system feat/search-system"
  exit 1
fi

BACKUP_DIR="$1"
GROUP="$2"
WT_DIR="$3"
BRANCH="$4"

ROOT="$(git rev-parse --show-toplevel)"
COPY_FILE="$BACKUP_DIR/groups/$GROUP.copy"
DELETE_FILE="$BACKUP_DIR/groups/$GROUP.delete"

if [[ ! -f "$COPY_FILE" ]]; then
  echo "[err] Grup listesi yok: $COPY_FILE"
  exit 1
fi

# worktree repo'nun bir üst dizininde oluşturulur (plan örneğine uygun)
WT_PATH="$(dirname "$ROOT")/$WT_DIR"

echo "[i] Worktree: $WT_PATH (branch: $BRANCH)"
git worktree add "$WT_PATH" -b "$BRANCH"
cd "$WT_PATH"

echo "[i] Grubun dosyalarını kopyalıyorum: $GROUP"
rsync -a --files-from="$COPY_FILE" "$ROOT"/ ./

if [[ -s "$DELETE_FILE" ]]; then
  echo "[i] Silinen dosyaları uyguluyorum"
  xargs -a "$DELETE_FILE" -r git rm -- || true
fi

echo "[i] Stage (sadece gruptaki dosyalar)"
xargs -a "$COPY_FILE" -r git add -- || true

echo "[ok] Kontrol:"
git status -sb
git diff --cached --name-only
