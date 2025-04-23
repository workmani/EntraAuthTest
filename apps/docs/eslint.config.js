import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'; // Import Prettier config

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize FlatCompat
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = [
  // Use FlatCompat to extend the legacy Next.js configurations
  ...compat.extends('next/core-web-vitals'),

  // Apply Prettier rules last
  eslintPluginPrettierRecommended,

  // Optional: Add specific overrides for the docs project here
  // {
  //     files: ['src/content/**/*.mdx'], // Example for MDX if used
  //     rules: {
  //         // Docs specific rules
  //     }
  // }
];

export default eslintConfig;
