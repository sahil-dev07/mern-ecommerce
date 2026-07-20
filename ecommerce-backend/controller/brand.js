const { Brand } = require("../model/brand")
const catchAsync = require("../utils/catchAsync")

exports.fetchBrands = catchAsync(async (req, res) => {
    const brands = await Brand.find({})
    res.status(200).json(brands)
})

exports.createBrand = catchAsync(async (req, res) => {
    const brand = new Brand(req.body)
    const doc = await brand.save()
    res.status(201).json(doc)
})
