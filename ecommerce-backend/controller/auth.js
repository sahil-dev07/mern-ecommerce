const { User } = require("../model/user")

exports.createUser = async (req, res) => {
    // create a new user
    try {
        // console.log(req.body);
        const { email } = req.body
        const existedUser = await User.findOne({ email })
        if (existedUser) {
            res.status(401).json({
                message: "User Already Exist"
            })
            return
        }
        else {
            const user = await User.create(req.body)
            // console.log(user);
            res.status(201).json({ id: user.id, role: user.role })
        }
    } catch (error) {
        console.log("Error in create User", error)
        res.status(400).json(error)
    }
}

exports.loginUser = async (req, res) => {
    try {
        // console.log(req.body);
        const { email, password } = req.body
        const user = await User.findOne(
            { email: email },
        )

        if (!user) {
            // console.log("user not present");
            res.status(401).json({ message: 'no such user email' });
            return
        }
        // console.log({ user })
        const isPasswordValid = await user.isPasswordCorrect(password)
        if (isPasswordValid) {
            res.status(200).json({ id: user.id, role: user.role });
        } else {
            res.status(401).json({ message: 'invalid credentials' });
        }
    } catch (err) {
        console.log("Error while login", err);
        res.status(400).json(err);
    }
}