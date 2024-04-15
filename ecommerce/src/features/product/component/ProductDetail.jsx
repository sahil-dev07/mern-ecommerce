import { useEffect } from 'react'
import { StarIcon } from '@heroicons/react/20/solid'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductByIdAsync, selectProductListStatus, selectedProductById } from '../productSlice'
import { useParams } from 'react-router-dom'
import { selectLoggedInUser } from '../../auth/authSlice'
import { addToCartAsync, selectItems } from '../../cart/cartSlice'
import { discountedPrice } from '../../../app/constants'
import HashLoader from "react-spinners/HashLoader"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const reviews = { href: '#', average: 4, totalCount: 117 }

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function ProductDetail() {

    const product = useSelector(selectedProductById)
    const param = useParams()
    const dispatch = useDispatch()
    const user = useSelector(selectLoggedInUser)
    const itemsInCart = useSelector(selectItems)
    const status = useSelector(selectProductListStatus)

    useEffect(() => {
        // console.log("page " + param.id)
        dispatch(fetchProductByIdAsync(param.id))
    }, [dispatch, param.id])

    const handleCart = (e) => {
        e.preventDefault()
        // console.log({ productId: product.id, cart: itemsInCart })
        const index = itemsInCart.findIndex(item => item.product.id === product.id)
        if (index > -1) {
            toast.error("Item already in Cart")
        } else {
            // console.log({ itemsInCart, product })
            const newItem = { product: product.id, quantity: 1, user: user.id }
            dispatch(addToCartAsync(newItem))
            toast.success("Item Addes to Cart")

        }

    }

    return (
        <div className="bg-white">
            <ToastContainer
                position="top-center"
                autoClose={2000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
            {status === 'loading' ?
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <HashLoader
                        // color='#464FE5'
                        size='120px'
                        color="#36d7b7"
                    />
                </div>
                : null}
            {product && (
                <div className="pt-6">
                    <nav aria-label="Breadcrumb">
                        <ol className="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                            {product.breadcrumbs && product.breadcrumbs.map((breadcrumb) => (
                                <li key={breadcrumb.id}>
                                    <div className="flex items-center">
                                        <a href={breadcrumb.href} className="mr-2 text-sm font-medium text-gray-900">
                                            {breadcrumb.name}
                                        </a>
                                        <svg
                                            width={16}
                                            height={20}
                                            viewBox="0 0 16 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                            className="h-5 w-4 text-gray-300"
                                        >
                                            <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
                                        </svg>
                                    </div>
                                </li>
                            ))}
                            <li className="text-sm">
                                <a href={product.href} aria-current="page" className="font-medium text-gray-500 hover:text-gray-600">
                                    {product.name}
                                </a>
                            </li>
                        </ol>
                    </nav>

                    {/* Image gallery */}
                    <div className="mx-auto mt-6 max-w-2xl sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:gap-x-8 lg:px-8">
                        <div className="aspect-h-4 aspect-w-3 hidden overflow-hidden rounded-lg lg:block">
                            <img
                                src={product.images[0]}
                                alt={product.title}
                                className="h-full w-full object-cover object-center"
                            />
                        </div>
                        <div className="hidden lg:grid lg:grid-cols-1 lg:gap-y-8">
                            <div className="aspect-h-2 aspect-w-3 overflow-hidden rounded-lg">
                                <img
                                    src={product.images[1]}
                                    alt={product.title}
                                    className="h-full w-full object-cover object-center"
                                />
                            </div>
                            <div className="aspect-h-2 aspect-w-3 overflow-hidden rounded-lg">
                                <img
                                    src={product.images[2]}
                                    alt={product.title}
                                    className="h-full w-full object-cover object-center"
                                />
                            </div>
                        </div>
                        <div className="aspect-h-5 aspect-w-4 lg:aspect-h-4 lg:aspect-w-3 sm:overflow-hidden sm:rounded-lg">
                            <img
                                src={product.images[3]}
                                alt={product.title}
                                className="h-full w-full object-cover object-center"
                            />
                        </div>
                    </div>

                    {/* Product info */}
                    <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8 lg:px-8 lg:pb-24 lg:pt-16">
                        <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{product.name}</h1>
                        </div>

                        {/* Options */}
                        <div className="mt-4 lg:row-span-3 lg:mt-0">
                            <h2 className="sr-only">Product information</h2>
                            <p className="text-3xl tracking-tight text-gray-900">${discountedPrice(product)}</p>

                            {/* Reviews */}
                            <div className="mt-6">
                                <h3 className="sr-only">Reviews</h3>
                                <div className="flex items-center">
                                    <div className="flex items-center">
                                        {[0, 1, 2, 3, 4].map((rating) => (
                                            <StarIcon
                                                key={rating}
                                                className={classNames(
                                                    reviews.average > rating ? 'fill-yellow-600' : 'text-gray-300',
                                                    'h-5 w-5 flex-shrink-0 '
                                                )}
                                                aria-hidden="true"
                                            />
                                        ))}
                                    </div>
                                    <p className="sr-only">{reviews.average} out of 5 stars</p>
                                </div>
                            </div>

                            <form className="mt-10">
                                <button
                                    onClick={handleCart}
                                    type="submit"
                                    className="mt-10 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    Add to Cart
                                </button>
                            </form>
                        </div>

                        <div className="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pb-16 lg:pr-8 lg:pt-6">
                            {/* Description and details */}
                            <div>
                                <h3 className="sr-only">Description</h3>

                                <div className="space-y-6">
                                    <p className="text-base text-gray-900">{product.description}</p>
                                </div>
                            </div>

                            <div className="mt-10">
                                <h2 className="text-sm font-medium text-gray-900">Details</h2>

                                <div className="mt-4 space-y-6">
                                    <p className="text-sm text-gray-600">{product.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
