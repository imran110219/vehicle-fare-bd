const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./"
});

const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/tests/styleMock.js"
  },
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/tests/e2e/"
  ],
  transformIgnorePatterns: [
    "/node_modules/(?!(bad-words|badwords-list)/)"
  ]
};

module.exports = createJestConfig(config);
