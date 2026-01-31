# Bundle refs proof

## Bundle refs fixed

- `bundle/chore-track-core` → `backupbundle/chore/track-core`
- `bundle/main` → `backupbundle/main`

## Log proof

```bash
$ git log -1 --oneline bundle/chore-track-core
55454ea fix(api): return 200 with empty results on search DB connection error

$ git log -1 --oneline bundle/main
7602c69 fix: export formatPrice and formatProductName
```
