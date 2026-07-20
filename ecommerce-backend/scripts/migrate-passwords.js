// One-time migration: hash any still-plaintext user passwords with bcrypt.
//
// WHY: login already uses bcrypt.compare, so any user whose password is still
// stored as plaintext (from before hashing was added) can no longer log in until
// their password is hashed. This backfills those.
//
// SAFE TO RE-RUN: the bcrypt-prefix regex skips values that are already hashed,
// and updateOne bypasses the model's pre-save hook, so nothing is ever
// double-hashed.
//
// RUN (against the rotated production DB, from ecommerce-backend/):
//   node scripts/migrate-passwords.js
require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const { User } = require('../model/user')
const logger = require('../config/logger')

const SALT_ROUNDS = 10
const BCRYPT = /^\$2[aby]\$/ // matches $2a$ / $2b$ / $2y$ bcrypt hashes

async function main() {
    if (!process.env.DATABASE_URI) {
        logger.error('DATABASE_URI is not set — aborting')
        process.exit(1)
    }
    await mongoose.connect(process.env.DATABASE_URI, { family: 4 })

    // .lean() returns raw docs including the password field (the toJSON strip
    // only applies to serialized Mongoose documents, not lean objects).
    const users = await User.find({}).select('+password').lean()
    let migrated = 0
    let skipped = 0

    for (const u of users) {
        if (!u.password || BCRYPT.test(u.password)) {
            skipped++
            continue
        }
        const hash = await bcrypt.hash(u.password, SALT_ROUNDS)
        // updateOne bypasses pre('save') → no risk of double-hashing.
        await User.updateOne({ _id: u._id }, { $set: { password: hash } })
        migrated++
    }

    logger.info(
        `Password migration complete: migrated=${migrated} skipped=${skipped} total=${users.length}`
    )
    await mongoose.disconnect()
}

main().catch((err) => {
    logger.error({ err }, 'Password migration failed')
    process.exit(1)
})
