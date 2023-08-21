import AdminOrder from '../features/Admin/component/AdminOrder'
import Navbar from '../features/navbar/Navbar'
import React from 'react'

const AdminOrderPage = () => {
    return (
        <div>
            <Navbar>
                <AdminOrder />
            </Navbar>
        </div>
    )
}

export default AdminOrderPage