const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const { Schema } = mongoose

const SALT_ROUNDS = 10

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        // Store emails normalized. Login/signup zod already lowercases the input,
        // but findOne is case-sensitive, so the DB copy must match. lowercase+trim
        // runs on every save/create; existing rows are backfilled by the migration.
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        default: 'user',
    },
    addresses: {
        type: [Schema.Types.Mixed],
    },
    orders: {
        type: [Schema.Types.Mixed],
    },
})

const virtual = userSchema.virtual('id')
virtual.get(function () {
    return this._id
})

// Never expose _id, __v, or the password hash in serialized responses.
userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id
        delete ret.password
        return ret
    },
})

// Hash the password before saving.
// - isModified guard: only re-hash when the password actually changed, so an
//   unrelated save (e.g. pushing an address/order) doesn't re-hash the hash.
// - bcrypt-prefix guard: makes the hook idempotent. If the value already looks
//   like a bcrypt hash ($2a/$2b/$2y), skip it — this lets the one-time migration
//   script (which writes hashes directly) and this hook coexist without ever
//   double-hashing a password.
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    if (/^\$2[aby]\$/.test(this.password)) return next()
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS)
    next()
})

// Compare a plaintext candidate against the stored bcrypt hash.
userSchema.methods.isPasswordCorrect = async function (password) {
    return bcrypt.compare(password, this.password)
}

exports.User = mongoose.model('User', userSchema)
