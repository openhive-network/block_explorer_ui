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
  {
    // Security (#835): images are never routed through the server-side
    // optimizer, so the app uses plain <img> and next/image is banned.
    rules: {
      "@next/next/no-img-element": "off",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/image",
              message:
                "Use a plain <img>. next/image routes pictures through the server-side optimizer (/_next/image + sharp), which must never decode remote or user-controlled images (#835).",
            },
            {
              name: "next/legacy/image",
              message:
                "Use a plain <img>. next/image routes pictures through the server-side optimizer (/_next/image + sharp), which must never decode remote or user-controlled images (#835).",
            },
          ],
          patterns: [
            {
              group: ["next/dist/**/image*"],
              message:
                "Use a plain <img>. The Next image component must not be used (#835).",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "ImportExpression[source.value=/^next.(legacy.)?image$|^next.dist.*image/]",
          message:
            "Use a plain <img>. The Next image component must not be used (#835).",
        },
        {
          selector:
            "CallExpression[callee.name='require'][arguments.0.value=/^next.(legacy.)?image$|^next.dist.*image/]",
          message:
            "Use a plain <img>. The Next image component must not be used (#835).",
        },
      ],
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
