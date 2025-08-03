# 🤝 Contributing Guide

Thank you for your interest in contributing to our project! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn
- Git

### Fork and Clone

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/my-nextjs-app.git
   cd my-nextjs-app
   ```

### Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

3. **Run the setup script**
   ```bash
   ./scripts/setup.sh
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🛠 Development Setup

### Git Configuration

Configure your Git user information:

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Branch Naming Convention

Use the following branch naming convention:

- `feature/description` - For new features
- `fix/description` - For bug fixes
- `docs/description` - For documentation changes
- `refactor/description` - For code refactoring
- `test/description` - For test-related changes

### Commit Message Convention

Follow [Conventional Commits](https://conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Test changes
- `chore` - Build process or auxiliary tool changes

Examples:
```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve navigation issue"
git commit -m "docs: update API documentation"
```

## 🔧 Making Changes

### Before Making Changes

1. **Update your fork**
   ```bash
   git fetch origin
   git checkout main
   git pull origin main
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

### During Development

1. **Make your changes**
2. **Write tests** for new functionality
3. **Update documentation** if needed
4. **Run tests** to ensure everything works
   ```bash
   npm run test:ci
   ```

### Code Style

- Follow the existing code style
- Use ESLint and Prettier
- Write meaningful commit messages
- Add comments for complex logic

### Testing

- Write unit tests for new features
- Ensure all tests pass
- Maintain or improve test coverage

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests for CI
npm run test:ci

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Writing Tests

- Test files should be named `*.test.ts` or `*.test.tsx`
- Place test files next to the source files
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

Example:
```typescript
describe('UserComponent', () => {
  it('should render user information correctly', () => {
    // Arrange
    const user = { name: 'John', email: 'john@example.com' }
    
    // Act
    render(<UserComponent user={user} />)
    
    // Assert
    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })
})
```

## 🔄 Pull Request Process

### Before Submitting

1. **Ensure tests pass**
   ```bash
   npm run test:ci
   npm run build
   ```

2. **Check code style**
   ```bash
   npm run lint
   npm run type-check
   ```

3. **Update documentation** if needed

### Creating a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request**
   - Use the provided template
   - Fill in all required sections
   - Add screenshots if applicable
   - Link related issues

3. **Wait for review**
   - Address review comments
   - Make requested changes
   - Update the PR as needed

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Code is commented, especially in hard-to-understand areas
- [ ] Corresponding changes to documentation made
- [ ] Changes generate no new warnings
- [ ] Tests added that prove fix is effective or feature works
- [ ] New and existing unit tests pass locally
- [ ] Any dependent changes have been merged and published

## 🚀 Release Process

### Semantic Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

### Release Process

1. **Merge to main branch**
2. **Automatic release** via GitHub Actions
3. **Deploy to production** via Vercel
4. **Create GitHub release** with changelog

### Release Notes

Release notes are automatically generated based on commit messages:

- `feat:` - New features
- `fix:` - Bug fixes
- `BREAKING CHANGE:` - Breaking changes
- `docs:` - Documentation updates
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build process changes

## 📞 Getting Help

If you need help:

- **Open an issue** for bugs or feature requests
- **Join our Discord** for community support
- **Email us** for direct support

## 🙏 Recognition

Contributors will be recognized in:

- Project README
- Release notes
- Contributors page
- GitHub contributors list

Thank you for contributing! 🎉 