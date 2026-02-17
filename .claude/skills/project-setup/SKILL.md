---
name: project-setup
description: Setup inicial de projeto novo. Usar ao criar um novo projeto, configurar ambiente de desenvolvimento, instalar dependências, configurar MCPs, ou inicializar estrutura de pastas.
allowed-tools: Bash, Read, Write
---

# Project Setup — Inicialização de Projeto Novo

## Quando Usar

- Ao iniciar um projeto novo do zero
- Ao configurar ambiente de desenvolvimento
- Ao configurar MCPs e ferramentas

## Pré-requisitos (instalar uma vez)

```bash
# Flutter (se projeto Flutter)
flutter doctor

# Node.js (se projeto web)
node -v && npm -v

# Git
git --version

# GitHub CLI
gh auth status

# Claude Code
claude --version
```

## Passo a Passo — Projeto Novo

### 1. Criar o Projeto

**Flutter:**

```bash
flutter create --org com.seudominio nome_do_projeto
cd nome_do_projeto
```

**Next.js:**

```bash
npx create-next-app@latest nome-do-projeto --typescript --tailwind --app
cd nome-do-projeto
```

### 2. Copiar Templates

Copiar da pasta de templates para a raiz do projeto:

- `CLAUDE.md` (editar com dados do projeto)
- `PROJECT_PLAN.md` (já preenchido no planejamento)
- `SETUP.md`
- `PRE_LAUNCH.md`
- Pasta `.claude/skills/` completa

### 3. Configurar .env.local

```bash
# Criar arquivo (NUNCA commitar)
cat > .env.local << 'EOF'
# Supabase
SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=sua_anon_key_aqui

# Outras APIs (se necessário)
# GOOGLE_CLIENT_ID=
# STRIPE_SECRET_KEY=
EOF
```

### 4. Configurar .gitignore

Verificar que contém:

```
.env.local
.env*.local
*.keystore
*.jks
.dart_tool/
build/
node_modules/
.next/
```

### 5. Configurar Git (ver skill git-workflow)

```bash
git init
git add .
# → Secret scan antes do commit!
git commit -m "chore: setup inicial do projeto"
gh repo create nome-do-projeto --private --source=. --remote=origin
git push -u origin main
git checkout -b develop
git push -u origin develop
```

### 6. Instalar Pre-commit Hook

Ver instruções completas na skill `git-workflow`.

### 7. Rodar `/init` do Claude Code

```bash
claude
# Dentro do Claude Code:
/init
```

O `/init` analisa o projeto e complementa o CLAUDE.md com detecções automáticas (build system, test framework, etc.). Revisar o que ele gerou e mesclar com nosso template.

### 8. Configurar MCPs

**Supabase (obrigatório se usando Supabase):**

```bash
claude mcp add supabase --transport streamable-http \
  "https://mcp.supabase.com/mcp?project_ref=SEU_PROJECT_REF"
```

- Substituir `SEU_PROJECT_REF` pelo Project ID (Supabase → Project Settings → General)
- Primeira execução abre navegador para login

**Context7 (recomendado — docs atualizadas):**

```bash
claude mcp add context7 -- npx -y @context7/mcp@latest
```

- Permite buscar docs atualizadas de qualquer biblioteca

**Verificação dos MCPs:**

```
# No Claude Code, perguntar:
"Quais tabelas existem no banco?"        → Testa MCP Supabase
"Busque a doc de [biblioteca] no Context7" → Testa MCP Context7
```

### 9. Configurar Supabase (ver skill supabase-setup)

1. Criar projeto em supabase.com (manual — 30 segundos)
2. Copiar Project ID e keys
3. Preencher .env.local
4. Criar tabelas via MCP ou migrations.sql
5. Ativar RLS em todas as tabelas

### 10. Validação Final

```bash
# Projeto compila?
flutter run         # ou npm run dev

# Git configurado?
git remote -v       # deve mostrar origin
git branch          # deve estar em develop

# MCP funcionando?
# (testar dentro do Claude Code)

# .env.local protegido?
cat .gitignore | grep "env.local"

# Pre-commit hook instalado?
ls -la .git/hooks/pre-commit
```

## Checklist Completo de Setup

- [ ] Projeto criado (Flutter/Next.js)
- [ ] CLAUDE.md configurado
- [ ] PROJECT_PLAN.md copiado
- [ ] Skills copiadas (.claude/skills/)
- [ ] .env.local criado (com keys do Supabase)
- [ ] .gitignore verificado
- [ ] Git inicializado + repo privado no GitHub
- [ ] Branch develop criada
- [ ] Pre-commit hook instalado
- [ ] `/init` do Claude Code executado
- [ ] MCP Supabase configurado
- [ ] MCP Context7 configurado
- [ ] Supabase: tabelas, RLS, triggers criados
- [ ] Projeto compila e roda
- [ ] Primeiro commit na develop ✅
