const { User } = require("../model/user")
const catchAsync = require("../utils/catchAsync")
const { signToken } = require("../utils/token")

// Register a new user.
// Fields are whitelisted to {name, email, password} so a client cannot set
// `role` (privilege escalation) — role falls back to the schema default 'user'.
// The password is hashed by the model's pre-save hook.
exports.createUser = catchAsync(async (req, res) => {
    const { name, email, password } = req.body
    const existedUser = await User.findOne({ email })
    if (existedUser) {
        return res.status(409).json({ message: "User already exists" })
    }
    const user = await User.create({ name, email, password })
    const token = signToken({ id: user.id, role: user.role })
    res.status(201).json({ id: user.id, role: user.role, name: user.name, token })
})

// Authenticate a user. Password is verified via the bcrypt-backed
// isPasswordCorrect() method. A generic message is returned for both the
// unknown-email and wrong-password cases so we don't leak which emails exist.
exports.loginUser = catchAsync(async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await user.isPasswordCorrect(password))) {
        return res.status(401).json({ message: 'Invalid credentials' })
    }
    const token = signToken({ id: user.id, role: user.role })
    res.status(200).json({ id: user.id, role: user.role, name: user.name, token })
})
