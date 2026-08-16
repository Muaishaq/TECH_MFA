const request = require('supertest');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Mock the protect middleware before importing routes
const mockProtect = (req, res, next) => {
  req.user = { id: 'test-user-id', role: 'student' };
  next();
};

jest.mock('../../src/middleware/auth.middleware', () => ({
  protect: mockProtect,
}));

// Mock Prisma before importing routes
jest.mock('../../src/config/db', () => ({
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

const prisma = require('../../src/config/db');

describe('API Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(cors());
    app.use(helmet());

    // Import and use routes
    const authRoutes = require('../../src/routes/auth.routes');
    const enrollmentRoutes = require('../../src/routes/enrollment.routes');

    app.use('/api/auth', authRoutes);
    app.use('/api/enrollments', enrollmentRoutes);
  });

  describe('Auth Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user', async () => {
        const userData = {
          full_name: 'Integration Test User',
          email: 'integration@example.com',
          password: 'password123',
          academy: 'forex',
        };

        prisma.user.findUnique.mockResolvedValue(null);
        prisma.user.create.mockResolvedValue({
          id: 'user-1',
          ...userData,
          role: 'student',
          is_verified: true,
          created_at: new Date(),
        });

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect('Content-Type', /json/);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Account created successfully');
        expect(prisma.user.create).toHaveBeenCalled();
      });

      it('should reject duplicate email', async () => {
        const userData = {
          full_name: 'Integration Test User',
          email: 'integration@example.com',
          password: 'password123',
        };

        prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(prisma.user.create).not.toHaveBeenCalled();
      });
    });

    describe('POST /api/auth/login', () => {
      it('should login with valid credentials', async () => {
        const loginData = {
          email: 'integration@example.com',
          password: 'password123',
        };

        prisma.user.findUnique.mockResolvedValue({
          id: 'user-1',
          email: 'integration@example.com',
          password_hash: 'hashedPassword',
          full_name: 'Test User',
          role: 'student',
          academy: 'forex',
          is_verified: true,
        });

        const bcrypt = require('bcryptjs');
        bcrypt.compare = jest.fn().mockResolvedValue(true);

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Login successful');
      });

      it('should reject invalid credentials', async () => {
        const loginData = {
          email: 'integration@example.com',
          password: 'wrongpassword',
        };

        prisma.user.findUnique.mockResolvedValue({
          id: 'user-1',
          password_hash: 'hashedPassword',
        });

        const bcrypt = require('bcryptjs');
        bcrypt.compare = jest.fn().mockResolvedValue(false);

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Enrollment Endpoints', () => {
    describe('GET /api/enrollments/my', () => {
      it('should return user enrollments', async () => {
        const mockEnrollments = [
          {
            id: 'enrollment-1',
            student_id: 'test-user-id',
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

        const response = await request(app)
          .get('/api/enrollments/my')
          .set('Authorization', 'Bearer test-token');

        expect(response.body.success).toBe(true);
        expect(response.body.data.enrollments).toHaveLength(1);
        expect(prisma.enrollment.findMany).toHaveBeenCalledWith({
          where: {
            student_id: 'test-user-id',
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
      it('should enroll in free course', async () => {
        const mockCourse = {
          id: 'course-1',
          title: 'Free Course',
          type: 'free',
        };

        const mockEnrollment = {
          id: 'enrollment-1',
          student_id: 'test-user-id',
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

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Enrolled successfully');
        expect(prisma.enrollment.create).toHaveBeenCalled();
      });

      it('should reject paid course enrollment', async () => {
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

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('This is a paid course');
      });
    });
  });

  describe('Profile Update Endpoint', () => {
    describe('PUT /api/auth/profile', () => {
      it('should update user profile', async () => {
        const updateData = {
          name: 'Updated Name',
        };

        prisma.user.findUnique.mockResolvedValue({
          id: 'test-user-id',
          full_name: 'Old Name',
          email: 'test@example.com',
        });

        prisma.user.update.mockResolvedValue({
          id: 'test-user-id',
          full_name: 'Updated Name',
          email: 'test@example.com',
          role: 'student',
          academy: 'forex',
          is_verified: true,
          created_at: new Date(),
        });

        const response = await request(app)
          .put('/api/auth/profile')
          .send(updateData)
          .set('Authorization', 'Bearer test-token');

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Profile updated successfully');
        expect(prisma.user.update).toHaveBeenCalledWith({
          where: { id: 'test-user-id' },
          data: { full_name: 'Updated Name' },
          select: expect.any(Object),
        });
      });

      it('should change password with valid current password', async () => {
        const passwordData = {
          currentPassword: 'oldpassword',
          newPassword: 'newpassword123',
        };

        prisma.user.findUnique.mockResolvedValue({
          id: 'test-user-id',
          password_hash: 'oldHashedPassword',
        });

        const bcrypt = require('bcryptjs');
        bcrypt.compare = jest.fn().mockResolvedValue(true);
        bcrypt.genSalt = jest.fn().mockResolvedValue('salt');
        bcrypt.hash = jest.fn().mockResolvedValue('newHashedPassword');

        prisma.user.update.mockResolvedValue({
          id: 'test-user-id',
          full_name: 'Test User',
          email: 'test@example.com',
          role: 'student',
          academy: 'forex',
          is_verified: true,
          created_at: new Date(),
        });

        const response = await request(app)
          .put('/api/auth/profile')
          .send(passwordData)
          .set('Authorization', 'Bearer test-token');

        expect(response.body.success).toBe(true);
        expect(bcrypt.compare).toHaveBeenCalledWith('oldpassword', 'oldHashedPassword');
        expect(prisma.user.update).toHaveBeenCalled();
      });

      it('should reject password change with invalid current password', async () => {
        const passwordData = {
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        };

        prisma.user.findUnique.mockResolvedValue({
          id: 'test-user-id',
          password_hash: 'oldHashedPassword',
        });

        const bcrypt = require('bcryptjs');
        bcrypt.compare = jest.fn().mockResolvedValue(false);

        const response = await request(app)
          .put('/api/auth/profile')
          .send(passwordData)
          .set('Authorization', 'Bearer test-token');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Current password is incorrect');
      });
    });
  });
});
