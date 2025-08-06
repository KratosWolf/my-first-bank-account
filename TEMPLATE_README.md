# 🚀 Next.js DevOps Template

Este é um template completo para projetos Next.js com configuração profissional de DevOps, CI/CD e deploy automatizado.

## ✨ O que está incluído

### 🔧 **Configuração DevOps Completa**

- ✅ **CI/CD Pipeline** com GitHub Actions
- ✅ **Branch Protection** com code review obrigatório
- ✅ **Semantic Versioning** automatizado
- ✅ **Deploy automatizado** para Vercel (staging + production)
- ✅ **Security scanning** com CodeQL e npm audit
- ✅ **Dependabot** para atualizações automáticas

### 📋 **Templates e Documentação**

- ✅ **Issue templates** (bugs e feature requests)
- ✅ **Pull Request template** profissional
- ✅ **README.md** completo com badges
- ✅ **Contributing guide** detalhado
- ✅ **Deployment guide** com troubleshooting

### 🛠️ **Ferramentas de Desenvolvimento**

- ✅ **TypeScript** configurado
- ✅ **ESLint + Prettier** para code quality
- ✅ **Husky + lint-staged** para Git hooks
- ✅ **Jest** para testes unitários
- ✅ **Playwright** para testes E2E

### 📦 **Scripts Utilitários**

- ✅ **Setup script** para configuração automática
- ✅ **Secrets setup** para GitHub secrets
- ✅ **Validation script** para verificar configuração

## 🚀 Como usar este template

### **Método 1: Via GitHub (Recomendado)**

1. **Clique em "Use this template"** no GitHub
2. **Nomeie seu novo projeto**
3. **Clone o repositório criado**:

   ```bash
   git clone https://github.com/seu-usuario/seu-projeto.git
   cd seu-projeto
   ```

4. **Execute o script de inicialização**:
   ```bash
   ./scripts/init-project.sh
   ```

### **Método 2: Via GitHub CLI**

```bash
# Criar novo repositório baseado no template
gh repo create meu-projeto --template KratosWolf/nextjs-devops-template --public --clone

# Navegar para o projeto
cd meu-projeto

# Executar inicialização
./scripts/init-project.sh
```

## ⚙️ Configuração Pós-Criação

### **1. Configurar Secrets do GitHub**

Execute o script interativo:

```bash
./scripts/setup-secrets.sh
```

**Secrets necessários:**

- `VERCEL_TOKEN` - Token da sua conta Vercel
- `VERCEL_ORG_ID` - ID da sua organização Vercel
- `VERCEL_PROJECT_ID` - ID do projeto Vercel
- `SLACK_WEBHOOK` - (Opcional) Webhook do Slack
- `DISCORD_WEBHOOK` - (Opcional) Webhook do Discord

### **2. Configurar Vercel Project**

```bash
# Fazer login no Vercel
vercel login

# Linkar o projeto
vercel link

# Fazer deploy inicial
vercel --prod
```

### **3. Configurar Environment Variables**

Copie e configure suas variáveis:

```bash
cp .env.example .env.local
# Edite .env.local com suas configurações
```

### **4. Validar Configuração**

```bash
./scripts/validate-setup.sh
```

## 📋 Checklist de Configuração

- [ ] Repositório criado baseado no template
- [ ] Script de inicialização executado
- [ ] Secrets do GitHub configurados
- [ ] Projeto Vercel configurado e linkado
- [ ] Environment variables configuradas
- [ ] Primeiro deploy realizado com sucesso
- [ ] Branch protection funcionando
- [ ] CI/CD pipeline executando
- [ ] Testes passando

## 🎯 Estrutura do Projeto

```
.
├── .github/
│   ├── workflows/           # GitHub Actions
│   ├── ISSUE_TEMPLATE/      # Templates para issues
│   └── pull_request_template.md
├── docs/
│   ├── CONTRIBUTING.md      # Guia de contribuição
│   └── DEPLOYMENT.md        # Guia de deploy
├── scripts/
│   ├── init-project.sh      # Inicialização do projeto
│   ├── setup.sh            # Setup do ambiente
│   ├── setup-secrets.sh    # Configuração de secrets
│   └── validate-setup.sh   # Validação da configuração
├── __tests__/              # Testes
├── app/                    # Next.js App Router
├── components/             # Componentes React
├── .env.example           # Exemplo de variáveis
├── jest.config.js         # Configuração Jest
├── next.config.ts         # Configuração Next.js
└── package.json           # Dependencies e scripts
```

## 🆘 Suporte

- 📚 **Documentação**: Veja `docs/DEPLOYMENT.md`
- 🐛 **Issues**: Use os templates de issue
- 💬 **Discussões**: GitHub Discussions
- 📧 **Email**: support@example.com

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Template criado com ❤️ para acelerar desenvolvimento de projetos Next.js profissionais!** 🚀
