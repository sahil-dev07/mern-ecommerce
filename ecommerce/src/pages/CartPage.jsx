import React from 'react'
import Navbar from '../features/navbar/Navbar'
import Cart from '../features/cart/Cart'
import Footer from '../features/common/Footer'

// Wrapped in <Navbar> to match every other page (Home, UserOrderPage,
// UserProfilePage, ...). Without it the site chrome vanished mid-funnel: a shopper
// reaching the cart lost the nav, the cart badge and the account menu, with no way
// back to the store except the browser's back button.
const CartPage = () => {
    return (
        <>
            <Navbar>
                <Cart />
            </Navbar>
            <Footer />
        </>
    )
}

export default CartPage