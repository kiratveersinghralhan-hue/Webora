import js from "@eslint/js";
import tseslint from "typescript-eslint";
import hooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "node_modules",
      "test-results",
      "playwright-report",
      "supabase/functions",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,mjs}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    // CommonJS Node scripts (e.g. local Playwright QA tools): require() is the
    // module system here, and page.evaluate callbacks run in the browser.
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: { ...globals.browser, ...globals.node },
    },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "react-hooks": hooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
);
