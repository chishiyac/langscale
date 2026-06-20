import { defineConfig } from 'oxfmt'
import ultracite from 'ultracite/oxfmt'

export default defineConfig({
  ...ultracite,
  bracketSpacing: true,
  jsdoc: true,
  jsxSingleQuote: true,
  printWidth: 70,
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none'
})
