// Wrap an async Express handler so any rejected promise is forwarded to the
// central error-handling middleware via next(err), instead of surfacing as an
// unhandled promise rejection (which would crash the process). This removes the
// copy-pasted try/catch that previously lived in every controller.
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = catchAsync
