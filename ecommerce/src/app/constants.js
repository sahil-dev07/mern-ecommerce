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
