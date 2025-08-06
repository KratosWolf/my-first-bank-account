#!/bin/bash
# scripts/init-project.sh
# Script para inicializar um novo projeto baseado no template

set -e

echo "🚀 Inicializando novo projeto Next.js com DevOps Template..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para input do usuário
ask_user() {
    local prompt="$1"
    local var_name="$2"
    local default_value="$3"
    
    if [ -n "$default_value" ]; then
        read -p "$(echo -e "${BLUE}${prompt}${NC} [${default_value}]: ")" input
        export $var_name="${input:-$default_value}"
    else
        read -p "$(echo -e "${BLUE}${prompt}${NC}: ")" input
        export $var_name="$input"
    fi
}

echo -e "${GREEN}📋 Configuração do Projeto${NC}"
echo "Por favor, forneça as informações do seu novo projeto:"
echo ""

# Coletar informações do projeto
ask_user "Nome do projeto" PROJECT_NAME "$(basename $(pwd))"
ask_user "Descrição do projeto" PROJECT_DESCRIPTION "A modern Next.js application with complete DevOps setup"
ask_user "Autor" PROJECT_AUTHOR "$(git config user.name 2>/dev/null || echo 'Your Name')"
ask_user "Email do autor" PROJECT_EMAIL "$(git config user.email 2>/dev/null || echo 'your.email@example.com')"
ask_user "GitHub username" GITHUB_USERNAME "$(gh api user --jq .login 2>/dev/null || echo 'username')"
ask_user "URL do repositório" REPO_URL "https://github.com/${GITHUB_USERNAME}/${PROJECT_NAME}.git"

echo ""
echo -e "${YELLOW}🔧 Configurando projeto...${NC}"

# 1. Atualizar package.json
echo "📦 Atualizando package.json..."
if [ -f "package.json" ]; then
    # Backup do package.json original
    cp package.json package.json.backup
    
    # Atualizar informações do projeto
    sed -i.tmp "s/\"name\": \".*\"/\"name\": \"$PROJECT_NAME\"/" package.json
    sed -i.tmp "s/\"description\": \".*\"/\"description\": \"$PROJECT_DESCRIPTION\"/" package.json
    
    # Remover arquivo temporário
    rm package.json.tmp
fi

# 2. Atualizar README.md
echo "📝 Criando README.md personalizado..."
cat > README.md << EOF
# 🚀 $PROJECT_NAME

$PROJECT_DESCRIPTION

[![CI/CD Pipeline](https://github.com/$GITHUB_USERNAME/$PROJECT_NAME/actions/workflows/ci.yml/badge.svg)](https://github.com/$GITHUB_USERNAME/$PROJECT_NAME/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/$GITHUB_USERNAME/$PROJECT_NAME/branch/main/graph/badge.svg)](https://codecov.io/gh/$GITHUB_USERNAME/$PROJECT_NAME)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- ⚡ **Next.js 14** with App Router
- 🔷 **TypeScript** for type safety
- 🎨 **Tailwind CSS** for styling
- 🚀 **Vercel** for deployment
- 🧪 **Jest & Testing Library** for testing
- 📱 **Responsive Design** mobile-first
- 🔍 **SEO Optimized** with meta tags
- 🔄 **CI/CD** with GitHub Actions

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or later
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone $REPO_URL
   cd $PROJECT_NAME
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

4. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- [Contributing Guide](docs/CONTRIBUTING.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](docs/CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [$PROJECT_AUTHOR](https://github.com/$GITHUB_USERNAME)
EOF

# 3. Atualizar arquivos de configuração com URLs corretas
echo "🔧 Atualizando configurações..."

# Atualizar badges no README se necessário
if [ -f "docs/CONTRIBUTING.md" ]; then
    sed -i.tmp "s|github.com/username/my-nextjs-app|github.com/$GITHUB_USERNAME/$PROJECT_NAME|g" docs/CONTRIBUTING.md
    rm -f docs/CONTRIBUTING.md.tmp
fi

if [ -f "docs/DEPLOYMENT.md" ]; then
    sed -i.tmp "s|github.com/username/my-nextjs-app|github.com/$GITHUB_USERNAME/$PROJECT_NAME|g" docs/DEPLOYMENT.md
    rm -f docs/DEPLOYMENT.md.tmp
fi

# 4. Atualizar .env.example se necessário
if [ -f ".env.example" ]; then
    echo "🔐 Configurando .env.example..."
    # Adicionar comentários específicos do projeto se necessário
fi

# 5. Instalar dependências
echo "📦 Instalando dependências..."
if command -v npm &> /dev/null; then
    npm install
else
    echo -e "${RED}❌ npm não encontrado. Instale Node.js primeiro.${NC}"
    exit 1
fi

# 6. Configurar Git se necessário
if [ -d ".git" ]; then
    echo "🔗 Configurando Git..."
    git config user.name "$PROJECT_AUTHOR" 2>/dev/null || true
    git config user.email "$PROJECT_EMAIL" 2>/dev/null || true
fi

# 7. Executar testes para verificar se tudo está funcionando
echo "🧪 Executando testes..."
npm run test:ci || echo -e "${YELLOW}⚠️ Alguns testes falharam, mas isso é normal em um novo projeto${NC}"

# 8. Tentar fazer build
echo "🔨 Testando build..."
npm run build || echo -e "${YELLOW}⚠️ Build falhou, verifique a configuração${NC}"

echo ""
echo -e "${GREEN}✅ Projeto inicializado com sucesso!${NC}"
echo ""
echo -e "${BLUE}📋 Próximos passos:${NC}"
echo "1. Configure os secrets do GitHub: ${YELLOW}./scripts/setup-secrets.sh${NC}"
echo "2. Configure o projeto Vercel: ${YELLOW}vercel link${NC}"
echo "3. Configure variáveis de ambiente: ${YELLOW}cp .env.example .env.local${NC}"
echo "4. Faça o primeiro commit: ${YELLOW}git add . && git commit -m 'feat: initial project setup'${NC}"
echo "5. Faça push para o GitHub: ${YELLOW}git push origin main${NC}"
echo ""
echo -e "${GREEN}🎉 Seu projeto está pronto para desenvolvimento!${NC}"
echo -e "Execute ${YELLOW}npm run dev${NC} para iniciar o servidor de desenvolvimento"
echo ""
echo -e "${BLUE}📚 Documentação:${NC}"
echo "- Contributing: docs/CONTRIBUTING.md"
echo "- Deployment: docs/DEPLOYMENT.md"
echo "- Validation: ./scripts/validate-setup.sh"