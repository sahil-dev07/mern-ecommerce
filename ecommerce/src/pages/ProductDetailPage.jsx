import React from 'react'
import Navbar from '../features/navbar/Navbar'
import ProductDetail from '../features/product/component/ProductDetail'
import Footer from '../features/common/Footer'

const ProductDetailPage = () => {
    return (
        <>
            <Navbar>
                <ProductDetail />
            </Navbar>
            <Footer />
        </>
    )
}

export default ProductDetailPage