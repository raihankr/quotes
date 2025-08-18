import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-console": 0,
      "max-len": [
        "warn",
        {
          code: 80,
        },
      ],
      "import/extensions": 0,
    },
  },
];
