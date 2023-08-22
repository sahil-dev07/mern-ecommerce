import React from 'react';
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { deleteItemFromCartAsync, selectCartStatus, selectItems, updateCartAsync } from './cartSlice';
import { discountedPrice } from '../../app/constants';
import HashLoader from "react-spinners/HashLoader"
import Modal from '../common/Modal';
import { selectLoggedInUser } from '../auth/authSlice';
import { ToastContainer, toast } from 'react-toastify';


export default function Cart() {
  const status = useSelector(selectCartStatus)
  const items = useSelector(selectItems)
  const dispatch = useDispatch()
  const [open, setOpen] = useState(true)
  const [openModal, setOpenModal] = useState(null)
  const user = useSelector(selectLoggedInUser)

  const totalAmount = items.reduce((amount, item) => discountedPrice(item.product) * item.quantity + amount, 0)
  const totalItems = items.reduce((total, item) => item.quantity + total, 0)

  const handleQuantity = (e, item) => {
    console.log({ userId: user.id, productId: item.product.id, quantity: +e.target.value })
    dispatch(updateCartAsync({ userId: user.id, productId: item.product.id, quantity: +e.target.value }))
    toast.success("Item Updated")
  }
  const handleRemove = (e, id, user) => {
    dispatch(deleteItemFromCartAsync({ productId: id, userId: user.id }))
    // console.log(user)
    toast.success("Item Deleted From the Cart")
  }
  console.log(items)
  console.log(open)
  return (

    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      {!items.length && <Navigate to='/' replace={true}></Navigate>}
      <div className='mx-auto mt-12 max-w-7xl bg-white px-4 sm:px-6 lg:px-8'>
        <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
          <h1 className="text-4xl my-10 font-bold tracking-tight text-gray-900">Cart</h1>
          <div className="flow-root">
            {status === 'loading' ?
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <HashLoader
                  // color='#464FE5'
                  size='120px'
                  color="#36d7b7"
                />
              </div>
              : null}
            <ul className="-my-6 divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.product.id} className="flex py-6">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.product.thumbnail}
                      alt={item.product.title}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>
                          <a href={item.product.href}>{item.product.title}</a>
                        </h3>
                        <p className="ml-4">${discountedPrice(item.product)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{item.product.color}</p>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="text-gray-500">
                        <label htmlFor="quantity"
                          className='inline mr-5 text-sm font-medium leading-6 text-gray-900'>
                          Qty
                        </label>
                        <select value={item.quantity} onChange={(e) => handleQuantity(e, item)} >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                        </select>
                      </div>

                      <div className="flex">
                        <Modal
                          title={`Delete ${item.product.title}`}
                          message='Are you sure you want to delete this Cart item ?'
                          dangerOption='Delete'
                          cancelOption='Cancel'
                          dangerAction={(e) => handleRemove(e, item.product.id, user)}
                          cancelAction={() => setOpenModal(null)}
                          showModal={openModal === item.product.id}
                        />
                        <button
                          onClick={(e) => { setOpenModal(item.product.id) }}
                          type="button"
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
          <div className="flex my-2 justify-between text-base font-medium text-gray-900">
            <p>Total Items in cart</p>
            <p>{totalItems} Items</p>
          </div>
          <div className="flex my-2 justify-between text-base font-medium text-gray-900">
            <p>Subtotal</p>
            <p>${totalAmount}</p>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
          <div className="mt-6">
            <Link
              to='/checkout'
              className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Checkout
            </Link>
          </div>
          <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
            <p>
              or
              <Link to='/' >
                <button
                  type="button"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                  onClick={() => setOpen(false)}
                >
                  Continue Shopping
                  <span aria-hidden="true"> &rarr;</span>
                </button>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
