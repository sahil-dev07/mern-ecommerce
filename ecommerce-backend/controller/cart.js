
const { Cart } = require("../model/cart")

exports.fetchCartByUser = async (req, res) => {
    const { user } = req.query
    try {
        const cartItems = await Cart.find({ user: user }).populate('user').populate('product')
        res.send(cartItems).status(200)
    } catch (error) {
        res.send(error).status(400)
    }
}

exports.addToCart = async (req, res) => {
    const cart = new Cart(req.body)
    try {
        const doc = await cart.save()
        const result = await doc.populate('product')
        // console.log(result)
        res.json(result).status(201)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
}

exports.updateCart = async (req, res) => {
    // console.log(req.body)
    const { userId, productId, quantity } = req.body
    try {
        // inorder to get the updated doc in return {new:true} is written
        const updatedCart = await Cart.findOne({ user: userId, product: productId })

        if (!updatedCart) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        // console.log("old ", updatedCart)
        updatedCart.quantity = quantity
        await updatedCart.save()
        const result = await updatedCart.populate('product')
        // console.log("new ", result)
        res.json(result).status(200)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
}

exports.deleteFromCart = async (req, res) => {
    const { product, user } = req.query

    try {
        // console.log({ product, user })
        const doc = await Cart.findOneAndDelete({ product: product, user: user })
        res.json(doc).status(200)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
}