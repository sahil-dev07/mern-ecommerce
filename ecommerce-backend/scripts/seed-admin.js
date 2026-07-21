// One-time (idempotent) seed of the FIRST admin user.
//
// WHY: signup no longer accepts a `role` (mass-assignment was closed in Phase B),
// so every account created through the app defaults to role:'user'. There is no
// way to become an admin through the UI. After the Phase G enforcement flip,
// product writes and order management are admin-only — so the panel needs at least
// one admin operator. This script creates (or promotes) exactly one, from env vars.
//
// SAFE TO RE-RUN: it looks the user up by normalized email.
//   - already admin        -> no-op
//   - exists, not admin     -> promoted to admin (password left untouched)
//   - does not exist        -> created with the given password
//
// WHY save() and NOT updateOne: the User model's pre('save') hook hashes the
// password (and the schema setter lowercases the email). updateOne/findOneAndUpdate
// bypass both, so a new admin created that way would store a PLAINTEXT password and
// never be able to log in. We use new User(...).save() / doc.save() so the hook runs.
//
// RUN (against the production DB, from ecommerce-backend/):
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='strong-pass' ADMIN_NAME='You' \
//     node scripts/seed-admin.js
// (ADMIN_* may also live in .env). Unset the ADMIN_* vars again once done.
require('dotenv').config()
const mongoose = require('mongoose')
const { User } = require('../model/user')
const logger = require('../config/logger')

// Normalize an email the same way the schema's lowercase+trim setter does, so the
// findOne lookup matches how the row is stored (findOne is case-sensitive).
const normalizeEmail = (email) => (email || '').trim().toLowerCase()

async function main() {
    const { DATABASE_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env
    const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin'

    // Fail fast on missing config — mirrors the boot-time env guard in index.js.
    const missing = ['DATABASE_URI', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'].filter(
        (k) => !process.env[k]
    )
    if (missing.length) {
        logger.error(`Missing required env: ${missing.join(', ')} — aborting`)
        process.exit(1)
    }

    // family: 4 forces IPv4 (matches migrate-passwords.js; avoids IPv6 DNS hangs).
    await mongoose.connect(DATABASE_URI, { family: 4 })

    const email = normalizeEmail(ADMIN_EMAIL)
    const existing = await User.findOne({ email })

    if (existing && existing.role === 'admin') {
        logger.info(`User ${email} is already an admin — nothing to do.`)
    } else if (existing) {
        // Promote in place. The pre-save hook's isModified('password') guard means
        // an unchanged password is never re-hashed, so we don't disturb their login.
        existing.role = 'admin'
        await existing.save()
        logger.info(`Promoted existing user ${email} to admin.`)
    } else {
        // Create fresh. Passing a PLAINTEXT password is correct: save() triggers the
        // pre-save hook, which hashes it; the email setter lowercases/trims it.
        await new User({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'admin',
        }).save()
        logger.info(`Created new admin user ${email}.`)
    }

    await mongoose.disconnect()
}

main().catch((err) => {
    logger.error({ err }, 'Seed admin failed')
    process.exit(1)
})
