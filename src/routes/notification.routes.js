const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

// @route   GET /api/notifications — get current user's notifications
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { user_id: req.user.id },
    orderBy: { created_at: 'desc' },
    take: 50
  });
  res.json({ success: true, data: { notifications } });
}));

// @route   PATCH /api/notifications/:id/read — mark single notification as read
// @access  Private
router.patch('/:id/read', protect, asyncHandler(async (req, res) => {
  const notification = await prisma.notification.findUnique({
    where: { id: req.params.id }
  });

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  if (notification.user_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  await prisma.notification.update({
    where: { id: req.params.id },
    data: { is_read: true }
  });

  res.json({ success: true, message: 'Notification marked as read' });
}));

// @route   PATCH /api/notifications/read-all — mark all notifications as read
// @access  Private
router.patch('/read-all', protect, asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { user_id: req.user.id, is_read: false },
    data: { is_read: true }
  });

  res.json({ success: true, message: 'All notifications marked as read' });
}));

// @route   GET /api/notifications/all — admin gets all unique announcements sent
// @access  Admin
router.get('/all', protect, requireAdmin, asyncHandler(async (req, res) => {
  // Get unique announcements by title+message combination
  const notifications = await prisma.notification.findMany({
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      title: true,
      message: true,
      created_at: true
    }
  });

  // Deduplicate by title+message, keep the earliest id as the reference
  const seen = new Map();
  const unique = [];
  for (const n of notifications) {
    const key = `${n.title}|||${n.message}`;
    if (!seen.has(key)) {
      seen.set(key, true);
      unique.push(n);
    }
  }

  res.json({ success: true, data: { notifications: unique.slice(0, 100) } });
}));

// @route   DELETE /api/notifications/announcement — admin deletes ALL copies of an announcement
// @access  Admin
router.delete('/announcement', protect, requireAdmin, asyncHandler(async (req, res) => {
  const { title, message } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Title and message required' });
  }
  await prisma.notification.deleteMany({
    where: { title, message }
  });
  res.json({ success: true, message: 'Announcement deleted for all students' });
}));

module.exports = router;