# Linting Setup

This document explains our project's linting configuration and how it's standardized across different environments.

## Lint Configuration

We use a unified ESLint configuration that is consistent across:

- Local development (`npm run lint`)
- Pre-commit hooks (using Husky and lint-staged)
- CI pipeline (GitHub Actions)

Our configuration is defined in:

- Root `eslint.config.js` - Main config file
- `packages/eslint-config/` - Shared ESLint configurations

## TypeScript Strictness

Our linting setup enforces:

- No use of `any` type unless explicitly commented with a `@ts-expect-error` and explanation
- No unused variables
- Proper typing for all functions and variables
- Special strictness for auth-related files (security-critical paths)

## How to Run Linting

The following commands are available:

```bash
# Standard linting
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Strict mode - fails on warnings too (like CI)
npm run lint:strict
```

## Pre-commit Hooks

When you try to commit code, Husky will automatically run linting via lint-staged on your staged files.
The pre-commit configuration uses the same ESLint configuration to ensure consistency.

## CI Pipeline

Our CI pipeline runs the exact same linting configuration using GitHub Actions. See `.github/workflows/ci.yml` for details.

## Troubleshooting

If your code passes local linting but fails in pre-commit or CI, check:

1. Are you running the latest dependencies? (`npm install`)
2. Have you checked for TypeScript errors? (`npm run check-types`)
3. Are you using the standard lint command? (`npm run lint:strict`)

## Adding New Rules

When adding new lint rules:

1. Add them to the shared config in `packages/eslint-config/`
2. Test them locally with `npm run lint:strict`
3. Ensure they're consistent with our coding standards
