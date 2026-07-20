// One-time migration: (1) hash any still-plaintext user passwords with bcrypt,
// and (2) normalize email casing to lowercase.
//
// WHY (passwords): login uses bcrypt.compare, so any user whose password is still
// stored as plaintext (from before hashing was added) can no longer log in until
// their password is hashed. This backfills those.
//
// WHY (emails): login/signup validation now lowercases the submitted email, but
// findOne is case-sensitive and older rows were stored with the original casing.
// Without this backfill, any user whose stored email has an uppercase letter is
// locked out (the lowercased lookup key never matches the mixed-case stored value).
//
// SAFE TO RE-RUN: the bcrypt-prefix regex skips already-hashed passwords, emails
// already lowercase are left untouched, and updateOne bypasses the model's
// pre-save hook, so nothing is ever double-hashed.
//
// COLLISION SAFETY: lowercasing could make two distinct rows collide on the unique
// email index (e.g. "John@x.com" and "john@x.com"). Any lowercased email claimed
// by more than one row is LOGGED and SKIPPED for manual resolution rather than
// updated — an update would throw a duplicate-key error mid-run.
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

// Normalize an email the same way the schema's lowercase+trim setter does, so the
// backfilled value matches what future writes will store.
const normalizeEmail = (email) => (email || '').trim().toLowerCase()

async function main() {
    if (!process.env.DATABASE_URI) {
        logger.error('DATABASE_URI is not set — aborting')
        process.exit(1)
    }
    await mongoose.connect(process.env.DATABASE_URI, { family: 4 })

    // .lean() returns raw docs including the password field (the toJSON strip
    // only applies to serialized Mongoose documents, not lean objects).
    const users = await User.find({}).select('+password').lean()

    // Count how many rows map to each normalized email. Any count > 1 is a
    // collision: lowercasing would violate the unique index, so we skip those.
    const normalizedCounts = new Map()
    for (const u of users) {
        const lower = normalizeEmail(u.email)
        normalizedCounts.set(lower, (normalizedCounts.get(lower) || 0) + 1)
    }

    let passwordsMigrated = 0
    let emailsNormalized = 0
    let emailCollisions = 0
    let skipped = 0

    for (const u of users) {
        const update = {}

        // (1) Password: hash if still plaintext.
        if (u.password && !BCRYPT.test(u.password)) {
            update.password = await bcrypt.hash(u.password, SALT_ROUNDS)
        }

        // (2) Email: lowercase if it differs, unless doing so collides with
        // another row on the unique index.
        const lower = normalizeEmail(u.email)
        if (lower !== u.email) {
            if (normalizedCounts.get(lower) > 1) {
                emailCollisions++
                logger.warn(
                    `Email collision — "${u.email}" (_id=${u._id}) lowercases to "${lower}", ` +
                        `already used by another user. Skipping; resolve manually.`
                )
            } else {
                update.email = lower
            }
        }

        if (Object.keys(update).length === 0) {
            skipped++
            continue
        }

        // updateOne bypasses pre('save') and schema setters → we set the exact
        // (already normalized/hashed) values ourselves; no risk of double-hashing.
        await User.updateOne({ _id: u._id }, { $set: update })
        if (update.password) passwordsMigrated++
        if (update.email) emailsNormalized++
    }

    logger.info(
        `Migration complete: passwordsMigrated=${passwordsMigrated} ` +
            `emailsNormalized=${emailsNormalized} emailCollisions=${emailCollisions} ` +
            `unchanged=${skipped} total=${users.length}`
    )
    if (emailCollisions > 0) {
        logger.warn(
            `${emailCollisions} email collision(s) were skipped — those users stay ` +
                `case-sensitive and must be resolved manually before they can log in.`
        )
    }
    await mongoose.disconnect()
}

main().catch((err) => {
    logger.error({ err }, 'Migration failed')
    process.exit(1)
})
