const express = require('express');
const router = express.Router();
const {
  getCourses, getCourse, createCourse, updateCourse,
  deleteCourse, togglePromo, getModules, createModule,
  updateModule, deleteModule, createLesson, updateLesson,
  deleteLesson, completeLesson
} = require('../controllers/course.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourse);

// Admin only routes
router.post('/', protect, requireAdmin, createCourse);
router.put('/:id', protect, requireAdmin, updateCourse);
router.delete('/:id', protect, requireAdmin, deleteCourse);
router.patch('/:id/promo-toggle', protect, requireAdmin, togglePromo);

// Modules
router.get('/:id/modules', protect, getModules);
router.post('/:id/modules', protect, requireAdmin, createModule);

// Module routes (separate)
router.put('/modules/:id', protect, requireAdmin, updateModule);
router.delete('/modules/:id', protect, requireAdmin, deleteModule);

// Lesson routes
router.post('/modules/:id/lessons', protect, requireAdmin, createLesson);
router.put('/lessons/:id', protect, requireAdmin, updateLesson);
router.delete('/lessons/:id', protect, requireAdmin, deleteLesson);
router.patch('/lessons/:id/complete', protect, completeLesson);

module.exports = router;