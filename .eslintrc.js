module.exports = {
  extends: [
    'next/core-web-vitals'
  ],
  rules: {
    'no-console': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off'
  },
  ignorePatterns: ['.next/', 'node_modules/', 'coverage/', 'dist/']
};