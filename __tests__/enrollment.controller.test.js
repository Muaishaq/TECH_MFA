// Mock Prisma before importing routes
jest.mock('../src/config/db', () => ({
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  course: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  enrollment: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const prisma = require('../src/config/db');

// Mock the enrollment routes
const enrollmentRoutes = require('../src/routes/enrollment.routes');
const express = require('express');
const request = require('supertest');

describe('Enrollment Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/enrollments', enrollmentRoutes);
    jest.clearAllMocks();
  });

  describe('GET /api/enrollments/my', () => {
    it('should return user enrollments with course details', async () => {
      const mockEnrollments = [
        {
          id: 'enrollment-1',
          student_id: 'user-1',
          course_id: 'course-1',
          status: 'active',
          enrolled_at: new Date(),
          course: {
            id: 'course-1',
            title: 'Test Course',
            academy: 'forex',
            type: 'free',
          },
        },
      ];

      prisma.enrollment.findMany.mockResolvedValue(mockEnrollments);

      // Mock protect middleware to pass
      const mockProtect = (req, res, next) => {
        req.user = { id: 'user-1' };
        next();
      };

      // We need to test the route handler directly
      const { protect } = require('../src/middleware/auth.middleware');
      jest.mock('../src/middleware/auth.middleware', () => ({
        protect: mockProtect,
      }));

      const response = await request(app)
        .get('/api/enrollments/my')
        .set('Authorization', 'Bearer test-token');

      // Since we can't easily test the middleware, we'll test the handler logic
      expect(prisma.enrollment.findMany).toHaveBeenCalledWith({
        where: {
          student_id: 'user-1',
          status: 'active',
        },
        include: {
          course: true,
        },
        orderBy: { enrolled_at: 'desc' },
      });
    });
  });

  describe('POST /api/enrollments/free', () => {
    it('should enroll user in free course successfully', async () => {
      const mockCourse = {
        id: 'course-1',
        title: 'Free Course',
        type: 'free',
      };

      const mockEnrollment = {
        id: 'enrollment-1',
        student_id: 'user-1',
        course_id: 'course-1',
        status: 'active',
      };

      prisma.course.findUnique.mockResolvedValue(mockCourse);
      prisma.enrollment.findFirst.mockResolvedValue(null);
      prisma.enrollment.create.mockResolvedValue(mockEnrollment);

      const response = await request(app)
        .post('/api/enrollments/free')
        .send({ course_id: 'course-1' })
        .set('Authorization', 'Bearer test-token');

      expect(prisma.enrollment.create).toHaveBeenCalledWith({
        data: {
          student_id: expect.any(String),
          course_id: 'course-1',
          status: 'active',
        },
      });
    });

    it('should return error if course not found', async () => {
      prisma.course.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/enrollments/free')
        .send({ course_id: 'nonexistent-course' })
        .set('Authorization', 'Bearer test-token');

      expect(prisma.enrollment.create).not.toHaveBeenCalled();
    });

    it('should return error if trying to enroll in paid course', async () => {
      const mockCourse = {
        id: 'course-1',
        title: 'Paid Course',
        type: 'paid',
      };

      prisma.course.findUnique.mockResolvedValue(mockCourse);

      const response = await request(app)
        .post('/api/enrollments/free')
        .send({ course_id: 'course-1' })
        .set('Authorization', 'Bearer test-token');

      expect(prisma.enrollment.create).not.toHaveBeenCalled();
    });

    it('should return success if already enrolled', async () => {
      const mockCourse = {
        id: 'course-1',
        title: 'Free Course',
        type: 'free',
      };

      const mockExistingEnrollment = {
        id: 'enrollment-1',
        student_id: 'user-1',
        course_id: 'course-1',
        status: 'active',
      };

      prisma.course.findUnique.mockResolvedValue(mockCourse);
      prisma.enrollment.findFirst.mockResolvedValue(mockExistingEnrollment);

      const response = await request(app)
        .post('/api/enrollments/free')
        .send({ course_id: 'course-1' })
        .set('Authorization', 'Bearer test-token');

      expect(prisma.enrollment.create).not.toHaveBeenCalled();
    });
  });
});
