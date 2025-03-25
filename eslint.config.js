import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    ignores: ['node_modules/**', 'dist/**', '.mastra/**', '**/*.min.js', 'reports/**'],
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
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
        },
      ],

      // TypeScript specific rules
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'log'] }],
      'no-unused-vars': 'off', // Turn off base rule
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
];
