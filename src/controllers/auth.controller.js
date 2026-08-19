const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const { MIN_PASSWORD_LENGTH, BCRYPT_SALT_ROUNDS, REFRESH_TOKEN_EXPIRY_DAYS, REFRESH_TOKEN_COOKIE_MS, ROLES, ACADEMY } = require('../constants');
const { sendWelcomeEmail } = require('../services/email.service');

const userSelect = {
  id: true,
  full_name: true,
  email: true,
  role: true,
  academy: true,
  is_verified: true,
  avatar_url: true,
  created_at: true,
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { full_name, email, password, academy } = req.body;

  // Validate input
  if (!full_name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide full name, email and password'
    });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    });
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'An account with this email already exists'
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  const password_hash = await bcrypt.hash(password, salt);

  // Create user
  const user = await prisma.user.create({
    data: {
      full_name,
      email,
      password_hash,
      role: ROLES.STUDENT,
      academy: academy || ACADEMY.FOREX
    },
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
      academy: true,
      is_verified: true,
      created_at: true
    }
  });

  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  // Send refresh token as httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none', // Required for CORS with credentials across domains
    maxAge: REFRESH_TOKEN_COOKIE_MS
  });

  // Send welcome email (async, non-blocking)
  sendWelcomeEmail(user);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: {
      user,
      accessToken
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  // Send refresh token as httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none', // Required for CORS with credentials across domains
    maxAge: REFRESH_TOKEN_COOKIE_MS
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        academy: user.academy,
        is_verified: user.is_verified
      },
      accessToken
    }
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0)
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
      academy: true,
      is_verified: true,
      avatar_url: true,
      created_at: true
    }
  });

  res.json({
    success: true,
    message: 'User retrieved successfully',
    data: { user }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, currentPassword, newPassword } = req.body;

  // Get current user
  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Update name if provided
  const updateData = {};
  if (name) {
    updateData.full_name = name;
  }

  // Handle password change
  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is required to change password'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters`
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    updateData.password_hash = await bcrypt.hash(newPassword, salt);
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: updateData,
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
      academy: true,
      is_verified: true,
      avatar_url: true,
      created_at: true
    }
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: updatedUser }
  });
});

module.exports = { register, login, logout, getMe, updateProfile };