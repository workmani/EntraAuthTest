import eslintConfig from '@repo/eslint-config';
// import globals from 'globals'; // Keep globals for potential browser/node environment setting if needed later

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // 1. Global Ignores
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '.turbo/',
      'coverage/',
      '.next/', // Still ignore Next.js build globally
      '.prettierrc.cjs',
      'next.config.*',
      'postcss.config.mjs',
      'apps/backend/bin/',
      'apps/backend/obj/',
      '.vs/',
      'apps/backend/Backend/obj/',
      'apps/backend/Backend/bin/',
      'apps/backend/Backend/.gitignore',
      '.gitignore',
      'package-lock.json',
      'apps/web/', // Ignore the old web app dir
    ],
  },

  // 2. Base config from shared package
  // Spread the array exported from @repo/eslint-config
  ...eslintConfig,

  // 3. (Optional) Add global languageOptions if needed (e.g., setting Node env)
  // {
  //   languageOptions: {
  //     globals: {
  //       ...globals.node,
  //     }
  //   }
  // }
];
