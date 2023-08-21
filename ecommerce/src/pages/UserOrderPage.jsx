import React from 'react'
import Navbar from '../features/navbar/Navbar'
import UserOrder from '../features/user/component/UserOrder'
import Footer from '../features/common/Footer'

const UserOrderPage = () => {
    return (
        <>
            <Navbar>
                <h1 className='mx-auto text-2xl'>My Orders</h1>
                <UserOrder />
            </Navbar>
            <Footer />
        </>
    )
}

export default UserOrderPage