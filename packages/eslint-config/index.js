// packages/eslint-config/index.js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

// Export a flat config array directly
/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Base recommended configs
  eslint.configs.recommended,
  ...tseslint.configs.recommended, // Use non-type-checked recommended for base shared config

  // Specific rules for TS files - strengthened to match CI requirements
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn', // Basic unused var check
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'error', // Stricter typing, caught by pre-commit
      '@typescript-eslint/ban-ts-comment': [
        'warn',
        {
          'ts-expect-error': 'allow-with-description',
          minimumDescriptionLength: 10,
        },
      ], // Allow ts-expect-error but require explanation
      '@typescript-eslint/no-non-null-assertion': 'warn', // Consider moving to error in future
      // Add other general TS rules if desired
    },
  },

  // Specific rules for auth-related files - extra strictness for security
  {
    files: [
      '**/auth.{ts,tsx}',
      '**/auth.config.{ts,tsx}',
      '**/middleware.{ts,tsx}',
      '**/api/auth/**/*.{ts,tsx}',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          minimumDescriptionLength: 10,
        },
      ],
    },
  },

  // Specific rules for JS files (optional)
  {
    files: ['**/*.{js,mjs,cjs}'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off', // Allow require in JS config files etc.
      // Add other general JS rules if desired
    },
  },

  // Apply Prettier last
  eslintPluginPrettierRecommended,
];
