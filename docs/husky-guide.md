# Husky in Our Project

This document explains how Husky is configured and used in our project to maintain code quality and consistency.

## What is Husky?

Husky is a Git hooks manager that allows you to run scripts before specific Git events, such as:

- Before commits (`pre-commit`)
- Before pushing code (`pre-push`)
- Before merging (`pre-merge-commit`)
- After commits (`post-commit`)

In our project, we use Husky primarily to ensure code quality checks are performed automatically before code is committed to the repository.

## How Husky is Configured

Husky is installed and configured in our project with the following components:

1. **Installation**: In the root `package.json`, there's a `prepare` script that sets up Husky:

   ```json
   {
     "scripts": {
       "prepare": "husky install"
     },
     "devDependencies": {
       "husky": "^8.0.0",
       "lint-staged": "^15.5.1"
     }
   }
   ```

2. **Hook Configuration**: Husky hooks are stored in the `.husky` directory at the project root:

   ```
   .husky/
   ├── _/
   ├── pre-commit  # Runs before git commit
   └── ...         # Other potential hooks
   ```

## Git Hooks We Use

### Pre-commit Hook

Our `pre-commit` hook ensures that all code meets our quality standards before it's committed to the repository:

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

This hook runs `lint-staged`, which only runs linters on files that are staged for commit.

## Lint-staged Configuration

We use lint-staged to run linters only on the files that are being committed. Our configuration in `package.json` looks like this:

```json
{
  "lint-staged": {
    "**/*.{js,ts,tsx}": [
      "eslint --fix --config ./eslint.config.js",
      "prettier --write"
    ],
    "**/*.{json,md}": ["prettier --write"]
  }
}
```

This configuration:

1. For JavaScript/TypeScript files:

   - Runs ESLint with automatic fixing
   - Formats with Prettier

2. For JSON and Markdown files:
   - Formats with Prettier

## Workflow with Husky

Here's how Husky integrates into our development workflow:

1. **Initial Setup**:

   - When you first clone the repository, run `npm install` which triggers the `prepare` script
   - This automatically installs Husky and configures the Git hooks

2. **During Development**:

   - Write your code normally
   - Stage your changes with `git add`
   - When you run `git commit`:
     - The pre-commit hook triggers
     - lint-staged runs linters only on staged files
     - If linting fails, your commit is blocked until issues are fixed
     - If linting passes with auto-fixes, the fixed code is automatically re-staged

3. **Benefits**:
   - Prevents code with linting errors from being committed
   - Enforces consistent code style across the team
   - Automatically fixes minor style issues
   - Reduces code review comments about formatting

## Common Commands and Scenarios

### If You Need to Skip Hooks

In rare circumstances, you might need to bypass Husky hooks:

```bash
git commit -m "..." --no-verify
```

**Note**: This should be used sparingly, as it bypasses our quality controls.

### Adding a New Hook

To add a new Git hook (e.g., pre-push):

1. Create the hook file in the `.husky` directory:

   ```bash
   npx husky add .husky/pre-push "npm run test"
   ```

2. Make it executable if needed:

   ```bash
   chmod +x .husky/pre-push
   ```

### Updating Hook Scripts

To modify an existing hook, simply edit the corresponding file in the `.husky` directory.

## Troubleshooting

### Hook Not Running

If a hook isn't running when expected:

1. Check that Husky is installed properly:

   ```bash
   npm run prepare
   ```

2. Verify the hook file has execute permissions:

   ```bash
   chmod +x .husky/pre-commit
   ```

3. Make sure Git is aware of the hooks:
   ```bash
   git config --get core.hookspath
   ```
   Should return `.husky`

### Lint-staged Errors

If lint-staged is reporting errors:

1. Run the linters manually to see the detailed errors:

   ```bash
   npx eslint --config ./eslint.config.js <filename>
   ```

2. Fix the issues and try committing again

## Benefits for Our Project

Our Husky setup provides several key benefits:

1. **Consistency**: Ensures all code follows the same style guidelines
2. **Quality Gates**: Prevents code with linting errors from entering the repository
3. **Efficiency**: Automatically fixes minor style issues, saving developer time
4. **CI Integration**: Reduces CI failures by catching issues early

## Integration with Our Monorepo

In our monorepo structure, Husky is configured at the root level and applies to all packages and applications. This ensures consistent quality standards across the entire project.

The lint-staged configuration intelligently selects the appropriate linters based on file extensions, regardless of which package the files belong to.

## Additional Resources

- [Husky Documentation](https://typicode.github.io/husky/#/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [Git Hooks Documentation](https://git-scm.com/docs/githooks)
