const express = require('express');
const router = express.Router();
const {
  getSessions,
  getAllSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  addRecording
} = require('../controllers/session.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

// Student routes
router.get('/', protect, getSessions);
router.get('/:id', protect, getSession);

// Admin routes
router.get('/all', protect, requireAdmin, getAllSessions);
router.post('/', protect, requireAdmin, createSession);
router.put('/:id', protect, requireAdmin, updateSession);
router.delete('/:id', protect, requireAdmin, deleteSession);
router.patch('/:id/recording', protect, requireAdmin, addRecording);

module.exports = router;