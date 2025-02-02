import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: {...globals.browser, ...globals.node, ...globals.jest} }},
  {rules: { "no-unused-vars": ["error", { "argsIgnorePattern": "^next$" }] }},
  pluginJs.configs.recommended,
];