const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/(.*)$': '<rootDir>/lib/$1',
  },
  collectCoverageFrom: [
    'lib/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  testMatch: [
    '**/__tests__/**/*.(test|spec).[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  // ai-agent-auto-improvement/ and network-sentinel/ are standalone projects
  // with their own package.json and Vitest suites — Jest's default recursive
  // testMatch would otherwise pick up their *.test.ts files and fail with
  // "Cannot find module 'vitest'" since it isn't a root dependency.
  // omega-veritas/ is standalone too, with its own Jest config and node test environment.
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/ai-agent-auto-improvement/',
    '<rootDir>/network-sentinel/',
    '<rootDir>/omega-veritas/',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
