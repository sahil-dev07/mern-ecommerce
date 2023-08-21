const { Category } = require("../model/category")

exports.fetchCategories = async (req, res) => {
    try {
        const categories = await Category.find({})
        // console.log("cat fetched")
        res.json(categories).status(200)
    } catch (error) {
        res.send(error).status(400)
    }
}

exports.createCategory = async (req, res) => {
    // create a new category
    const category = new Category(req.body)
    try {
        const doc = await category.save()
        console.log(doc)
        res.json(doc).status(201)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
}