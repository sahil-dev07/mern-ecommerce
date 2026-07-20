const { Category } = require("../model/category")
const catchAsync = require("../utils/catchAsync")

exports.fetchCategories = catchAsync(async (req, res) => {
    const categories = await Category.find({})
    res.status(200).json(categories)
})

exports.createCategory = catchAsync(async (req, res) => {
    const category = new Category(req.body)
    const doc = await category.save()
    res.status(201).json(doc)
})
