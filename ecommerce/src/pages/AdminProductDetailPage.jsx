import React from 'react'
import Navbar from '../features/navbar/Navbar'
import AdminProductDetail from '../features/Admin/component/AdminProductDetail'

const AdminProductDetailPage = () => {
    return (
        <>
            <Navbar>
                <AdminProductDetail />
            </Navbar>
        </>
    )
}

export default AdminProductDetailPage