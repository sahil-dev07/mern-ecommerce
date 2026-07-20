const { Product } = require("../model/product")
const catchAsync = require("../utils/catchAsync")

exports.createProduct = catchAsync(async (req, res) => {
    const product = new Product(req.body)
    const doc = await product.save()
    res.status(201).json(doc)
})

exports.fetchAllProducts = catchAsync(async (req, res) => {
    // Base filter: exclude soft-deleted products unless the admin view asks for all.
    const condition = {}
    if (!req.query.admin) {
        condition.deleted = { $ne: true }
    }

    let query = Product.find(condition)
    let totalProductQuery = Product.find(condition)

    // Category filter (comma-separated list; a trailing empty entry is popped).
    if (req.query.category) {
        const categories = req.query.category.split(',')
        categories.pop()
        query = query.find({ category: { $in: categories } })
        totalProductQuery = Product.find({ category: { $in: categories } })
    }
    // Brand filter.
    if (req.query.brand) {
        const brands = req.query.brand.split(',')
        brands.pop()
        query = query.find({ brand: { $in: brands } })
        totalProductQuery = Product.find({ brand: { $in: brands } })
    }
    // Sort.
    if (req.query._sort && req.query._order) {
        query = query.sort({ [req.query._sort]: req.query._order })
    }

    // Total count for pagination headers. countDocuments() — count() is removed
    // in Mongoose 8. This await is now inside the catchAsync-wrapped handler, so
    // a failure rejects to the central error handler instead of crashing.
    const totalDocs = await totalProductQuery.countDocuments().exec()

    // Pagination (values are unvalidated for now; capped in Phase C).
    if (req.query._page && req.query._limit) {
        const pageSize = req.query._limit
        const page = req.query._page
        query = query.skip(pageSize * (page - 1)).limit(pageSize)
    }

    res.set('X-Total-Count', totalDocs)
    const docs = await query.exec()
    res.status(200).json(docs)
})

exports.fetchProductById = catchAsync(async (req, res) => {
    const { id } = req.params
    const product = await Product.findById(id)
    res.status(200).json(product)
})

exports.updateProduct = catchAsync(async (req, res) => {
    const { id } = req.params
    // {new:true} returns the updated document.
    // NOTE (Phase C): req.body is not yet whitelisted here.
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true })
    res.status(200).json(updatedProduct)
})
