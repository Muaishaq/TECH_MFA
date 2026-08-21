const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/auth.middleware');

// GET /api/enrollments/my — get current student's enrollments
router.get('/my', protect, asyncHandler(async (req, res) => {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      student_id: req.user.id,
      status: 'active'
    },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: true
            }
          }
        }
      },
      batch: true
    },
    orderBy: { enrolled_at: 'desc' }
  });

  // Get all completed lessons for this student in a single query (fix N+1 problem)
  const courseIds = enrollments.map(e => e.course_id).filter(Boolean);
  const completedProgress = courseIds.length > 0 ? await prisma.progress.findMany({
    where: {
      student_id: req.user.id,
      completed: true,
      lesson: {
        module: {
          course_id: { in: courseIds }
        }
      }
    },
    select: {
      lesson: {
        select: {
          module: {
            select: {
              course_id: true
            }
          }
        }
      }
    }
  }) : [];

  // Group completed lessons by course_id
  const completedByCourse = {};
  completedProgress.forEach(p => {
    const courseId = p.lesson.module.course_id;
    completedByCourse[courseId] = (completedByCourse[courseId] || 0) + 1;
  });

  // Calculate progress for each enrollment
  const enrollmentsWithProgress = enrollments.map(enrollment => {
    const totalLessons = enrollment.course?.modules?.reduce((sum, module) => sum + (module.lessons?.length || 0), 0) || 0;
    const completedLessons = completedByCourse[enrollment.course_id] || 0;
    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      ...enrollment,
      progress: {
        completed: completedLessons,
        total: totalLessons,
        percentage
      }
    };
  });

  res.json({ success: true, data: { enrollments: enrollmentsWithProgress } });
}));

// POST /api/enrollments/free — enroll in a free course
router.post('/free', protect, asyncHandler(async (req, res) => {
  const { course_id } = req.body;

  const course = await prisma.course.findUnique({ where: { id: course_id } });
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  if (course.type === 'paid') {
    return res.status(400).json({ success: false, message: 'This is a paid course' });
  }

  // Check if already enrolled
  const existing = await prisma.enrollment.findFirst({
    where: { student_id: req.user.id, course_id }
  });

  if (existing) {
    return res.status(200).json({ success: true, message: 'Already enrolled', data: { enrollment: existing } });
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      student_id: req.user.id,
      course_id,
      status: 'active'
    }
  });

  res.status(201).json({ success: true, message: 'Enrolled successfully', data: { enrollment } });
}));

module.exports = router;