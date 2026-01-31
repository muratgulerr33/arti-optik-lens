# COMMAND_LOG — Recovery (Senior Git Recovery)

**Kural:** Her adımda komut çıktısı bu dosyaya append edilir.

---

## PHASE 0 — Safety Snapshot

**1) git fetch --all --prune**
```
Fetching origin
Fetching backupbundle
```

**2) git switch -c safety/recovery-$(date +%Y%m%d-%H%M%S)**
```
Switched to a new branch 'safety/recovery-20260201-013056'
```

**3) git push -u origin HEAD**
```
remote: Create a pull request for 'safety/recovery-20260201-013056' on GitHub by visiting:
        https://github.com/muratgulerr33/arti-optik-lens/pull/new/safety/recovery-20260201-013056
To https://github.com/muratgulerr33/arti-optik-lens.git
 * [new branch]      HEAD -> safety/recovery-20260201-013056
branch 'safety/recovery-20260201-013056' set up to track 'origin/safety/recovery-20260201-013056'.
```

**4) git remote remove backupbundle; git remote add backupbundle <path>; git fetch backupbundle**
```
From /Users/apple/arti-optik-backups/20260131-025419/repo.bundle
 * [new branch]      main             -> backupbundle/main
 * [new branch]      chore/track-core -> backupbundle/chore/track-core
```

**5) git branch -f bundle/chore-track-core backupbundle/chore/track-core; git branch -f bundle/main backupbundle/main**
```
branch 'bundle/chore-track-core' set up to track 'backupbundle/chore/track-core'.
branch 'bundle/main' set up to track 'backupbundle/main'.
```

**6) git log -1 --oneline bundle/chore-track-core**
```
55454ea fix(api): return 200 with empty results on search DB connection error
```

**7) git log -1 --oneline bundle/main**
```
7602c69 fix: export formatPrice and formatProductName
```

---

## PHASE 1 — Audit (wishlist ignore)

**BACKUP_DIR=... node scripts/recovery/audit-missing.mjs**
```
WROTE: /Users/apple/dev/arti-optik-next/docs/recovery/AUDIT_2026-01-31T22-31-23.md
MUST_RECOVER missing count: 0
```

---

## PHASE 2 — Restore Missing

**DRY_RUN=1 node scripts/recovery/restore-missing.mjs**
```
WROTE: /Users/apple/dev/arti-optik-next/docs/recovery/RESTORE_2026-01-31T22-31-31.md
restored=0 unresolved=0
```

**DRY_RUN=0 node scripts/recovery/restore-missing.mjs**
```
WROTE: /Users/apple/dev/arti-optik-next/docs/recovery/RESTORE_2026-01-31T22-31-33.md
restored=0 unresolved=0
```

---

## PHASE 3 — Hesabım route (bundle)

**git checkout bundle/chore-track-core -- src/app/hesabim/layout.tsx page.tsx adresler/page.tsx siparisler/page.tsx**
```
(no output — files already matched bundle)
```
Working tree clean after checkout; no commit needed.

---

## PHASE 4 — next/image example.com

next.config.ts zaten `images.remotePatterns` içinde example.com (https, pathname /**) tanımlı. Değişiklik yok.

---

## PHASE 5 — Playwright config TS → MJS

**playwright.config.ts kaldırıldı, playwright.config.mjs oluşturuldu**
```
git add playwright.config.mjs
git commit -m "chore(e2e): move playwright config to mjs"
git push
```

---

## FINAL — Kanıt

**docs/recovery/FINAL_STATUS.md** oluşturuldu: branch, HEAD sha, AUDIT sonucu (missing count), build sonucu, fixed items listesi.
