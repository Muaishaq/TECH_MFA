const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard-stats
// @access  Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalStudents,
    totalCourses,
    totalRevenue,
    openBatches,
    recentEnrollments,
    recentPayments
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'student' } }),
    prisma.course.count({ where: { is_published: true } }),
    prisma.payment.aggregate({
      where: { status: 'success' },
      _sum: { amount: true }
    }),
    prisma.batch.count({ where: { status: 'open' } }),
    prisma.enrollment.findMany({
      take: 5,
      orderBy: { enrolled_at: 'desc' },
      include: {
        student: { select: { full_name: true, email: true } },
        course: { select: { title: true } },
        batch: { select: { name: true } }
      }
    }),
    prisma.payment.findMany({
      take: 5,
      where: { status: 'success' },
      orderBy: { paid_at: 'desc' },
      include: {
        student: { select: { full_name: true, email: true } },
        course: { select: { title: true } }
      }
    })
  ]);

  res.json({
    success: true,
    message: 'Dashboard stats retrieved',
    data: {
      stats: {
        totalStudents,
        totalCourses,
        totalRevenue: totalRevenue._sum.amount || 0,
        openBatches
      },
      recentEnrollments,
      recentPayments
    }
  });
});

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Admin
const getStudents = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;

  const where = { role: 'student' };
  if (search) {
    where.OR = [
      { full_name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [students, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        is_verified: true,
        created_at: true,
        _count: { select: { enrollments: true, payments: true } }
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: Number(limit)
    }),
    prisma.user.count({ where })
  ]);

  res.json({
    success: true,
    message: 'Students retrieved successfully',
    data: {
      students,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get single student
// @route   GET /api/admin/students/:id
// @access  Admin
const getStudent = asyncHandler(async (req, res) => {
  const student = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
      is_verified: true,
      avatar_url: true,
      created_at: true,
      enrollments: {
        include: {
          course: { select: { title: true, academy: true } },
          batch: { select: { name: true } }
        }
      },
      payments: {
        where: { status: 'success' },
        include: {
          course: { select: { title: true } }
        }
      }
    }
  });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  res.json({
    success: true,
    message: 'Student retrieved successfully',
    data: { student }
  });
});

// @desc    Suspend or unsuspend a student
// @route   PATCH /api/admin/students/:id/suspend
// @access  Admin
const suspendStudent = asyncHandler(async (req, res) => {
  const { suspend } = req.body;

  const student = await prisma.user.findUnique({
    where: { id: req.params.id }
  });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // We use is_verified as suspension flag (false = suspended)
  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { is_verified: !suspend },
    select: {
      id: true,
      full_name: true,
      email: true,
      is_verified: true
    }
  });

  res.json({
    success: true,
    message: `Student ${suspend ? 'suspended' : 'unsuspended'} successfully`,
    data: { student: updated }
  });
});

// @desc    Send announcement to all students
// @route   POST /api/admin/announcements
// @access  Admin
const sendAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, academy } = req.body;

  if (!title || !message) {
    return res.status(400).json({
      success: false,
      message: 'Please provide title and message'
    });
  }

  // Get all students
  const students = await prisma.user.findMany({
    where: { role: 'student' },
    select: { id: true }
  });

  // Create notification for each student
  await prisma.notification.createMany({
    data: students.map(student => ({
      user_id: student.id,
      title,
      message
    }))
  });

  // Also post to announcement chat room
  const announcementRoom = await prisma.chatRoom.findFirst({
    where: { type: 'announcement' }
  });

  if (announcementRoom) {
    await prisma.message.create({
      data: {
        room_id: announcementRoom.id,
        sender_id: req.user.id,
        content: `📢 ${title}\n\n${message}`,
        type: 'text'
      }
    });
  }

  res.json({
    success: true,
    message: `Announcement sent to ${students.length} students`,
    data: { recipients: students.length }
  });
});

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Admin
const getTransactions = asyncHandler(async (req, res) => {
  const payments = await prisma.payment.findMany({
    include: {
      student: { select: { full_name: true, email: true } },
      course: { select: { title: true, academy: true } }
    },
    orderBy: { created_at: 'desc' }
  });

  const totalRevenue = await prisma.payment.aggregate({
    where: { status: 'success' },
    _sum: { amount: true }
  });

  res.json({
    success: true,
    message: 'Transactions retrieved successfully',
    data: {
      payments,
      totalRevenue: totalRevenue._sum.amount || 0
    }
  });
});

module.exports = {
  getDashboardStats,
  getStudents,
  getStudent,
  suspendStudent,
  sendAnnouncement,
  getTransactions
};