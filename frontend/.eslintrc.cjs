module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  plugins: ["svelte3", "@typescript-eslint"],
  ignorePatterns: ["*.cjs"],
  overrides: [{ files: ["*.svelte"], processor: "svelte3/svelte3" }],
  settings: {
    "svelte3/typescript": () => require("typescript"),
  },
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
    ecmaVersion: 2022,
    extraFileExtensions: [".svelte"],
    allowImportExportEverywhere: false,
  },
  env: {
    browser: true,
    es2022: true,
  },
  rules: {
    "prefer-arrow-callback": 2,
  },
};
