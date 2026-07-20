const { User } = require("../model/user")
const catchAsync = require("../utils/catchAsync")

// Register a new user.
// NOTE (Phase C): req.body is still mass-assignable (a client can send
// role:'admin') — this is locked down with a field whitelist in a later phase.
exports.createUser = catchAsync(async (req, res) => {
    const { email } = req.body
    const existedUser = await User.findOne({ email })
    if (existedUser) {
        return res.status(409).json({ message: "User already exists" })
    }
    // Password is hashed by the model's pre-save hook.
    const user = await User.create(req.body)
    res.status(201).json({ id: user.id, role: user.role })
})

// Authenticate a user. Password is verified via the bcrypt-backed
// isPasswordCorrect() method on the model.
// NOTE (Phase B): this will issue a JWT; today it only returns id/role.
exports.loginUser = catchAsync(async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    // Generic message for both branches so we don't leak which emails exist.
    if (!user || !(await user.isPasswordCorrect(password))) {
        return res.status(401).json({ message: 'Invalid credentials' })
    }
    res.status(200).json({ id: user.id, role: user.role })
})
