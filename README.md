# 🚀 My Next.js App

[![CI/CD Pipeline](https://github.com/KratosWolf/my-nextjs-app/actions/workflows/ci.yml/badge.svg)](https://github.com/KratosWolf/my-nextjs-app/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/KratosWolf/my-nextjs-app/branch/main/graph/badge.svg)](https://codecov.io/gh/KratosWolf/my-nextjs-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, production-ready Next.js application with TypeScript, Tailwind CSS, and comprehensive DevOps setup.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- ⚡ **Next.js 14** with App Router
- 🔷 **TypeScript** for type safety
- 🎨 **Tailwind CSS** for styling
- 🔐 **Stack Auth** for authentication
- 📊 **Neon Database** for data storage
- 🚀 **Vercel** for deployment
- 🧪 **Jest & Testing Library** for testing
- 📱 **Responsive Design** mobile-first
- 🔍 **SEO Optimized** with meta tags
- 📈 **Analytics** with Vercel Analytics
- 🛡️ **Security** with security headers
- 🔄 **CI/CD** with GitHub Actions

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Icons**: Heroicons
- **Fonts**: Inter

### Backend

- **Runtime**: Node.js
- **Database**: PostgreSQL (Neon)
- **Authentication**: Stack Auth
- **ORM**: Native SQL with Neon SDK
- **Validation**: Zod

### DevOps

- **Deployment**: Vercel
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics
- **Error Tracking**: Sentry
- **Testing**: Jest, Testing Library, Playwright

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/KratosWolf/my-nextjs-app.git
   cd my-nextjs-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration:

   ```env
   DATABASE_URL=your_neon_database_url
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Set up the database**

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 💻 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript compiler
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

### Code Style

This project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for Git hooks
- **lint-staged** for staged files linting

### Git Workflow

1. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**

   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

3. **Push to the branch**

   ```bash
   git push origin feature/amazing-feature
   ```

4. **Open a Pull Request**

### Commit Convention

This project follows [Conventional Commits](https://conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Testing changes
- `chore:` - Build process or auxiliary tool changes

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Test Structure

```
tests/
├── __mocks__/          # Mock files
├── components/         # Component tests
├── pages/              # Page tests
├── utils/              # Utility tests
├── e2e/                # End-to-end tests
└── setup.ts            # Test setup
```

## 🚀 Deployment

### Automatic Deployment

The project automatically deploys to Vercel when:

- **Staging**: Push to `develop` branch
- **Production**: Push to `main` branch

### Manual Deployment

```bash
# Deploy to Vercel
vercel --prod

# Deploy to staging
vercel
```

### Environment Variables

Make sure to configure these environment variables in Vercel:

```env
DATABASE_URL=your_production_database_url
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Contributing Guide](docs/CONTRIBUTING.md)
- [Architecture Overview](docs/ARCHITECTURE.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Setup

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Add tests for your changes
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Vercel](https://vercel.com/) for hosting and deployment
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Shadcn/ui](https://ui.shadcn.com/) for UI components

## 📞 Support

If you have any questions or need help, please:

- Open an issue on GitHub
- Join our Discord community
- Email us at support@example.com

---

Made with ❤️ by [Tiago Fernandes](https://github.com/KratosWolf)
