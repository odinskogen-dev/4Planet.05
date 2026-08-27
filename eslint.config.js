// V40 delivery harness: a real lint config + script.
// Scoped and lenient by design — the V39 base was never linted and World.tsx
// carries // @ts-nocheck, so a maximalist rule set would drown signal in legacy
// noise. This enforces the rules that actually catch interaction-surface bugs
// (hooks correctness, obvious errors) and reports honestly.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "scripts", "*.config.js", "src/pages/v5/Atlas.tsx"] },
  js.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaVersion: 2022, sourceType: "module", ecmaFeatures: { jsx: true } },
      globals: { window: "readonly", document: "readonly", fetch: "readonly", requestAnimationFrame: "readonly", cancelAnimationFrame: "readonly", setTimeout: "readonly", clearTimeout: "readonly", setInterval: "readonly", clearInterval: "readonly", console: "readonly", localStorage: "readonly", navigator: "readonly", URL: "readonly", URLSearchParams: "readonly" },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "off",
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-empty": "off",
      "no-constant-condition": "warn",
      "no-cond-assign": "off",
    },
  },
);
