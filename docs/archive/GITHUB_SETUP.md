# 🚀 Configuração do GitHub - Guia Completo

## 📋 Passos para configurar o repositório GitHub

### 1. Criar repositório no GitHub

1. Acesse [GitHub.com](https://github.com)
2. Clique em "New repository"
3. Configure:
   - **Repository name**: `my-nextjs-app`
   - **Description**: Modern Next.js app with complete DevOps setup
   - **Visibility**: Public
   - **Initialize with**: NÃO marque nenhuma opção
4. Clique em "Create repository"

### 2. Conectar repositório local ao GitHub

```bash
# Adicionar remote origin
git remote add origin https://github.com/SEU_USERNAME/my-nextjs-app.git

# Fazer push das branches
git push -u origin main
git push -u origin develop
```

### 3. Configurar Secrets no GitHub

1. Vá para Settings > Secrets and variables > Actions
2. Adicione os seguintes secrets:

#### Secrets obrigatórios (para deploy automático):

- `VERCEL_TOKEN` - Token do Vercel
- `VERCEL_ORG_ID` - ID da organização Vercel
- `VERCEL_PROJECT_ID` - ID do projeto Vercel

#### Secrets opcionais:

- `SLACK_WEBHOOK` - Webhook do Slack para notificações
- `DATABASE_URL` - URL do banco de dados
- `NEXTAUTH_SECRET` - Secret do NextAuth

**Nota**: Se não configurar os secrets do Vercel, o CI funcionará normalmente, mas o deploy automático será ignorado.

### 4. Configurar Branch Protection

1. Vá para Settings > Branches
2. Clique em "Add rule"
3. Configure para branch `main`:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators
   - ✅ Restrict pushes that create files that override the above settings

### 5. Configurar Dependabot

1. Vá para Settings > Code security and analysis
2. Ative "Dependency graph"
3. Ative "Dependabot alerts"
4. Ative "Dependabot security updates"

### 6. Configurar Vercel

#### Opção 1: Deploy Automático (Recomendado)

```bash
# Login no Vercel
npx vercel login

# Deploy inicial
npx vercel

# Configurar projeto
npx vercel --prod
```

#### Opção 2: Deploy Manual

1. Vá para Actions no GitHub
2. Execute o workflow "Simple Deploy"
3. Siga as instruções fornecidas

#### Opção 3: Vercel Dashboard

1. Acesse [vercel.com](https://vercel.com)
2. Conecte seu repositório GitHub
3. Configure automaticamente

### 7. Verificar configuração

```bash
# Verificar remotes
git remote -v

# Verificar status
git status

# Testar build
npm run build

# Testar deploy
npm run deploy:preview
```

## ✅ Checklist de Configuração

- [ ] Repositório criado no GitHub
- [ ] Remote origin configurado
- [ ] Branches pushadas
- [ ] Secrets configurados
- [ ] Branch protection ativada
- [ ] Dependabot configurado
- [ ] Vercel conectado
- [ ] Workflows funcionando

## 🔧 Troubleshooting

### Problema: Permission denied

```bash
# Usar sudo para instalar ferramentas globais
sudo npm install -g vercel
```

### Problema: GitHub CLI não instalado

```bash
# Instalar via Homebrew (se disponível)
brew install gh

# Ou baixar diretamente
# https://cli.github.com/
```

### Problema: Vercel não encontrado

```bash
# Usar npx
npx vercel --version
```

## 📞 Suporte

Se encontrar problemas:

1. Verifique se todas as dependências estão instaladas
2. Confirme se os secrets estão configurados corretamente
3. Verifique os logs dos workflows no GitHub Actions
