// Validate a request part (body/query) against a zod schema.
// - On failure: respond 400 with the list of field errors.
// - On success for `body`: replace req.body with the parsed result. zod strips
//   unknown keys by default, so this is what closes mass-assignment (a client
//   can't sneak in role/deleted/etc). req.body is writable in Express 5.
// - For `query`/`params` (read-only getters in Express 5) we only validate and
//   reject; the raw value is left in place but has been proven to conform
//   (e.g. an operator-injection object like {"$gt":""} fails a string field).
const validate = (schema, source = 'body') => (req, res, next) => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
        return res.status(400).json({
            message: 'Validation failed',
            details: result.error.issues.map(
                (i) => `${i.path.join('.') || source}: ${i.message}`
            ),
        })
    }
    if (source === 'body') req.body = result.data
    next()
}

module.exports = validate
