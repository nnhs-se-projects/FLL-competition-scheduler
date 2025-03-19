/**
 * Jest Configuration
 *
 * This file configures Jest for testing the FLL Competition Scheduler.
 */

const config = {
  testEnvironment: "jest-environment-node",
  transform: {},
  testMatch: ["**/src/tests/**/*.test.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  rootDir: "../",
};

export default config;
