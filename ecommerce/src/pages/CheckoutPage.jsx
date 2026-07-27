import React from 'react'
import Navbar from '../features/navbar/Navbar'
import Checkout from './Checkout'
import Footer from '../features/common/Footer'

// See CartPage: /checkout was the second of three screens that rendered no site
// chrome at all.
const CheckoutPage = () => {
    return (
        <>
            <Navbar>
                <Checkout />
            </Navbar>
            <Footer />
        </>
    )
}

export default CheckoutPage