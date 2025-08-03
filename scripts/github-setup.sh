#!/bin/bash
# scripts/github-setup.sh

set -e

echo "🚀 Configurando GitHub e Vercel..."

# Verificar se git está configurado
if ! git config user.name > /dev/null 2>&1; then
    echo "❌ Git não está configurado. Configure primeiro:"
    echo "git config user.name 'Seu Nome'"
    echo "git config user.email 'seu.email@exemplo.com'"
    exit 1
fi

# Verificar se há remote origin
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  Nenhum remote origin configurado."
    echo "📝 Para configurar, execute:"
    echo "git remote add origin https://github.com/SEU_USERNAME/my-nextjs-app.git"
    echo ""
    echo "📋 Depois execute:"
    echo "git push -u origin main"
    echo "git push -u origin develop"
else
    echo "✅ Remote origin configurado: $(git remote get-url origin)"
fi

# Verificar Vercel
if npx vercel --version > /dev/null 2>&1; then
    echo "✅ Vercel CLI disponível"
else
    echo "❌ Vercel CLI não encontrado. Instalando..."
    npm install --save-dev vercel --legacy-peer-deps
fi

# Testar build
echo "🔨 Testando build..."
npm run build

# Verificar se tudo está funcionando
echo ""
echo "✅ Configuração local completa!"
echo ""
echo "📋 Próximos passos:"
echo "1. Crie o repositório no GitHub: https://github.com/new"
echo "2. Configure o remote: git remote add origin https://github.com/SEU_USERNAME/my-nextjs-app.git"
echo "3. Faça push: git push -u origin main"
echo "4. Configure secrets no GitHub (Settings > Secrets and variables > Actions)"
echo "5. Configure branch protection (Settings > Branches)"
echo "6. Execute: npx vercel login"
echo "7. Execute: npx vercel"
echo ""
echo "📖 Consulte GITHUB_SETUP.md para instruções detalhadas" 