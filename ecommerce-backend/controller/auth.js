const { User } = require("../model/user")

exports.createUser = async (req, res) => {
    // create a new user
    const user = new User(req.body)
    try {
        const doc = await user.save()
        res.json({ id: doc.id, role: doc.role, name: doc.name }).status(201)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
}

exports.loginUser = async (req, res) => {
    try {
        const user = await User.findOne(
            { email: req.body.email },
        ).exec();
        // TODO: this is just temporary, we will use strong password auth
        // console.log({ user })
        if (!user) {
            res.status(401).json({ message: 'no such user email' });
        } else if (user.password === req.body.password) {
            // TODO: We will make addresses independent of login
            res.status(200).json({ id: user.id, role: user.role });
        } else {
            res.status(401).json({ message: 'invalid credentials' });
        }
    } catch (err) {
        res.status(400).json(err);
    }
}