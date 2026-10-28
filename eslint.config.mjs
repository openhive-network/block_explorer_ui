import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextCoreWebVitals,
  {
    // eslint-plugin-react-hooks 7 adds the React Compiler's checks as errors.
    // The app is not compiled with the React Compiler, so existing code that
    // predates them is reported, not failed, until it is refactored.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/use-memo": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "next-env.d.ts",
    "npm-common-config/**",
    "test-results/**",
    "playwright-report/**",
  ]),
]);
