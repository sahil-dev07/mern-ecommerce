import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllProducts, fetchProductsByFilterAsync, selectTotalItems, selectBrands, selectCategory, fetchCategoryAsync, fetchBrandsAsync, selectProductListStatus } from '../productSlice';
import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon, FunnelIcon, PlusIcon, Squares2X2Icon, StarIcon } from '@heroicons/react/20/solid'
import { ITEMS_PER_PAGE } from '../../../app/constants';
import Pagination from '../../common/Pagination';
import MobileFilter from './MobileFilter';
import DesktopFilter from './DesktopFilter';
import ProductGrid from './ProductGrid';

export default function ProductList() {

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [filter, setFilter] = useState({})
  const [sort, setSort] = useState({})
  const [page, setPage] = useState(1)
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts)
  const totalItems = useSelector(selectTotalItems)
  const originalBrands = useSelector(selectBrands)
  const originalCategory = useSelector(selectCategory)
  const status = useSelector(selectProductListStatus)

  const [category, setCategory] = useState([])
  const [brands, setBrands] = useState([])

  useEffect(() => {
    // console.log("products in useeffect")
    const pagination = { _page: page, _limit: ITEMS_PER_PAGE }
    dispatch(fetchProductsByFilterAsync({ filter, sort, pagination }))

  }, [dispatch, filter, sort, page])

  useEffect(() => {
    setPage(1)
    // console.log(totalItems)
  }, [totalItems, sort])

  useEffect(() => {
    dispatch(fetchBrandsAsync())
    dispatch(fetchCategoryAsync())
  }, [dispatch])
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }

  const sortOptions = [
    { name: 'Best Rating', sort: 'rating', order: "desc", current: false },
    { name: 'Price: Low to High', sort: 'price', order: "asc", current: false },
    { name: 'Price: High to Low', sort: 'price', order: "desc", current: false },
  ]


  const filters = [
    {
      id: 'category',
      name: 'Category',
      options: category,
    },
    {
      id: 'brand',
      name: 'Brands',
      options: brands,
    },
  ]

  useEffect(() => {
    setCategory(originalCategory);
    setBrands(originalBrands)
  }, [originalCategory, originalBrands])

  const updateCheckbox = (option) => {
    const updatedCategory = category.map((obj) => {
      if (obj.id === option.id)
        return { ...obj, checked: !obj.checked }

      return obj
    })
    setCategory(updatedCategory)

    const updatedBrands = brands.map((obj) => {
      if (obj.id === option.id)
        return { ...obj, checked: !obj.checked }

      return obj
    })
    setBrands(updatedBrands)
  }

  const handleFilter = (e, section, option) => {
    // changes on frontend
    updateCheckbox(option)
    const newFilter = { ...filter }
    if (e.target.checked) {

      if (newFilter[section.id]) {
        newFilter[section.id].push(option.value)
      }
      else {
        newFilter[section.id] = [option.value]
      }
    }
    else {
      const index = newFilter[section.id].findIndex(ele => ele === option.value)
      newFilter[section.id].splice(index, 1)
    }

    setFilter(newFilter)
    // console.log({ filters, e, section, option })
    // console.log("products in handlefilter", newFilter)
    // dispatch(fetchProductsByFilterAsync({ newFilter, sort, pagination }))

    // console.log({ filter, newFilter });
  }

  const handleClearFilter = (e) => {
    e.preventDefault()
    setFilter({})
    setCategory(originalCategory)
    setBrands(originalBrands)
  }

  const handleSort = (e, option) => {

    const sort = { _sort: option.sort, _order: option.order }
    setSort(sort)
    // console.log("products in handlesort")
    // dispatch(fetchProductsByFilterAsync(sort))
  }

  const handlePage = (page) => {
    setPage(page)
  }
  return (
    <div className="bg-white">
      <div>
        <MobileFilter
          handleFilter={handleFilter}
          mobileFiltersOpen={mobileFiltersOpen}
          setMobileFiltersOpen={setMobileFiltersOpen}
          filters={filters}
          handleClearFilter={handleClearFilter}
        />

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              All Products
            </h1>

            <div className="flex items-center">
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                    Sort
                    <ChevronDownIcon
                      className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                  </Menu.Button>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {sortOptions.map((option) => (
                        <Menu.Item key={option.name}>
                          {({ active }) => (
                            <p
                              onClick={(e) => handleSort(e, option)}
                              className={classNames(
                                option.current
                                  ? 'font-medium text-gray-900'
                                  : 'text-gray-500',
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm'
                              )}
                            >
                              {option.name}
                            </p>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              <button
                type="button"
                className="-m-2 ml-5 p-2 text-gray-400 hover:text-gray-500 sm:ml-7"
              >
                <span className="sr-only">View grid</span>
                <Squares2X2Icon className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <span className="sr-only">Filters</span>
                <FunnelIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <section aria-labelledby="products-heading" className="pb-24 pt-6">
            <h2 id="products-heading" className="sr-only">
              Products
            </h2>

            <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
              <DesktopFilter
                handleFilter={handleFilter}
                filters={filters}
                handleClearFilter={handleClearFilter}
              />
              {/* Product grid */}
              <div className="lg:col-span-3">
                <ProductGrid products={products} status={status} />
              </div>
              {/* Product grid end */}
            </div>
          </section>

          {/* section of product and filters ends */}
          <Pagination
            page={page}
            setPage={setPage}
            handlePage={handlePage}
            totalItems={totalItems}>
          </Pagination>
        </main>
      </div>
    </div>
  );
}

