const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock Prisma before importing controllers
const prisma = require('../src/config/db');
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

const { register, login, getMe, updateProfile } = require('../src/controllers/auth.controller');

// Mock bcrypt and jwt
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../src/utils/generateToken');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: { id: 'test-user-id' },
      cookie: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      req.body = {
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        academy: 'forex',
      };

      prisma.user.findUnique.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        full_name: 'Test User',
        email: 'test@example.com',
        role: 'student',
        academy: 'forex',
        is_verified: true,
        created_at: new Date(),
      });

      const generateAccessToken = require('../src/utils/generateToken');
      generateAccessToken.generateAccessToken = jest.fn().mockReturnValue('access-token');
      generateAccessToken.generateRefreshToken = jest.fn().mockReturnValue('refresh-token');

      await register(req, res);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          full_name: 'Test User',
          email: 'test@example.com',
          password_hash: 'hashedPassword',
          role: 'student',
          academy: 'forex',
        },
        select: expect.any(Object),
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Account created successfully',
        })
      );
    });

    it('should return error if user already exists', async () => {
      req.body = {
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'An account with this email already exists',
        })
      );
    });

    it('should return error if password is too short', async () => {
      req.body = {
        full_name: 'Test User',
        email: 'test@example.com',
        password: '123',
      };

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Password must be at least 6 characters',
        })
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        full_name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hashedPassword',
        role: 'student',
        academy: 'forex',
        is_verified: true,
      });

      bcrypt.compare.mockResolvedValue(true);

      const generateAccessToken = require('../src/utils/generateToken');
      generateAccessToken.generateAccessToken = jest.fn().mockReturnValue('access-token');
      generateAccessToken.generateRefreshToken = jest.fn().mockReturnValue('refresh-token');

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Login successful',
        })
      );
    });

    it('should return error if user not found', async () => {
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      prisma.user.findUnique.mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid email or password',
        })
      );
    });

    it('should return error if password is incorrect', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        password_hash: 'hashedPassword',
      });

      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid email or password',
        })
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user name successfully', async () => {
      req.body = {
        name: 'Updated Name',
      };

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        full_name: 'Test User',
        email: 'test@example.com',
      });

      prisma.user.update.mockResolvedValue({
        id: 'user-1',
        full_name: 'Updated Name',
        email: 'test@example.com',
        role: 'student',
        academy: 'forex',
        is_verified: true,
        created_at: new Date(),
      });

      await updateProfile(req, res);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
        data: { full_name: 'Updated Name' },
        select: expect.any(Object),
      });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Profile updated successfully',
        })
      );
    });

    it('should update password successfully', async () => {
      req.body = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      };

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        password_hash: 'oldHashedPassword',
      });

      bcrypt.compare.mockResolvedValue(true);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('newHashedPassword');

      prisma.user.update.mockResolvedValue({
        id: 'user-1',
        full_name: 'Test User',
        email: 'test@example.com',
        role: 'student',
        academy: 'forex',
        is_verified: true,
        created_at: new Date(),
      });

      await updateProfile(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith('oldpassword', 'oldHashedPassword');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
        data: { password_hash: 'newHashedPassword' },
        select: expect.any(Object),
      });
    });

    it('should return error if current password is incorrect', async () => {
      req.body = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      };

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        password_hash: 'oldHashedPassword',
      });

      bcrypt.compare.mockResolvedValue(false);

      await updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Current password is incorrect',
        })
      );
    });

    it('should return error if new password is too short', async () => {
      req.body = {
        currentPassword: 'oldpassword',
        newPassword: '123',
      };

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        password_hash: 'oldHashedPassword',
      });

      bcrypt.compare.mockResolvedValue(true);

      await updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'New password must be at least 6 characters',
        })
      );
    });
  });
});
