const a11yInsights = require('@accessibility-insights/eslint-plugin');

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    '@accessibility-insights',
  ],
  extends: [
    'prettier',
    'plugin:@typescript-eslint/recommended',
    'plugin:@accessibility-insights/recommended',
  ],
  rules: {
    ...a11yInsights.configs.recommended.rules,
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        selector: 'import',
        format: ['camelCase', 'PascalCase'],
      },
    ],
    'curly': 'warn',
    // '@typescript-eslint/semi': 'warn',
    // 'eqeqeq': 'warn',
    // 'no-throw-literal': 'warn',
    // 'semi': ['warn', 'always'],
    // 'comma-dangle': ['warn', 'never'],
    // 'quotes': ['warn', 'single'],
    // 'max-len': ['warn', { code: 100 }],
    // 'indent': ['warn', 2],
    // Disabled rules as requested
    '@typescript-eslint/no-explicit-any': 'off',
    'max-len': 'off',
    'quotes': 'off',
    'indent': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/semi': 'off',
    'semi': 'off',
    'eqeqeq': 'off',
    'prefer-const': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-namespace': 'off',
  },
  ignorePatterns: ['out', 'dist', '**/*.d.ts'],
  settings: {
    '@accessibility-insights': {
      disableTelemetry: true,
    },
  },
};