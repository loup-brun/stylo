module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:security/recommended',
  ],
  parserOptions: {
    ecmaVersion: 13,
  },
  plugins: ['security'],
  rules: {},
}
