# MasterPack Tools (split / check / assemble)

Node >= 18 recommended.

## 1) Split
```bash
node split-masterpack.mjs ./00.chatgpt-master-pack-19-01-2026.md ./mp-out
```

## 2) Edit
Edit files in `./mp-out/doc-XX.md`.  
Only touched DOCs will change hash.

## 3) Check changes
```bash
node check-masterpack.mjs ./mp-out
```

## 4) Assemble
```bash
node assemble-masterpack.mjs ./mp-out ./00.chatgpt-master-pack-arti-optik-25-01-2026.md
```

### Notes
- Split boundary is the anchor line: `<a id="doc-01"></a>`
- Output order is `manifest.json` order.
