const { Product } = require("../model/product")

exports.createProduct = async (req, res) => {
    // create a new product
    const product = new Product(req.body)
    try {
        const doc = await product.save()
        console.log(doc)
        res.json(doc).status(201)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
}

exports.fetchAllProducts = async (req, res) => {
    let condition = {}
    if (!req.query.admin) {
        condition.deleted = { $ne: true }
    }


    let query = Product.find(condition)
    let totalProductQuery = Product.find(condition)
    // category filter
    if (req.query.category) {
        query = query.find({ category: req.query.category })
        totalProductQuery = Product.find({ category: req.query.category })

    }
    // brand filter
    if (req.query.brand) {
        query = query.find({ brand: req.query.brand })
        totalProductQuery = Product.find({ brand: req.query.brand })
    }
    // sort
    if (req.query._sort && req.query._order) {
        query = query.sort({ [req.query._sort]: req.query._order })
    }

    const totalDocs = await totalProductQuery.count().exec()

    // pagination
    if (req.query._page && req.query._limit) {
        const pageSize = req.query._limit
        const page = req.query._page
        query = query.skip(pageSize * (page - 1)).limit(pageSize)
    }

    try {
        // console.log('Category:', req.query.category);
        // console.log('Brand:', req.query.brand);

        // console.log('all product fetched')
        res.set('X-Total-Count', totalDocs)
        const docs = await query.exec()
        // console.log(docs)
        res.json(docs).status(200)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
}

//better to understand

// exports.fetchAllProducts = async (req, res) => {
//     let query = Product.find({});

//     // category filter
//     if (req.query.category) {
//         query = query.where('category', req.query.category);
//     }
//     // brand filter
//     if (req.query.brand) {
//         query = query.where('brand', req.query.brand);
//     }
//     // sort
//     if (req.query._sort && req.query._order) {
//         query = query.sort({ [req.query._sort]: req.query._order });
//     }
//     // pagination
//     if (req.query._page && req.query._limit) {
//         const pageSize = req.query._limit;
//         const page = req.query._page;
//         query = query.skip(pageSize * (page - 1)).limit(pageSize);
//     }

//     try {
//         const docs = await query.exec();
//         console.log(docs);
//         res.json(docs).status(200);
//     } catch (error) {
//         console.log(error);
//         res.status(400).json(error);
//     }
// };

// fetch product by id
exports.fetchProductById = async (req, res) => {
    const { id } = req.params
    // create a new product
    try {
        const product = await Product.findById(id)
        res.json(product).status(200)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
}

// update product
exports.updateProduct = async (req, res) => {
    const { id } = req.params

    try {
        // inorder to get the updated doc in return {new:true} is written
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true })
        res.json(updatedProduct).status(200)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
}


