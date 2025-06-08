# Code Quality and Standards

This project uses the following tools to enforce and automate code standards:

## Tools Configured

### 🎨 Prettier

- **Purpose**: Code formatting
- **Config**: `.prettierrc`
- **Ignore**: `.prettierignore`
- **Commands**:
  - `npm run format` - Format all files
  - `npm run format:check` - Check if files are formatted

### 🔍 ESLint

- **Purpose**: Code linting and quality checks
- **Config**: `eslint.config.js` (ESLint v9 flat config)
- **Commands**:
  - `npm run lint` - Lint and auto-fix issues
  - `npm run lint:check` - Check for lint issues without fixing

### 🐺 Husky

- **Purpose**: Git hooks automation
- **Config**: `.husky/` directory
- **Hooks**:
  - `pre-commit`: Runs lint-staged on staged files
  - `commit-msg`: Validates commit message format

### 📝 Commitlint

- **Purpose**: Enforce conventional commit messages
- **Config**: `commitlint.config.js`
- **Format**: `type(scope): description`
  - Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

### 🎯 Lint-staged

- **Purpose**: Run linters on staged files only
- **Config**: `lint-staged` section in `package.json`
- **Actions**: Runs ESLint and Prettier on staged files before commit

## Workflow

1. **Development**: Write code following project standards
2. **Pre-commit**: When you commit, Husky automatically:
   - Runs ESLint on staged files and fixes issues
   - Runs Prettier to format staged files
   - Validates commit message format
3. **Manual commands**: Use npm scripts for manual linting/formatting

## Commit Message Examples

```bash
# Good commit messages
git commit -m "feat: add new data filtering feature"
git commit -m "fix: resolve pagination bug"
git commit -m "docs: update API documentation"
git commit -m "refactor: improve table rendering performance"

# Bad commit messages (will be rejected)
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "Updated files"
```

## VSCode Integration

For the best experience, install these VSCode extensions:

- ESLint
- Prettier - Code formatter
- Vue Language Features (Volar)

Configure VSCode to format on save by adding to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["javascript", "typescript", "vue"]
}
```
