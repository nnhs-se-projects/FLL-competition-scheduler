const config = {
  testEnvironment: "jest-environment-node",
  transform: {},
  testMatch: ["**/src/tests/**/*.test.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default config;
