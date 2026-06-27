const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getStudents,
  getStudent,
  suspendStudent,
  sendAnnouncement,
  getTransactions
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

// All admin routes are protected
router.use(protect, requireAdmin);

// Dashboard
router.get('/dashboard-stats', getDashboardStats);

// Students
router.get('/students', getStudents);
router.get('/students/:id', getStudent);
router.patch('/students/:id/suspend', suspendStudent);

// Announcements
router.post('/announcements', sendAnnouncement);

// Transactions
router.get('/transactions', getTransactions);

module.exports = router;