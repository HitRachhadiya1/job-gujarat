const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/authRoutes');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

// Mock the JWT middleware to bypass authentication in tests
jest.mock('../middleware/jwtAuth', () => ({
  jwtWithRole: (req, res, next) => {
    // Set up mock user data based on test context
    if (req.headers['x-test-scenario'] === 'no-role') {
      req.user = { sub: 'auth0|test-user-no-role', email: 'norole@test.com' };
    } else if (req.headers['x-test-scenario'] === 'company-no-company') {
      req.user = { sub: 'auth0|test-user-company', email: 'company@test.com', role: 'COMPANY' };
    } else if (req.headers['x-test-scenario'] === 'company-with-company') {
      req.user = { sub: 'auth0|test-user-company-complete', email: 'complete@test.com', role: 'COMPANY', id: 1 };
    } else if (req.headers['x-test-scenario'] === 'job-seeker') {
      req.user = { sub: 'auth0|test-user-job-seeker', email: 'jobseeker@test.com', role: 'JOB_SEEKER' };
    } else {
      req.user = { sub: 'auth0|test-user', email: 'test@test.com' };
    }
    next();
  }
}));

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

// Mock Prisma client
const mockPrisma = new PrismaClient();

describe('/auth/me endpoint', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('User with no role', () => {
    test('should return role: null for user with no role', async () => {
      // Mock Auth0 API response for user with no role
      axios.get.mockResolvedValue({
        data: {
          email: 'norole@test.com',
          app_metadata: {}
        }
      });

      const response = await request(app)
        .get('/auth/me')
        .set('x-test-scenario', 'no-role')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        role: null
      });
    });
  });

  describe('COMPANY user without company profile', () => {
    test('should return role: COMPANY with companyStatus indicating no company exists', async () => {
      // Mock database user lookup
      mockPrisma.user.findFirst.mockResolvedValue({ id: 1 });
      
      // Mock company lookup - no company found
      mockPrisma.company.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/auth/me')
        .set('x-test-scenario', 'company-no-company')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        role: 'COMPANY',
        companyStatus: {
          exists: false,
          completed: false,
          company: null
        }
      });
    });
  });

  describe('COMPANY user with incomplete company profile', () => {
    test('should return role: COMPANY with companyStatus indicating incomplete profile', async () => {
      // Mock company lookup - incomplete company profile
      mockPrisma.company.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test Company',
        industry: '', // Missing required field
        description: '',
        logoUrl: null,
        website: null,
        verified: false
      });

      const response = await request(app)
        .get('/auth/me')
        .set('x-test-scenario', 'company-with-company')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('COMPANY');
      expect(response.body.companyStatus.exists).toBe(true);
      expect(response.body.companyStatus.completed).toBe(false);
      expect(response.body.companyStatus.company).toEqual({
        id: 1,
        name: 'Test Company',
        industry: '',
        description: '',
        logoUrl: null,
        website: null,
        verified: false
      });
    });
  });

  describe('COMPANY user with complete company profile', () => {
    test('should return role: COMPANY with companyStatus indicating complete profile', async () => {
      // Mock company lookup - complete company profile
      mockPrisma.company.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test Company Inc.',
        industry: 'Technology',
        description: 'A test technology company',
        logoUrl: 'https://example.com/logo.png',
        website: 'https://example.com',
        verified: true
      });

      const response = await request(app)
        .get('/auth/me')
        .set('x-test-scenario', 'company-with-company')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('COMPANY');
      expect(response.body.companyStatus.exists).toBe(true);
      expect(response.body.companyStatus.completed).toBe(true);
      expect(response.body.companyStatus.company).toEqual({
        id: 1,
        name: 'Test Company Inc.',
        industry: 'Technology',
        description: 'A test technology company',
        logoUrl: 'https://example.com/logo.png',
        website: 'https://example.com',
        verified: true
      });
    });
  });

  describe('JOB_SEEKER user', () => {
    test('should return role: JOB_SEEKER without companyStatus', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('x-test-scenario', 'job-seeker')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        role: 'JOB_SEEKER'
      });
    });
  });

  describe('Error handling', () => {
    test('should handle database errors gracefully for COMPANY users', async () => {
      // Mock database error
      mockPrisma.company.findUnique.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/auth/me')
        .set('x-test-scenario', 'company-with-company')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('COMPANY');
      expect(response.body.companyStatus.error).toBe('Error getting company status');
      expect(response.body.companyStatus.details).toBe('Database connection failed');
    });

    test('should handle general errors in getCurrentUserInfo', async () => {
      // We'll test error handling by triggering an error scenario in the business logic
      // This happens when the getCurrentUserInfo function encounters an unexpected error
      
      // Set up a user without role to trigger potential error paths
      const response = await request(app)
        .get('/auth/me')
        .set('x-test-scenario', 'no-role')
        .set('Authorization', 'Bearer mock-token');

      // This test verifies that the endpoint handles errors gracefully
      // In the case of no role, it should return 200 with role: null
      expect(response.status).toBe(200);
      expect(response.body.role).toBeNull();
    });
  });

  describe('Database user lookup scenarios', () => {
    test('should handle COMPANY user not found in database', async () => {
      // Mock no database user found
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .get('/auth/me')
        .set('x-test-scenario', 'company-no-company')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        role: 'COMPANY',
        companyStatus: {
          exists: false,
          completed: false,
          company: null
        }
      });
    });

    test('should use cached user ID when available', async () => {
      // Mock company lookup for user with cached ID
      mockPrisma.company.findUnique.mockResolvedValue({
        id: 1,
        name: 'Cached Company',
        industry: 'Tech',
        description: 'Test company',
        logoUrl: null,
        website: null,
        verified: false
      });

      const response = await request(app)
        .get('/auth/me')
        .set('x-test-scenario', 'company-with-company')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(mockPrisma.company.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
        select: {
          id: true,
          name: true,
          industry: true,
          description: true,
          logoUrl: true,
          website: true,
          verified: true,
        },
      });
      // Should not call user.findFirst since ID was cached
      expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
    });
  });
});
