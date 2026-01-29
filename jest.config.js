/** @type {import('jest').Config} */
const config = {
  // Use ts-jest to handle TypeScript files
  preset: 'ts-jest',

  // Use jsdom for browser-like environment (needed for React/localStorage)
  testEnvironment: 'jsdom',

  // Where to find test files
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],

  // Handle path aliases like @/lib/store
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Setup file to run before tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Don't transform node_modules (except specific packages if needed)
  transformIgnorePatterns: [
    'node_modules/(?!(zustand)/)',
  ],
};

module.exports = config;
