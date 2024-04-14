const { Order } = require("../model/order")


exports.fetchOrderByUser = async (req, res) => {
    const { userId } = req.params
    // console.log(userId)
    try {
        const orders = await Order.find({ user: userId })

        res.send(orders).status(200)
    } catch (error) {
        res.send(error).status(400)
    }
}

exports.createOrder = async (req, res) => {
    const order = new Order(req.body)
    try {
        const doc = await order.save()
        // console.log(doc)
        res.json(doc).status(201)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
}

exports.deleteOrder = async (req, res) => {
    const { id } = req.params

    try {
        const order = await Order.findByIdAndDelete(id)
        res.json(order).status(200)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
}

exports.updateOrder = async (req, res) => {
    const { id } = req.params
    // console.log(req.body, { id: id })
    try {
        // inorder to get the updated doc in return {new:true} is written
        const updatedOrder = await Order.findByIdAndUpdate(id, req.body, { new: true })
        res.json(updatedOrder).status(201)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
}


// for Admin
exports.fetchAllOrders = async (req, res) => {

    const { _sort, _order, _page, _limit } = req.query
    // console.log(_page, _limit)

    let query = Order.find({ deleted: { $ne: true } })
    let totalOrdersQuery = Order.find({ deleted: { $ne: true } })

    // sort
    if (_sort && _order) {
        query = query.sort({ [_sort]: _order })
    }

    const totalDocs = await totalOrdersQuery.count().exec()

    // pagination
    if (_page && _limit) {
        const pageSize = _limit
        const page = _page
        query = query.skip(pageSize * (page - 1)).limit(pageSize)
    }

    try {
        res.set('X-Total-Count', totalDocs)
        const docs = await query.exec()
        // const result = await docs.populate('product')

        // console.log(result)
        res.json(docs).status(200)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
}