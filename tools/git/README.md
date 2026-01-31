# Repo temizliği + güvenli commit (backup-first)

## Akış

1. **Backup + gruplama** (read-only, repo’ya dokunmaz):
   ```bash
   ./tools/git/safe-backup-and-group.sh
   ```
   Çıktı: `~/arti-optik-backups/<timestamp>/` (repo.bundle, patch’ler, groups/*.copy, grouping-report.md).

2. **Niyet bazlı worktree** (her grup için):
   ```bash
   BACKUP_DIR="$HOME/arti-optik-backups/<TIMESTAMP>"
   ./tools/git/apply-group-to-worktree.sh "$BACKUP_DIR" A-search-system _wt-search-system feat/search-system
   ./tools/git/apply-group-to-worktree.sh "$BACKUP_DIR" B-category-filters _wt-category-filters feat/category-filters
   ./tools/git/apply-group-to-worktree.sh "$BACKUP_DIR" C-db-attributes _wt-db-attributes chore/db-attributes
   ./tools/git/apply-group-to-worktree.sh "$BACKUP_DIR" D-ui-assets _wt-ui-assets chore/ui-assets
   ```
   Sonra her worktree’de: commit → `npm run lint` + `npm run build` → push.

3. **DoD**: Her branch’te sadece ilgili dosyalar; lint + build geçmeli; küçük PR (5–7 dosya).

4. **Rollback**: `git revert` + önceki stabil commit’e dönerek redeploy.

## Kurallar

- ASLA `git add .` kullanma; sadece grupların `.copy`/`.delete` listelerindeki path’ler.
- `Unknown.copy`: manuel karar kuyruğu; niyete bağlamadan PR’a sokma.
- Seed/ham import dosyaları commit edilmez (.gitignore’da).
