const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all published courses
// @route   GET /api/courses
// @access  Public
const getCourses = asyncHandler(async (req, res) => {
  const { academy } = req.query;

  const where = { is_published: true };
  if (academy) where.academy = academy;

  const courses = await prisma.course.findMany({
    where,
    select: {
      id: true,
      title: true,
      description: true,
      academy: true,
      type: true,
      price: true,
      thumbnail_url: true,
      promo_expires: true,
      _count: { select: { modules: true, enrollments: true } }
    },
    orderBy: { created_at: 'desc' }
  });

  res.json({
    success: true,
    message: 'Courses retrieved successfully',
    data: { courses }
  });
});

// @desc    Get single course with modules
// @route   GET /api/courses/:id
// @access  Public
const getCourse = asyncHandler(async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { id: req.params.id },
    include: {
      modules: {
        orderBy: { order_index: 'asc' },
        include: {
          lessons: {
            orderBy: { order_index: 'asc' },
            select: {
              id: true,
              title: true,
              type: true,
              order_index: true
            }
          }
        }
      }
    }
  });

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  res.json({
    success: true,
    message: 'Course retrieved successfully',
    data: { course }
  });
});

// @desc    Create a course
// @route   POST /api/courses
// @access  Admin
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, academy, type, price, thumbnail_url } = req.body;

  if (!title || !academy || !type) {
    return res.status(400).json({
      success: false,
      message: 'Please provide title, academy and type'
    });
  }

  const course = await prisma.course.create({
    data: {
      title,
      description,
      academy,
      type,
      price: price || 0,
      thumbnail_url
    }
  });

  res.status(201).json({
    success: true,
    message: 'Course created successfully',
    data: { course }
  });
});

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Admin
const updateCourse = asyncHandler(async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { id: req.params.id }
  });

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  const updated = await prisma.course.update({
    where: { id: req.params.id },
    data: req.body
  });

  res.json({
    success: true,
    message: 'Course updated successfully',
    data: { course: updated }
  });
});

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Admin
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { id: req.params.id }
  });

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  await prisma.course.delete({ where: { id: req.params.id } });

  res.json({
    success: true,
    message: 'Course deleted successfully',
    data: {}
  });
});

// @desc    Toggle promo free status
// @route   PATCH /api/courses/:id/promo-toggle
// @access  Admin
const togglePromo = asyncHandler(async (req, res) => {
  const { is_promo, promo_expires } = req.body;

  const course = await prisma.course.findUnique({
    where: { id: req.params.id }
  });

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  const updated = await prisma.course.update({
    where: { id: req.params.id },
    data: {
      type: is_promo ? 'promo' : 'paid',
      promo_expires: is_promo ? (promo_expires || null) : null
    }
  });

  res.json({
    success: true,
    message: `Course ${is_promo ? 'set to promo free' : 'reverted to paid'}`,
    data: { course: updated }
  });
});

// @desc    Get modules for a course
// @route   GET /api/courses/:id/modules
// @access  Private
const getModules = asyncHandler(async (req, res) => {
  const modules = await prisma.module.findMany({
    where: { course_id: req.params.id },
    orderBy: { order_index: 'asc' },
    include: {
      lessons: { orderBy: { order_index: 'asc' } }
    }
  });

  res.json({
    success: true,
    message: 'Modules retrieved successfully',
    data: { modules }
  });
});

// @desc    Create a module
// @route   POST /api/courses/:id/modules
// @access  Admin
const createModule = asyncHandler(async (req, res) => {
  const { title, order_index } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a module title'
    });
  }

  const module = await prisma.module.create({
    data: {
      course_id: req.params.id,
      title,
      order_index: order_index || 1
    }
  });

  res.status(201).json({
    success: true,
    message: 'Module created successfully',
    data: { module }
  });
});

// @desc    Update a module
// @route   PUT /api/modules/:id
// @access  Admin
const updateModule = asyncHandler(async (req, res) => {
  const updated = await prisma.module.update({
    where: { id: req.params.id },
    data: req.body
  });

  res.json({
    success: true,
    message: 'Module updated successfully',
    data: { module: updated }
  });
});

// @desc    Delete a module
// @route   DELETE /api/modules/:id
// @access  Admin
const deleteModule = asyncHandler(async (req, res) => {
  await prisma.module.delete({ where: { id: req.params.id } });

  res.json({
    success: true,
    message: 'Module deleted successfully',
    data: {}
  });
});

// @desc    Create a lesson
// @route   POST /api/modules/:id/lessons
// @access  Admin
const createLesson = asyncHandler(async (req, res) => {
  const { title, type, content_url, rich_text, order_index } = req.body;

  if (!title || !type) {
    return res.status(400).json({
      success: false,
      message: 'Please provide lesson title and type'
    });
  }

  const lesson = await prisma.lesson.create({
    data: {
      module_id: req.params.id,
      title,
      type,
      content_url,
      rich_text,
      order_index: order_index || 1
    }
  });

  res.status(201).json({
    success: true,
    message: 'Lesson created successfully',
    data: { lesson }
  });
});

// @desc    Update a lesson
// @route   PUT /api/lessons/:id
// @access  Admin
const updateLesson = asyncHandler(async (req, res) => {
  const updated = await prisma.lesson.update({
    where: { id: req.params.id },
    data: req.body
  });

  res.json({
    success: true,
    message: 'Lesson updated successfully',
    data: { lesson: updated }
  });
});

// @desc    Delete a lesson
// @route   DELETE /api/lessons/:id
// @access  Admin
const deleteLesson = asyncHandler(async (req, res) => {
  await prisma.lesson.delete({ where: { id: req.params.id } });

  res.json({
    success: true,
    message: 'Lesson deleted successfully',
    data: {}
  });
});

// @desc    Mark lesson as complete
// @route   PATCH /api/lessons/:id/complete
// @access  Student
const completeLesson = asyncHandler(async (req, res) => {
  const progress = await prisma.progress.upsert({
    where: {
      student_id_lesson_id: {
        student_id: req.user.id,
        lesson_id: req.params.id
      }
    },
    update: {
      completed: true,
      completed_at: new Date()
    },
    create: {
      student_id: req.user.id,
      lesson_id: req.params.id,
      completed: true,
      completed_at: new Date()
    }
  });

  res.json({
    success: true,
    message: 'Lesson marked as complete',
    data: { progress }
  });
});

module.exports = {
  getCourses, getCourse, createCourse, updateCourse,
  deleteCourse, togglePromo, getModules, createModule,
  updateModule, deleteModule, createLesson, updateLesson,
  deleteLesson, completeLesson
};