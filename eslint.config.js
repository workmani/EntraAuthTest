import eslintConfig from '@repo/eslint-config';
import globals from 'globals'; // Re-add globals import

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
      'scripts/task-complexity-report.json', // Ensure this is ignored if gitignored
    ],
  },

  // 2. Base config from shared package
  ...eslintConfig,

  // 3. Specific config for scripts directory to add Node.js globals
  {
    files: ['scripts/**/*.js'], // Target JS files in scripts dir
    languageOptions: {
      globals: {
        ...globals.node, // Add Node.js built-in globals (like process, console)
      },
    },
    rules: {
      // Add any script-specific rule overrides if needed
    },
  },

  // 4. (Optional) Add global languageOptions if needed
  // {
  //   languageOptions: {
  //     globals: {
  //       ...globals.node,
  //     }
  //   }
  // }
];
