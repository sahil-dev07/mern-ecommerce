const { Brand } = require("../model/brand")

exports.fetchBrands = async (req, res) => {
    try {
        const brands = await Brand.find({})
        res.send(brands).status(200)
    } catch (error) {
        res.send(error).status(400)
    }
}

exports.createBrand = async (req, res) => {
    // create a new brand
    const brand = new Brand(req.body)
    try {
        const doc = await brand.save()
        // console.log(doc)
        res.json(doc).status(201)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
}