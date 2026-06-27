const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all open batches
// @route   GET /api/batches
// @access  Public
const getBatches = asyncHandler(async (req, res) => {
  const { academy } = req.query;

  const where = { status: 'open' };
  if (academy) where.academy = academy;

  const batches = await prisma.batch.findMany({
    where,
    include: {
      course: {
        select: { id: true, title: true, academy: true }
      },
      _count: { select: { enrollments: true } }
    },
    orderBy: { created_at: 'desc' }
  });

  res.json({
    success: true,
    message: 'Batches retrieved successfully',
    data: { batches }
  });
});

// @desc    Get single batch
// @route   GET /api/batches/:id
// @access  Public
const getBatch = asyncHandler(async (req, res) => {
  const batch = await prisma.batch.findUnique({
    where: { id: req.params.id },
    include: {
      course: {
        select: { id: true, title: true, academy: true }
      },
      _count: { select: { enrollments: true } }
    }
  });

  if (!batch) {
    return res.status(404).json({
      success: false,
      message: 'Batch not found'
    });
  }

  res.json({
    success: true,
    message: 'Batch retrieved successfully',
    data: { batch }
  });
});

// @desc    Create a batch
// @route   POST /api/batches
// @access  Admin
const createBatch = asyncHandler(async (req, res) => {
  const { name, academy, course_id, max_students, form_schema, open_date, close_date } = req.body;

  if (!name || !academy) {
    return res.status(400).json({
      success: false,
      message: 'Please provide batch name and academy'
    });
  }

  const batch = await prisma.batch.create({
    data: {
      name,
      academy,
      course_id,
      max_students,
      form_schema,
      open_date,
      close_date,
      status: 'closed'
    }
  });

  // Auto-create chat room for this batch
  await prisma.chatRoom.create({
    data: {
      name: `${name} Group`,
      type: 'batch',
      academy: academy === 'forex' ? 'forex' : 'tech',
      batch_id: batch.id,
      status: 'active'
    }
  });

  res.status(201).json({
    success: true,
    message: 'Batch created successfully',
    data: { batch }
  });
});

// @desc    Update a batch
// @route   PUT /api/batches/:id
// @access  Admin
const updateBatch = asyncHandler(async (req, res) => {
  const batch = await prisma.batch.findUnique({
    where: { id: req.params.id }
  });

  if (!batch) {
    return res.status(404).json({
      success: false,
      message: 'Batch not found'
    });
  }

  const updated = await prisma.batch.update({
    where: { id: req.params.id },
    data: req.body
  });

  res.json({
    success: true,
    message: 'Batch updated successfully',
    data: { batch: updated }
  });
});

// @desc    Open or close batch registration
// @route   PATCH /api/batches/:id/status
// @access  Admin
const updateBatchStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['open', 'closed', 'completed'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status must be open, closed, or completed'
    });
  }

  const batch = await prisma.batch.findUnique({
    where: { id: req.params.id },
    include: { chat_room: true }
  });

  if (!batch) {
    return res.status(404).json({
      success: false,
      message: 'Batch not found'
    });
  }

  // Update batch status
  const updated = await prisma.batch.update({
    where: { id: req.params.id },
    data: { status }
  });

  // If batch completed, archive the chat room
  if (status === 'completed' && batch.chat_room) {
    await prisma.chatRoom.update({
      where: { id: batch.chat_room.id },
      data: { status: 'archived' }
    });
  }

  res.json({
    success: true,
    message: `Batch registration ${status}`,
    data: { batch: updated }
  });
});

// @desc    Student enrolls in a batch
// @route   POST /api/batches/:id/enroll
// @access  Private (student)
const enrollInBatch = asyncHandler(async (req, res) => {
  const batch = await prisma.batch.findUnique({
    where: { id: req.params.id },
    include: {
      _count: { select: { enrollments: true } },
      chat_room: true
    }
  });

  if (!batch) {
    return res.status(404).json({
      success: false,
      message: 'Batch not found'
    });
  }

  if (batch.status !== 'open') {
    return res.status(400).json({
      success: false,
      message: 'Registration for this batch is currently closed'
    });
  }

  // Check max students
  if (batch.max_students && batch._count.enrollments >= batch.max_students) {
    return res.status(400).json({
      success: false,
      message: 'This batch is full'
    });
  }

  // Check if already enrolled
  const existing = await prisma.enrollment.findFirst({
    where: {
      student_id: req.user.id,
      batch_id: req.params.id
    }
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'You have already applied for this batch'
    });
  }

  // Create enrollment with form data
  const enrollment = await prisma.enrollment.create({
    data: {
      student_id: req.user.id,
      batch_id: req.params.id,
      course_id: batch.course_id,
      status: 'pending',
      form_data: req.body.form_data || {}
    }
  });

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully. Awaiting approval.',
    data: { enrollment }
  });
});

// @desc    Get all enrollments for a batch
// @route   GET /api/batches/:id/enrollments
// @access  Admin
const getBatchEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { batch_id: req.params.id },
    include: {
      student: {
        select: { id: true, full_name: true, email: true, avatar_url: true }
      }
    },
    orderBy: { enrolled_at: 'desc' }
  });

  res.json({
    success: true,
    message: 'Enrollments retrieved successfully',
    data: { enrollments }
  });
});

// @desc    Approve an enrollment
// @route   PATCH /api/enrollments/:id/approve
// @access  Admin
const approveEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: req.params.id },
    include: {
      batch: { include: { chat_room: true } }
    }
  });

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      message: 'Enrollment not found'
    });
  }

  // Update enrollment status
  const updated = await prisma.enrollment.update({
    where: { id: req.params.id },
    data: { status: 'active' }
  });

  // Auto-add student to batch chat room
  if (enrollment.batch?.chat_room) {
    await prisma.chatMember.upsert({
      where: {
        room_id_user_id: {
          room_id: enrollment.batch.chat_room.id,
          user_id: enrollment.student_id
        }
      },
      update: {},
      create: {
        room_id: enrollment.batch.chat_room.id,
        user_id: enrollment.student_id
      }
    });
  }

  // Send notification to student
  await prisma.notification.create({
    data: {
      user_id: enrollment.student_id,
      title: 'Application Approved! 🎉',
      message: 'Congratulations! Your batch application has been approved. Welcome to the academy!'
    }
  });

  res.json({
    success: true,
    message: 'Enrollment approved successfully',
    data: { enrollment: updated }
  });
});

// @desc    Reject an enrollment
// @route   PATCH /api/enrollments/:id/reject
// @access  Admin
const rejectEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: req.params.id }
  });

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      message: 'Enrollment not found'
    });
  }

  const updated = await prisma.enrollment.update({
    where: { id: req.params.id },
    data: { status: 'rejected' }
  });

  // Notify student
  await prisma.notification.create({
    data: {
      user_id: enrollment.student_id,
      title: 'Application Update',
      message: 'Unfortunately your batch application was not successful this time. Watch out for the next batch opening!'
    }
  });

  res.json({
    success: true,
    message: 'Enrollment rejected',
    data: { enrollment: updated }
  });
});

module.exports = {
  getBatches, getBatch, createBatch, updateBatch,
  updateBatchStatus, enrollInBatch, getBatchEnrollments,
  approveEnrollment, rejectEnrollment
};