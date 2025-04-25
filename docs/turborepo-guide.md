# Turborepo in Our Project

This document explains how Turborepo works and how we use it in our monorepo project architecture.

## What is Turborepo?

Turborepo is a high-performance build system for JavaScript/TypeScript monorepos. It provides several key features:

1. **Incremental Builds**: Only rebuilds what changed since the last build
2. **Parallel Execution**: Runs tasks across packages in parallel
3. **Remote Caching**: Shares computation cache across machines (optional)
4. **Task Dependencies**: Defines relationships between tasks
5. **Pruned Subsets**: Computes and develops only the packages you need

## Our Monorepo Structure

Our project uses a monorepo structure managed by Turborepo:

```
├── apps/
│   ├── frontend/  (Next.js application)
│   └── backend/   (C# Backend API)
├── packages/
│   ├── shared/    (Shared types and utilities)
│   ├── ui/        (Shared UI components)
│   ├── eslint-config/
│   └── typescript-config/
├── turbo.json     (Turborepo configuration)
└── package.json   (Root package.json)
```

## Turborepo Configuration

Our `turbo.json` defines how tasks are executed across the monorepo:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env.local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "lint": {
      "inputs": [
        "**/*.{ts,tsx,js,mjs,cjs}",
        ".eslintrc.js",
        "eslint.config.js",
        "package.json"
      ],
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "env": ["AUTH_SECRET"]
    },
    "check-types": {
      "inputs": ["**/*.{ts,tsx}", "tsconfig.json"],
      "outputs": []
    }
  }
}
```

### Key Configuration Elements:

- **globalDependencies**: Files that affect all tasks (.env.local)
- **tasks**: Definitions for each task type
  - **build**: Produces outputs and depends on dependencies being built first
  - **lint**: Configured with inputs but no outputs (doesn't generate files)
  - **dev**: Marked as persistent (keeps running) and not cached
  - **check-types**: Runs TypeScript type checking

## How Tasks Work

### Task Syntax Explained

- **dependsOn**: Tasks that must complete before this task runs
  - `^build` means "run build in all dependencies first"
- **inputs**: Globs to determine if a task should be re-run
- **outputs**: Globs of files to cache for future runs
- **cache**: Whether to cache results (true by default)
- **persistent**: For tasks that don't exit (like dev servers)
- **env**: Environment variables that affect task outcomes

## Common Workflows

### Development

To start development servers across the monorepo:

```bash
npm run dev
```

Behind the scenes, Turborepo:

1. Identifies which packages have a `dev` script
2. Runs them in parallel
3. Streams logs from all processes

### Building

To build all packages:

```bash
npm run build
```

Turborepo:

1. Determines the dependency order
2. Builds dependent packages first
3. Caches outputs for future runs

### Type Checking

To check types across all TypeScript packages:

```bash
npm run check-types
```

### Linting

To lint all packages:

```bash
npm run lint
```

## Workspace Scripts

Our root `package.json` defines scripts that use Turborepo:

```json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "eslint --config ./eslint.config.js .",
    "lint:fix": "eslint --config ./eslint.config.js --fix .",
    "lint:strict": "eslint --config ./eslint.config.js --max-warnings=0 .",
    "format": "prettier --write \"**/*.{ts,tsx,js,mjs,cjs,json,md}\" --ignore-path .gitignore",
    "check-types": "turbo run check-types"
  }
}
```

Each of these scripts delegates to Turborepo, which then:

1. Determines which packages have the corresponding script
2. Executes them in the correct order based on dependencies
3. Applies caching where configured

## Package Dependencies

In our monorepo, we handle package dependencies like this:

- **Workspace dependencies**: Referenced with `*` (e.g., `"@monorepo/shared": "*"`)
- **External dependencies**: Listed in the root and/or package package.json

This allows packages to easily use each other's code without publishing to npm.

## CI/CD Integration

In GitHub Actions, we use Turborepo to:

1. Build and test only affected packages
2. Ensure type checking passes (`check-types` task)
3. Provide faster CI through remote caching (optional)

## Troubleshooting

### Common Issues

1. **Missing Task Error**:

   ```
   Missing tasks in project
   Could not find task `check-types` in project
   ```

   **Solution**: Add the missing script to package.json in the affected workspace

2. **Caching Issues**:
   **Solution**: Run with `--force` flag to bypass cache: `npm run build -- --force`

3. **Inconsistent Builds**:
   **Solution**: Check that appropriate dependencies are declared in `dependsOn`

### Best Practices

1. Keep the root `turbo.json` updated when adding new task types
2. Ensure consistent script names across packages
3. Prefer many small tasks over few large ones
4. Use `--filter` to target specific packages: `npx turbo run build --filter=@monorepo/frontend`

## Remote Caching (Optional)

For faster builds across machines, Turborepo offers remote caching. If we implement this in the future, we would:

1. Connect to Vercel or a custom remote cache
2. Get faster CI/CD pipeline execution
3. Share build artifacts across developers

## Additional Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Monorepo Handbook](https://turbo.build/repo/docs/handbook)
- [Caching Strategies](https://turbo.build/repo/docs/core-concepts/caching)
