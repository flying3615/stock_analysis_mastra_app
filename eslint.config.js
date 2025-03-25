import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  js.configs.recommended,
  ...compat.extends('plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'),
  {
    ignores: ['node_modules/**', 'dist/**', '.mastra/**', '**/*.min.js', 'reports/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    files: ['**/*.js', '**/*.ts'],
    rules: {
      // Formatting rules
      indent: ['error', 2],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'comma-spacing': ['error', { before: false, after: true }],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'keyword-spacing': ['error', { before: true, after: true }],
      'space-infix-ops': 'error',

      // TypeScript specific rules
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-unused-vars': 'off', // Turn off base rule

      // Prettier integration
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: true,
          trailingComma: 'all',
          bracketSpacing: true,
          arrowParens: 'avoid',
          printWidth: 100,
          tabWidth: 2,
        },
      ],
    },
  },
];
