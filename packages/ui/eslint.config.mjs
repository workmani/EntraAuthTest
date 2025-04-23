import eslintConfig from '@repo/eslint-config';
// Optionally import React specific configs if needed later
// import react from 'eslint-plugin-react';
// import reactHooks from 'eslint-plugin-react-hooks';
// import globals from 'globals';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Spread the base shared config
  ...eslintConfig,

  // Add specific configurations for the UI package
  // Example: Enable React rules (if not already in shared config)
  // {
  //   files: ['**/*.{ts,tsx}'],
  //   plugins: {
  //     react,
  //     'react-hooks': reactHooks,
  //   },
  //   languageOptions: {
  //     globals: {
  //       ...globals.browser, // Add browser globals for React components
  //     },
  //   },
  //   settings: {
  //     react: { version: 'detect' }, // Detect React version
  //   },
  //   rules: {
  //     ...react.configs.recommended.rules,
  //     ...reactHooks.configs.recommended.rules,
  //     // Add other UI-specific rules
  //   }
  // }
];
