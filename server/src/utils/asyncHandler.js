// Wraps async route handlers to catch errors automatically
// Instead of try/catch in every controller, we wrap once here
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;