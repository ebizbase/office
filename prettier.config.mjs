/** @type {import("prettier").Config} */
export default {
  plugins: [
    'prettier-plugin-gherkin',
    'prettier-plugin-organize-imports'
  ],
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "htmlWhitespaceSensitivity": "css",
  "embeddedLanguageFormatting": "auto"
};
