export const ITEMS_PER_PAGE = 9
// export const END_POINT = "http://localhost:8080"
export const END_POINT = 'https://ecommerce-lun6.onrender.com'

export function discountedPrice(item) {
    return Math.round(item.price * (1 - item.discountPercentage / 100), 2)
}