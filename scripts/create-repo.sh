#!/bin/bash
# scripts/create-repo.sh

set -e

REPO_NAME="my-first-bank-account"
REPO_DESCRIPTION="A modern banking application with complete DevOps setup"

echo "🚀 Criando repositório 'My First Bank Account' no GitHub..."
echo ""

# Verificar se git está configurado
if ! git config user.name > /dev/null 2>&1; then
    echo "❌ Git não está configurado. Configure primeiro:"
    echo "git config user.name 'Seu Nome'"
    echo "git config user.email 'seu.email@exemplo.com'"
    exit 1
fi

echo "✅ Git configurado: $(git config user.name) <$(git config user.email)>"
echo ""

# Verificar se há remote origin
if git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  Já existe um remote origin configurado:"
    echo "   $(git remote get-url origin)"
    echo ""
    read -p "Deseja continuar e sobrescrever? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Operação cancelada"
        exit 1
    fi
    git remote remove origin
fi

echo ""
echo "📋 INSTRUÇÕES PARA CRIAR O REPOSITÓRIO:"
echo ""
echo "1. Acesse: https://github.com/new"
echo "2. Configure:"
echo "   - Repository name: $REPO_NAME"
echo "   - Description: $REPO_DESCRIPTION"
echo "   - Visibility: Private"
echo "   - NÃO marque 'Add a README file'"
echo "   - NÃO marque 'Add .gitignore'"
echo "   - NÃO marque 'Choose a license'"
echo ""
echo "3. Clique em 'Create repository'"
echo ""
read -p "Pressione ENTER quando o repositório estiver criado..."

echo ""
echo "🔗 Agora vamos conectar o projeto local ao GitHub..."

# Adicionar remote origin
git remote add origin "https://github.com/$(git config user.name | tr '[:upper:]' '[:lower:]' | tr ' ' '-')/$REPO_NAME.git"

echo "✅ Remote origin configurado"
echo ""

# Fazer push das branches
echo "📤 Fazendo push das branches..."
git push -u origin main
git push -u origin develop

echo ""
echo "✅ Repositório criado e configurado com sucesso!"
echo ""
echo "🌐 URL do repositório: https://github.com/$(git config user.name | tr '[:upper:]' '[:lower:]' | tr ' ' '-')/$REPO_NAME"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure secrets no GitHub (Settings > Secrets and variables > Actions)"
echo "2. Configure branch protection (Settings > Branches)"
echo "3. Execute: npx vercel login"
echo "4. Execute: npx vercel"
echo ""
echo "🎉 Seu projeto 'My First Bank Account' está pronto!" 