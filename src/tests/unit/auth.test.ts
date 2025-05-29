import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { registerUser, loginUser } from '../../controllers/authController';
import User from '../../models/userModel';

// Mock dependencies
jest.mock('../../models/userModel');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: Record<string, any>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    responseObject = {};

    // Setup response mock
    mockResponse = {
      status: jest.fn().mockReturnThis() as jest.MockedFunction<Response['status']>,
      json: jest.fn((data: Record<string, any>) => {
        responseObject = data;
        return mockResponse as Response;
      }) as jest.MockedFunction<Response['json']>,
    };
  });

  describe('registerUser', () => {
    beforeEach(() => {
      mockRequest = {
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123!'
        }
      };
    });

    test('should register a new user successfully', async () => {
      // Mock User.findOne to return null (user doesn't exist)
      (User.findOne as any).mockResolvedValueOnce(null);
      
      // Mock bcrypt hash
      (bcrypt.hash as any).mockResolvedValueOnce('hashedPassword');
      
      // Mock User.create
      (User.create as any).mockResolvedValueOnce({
        _id: 'mockUserId',
        username: 'testuser',
        email: 'test@example.com'
      });

      await registerUser(mockRequest as Request, mockResponse as Response);

      // Verify response
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject).toEqual({
        message: 'User registered successfully!'
      });

      // Verify mocks were called correctly
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 10);
      expect(User.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword'
      });
    });

    test('should return error if user already exists', async () => {
      // Mock User.findOne to return existing user
      (User.findOne as any).mockResolvedValueOnce({
        email: 'test@example.com'
      });

      await registerUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        message: 'User already exists'
      });
    });

    test('should handle registration error', async () => {
      // Mock User.findOne to return null
      (User.findOne as any).mockResolvedValueOnce(null);
      
      // Mock bcrypt hash to throw error
      (bcrypt.hash as any).mockRejectedValueOnce(new Error('Hash failed'));

      await registerUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        message: 'Error registering user'
      });
    });
  });

  describe('loginUser', () => {
    const mockUser = {
      _id: 'userId123',
      email: 'test@example.com',
      password: 'hashedPassword',
      username: 'testuser',
      role: 'user',
      avatar: 'avatar.jpg',
      lastLogin: new Date(),
      isAuthStrava: false
    };

    beforeEach(() => {
      mockRequest = {
        body: {
          email: 'test@example.com',
          password: 'Password123!'
        }
      };
    });

    test('should login user successfully', async () => {
      // Mock User.findOne to return user
      (User.findOne as any).mockResolvedValueOnce(mockUser);
      
      // Mock password comparison
      (bcrypt.compare as any).mockResolvedValueOnce(true);
      
      // Mock token generation
      (jwt.sign as any).mockReturnValueOnce('mockToken');

      await loginUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        message: 'Login successful!',
        token: 'mockToken',
        user: {
          userId: mockUser._id,
          username: mockUser.username,
          avatar: mockUser.avatar,
          email: mockUser.email,
          role: mockUser.role,
          lastLogin: mockUser.lastLogin,
          isAuthStrava: mockUser.isAuthStrava,
        }
      });
    });

    test('should return error for non-existent user', async () => {
      // Mock User.findOne to return null
      (User.findOne as any).mockResolvedValueOnce(null);

      await loginUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toEqual({
        message: 'User not found.'
      });
    });

    test('should return error for invalid password', async () => {
      // Mock User.findOne to return user
      (User.findOne as any).mockResolvedValueOnce(mockUser);
      
      // Mock password comparison to return false
      (bcrypt.compare as any).mockResolvedValueOnce(false);

      await loginUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toEqual({
        message: 'Invalid password.'
      });
    });

    test('should handle login error', async () => {
      // Mock User.findOne to throw error
      (User.findOne as any).mockRejectedValueOnce(new Error('Database error'));

      await loginUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        message: 'Error logging in'
      });
    });
  });
});
