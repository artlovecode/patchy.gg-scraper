module.exports = {
  env: {
    es6: true,
    node: true
  },
  plugins: ['jest', 'prettier'],
  extends: ['airbnb-base', 'plugin:jest/recommended'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    'arrow-parens': 'off',
    'prettier/prettier': 'error',
    semi: 'off',
    'comma-dangle': 'off',
    'arrow-body-style': 'off',
    'spaced-comment': 'off'
  }
}
