// Application constants - Section 4.1: No magic numbers or hardcoded strings

// Password requirements
const MIN_PASSWORD_LENGTH = 6;
const BCRYPT_SALT_ROUNDS = 12;

// JWT token expiration
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const REFRESH_TOKEN_COOKIE_MS = REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

// User roles
const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin'
};

// Course types
const COURSE_TYPES = {
  FREE: 'free',
  PAID: 'paid',
  PROMO: 'promo'
};

// Enrollment statuses
const ENROLLMENT_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  COMPLETED: 'completed'
};

// Payment statuses
const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed'
};

// Batch statuses
const BATCH_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  COMPLETED: 'completed'
};

// Academies
const ACADEMY = {
  FOREX: 'forex',
  TECH: 'tech'
};

// Paystack
const PAYSTACK_EVENT_TYPES = {
  CHARGE_SUCCESS: 'charge.success'
};

// Jitsi room name prefix
const JITSI_ROOM_PREFIX = 'mfa';

module.exports = {
  MIN_PASSWORD_LENGTH,
  BCRYPT_SALT_ROUNDS,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY_DAYS,
  REFRESH_TOKEN_COOKIE_MS,
  ROLES,
  COURSE_TYPES,
  ENROLLMENT_STATUS,
  PAYMENT_STATUS,
  BATCH_STATUS,
  ACADEMY,
  PAYSTACK_EVENT_TYPES,
  JITSI_ROOM_PREFIX
};
