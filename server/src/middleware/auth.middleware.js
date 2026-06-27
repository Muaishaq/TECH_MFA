const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const prisma = require('../config/db');

// Protect routes — verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Get user from database
  req.user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
      is_verified: true
    }
  });

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, user not found'
    });
  }

  next();
});

module.exports = { protect };