const express = require('express')
const server = express()

const mongoose = require('mongoose')
const productsRouters = require('./router/products')
const brandsRouters = require('./router/brands')
const categoriesRouters = require('./router/categories')
const userRouters = require('./router/users')
const authRouters = require('./router/auth')
const cartRouters = require('./router/cart')
const orderRouters = require('./router/order')
const cors = require('cors')
require('dotenv').config()
const atlas = process.env.DATABASE_URI

// authentication
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('./model/user')







// const atlas = "mongodb+srv://sahilgupta86046:Ihv3ZiSNOyb0c0WW@cluster0.tlhmh8r.mongodb.net/Ecommerce?retryWrites=true&w=majority"
mongoose.connect(atlas, {
    family: 4
    // useCreateIndex: true,
    // useNewUrlParser: true,
    // useUnifiedTopology: true
})
    .then(() => { console.log('connected to ecommerce Database ') })
    .catch((err) => { console.log('Opps cant connect to Database ' + err) })



// middleware


server.use(session({
    secret: 'keyboard cat',
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something 
}));

server.use(passport.initialize());
server.use(passport.session());



server.use(cors({
    exposedHeaders: ['X-Total-Count']
}))
// to parse req.body to json
server.use(express.json())



// to add /products automatically 
server.use('/products', productsRouters.router)
server.use('/brands', brandsRouters.router)
server.use('/categories', categoriesRouters.router)
server.use('/users', userRouters.router)
server.use('/auth', authRouters.router)
server.use('/cart', cartRouters.router)
server.use('/orders', orderRouters.router)


// passport strategy 
passport.use(new LocalStrategy(async function (username, password, done) {
    console.log("hello gyues")
    try {
        const user = await User.findOne({ email: username }).exec()
        console.log("hello", { user })

        if (!user) {
            done(null, false, { message: "Invalid Credential" })
        }
        else if (user.password === password) {
            // console.log(user)
            done(null, user)
        }
        else {
            done(null, false, { message: "Invalid Credential" })
        }


    }

    catch (error) {
        console.log("from middleware ", error)
        done(error)
    }
})
);

// this create session variable req.user on being called 
passport.serializeUser(function (user, cb) {
    console.log("serialise")
    process.nextTick(function () {
        return cb(null, { id: user.id, role: user.role });
    });
});
// this changes session variable req.user when called from authorized request 
passport.deserializeUser(function (user, cb) {
    console.log("deserialise")

    process.nextTick(function () {
        return cb(null, user);
    });
});



server.get('/', (req, res) => {
    res.json({ status: "success" })
})

server.listen(8080, () => {
    console.log("listening to port 8080")
})