const express = require('express');
const router = express.Router();
const {
  getBatches, getBatch, createBatch, updateBatch,
  updateBatchStatus, enrollInBatch, getBatchEnrollments,
  approveEnrollment, rejectEnrollment
} = require('../controllers/batch.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

// Public routes
router.get('/', getBatches);
router.get('/:id', getBatch);

// Admin only
router.post('/', protect, requireAdmin, createBatch);
router.put('/:id', protect, requireAdmin, updateBatch);
router.patch('/:id/status', protect, requireAdmin, updateBatchStatus);
router.get('/:id/enrollments', protect, requireAdmin, getBatchEnrollments);

// Student
router.post('/:id/enroll', protect, enrollInBatch);

// Enrollment actions (admin)
router.patch('/enrollments/:id/approve', protect, requireAdmin, approveEnrollment);
router.patch('/enrollments/:id/reject', protect, requireAdmin, rejectEnrollment);

module.exports = router;