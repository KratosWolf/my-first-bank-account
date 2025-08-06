# Deployment Guide

## 🚀 Deployment Overview

This guide covers deployment strategies, environment configuration, and best practices for deploying the Next.js application.

## 📋 Table of Contents

- [Deployment Strategies](#deployment-strategies)
- [Environment Configuration](#environment-configuration)
- [Vercel Deployment](#vercel-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Analytics](#monitoring--analytics)
- [Troubleshooting](#troubleshooting)

## 🎯 Deployment Strategies

### Automatic Deployment

The project uses GitOps for automatic deployments:

- **Production**: Push to `main` branch
- **Staging**: Push to `develop` branch
- **Preview**: Pull requests automatically create preview deployments

### Manual Deployment

For emergency deployments or testing:

```bash
# Deploy to production
npm run deploy

# Deploy to preview
npm run deploy:preview

# Using Vercel CLI directly
vercel --prod
```

## ⚙️ Environment Configuration

### Environment Variables

#### Required Variables

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.com

# Vercel (for CI/CD)
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

#### Optional Variables

```env
# Analytics
NEXT_PUBLIC_GA_ID=GA-XXXXXXXXX
NEXT_PUBLIC_VERCEL_ANALYTICS=1

# Error Tracking
SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project

# Feature Flags
NEXT_PUBLIC_ENABLE_FEATURE_X=true

# External APIs
API_KEY=your-api-key
WEBHOOK_SECRET=your-webhook-secret
```

### Environment Setup

#### Local Development

```bash
# Copy example file
cp .env.example .env.local

# Edit with your values
nano .env.local
```

#### Production

Configure environment variables in your deployment platform:

1. **Vercel**: Project Settings → Environment Variables
2. **Netlify**: Site Settings → Environment Variables
3. **Railway**: Project → Variables
4. **Heroku**: App Settings → Config Vars

## 🚀 Vercel Deployment

### Initial Setup

1. **Connect Repository**

   ```bash
   vercel link
   ```

2. **Configure Project**

   ```bash
   vercel env add NEXTAUTH_SECRET
   vercel env add DATABASE_URL
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Vercel Configuration

Create `vercel.json` in project root:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"],
  "env": {
    "CUSTOM_KEY": "value"
  },
  "build": {
    "env": {
      "CUSTOM_KEY": "build-value"
    }
  }
}
```

### Domain Configuration

1. **Add Custom Domain**

   ```bash
   vercel domains add yourdomain.com
   ```

2. **Configure DNS**
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or use Vercel nameservers

3. **SSL Certificate**
   - Automatically provisioned by Vercel
   - Supports wildcard certificates

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The deployment pipeline includes:

1. **Code Quality Checks**
   - TypeScript compilation
   - ESLint linting
   - Prettier formatting
   - Unit tests
   - E2E tests

2. **Security Scanning**
   - Dependency audit
   - CodeQL analysis
   - SAST scanning

3. **Build & Deploy**
   - Build optimization
   - Asset compression
   - Deployment to Vercel
   - Smoke tests

### Pipeline Configuration

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

### Secrets Configuration

Configure these secrets in GitHub repository settings:

```bash
# Vercel
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID

# Database
DATABASE_URL

# Authentication
NEXTAUTH_SECRET

# Notifications
SLACK_WEBHOOK
DISCORD_WEBHOOK
```

## 📊 Monitoring & Analytics

### Performance Monitoring

1. **Vercel Analytics**

   ```env
   NEXT_PUBLIC_VERCEL_ANALYTICS=1
   ```

2. **Google Analytics**

   ```env
   NEXT_PUBLIC_GA_ID=GA-XXXXXXXXX
   ```

3. **Custom Metrics**
   ```typescript
   // utils/analytics.ts
   export const trackEvent = (action: string, data?: any) => {
     // Your tracking implementation
   };
   ```

### Error Tracking

1. **Sentry Setup**

   ```bash
   npm install @sentry/nextjs
   ```

2. **Configuration**

   ```javascript
   // sentry.client.config.js
   import * as Sentry from '@sentry/nextjs';

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
   });
   ```

### Health Checks

1. **API Health Endpoint**

   ```typescript
   // app/api/health/route.ts
   export async function GET() {
     return Response.json({
       status: 'ok',
       timestamp: new Date().toISOString(),
     });
   }
   ```

2. **Database Health**
   ```typescript
   // Check database connectivity
   const dbHealthCheck = async () => {
     // Your database ping implementation
   };
   ```

## 🐛 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

#### Environment Variables

```bash
# Check variables
vercel env ls

# Pull environment
vercel env pull .env.local
```

#### Database Connection

```bash
# Test connection
npm run db:ping

# Run migrations
npm run db:migrate
```

### Debug Mode

Enable debug logging:

```env
DEBUG=*
NEXT_DEBUG=true
```

### Performance Issues

1. **Bundle Analysis**

   ```bash
   npm run analyze
   ```

2. **Lighthouse Audit**

   ```bash
   npm run lighthouse
   ```

3. **Memory Profiling**
   ```bash
   node --inspect npm run start
   ```

## 🔐 Security Considerations

### Environment Security

- Never commit `.env` files
- Use strong secrets
- Rotate credentials regularly
- Limit environment access

### Deployment Security

- Enable HTTPS only
- Configure security headers
- Use CSP policies
- Regular security audits

### Access Control

- Limit deployment permissions
- Use service accounts
- Enable 2FA
- Regular access reviews

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Security scan completed
- [ ] Performance benchmarks met

### Post-Deployment

- [ ] Health checks passing
- [ ] Monitoring enabled
- [ ] Analytics configured
- [ ] Error tracking active
- [ ] Documentation updated

## 🆘 Support

For deployment issues:

1. Check deployment logs
2. Review error tracking
3. Contact DevOps team
4. Create incident report

---

Happy Deploying! 🚀
