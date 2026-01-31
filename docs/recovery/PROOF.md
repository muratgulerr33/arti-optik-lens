# Recovery — Backup proof

Branch: `recovery/audit-20260201-recovery`  
Generated: 2026-02-01

## 1. Backup directory exists

```bash
$ ls -la /Users/apple/arti-optik-backups/20260131-025419
```

```
total 124792
drwxr-xr-x  15 apple  staff       480 Jan 31 18:39 .
drwxr-xr-x   4 apple  staff       128 Jan 31 18:39 ..
-rw-r--r--@  1 apple  staff      6148 Jan 31 19:26 .DS_Store
-rw-r--r--   1 apple  staff        41 Jan 31 02:54 HEAD.txt
-rw-r--r--@  1 apple  staff      1537 Jan 31 02:54 diff-name-only.txt
-rw-r--r--@  1 apple  staff       749 Jan 31 02:54 grouping-report.md
drwxr-xr-x  12 apple  staff       384 Jan 31 02:54 groups
-rw-r--r--@  1 apple  staff      1635 Jan 31 02:54 name-status.txt
-rw-r--r--@  1 apple  staff      9455 Jan 31 02:54 preflight.txt
-rw-r--r--@  1 apple  staff  63680407 Jan 31 02:54 repo.bundle
-rw-r--r--   1 apple  staff         0 Jan 31 02:54 staged.patch
-rw-r--r--   1 apple  staff      3114 Jan 31 02:54 status.txt
-rw-r--r--@  1 apple  staff      3849 Jan 31 02:54 untracked-all.txt
-rw-r--r--@  1 apple  staff      3849 Jan 31 02:54 untracked.txt
-rw-r--r--@  1 apple  staff    161812 Jan 31 02:54 working-tree.patch
```

## 2. Bundle is valid

```bash
$ git bundle verify /Users/apple/arti-optik-backups/20260131-025419/repo.bundle
```

```
/Users/apple/arti-optik-backups/20260131-025419/repo.bundle is okay
The bundle contains these 6 refs:
55454ea5ac75b3a992391afcaa3e0c6255739ba1 refs/heads/chore/track-core
7602c691c2dc67190874de0af21385cedf5f2c50 refs/heads/main
5cc6d28301c67497416c6094c614c5cbfa304628 refs/remotes/origin/HEAD
55454ea5ac75b3a992391afcaa3e0c6255739ba1 refs/remotes/origin/chore/track-core
5cc6d28301c67497416c6094c614c5cbfa304628 refs/remotes/origin/main
55454ea5ac75b3a992391afcaa3e0c6255739ba1 HEAD
The bundle records a complete history.
The bundle uses this hash algorithm: sha1
```
