// One-time (idempotent) migration: repair dead product image URLs in the DB.
//
// WHY: product `thumbnail`/`images` were seeded from dummyjson, whose image CDN
// URL scheme has since changed. The old, ID-based URLs stored in Mongo now 404
// (e.g. cdn.dummyjson.com/product-images/1/thumbnail.jpg), and the i.dummyjson.com
// host is gone entirely — so every product renders a broken image. The current
// dummyjson scheme is category/slug based (.../product-images/<category>/<slug>/
// thumbnail.webp). There is no numeric dummyjson id stored on our products (the
// schema keeps title/category/brand/thumbnail/images), so we re-key off `title`.
//
// WHAT: fetch the live dummyjson catalog, match each DB product by normalized
// title, and overwrite `thumbnail` + `images` with the current URLs. Products
// whose title no longer exists in dummyjson (renamed/removed, or custom-added)
// are logged and left untouched — the frontend onError placeholder covers them.
//
// SAFE TO RE-RUN: updates only when the stored URLs differ from live, so a second
// run reports everything `unchanged`. updateOne bypasses the (nonexistent) Product
// pre-save hooks and preserves each _id, so cart/order references stay intact.
//
// RUN (from ecommerce-backend/; DATABASE_URI comes from .env or the environment):
//   node scripts/fix-product-images.js
// Point DATABASE_URI at each environment's DB (local Mongo, then prod Atlas) and
// run once per environment.
require('dotenv').config()
const mongoose = require('mongoose')
const { Product } = require('../model/product')
const logger = require('../config/logger')

// dummyjson returns its whole catalog when limit=0; select trims the payload to
// just the fields we need to rewrite.
const DUMMYJSON_URL =
    'https://dummyjson.com/products?limit=0&select=title,thumbnail,images'

// Normalize a title for matching: trim + lowercase so trivial casing/whitespace
// differences between our stored titles and dummyjson's don't cause a miss.
const normalizeTitle = (title) => (title || '').trim().toLowerCase()

// Shallow array equality for the images list, so we can detect "already current"
// and keep the run idempotent without a deep-equal dependency.
const sameImages = (a, b) =>
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((v, i) => v === b[i])

async function main() {
    if (!process.env.DATABASE_URI) {
        logger.error('DATABASE_URI is not set — aborting')
        process.exit(1)
    }

    // Fetch the live catalog first: if dummyjson is unreachable, fail before
    // touching the DB. Node >=18 (repo engines) ships a global fetch.
    const res = await fetch(DUMMYJSON_URL)
    if (!res.ok) {
        logger.error(`dummyjson fetch failed: HTTP ${res.status} — aborting`)
        process.exit(1)
    }
    const { products: liveProducts = [] } = await res.json()

    // title -> { thumbnail, images } for O(1) lookup while iterating our DB rows.
    const liveByTitle = new Map()
    for (const p of liveProducts) {
        liveByTitle.set(normalizeTitle(p.title), {
            thumbnail: p.thumbnail,
            images: p.images,
        })
    }
    logger.info(`Fetched ${liveByTitle.size} live dummyjson products`)

    // family: 4 forces IPv4 (matches the other scripts; avoids IPv6 DNS hangs).
    await mongoose.connect(process.env.DATABASE_URI, { family: 4 })

    // Include soft-deleted products so their images are fixed too.
    const products = await Product.find({}).lean()

    let updated = 0
    let unchanged = 0
    let failed = 0
    const unmatched = []

    for (const product of products) {
        const live = liveByTitle.get(normalizeTitle(product.title))

        // No live match: renamed/removed in dummyjson, or a custom product. Leave
        // the row as-is (frontend placeholder handles the display) and record it.
        if (!live) {
            unmatched.push(product.title)
            continue
        }

        // Already pointing at the current URLs — nothing to do (idempotency).
        if (
            product.thumbnail === live.thumbnail &&
            sameImages(product.images, live.images)
        ) {
            unchanged++
            continue
        }

        // Per-product try/catch: a single failed write logs the exact product and
        // is skipped so it can't abort the whole run. The migration is idempotent,
        // so a later re-run safely retries anything that failed here.
        try {
            // updateOne with $set writes the exact new URLs; preserves _id and skips
            // hooks (Product has none), so references and stored data stay intact.
            await Product.updateOne(
                { _id: product._id },
                { $set: { thumbnail: live.thumbnail, images: live.images } }
            )
            updated++
        } catch (err) {
            failed++
            logger.error(
                { err },
                `Failed to update product "${product.title}" (_id=${product._id}) — skipping`
            )
        }
    }

    logger.info(
        `Product image migration complete: updated=${updated} ` +
            `unchanged=${unchanged} unmatched=${unmatched.length} ` +
            `failed=${failed} total=${products.length}`
    )
    if (unmatched.length) {
        logger.warn(
            `${unmatched.length} product(s) had no dummyjson title match and were ` +
                `left unchanged (frontend placeholder will cover them): ` +
                unmatched.join(', ')
        )
    }

    await mongoose.disconnect()
}

main().catch((err) => {
    logger.error({ err }, 'Product image migration failed')
    process.exit(1)
})
