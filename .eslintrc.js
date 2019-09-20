module.exports = {
  env: {
    es6: true,
    node: true
  },
  plugins: ['jest', 'prettier', 'import/typescript'],
  extends: ['airbnb-base', 'plugin:jest/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    'prettier/prettier': 'error',
  }
}
