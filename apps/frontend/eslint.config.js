// apps/frontend/eslint.config.js
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'; // Import Prettier config

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize FlatCompat
const compat = new FlatCompat({
  baseDirectory: __dirname, // Ensure paths are resolved correctly relative to this file
  // resolvePluginsRelativeTo: __dirname, // Might be needed if plugins aren't found
});

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = [
  // Use FlatCompat to extend the legacy Next.js configurations
  // next/core-web-vitals includes base Next.js, React, accessibility, and TypeScript rules
  ...compat.extends('next/core-web-vitals'),

  // Apply Prettier rules last to override formatting
  eslintPluginPrettierRecommended,

  // Optional: Add any specific overrides for the frontend project here
  // {
  //     files: ['src/components/**/*.tsx'],
  //     rules: {
  //         // Frontend specific rules
  //     }
  // }
];

export default eslintConfig;
