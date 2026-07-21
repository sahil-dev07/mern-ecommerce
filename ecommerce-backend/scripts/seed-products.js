// Re-seed the product catalog (products + categories + brands) from live dummyjson.
//
// WHY: the catalog was originally seeded from dummyjson's OLD demo dataset, which
// dummyjson has since replaced entirely — the old products no longer exist there
// (by title or id), and their image URLs 404 under dummyjson's new CDN scheme. A
// title-match repair (scripts/fix-product-images.js) could only recover ~1 product,
// so we replace the catalog with the current dummyjson products, which have working
// .webp images and real brand/category data.
//
// WHAT: fetch the live catalog, keep products that have a brand + thumbnail + images
// (so every row satisfies the required Product fields and the Brand filter stays
// clean — no "Generic" bucket), map to our schema, and REPLACE the Product,
// Category, and Brand collections. Category/Brand docs are derived from the seeded
// products so the filter dropdowns exactly match what's in stock.
//
// DESTRUCTIVE: this deleteMany + insertMany replaces all products/categories/brands.
// Product _ids change, so any pre-existing order/cart references to old products are
// orphaned (acceptable here — test data was already cleaned from prod). Re-running is
// deterministic (same dummyjson source), so it is safe to run again.
//
// RUN (from ecommerce-backend/; DATABASE_URI from .env or the environment):
//   node scripts/seed-products.js
require('dotenv').config()
const mongoose = require('mongoose')
const { Product } = require('../model/product')
const { Category } = require('../model/category')
const { Brand } = require('../model/brand')
const logger = require('../config/logger')

// How many products to seed. The old catalog had ~100; keep parity.
const TARGET_COUNT = 100

// Pull the whole catalog (limit=0) so we can filter to fully-populated products
// before taking TARGET_COUNT of them.
const DUMMYJSON_URL =
    'https://dummyjson.com/products?limit=0&select=title,description,price,discountPercentage,rating,stock,brand,category,thumbnail,images'

// Clamp a number into the schema's allowed range (avoids validation aborts on the
// occasional out-of-range dummyjson value).
const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

// Turn a category slug ("home-decoration") into a readable label ("home decoration"),
// matching the existing Category.label style (spaces, lowercase).
const prettify = (slug) => (slug || '').replace(/-/g, ' ')

// Map a live dummyjson product onto our Product schema, clamping every constrained
// field so insertMany's validation never fails mid-run:
//  price 0..10000, discountPercentage 1..99, rating 0..5, stock >= 0.
const mapProduct = (p) => ({
    title: p.title,
    description: p.description,
    price: clamp(p.price, 0, 10000),
    discountPercentage: clamp(p.discountPercentage || 1, 1, 99),
    rating: clamp(p.rating || 0, 0, 5),
    stock: Math.max(0, p.stock || 0),
    brand: p.brand,
    category: p.category,
    thumbnail: p.thumbnail,
    images: p.images && p.images.length ? p.images : [p.thumbnail],
    deleted: false,
})

async function main() {
    if (!process.env.DATABASE_URI) {
        logger.error('DATABASE_URI is not set — aborting')
        process.exit(1)
    }

    // Fetch first: if dummyjson is unreachable, fail before touching the DB.
    const res = await fetch(DUMMYJSON_URL)
    if (!res.ok) {
        logger.error(`dummyjson fetch failed: HTTP ${res.status} — aborting`)
        process.exit(1)
    }
    const { products: live = [] } = await res.json()

    // Keep only fully-populated products (satisfy all required schema fields and
    // keep the brand filter meaningful), dedupe by title (unique index), cap at
    // TARGET_COUNT.
    const seenTitles = new Set()
    const chosen = []
    for (const p of live) {
        if (chosen.length >= TARGET_COUNT) break
        const title = (p.title || '').trim()
        if (
            !title ||
            !p.brand ||
            !p.category ||
            !p.thumbnail ||
            !p.description ||
            !Array.isArray(p.images) ||
            p.images.length === 0
        ) {
            continue
        }
        const key = title.toLowerCase()
        if (seenTitles.has(key)) continue
        seenTitles.add(key)
        chosen.push(p)
    }

    if (!chosen.length) {
        logger.error('No usable products from dummyjson — aborting (DB untouched)')
        process.exit(1)
    }

    const products = chosen.map(mapProduct)

    // Derive the filter collections from exactly what we're seeding, so every
    // category/brand option maps to at least one in-stock product.
    const categories = [...new Set(products.map((p) => p.category))].map((value) => ({
        value,
        label: prettify(value),
    }))
    const brands = [...new Set(products.map((p) => p.brand))].map((value) => ({
        value,
        label: value,
    }))

    await mongoose.connect(process.env.DATABASE_URI, { family: 4 })

    // Replace each collection: drop old rows (they'd collide on the unique indexes),
    // then insert the fresh set. insertMany runs schema validation by default.
    await Product.deleteMany({})
    await Product.insertMany(products)

    await Category.deleteMany({})
    await Category.insertMany(categories)

    await Brand.deleteMany({})
    await Brand.insertMany(brands)

    logger.info(
        `Catalog re-seed complete: products=${products.length} ` +
            `categories=${categories.length} brands=${brands.length}`
    )

    await mongoose.disconnect()
}

main().catch((err) => {
    logger.error({ err }, 'Catalog re-seed failed')
    process.exit(1)
})
