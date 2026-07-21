// In-memory MongoDB for the one suite that genuinely needs a database
// (test/createOrder.test.js — proving the real Mongoose read/write path).
//
// Deliberately NOT a global setup: the other suites run with no DB at all, which
// is what keeps them fast. Only import this where a real database is required.
//
// NOTE: mongodb-memory-server downloads a mongod binary on first use. If that
// download is unavailable, only this suite fails — the DB-less suites still pass.
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongod = null

// Boot an ephemeral mongod and point Mongoose at it.
async function startDb() {
    mongod = await MongoMemoryServer.create()
    await mongoose.connect(mongod.getUri())
}

// Tear everything down so the vitest worker can exit cleanly.
async function stopDb() {
    await mongoose.disconnect()
    if (mongod) await mongod.stop()
    mongod = null
}

// Wipe every collection between tests so cases can't leak state into each other.
async function clearDb() {
    const { collections } = mongoose.connection
    await Promise.all(Object.values(collections).map((c) => c.deleteMany({})))
}

module.exports = { startDb, stopDb, clearDb }
