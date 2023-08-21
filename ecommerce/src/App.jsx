import React, { useEffect } from 'react';
import './App.css';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import CheckoutPage from './pages/CheckoutPage';
import ProductDetailPage from './pages/ProductDetailPage';
import Protected from './features/auth/component/Protected';

import { useDispatch, useSelector } from 'react-redux';
import { fetchItemsByUserIdAsync } from './features/cart/cartSlice';
import { selectLoggedInUser } from './features/auth/authSlice';
import PageNotFound from './pages/PageNotFound';
import CartPage from './pages/CartPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

import UserOrderPage from './pages/UserOrderPage';

import UserProfilePage from './pages/UserProfilePage';
import { fetchLoggedInUserAsync } from './features/user/userSlice';
import Logout from './features/auth/component/Logout';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProtectedAdmin from './features/auth/component/ProtectedAdmin';
import AdminHome from './pages/AdminHome'
import AdminProductDetailPage from './pages/AdminProductDetailPage';
// import ProductForm from './features/Admin/component/ProductForm';
import AdminProductFormPage from './pages/AdminProductFormPage';
import AdminOrderPage from './pages/AdminOrderPage';


const router = createBrowserRouter([
  {
    path: "/",
    element: <Protected><Home /></Protected>,
  },
  {
    path: "/admin",
    element: <ProtectedAdmin> <AdminHome /> </ProtectedAdmin>,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />
  },
  {
    path: "/cart",
    element: <Protected><CartPage /></Protected>
  },
  {
    path: "/checkout",
    element: <Protected><CheckoutPage /></Protected>
  },
  {
    path: "/product-detail/:id",
    element: <Protected><ProductDetailPage /></Protected>
  },
  {
    path: "/admin/product-detail/:id",
    element: <ProtectedAdmin><AdminProductDetailPage /></ProtectedAdmin>
  },
  {
    path: "/admin/product-form",
    element: <ProtectedAdmin><AdminProductFormPage /></ProtectedAdmin>
  },
  {
    path: "/admin/orders",
    element: <ProtectedAdmin><AdminOrderPage /></ProtectedAdmin>
  },
  {
    path: "/admin/product-form/edit/:id",
    element: <ProtectedAdmin>
      <AdminProductFormPage />
    </ProtectedAdmin>
  },
  {
    path: "/order-success/:orderId",
    element: <OrderSuccessPage />

  },
  {
    path: "/orders",
    element: <UserOrderPage />

  },
  {
    path: "/profile",
    element: <UserProfilePage />

  },
  {
    path: "/logout",
    element: <Logout />

  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />

  },
  {
    path: "*",
    element: <PageNotFound />
  }
]);

function App() {
  const dispatch = useDispatch()
  const user = useSelector(selectLoggedInUser)
  useEffect(() => {
    if (user) {
      dispatch(fetchItemsByUserIdAsync(user.id))
      dispatch(fetchLoggedInUserAsync(user.id))
      console.log(user)
    }
  }, [user, dispatch])
  return (
    <RouterProvider router={router} />
  );
}

export default App;
