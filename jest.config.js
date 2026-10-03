const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/unit/**/*.test.{ts,tsx}"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    // The package exports only an `import` condition, which Jest's CommonJS
    // resolver doesn't match.
    "^@hiveio/healthchecker-component$":
      "<rootDir>/node_modules/@hiveio/healthchecker-component/dist/healthchecker-component.es.js",
  },
};

// next/jest appends custom transformIgnorePatterns to its own node_modules ones,
// so the ESM-only healthchecker dist can only be let through by narrowing those.
module.exports = async () => {
  const config = await createJestConfig(customJestConfig)();
  config.transformIgnorePatterns = config.transformIgnorePatterns.map(
    (pattern) =>
      pattern.startsWith("/node_modules/")
        ? `^(?!.*@hiveio[+/]healthchecker-component).*${pattern}`
        : pattern
  );
  return config;
};
