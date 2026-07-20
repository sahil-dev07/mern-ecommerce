const { Cart } = require("../model/cart")
const catchAsync = require("../utils/catchAsync")

exports.fetchCartByUser = catchAsync(async (req, res) => {
    const { user } = req.query
    const cartItems = await Cart.find({ user }).populate('user').populate('product')
    res.status(200).json(cartItems)
})

exports.addToCart = catchAsync(async (req, res) => {
    const cart = new Cart(req.body)
    const doc = await cart.save()
    const result = await doc.populate('product')
    res.status(201).json(result)
})

exports.updateCart = catchAsync(async (req, res) => {
    const { userId, productId, quantity } = req.body
    const cartItem = await Cart.findOne({ user: userId, product: productId })
    if (!cartItem) {
        return res.status(404).json({ message: 'Cart item not found' })
    }
    cartItem.quantity = quantity
    await cartItem.save()
    const result = await cartItem.populate('product')
    res.status(200).json(result)
})

exports.deleteFromCart = catchAsync(async (req, res) => {
    const { product, user } = req.query
    const doc = await Cart.findOneAndDelete({ product, user })
    res.status(200).json(doc)
})
