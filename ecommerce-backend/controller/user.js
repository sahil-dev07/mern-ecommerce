const { User } = require("../model/user")
const catchAsync = require("../utils/catchAsync")

exports.fetchUserById = catchAsync(async (req, res) => {
    const { id } = req.params
    const doc = await User.findById(id).select("-password")
    res.status(200).json(doc)
})

exports.updateUser = catchAsync(async (req, res) => {
    const { id } = req.params
    // {new:true} returns the updated document; strip password from the response.
    // NOTE (Phase C): whitelist to {name, addresses} — currently a blind update.
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true }).select("-password")
    res.status(200).json(updatedUser)
})
