/** @type {import ("jest").Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  moduleFileExtensions: ["ts", "js", "json"],
  testTimeout: 30000,
  testMatch: [
    "<rootDir>/tests/health.test.ts",
    "<rootDir>/tests/schemas.test.ts",
    "<rootDir>/tests/security.test.ts",
  ],
  setupFiles: ["<rootDir>/tests/setup.ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
