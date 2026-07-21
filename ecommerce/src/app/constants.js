export const ITEMS_PER_PAGE = 9

// API base URL. Uses Vite env (VITE_API_URL) so the host can point the frontend at
// any backend; falls back to the Render prod URL (never localhost) so a missing env
// var degrades to production, not a broken local-only endpoint.
export const END_POINT = import.meta.env.VITE_API_URL || 'https://ecommerce-lun6.onrender.com'

// Rounds the post-discount price. Math.round takes ONE arg — the old 2nd arg (2) was
// silently ignored (it never rounded to 2 decimals). Prices are whole-number rupees
// here, so a plain integer round is the intended behavior.
export function discountedPrice(item) {
    return Math.round(item.price * (1 - item.discountPercentage / 100))
}

// Inline-SVG placeholder (light tile + sun + mountains) shown when a product image
// fails to load. Product image URLs are seeded from dummyjson, whose CDN URL scheme
// has changed before, leaving dead thumbnail/images URLs in the DB. Bundling the
// placeholder as a data URI (no network) guarantees the UI never shows a broken-image
// icon — for products dummyjson renamed/removed, or any future-dead URL.
export const PLACEHOLDER_IMG =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23e5e7eb'/%3E%3Ccircle cx='70' cy='70' r='16' fill='%239ca3af'/%3E%3Cpath d='M40 150l40-45 25 28 30-35 25 52z' fill='%239ca3af'/%3E%3C/svg%3E"

// onError handler for any product <img>. Clears onerror first so that if the
// placeholder itself ever failed to load it could not re-trigger (no infinite loop).
export function onImageError(e) {
    e.currentTarget.onerror = null
    e.currentTarget.src = PLACEHOLDER_IMG
}
