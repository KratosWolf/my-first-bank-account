#!/bin/bash

# Script to verify the repository setup
echo "🔍 Verifying MyFirstBA2 Repository Setup..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository"
    exit 1
fi

echo "✅ Git repository found"

# Check required tools
tools=("node" "npm" "git")
for tool in "${tools[@]}"; do
    if command -v $tool &> /dev/null; then
        echo "✅ $tool is installed"
    else
        echo "❌ $tool is not installed"
    fi
done

# Check for key configuration files
files=(
    ".github/workflows/ci.yml"
    ".github/workflows/deploy.yml" 
    ".github/workflows/release.yml"
    ".github/dependabot.yml"
    ".github/ISSUE_TEMPLATE/bug_report.md"
    ".github/ISSUE_TEMPLATE/feature_request.md"
    ".github/pull_request_template.md"
    "package.json"
    "tsconfig.json"
    ".eslintrc.js"
    ".prettierrc.js"
    ".gitignore"
    ".env.example"
    "README.md"
    "CONTRIBUTING.md"
    "LICENSE"
    "CHANGELOG.md"
    ".releaserc.json"
    ".czrc"
    "commitlint.config.js"
)

echo ""
echo "📁 Checking configuration files..."
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file missing"
    fi
done

# Check source structure
echo ""
echo "📂 Checking source structure..."
if [ -d "src" ]; then
    echo "✅ src/ directory exists"
    if [ -f "src/index.ts" ]; then
        echo "✅ src/index.ts exists"
    else
        echo "❌ src/index.ts missing"
    fi
    if [ -d "src/__tests__" ]; then
        echo "✅ src/__tests__/ directory exists"
    else
        echo "❌ src/__tests__/ directory missing"
    fi
else
    echo "❌ src/ directory missing"
fi

# Check if package.json has required scripts
echo ""
echo "📦 Checking package.json scripts..."
required_scripts=("dev" "start" "build" "test" "lint" "typecheck")
for script in "${required_scripts[@]}"; do
    if npm run-script --silent $script --dry-run &> /dev/null; then
        echo "✅ npm run $script"
    else
        echo "❌ npm run $script missing"
    fi
done

echo ""
echo "🎉 Repository setup verification complete!"
echo ""
echo "Next steps:"
echo "1. Install dependencies: npm install"
echo "2. Set up environment: cp .env.example .env.local"
echo "3. Run tests: npm test"
echo "4. Start development: npm run dev"
echo "5. Set up GitHub repository and configure secrets"
echo "6. Run branch protection setup: node scripts/setup-branch-protection.js"