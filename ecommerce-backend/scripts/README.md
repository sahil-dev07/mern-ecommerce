# Backend scripts

One-off maintenance/migration scripts. All are run from `ecommerce-backend/`, read
`DATABASE_URI` (and other config) from `.env` or the environment, and connect with
`{ family: 4 }` (IPv4, avoids IPv6 DNS hangs).

> ⚠️ There is **one shared Atlas database** (`Ecommerce`). The local frontend hits the
> Render prod backend, which uses this same Atlas cluster — so running any of these
> **writes to production data**. Point `DATABASE_URI` at the DB you intend to change
> and double-check it before running a destructive script.

| npm script | file | idempotent? | destructive? |
|---|---|---|---|
| `npm run seed:products` | `seed-products.js` | yes (deterministic) | **yes** — replaces Product/Category/Brand |
| `npm run fix:images` | `fix-product-images.js` | yes | no — only rewrites dead image URLs |
| `npm run seed:admin` | `seed-admin.js` | yes | no — creates/promotes one admin |
| `npm run migrate:passwords` | `migrate-passwords.js` | yes | no — backfills hashes/email casing |

---

## When product images break again (the likely repeat)

The catalog is seeded from [dummyjson](https://dummyjson.com/docs/products). dummyjson
periodically **changes its image CDN URL scheme and even replaces its whole catalog**,
which leaves the `thumbnail`/`images` URLs stored in our DB pointing at dead (404) URLs.
When that happens, product cards render broken images. Two tools, in order of preference:

### Option A — refresh image URLs only (least invasive) — `npm run fix:images`

Use this **first** if the products themselves still exist in dummyjson and only the image
URLs changed. It fetches the live catalog, matches each DB product by **title**, and
updates just `thumbnail` + `images`. Preserves `_id` (orders/cart refs stay intact).

If the run reports a high `unmatched` count, dummyjson has replaced the catalog (the old
titles no longer exist there) — image URLs can't be recovered by title. Go to Option B.

### Option B — re-seed the whole catalog — `npm run seed:products`

Replaces Products + Categories + Brands with the current dummyjson catalog (real `.webp`
images, filters derived from what's seeded). **Destructive:** product `_ids` change, so
any existing order/cart references to old products are orphaned.

**Before running, back up the current catalog** (so you can inspect/restore if needed):

```sh
API=https://ecommerce-lun6.onrender.com   # or your backend URL
curl -s "$API/products?admin=true&limit=1000" -o backup-products.json
curl -s "$API/categories" -o backup-categories.json
curl -s "$API/brands"     -o backup-brands.json
```

Then:

```sh
npm run seed:products
```

### Verify (either option)

```sh
API=https://ecommerce-lun6.onrender.com
# a sample thumbnail should return HTTP 200
curl -s "$API/products?limit=1" | grep -oE '"thumbnail":"[^"]*"'
# category filter should return products
curl -s "$API/products?category=beauty&limit=3" | grep -oE '"title":"[^"]*"'
```

The frontend also has a permanent safety net: any product `<img>` that still fails to load
falls back to an inline-SVG placeholder (`PLACEHOLDER_IMG` / `onImageError` in
`ecommerce/src/app/constants.js`) instead of showing a broken-image icon — so a future
dummyjson break degrades gracefully even before these scripts are re-run.

---

## Other scripts

- **`seed:admin`** — creates/promotes the first admin (signup can't set `role`). Needs
  `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME`; unset them again after. See the header
  comment in `seed-admin.js`.
- **`migrate:passwords`** — one-off backfill that bcrypt-hashes any legacy plaintext
  passwords and lowercases email casing. See the header comment in `migrate-passwords.js`.
