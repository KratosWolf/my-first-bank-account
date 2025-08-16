# Contributing to MyFirstBA2

Thank you for your interest in contributing to MyFirstBA2! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and professional in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/myfirstba2.git
   cd myfirstba2
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
5. **Create a new branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. **Ensure your fork is up-to-date**:
   ```bash
   git remote add upstream https://github.com/original/myfirstba2.git
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** following the coding standards

4. **Test your changes**:
   ```bash
   npm run test
   npm run lint
   npm run typecheck
   ```

5. **Commit your changes** using conventional commits

6. **Push to your fork** and create a Pull Request

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) for consistent commit messages:

### Commit Message Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test changes
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks

### Examples
```bash
feat(auth): add user authentication
fix(api): resolve undefined error in user endpoint
docs: update installation instructions
test(utils): add tests for helper functions
```

### Using Commitizen (Recommended)
We recommend using commitizen for consistent commit messages:
```bash
npm install -g commitizen
npm install -g cz-conventional-changelog
echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc
```

Then use `git cz` instead of `git commit`.

## Pull Request Process

1. **Ensure your branch is up-to-date** with the main branch
2. **Run all tests** and ensure they pass:
   ```bash
   npm run test:ci
   npm run lint
   npm run typecheck
   npm run build
   ```
3. **Update documentation** if needed
4. **Fill out the PR template** completely
5. **Request review** from maintainers
6. **Address feedback** and make requested changes
7. **Ensure CI passes** before merging

### PR Requirements
- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventional format
- [ ] PR template filled out completely

## Code Style

We use ESLint and Prettier for consistent code formatting:

- **Run linter**: `npm run lint`
- **Fix linting issues**: `npm run lint --fix`
- **Format code**: `npm run format`

### Key Guidelines
- Use TypeScript for type safety
- Follow functional programming principles where possible
- Write self-documenting code with clear variable names
- Add comments for complex business logic
- Keep functions small and focused
- Use async/await instead of callbacks

## Testing

We aim for high test coverage and quality:

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### Writing Tests
- Write unit tests for all new functionality
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test both success and error cases

### Test Structure
```typescript
describe('FeatureName', () => {
  describe('methodName', () => {
    it('should return expected result when given valid input', () => {
      // Arrange
      const input = 'test';
      const expected = 'TEST';

      // Act
      const result = methodName(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

## Reporting Issues

When reporting issues:

1. **Search existing issues** first
2. **Use issue templates** provided
3. **Provide detailed information**:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment details
   - Screenshots if applicable

## Getting Help

- **Documentation**: Check the README.md
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions

## Recognition

Contributors are recognized in our README.md file. Thank you for helping make MyFirstBA2 better!

## License

By contributing to MyFirstBA2, you agree that your contributions will be licensed under the MIT License.