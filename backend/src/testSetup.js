// Jest setup file
require('dotenv').config({ path: '.env.test' });

// This file is run before each test to set up mocks and environment

// Mock the Prisma client to avoid database connections during testing
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    company: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

// Mock Auth0 service functions
jest.mock('./services/auth0Service', () => ({
  getManagementToken: jest.fn(() => Promise.resolve('mock-token')),
  assignRoleToUser: jest.fn(() => Promise.resolve()),
  updateUserAppMetadata: jest.fn(() => Promise.resolve()),
}));

// Mock axios for Auth0 API calls
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));
