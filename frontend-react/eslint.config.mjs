import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Unused variables
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      }],

      // Console: warn for log, allow error and warn
      "no-console": ["warn", {
        allow: ["warn", "error", "info"],
      }],

      // TypeScript: warn on any
      "@typescript-eslint/no-explicit-any": "warn",

      // React hooks: warn on missing deps
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;
