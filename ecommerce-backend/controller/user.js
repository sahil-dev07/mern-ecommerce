
const { User } = require("../model/user")

exports.fetchUserById = async (req, res) => {

    const { id } = req.params
    try {
        // const doc = await User.findById(id, 'name email id')

        const doc = await User.findById(id)

        console.log(doc)
        res.json(doc).status(200)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
}

exports.updateUser = async (req, res) => {
    const { id } = req.params

    try {
        // inorder to get the updated doc in return {new:true} is written
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true })
        res.json(updatedUser).status(200)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
}

