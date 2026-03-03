# Contributing to Vehicle Fare BD

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 14+ (or Docker)
- Git

### Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/vehicle-fare-bd.git
   cd vehicle-fare-bd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local database credentials
   ```

4. **Setup database**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed  # Optional: adds sample data
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Verify tests pass**
   ```bash
   npm test
   npm run test:e2e
   ```

## Development Workflow

1. **Create a feature branch** from `master`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our code style guidelines

3. **Write or update tests** for your changes

4. **Run tests** to ensure everything passes
   ```bash
   npm test
   npm run lint
   ```

5. **Commit your changes** following our commit guidelines

6. **Push to your fork** and create a pull request

## Code Style

### TypeScript

- **Use TypeScript** for all new code
- **Enable strict mode** - the project uses strict TypeScript
- **Prefer type inference** where possible
- **Use explicit types** for function parameters and return values
- **Avoid `any`** - use `unknown` if type is truly unknown

### React/Next.js

- **Use functional components** with hooks (no class components)
- **Server Components by default** - only add `'use client'` when necessary
- **Prefer Server Actions** over API routes for mutations
- **Use meaningful component names** in PascalCase
- **Keep components focused** - single responsibility principle

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `EstimatorClient.tsx` |
| Files | camelCase or kebab-case | `fare.ts`, `rate-limit.ts` |
| Functions | camelCase | `calculateFare()` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_REPORTS_PER_DAY` |
| Types/Interfaces | PascalCase | `FareEstimate`, `UserRole` |
| Enums | PascalCase (from Prisma) | `City`, `VehicleType` |

### File Structure

```
src/
├── app/           # Next.js pages and API routes
├── components/    # Reusable React components
├── lib/           # Utility functions and business logic
└── types/         # TypeScript type definitions
```

**Guidelines:**
- Place business logic in `lib/`, not in components
- Keep components presentational when possible
- Server Actions go in page files or dedicated action files
- API routes only for external integrations or webhooks

### Formatting

The project uses ESLint and Next.js conventions:

```bash
# Check linting
npm run lint

# Auto-fix linting issues
npm run lint -- --fix
```

**Key rules:**
- 2 spaces for indentation (JavaScript/TypeScript)
- Single quotes for strings
- Semicolons required
- Trailing commas in multiline objects/arrays
- Max line length: 100 characters (flexible)

## Testing

### Unit Tests (Jest)

- **Location**: `src/lib/__tests__/`
- **Naming**: `filename.test.ts`
- **Coverage**: Aim for 80%+ on new utility functions

```bash
# Run unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm test -- --coverage
```

**What to test:**
- Business logic in `lib/` directory
- Utility functions
- Validation schemas
- Fare calculation algorithms

**Example:**
```typescript
// src/lib/__tests__/fare.test.ts
import { calculateFare } from '../fare';

describe('calculateFare', () => {
  it('should apply rain multiplier correctly', () => {
    const result = calculateFare({
      baseFare: 50,
      perKmRate: 20,
      distanceKm: 2,
      weather: 'RAIN',
      // ... other params
    });
    expect(result.estimate).toBeGreaterThan(90);
  });
});
```

### E2E Tests (Playwright)

- **Location**: `tests/`
- **Naming**: `feature.spec.ts`

```bash
# Run e2e tests
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui
```

**What to test:**
- Critical user flows (estimate fare, submit report, login)
- Admin functionality
- Error handling and edge cases

### Testing Requirements

**Before submitting a PR:**
- [ ] All existing tests pass
- [ ] New features have unit tests
- [ ] Critical paths have e2e tests
- [ ] No linting errors

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clear commit history.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, semicolons) |
| `refactor` | Code refactoring (no functional changes) |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, tooling |

### Examples

```bash
# Good commits
feat(estimator): add weather condition toggle
fix(auth): resolve session timeout issue
docs(api): document public insights endpoint
test(fare): add rain multiplier edge cases

# With body
feat(admin): add bulk fare config updates

Allow admins to update multiple fare configs at once
using a CSV upload feature.

Closes #123
```

### Scope

Optional but recommended. Use the feature or file area:
- `estimator`, `auth`, `admin`, `insights`, `report`
- `db`, `api`, `ui`, `i18n`

### Subject

- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period at the end
- Limit to 72 characters

## Pull Request Process

### Before Submitting

1. **Update your branch** with latest master
   ```bash
   git checkout master
   git pull upstream master
   git checkout your-feature-branch
   git rebase master
   ```

2. **Run all checks**
   ```bash
   npm run lint
   npm test
   npm run build  # Ensure production build works
   ```

3. **Update documentation** if needed
   - Update README.md for new features
   - Update API docs for endpoint changes
   - Update environment variable docs

### PR Title

Use the same format as commit messages:
```
feat(scope): brief description of changes
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass (`npm test`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] Linting passes (`npm run lint`)
- [ ] Manual testing performed

## Screenshots (if applicable)
Attach screenshots for UI changes.

## Checklist
- [ ] My code follows the project's code style
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Related Issues
Closes #(issue number)
```

### Review Process

1. **Automated checks** must pass (linting, tests)
2. **Code review** by at least one maintainer
3. **Feedback addressed** - respond to all comments
4. **Approval required** before merging
5. **Squash and merge** - commits will be squashed

### Review Timeline

- Initial review: Within 3-5 business days
- Follow-up reviews: Within 2 business days
- Simple fixes: May be merged faster

## Issue Guidelines

### Reporting Bugs

**Use the bug template:**

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox]
- Node version: [e.g., 18.17.0]
- Database: [e.g., PostgreSQL 14]

**Additional context**
Any other relevant information.
```

### Feature Requests

**Use the feature template:**

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Mockups, examples, or references.
```

### Good First Issues

Look for issues labeled `good first issue` - these are beginner-friendly tasks.

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

### Getting Help

- **Documentation**: Check README and docs/ folder
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Discord/Slack**: (Add link if available)

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Release notes for significant contributions
- README.md acknowledgments section

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

---

Thank you for contributing to Vehicle Fare BD! 🚗🛺
