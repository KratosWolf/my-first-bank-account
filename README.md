# MyFirstBA2

A professional Node.js project with comprehensive CI/CD pipeline and deployment strategy.

## Features

- 🚀 **Modern Development Stack**: Node.js 18+, TypeScript, Express
- 🔄 **CI/CD Pipeline**: Automated testing, linting, and deployment
- 📦 **Automated Releases**: Semantic versioning with changelog generation
- 🔍 **Code Quality**: ESLint, Prettier, Husky pre-commit hooks
- ✅ **Testing**: Jest with coverage reporting
- 🛡️ **Security**: CodeQL analysis and dependency auditing
- 🌐 **Deployment**: Automated deployment to Vercel (staging/production)

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/myfirstba2.git
cd myfirstba2
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Start development server:
```bash
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm start` | Start production server |
| `npm run build` | Build the application |
| `npm test` | Run tests |
| `npm run test:ci` | Run tests in CI mode with coverage |
| `npm run lint` | Lint and fix code |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run format` | Format code with Prettier |

## Deployment

### Staging
- Automatically deployed when pushing to `develop` branch
- Staging URL: [Your staging URL]

### Production
- Automatically deployed when pushing to `main` branch
- Production URL: [Your production URL]

## Environment Variables

See `.env.example` for required environment variables.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.