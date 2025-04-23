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

  // Specific rules for TS files (optional, can be refined)
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn', // Basic unused var check
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // Add other general TS rules if desired
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
