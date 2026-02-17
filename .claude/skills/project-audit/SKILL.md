# Skill: Project Audit

## Descrição

Auditoria completa de um projeto existente. Gera um relatório padronizado com diagnóstico de tech stack, segurança, qualidade de código, estado do Git, **reconciliação UI × Código × Banco**, e recomendações priorizadas.

## Quando Usar

- Ao retomar um projeto antigo
- Antes de planejar melhorias ou refatorações
- Quando não se sabe o estado atual do projeto
- Como primeiro passo antes de rodar o App Planner
- **OBRIGATÓRIO antes de evoluir qualquer projeto existente (Bloco 0 do Roteiro V4)**

## Processo

### 1. Tech Stack

Identificar todas as tecnologias usadas:

```
- Framework principal e versão
- Linguagem e versão
- UI/Styling (Tailwind, Material, etc.)
- Autenticação (Supabase, Firebase, etc.)
- Database (tipo, ORM, status de conexão)
- Estado (Provider, Redux, Zustand, etc.)
- Testing (framework, cobertura)
- CI/CD (configurado? funcionando?)
```

### 2. Estrutura de Pastas

Mapear a árvore do projeto:

```
- Pastas principais e seus papéis
- Número total de arquivos
- Arquivos de configuração presentes
- Documentação existente (.md files)
```

### 3. O Que Funciona vs O Que Está Quebrado

Testar e listar:

```
✅ Funcionalidades operacionais
⚠️ Funcionalidades parciais ou com bugs
❌ Funcionalidades quebradas
🚫 Funcionalidades planejadas mas não implementadas
```

### 4. Estado do Git

Verificar completamente:

```bash
git status                    # Arquivos modificados/untracked
git log --oneline -5          # Últimos commits
git branch -a                 # Branches locais e remotas
git remote -v                 # Repositórios remotos
git stash list                # Stashes pendentes
```

Reportar:

- Branch atual
- Working tree clean ou dirty (quantos arquivos)
- Tempo desde último commit
- Branches que podem ser limpas
- Conflitos pendentes

### 5. Dependências

Verificar atualizações:

```bash
# Flutter
flutter pub outdated

# Node/Next.js
npm outdated
# ou
npx npm-check-updates

# Python
pip list --outdated
```

Classificar:

- 🔴 Major updates (breaking changes possíveis)
- 🟡 Minor updates (features novas)
- 🟢 Patch updates (bug fixes)
- ⚠️ Pacotes descontinuados

### 6. Segurança

Escanear por problemas:

```bash
# Secrets expostos no Git
git log --all --full-history -- "*.json" "*.env" "*.key" "*.pem"
grep -r "password\|secret\|api_key\|token" --include="*.json" --include="*.yaml" --include="*.yml"

# Verificar .gitignore
cat .gitignore | grep -E "\.env|secret|key|credential|google-services"

# Dependências com vulnerabilidades
# Node
npm audit
# Flutter - verificar advisories manualmente
```

Classificar:

- 🔴 CRÍTICO: Secrets no Git, credenciais expostas
- 🟡 MÉDIO: Configs inseguras, secrets fracos
- 🟢 BAIXO: Melhorias recomendadas

### 7. Qualidade do Código

Analisar:

```bash
# Arquivos grandes (>500 linhas)
find . -name "*.dart" -o -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -20

# TODOs e FIXMEs
grep -rn "TODO\|FIXME\|HACK\|XXX" --include="*.dart" --include="*.ts" --include="*.tsx"

# Print/console statements em produção
grep -rn "print(\|console.log" --include="*.dart" --include="*.ts" --include="*.tsx"

# Lint
# Flutter
flutter analyze
# Node
npx eslint . --ext .ts,.tsx
```

### 8. 🆕 Reconciliação: UI × Código × Banco (OBRIGATÓRIO)

> Esta é a verificação mais importante para projetos existentes.
> Cruza três fontes de verdade para encontrar inconsistências.

#### Passo 8.1: Listar o que a UI mostra ao usuário

```bash
# Identificar todas as features visíveis na UI
# Flutter
grep -rn "Scaffold\|AppBar\|Text(" lib/ --include="*.dart" -l | head -20

# Next.js — listar páginas/rotas
find . -path "*/app/*" -name "page.tsx" -o -name "page.ts" | sort
find . -path "*/pages/*" -name "*.tsx" -o -name "*.ts" | sort

# Listar componentes que renderizam dados
grep -rn "map(\|\.map\|ListView\|FlatList" --include="*.tsx" --include="*.dart" -l .
```

#### Passo 8.2: Listar o que o código referencia no banco

```bash
# Supabase — tabelas referenciadas no código
grep -rn "from('\|\.from(" --include="*.ts" --include="*.tsx" --include="*.dart" . | \
  grep -oP "from\(['\"]([^'\"]+)" | sort -u

# Supabase — colunas referenciadas
grep -rn "\.select('\|\.eq('\|\.order(" --include="*.ts" --include="*.tsx" . | head -20

# Firebase — coleções referenciadas
grep -rn "collection('\|doc(" --include="*.ts" --include="*.tsx" --include="*.dart" . | head -20
```

#### Passo 8.3: Listar o que REALMENTE existe no banco

```sql
-- Executar no SQL Editor do Supabase ou via MCP:

-- Todas as tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Contagem de registros por tabela
SELECT schemaname, relname AS table_name, n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY relname;

-- Schema detalhado de cada tabela
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- RLS status por tabela
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Policies ativas
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

#### Passo 8.4: Montar a Tabela de Reconciliação

```markdown
| #   | Feature na UI | Componente/Página   | Tabela no Código | Tabela no Banco   | Status            |
| --- | ------------- | ------------------- | ---------------- | ----------------- | ----------------- |
| 1   | Dashboard     | pages/dashboard.tsx | transactions     | transactions ✅   | ✅ OK             |
| 2   | Perfil        | components/Profile  | user_profiles    | user_profiles ✅  | ✅ OK             |
| 3   | Sonhos        | pages/goals.tsx     | savings_goals    | ❌ NÃO EXISTE     | 🚨 BUG            |
| 4   | —             | —                   | old_temp_table   | old_temp_table ✅ | ⚠️ Código não usa |
```

**Legenda:**

- ✅ OK — UI, código e banco estão alinhados
- 🚨 BUG — Código referencia tabela que não existe (ou vice-versa)
- ⚠️ Orfão — Tabela existe no banco mas ninguém usa
- 🔍 Investigar — Não é claro se há problema

**Para CADA item 🚨 BUG, investigar:**

1. A tabela existe com outro nome?
2. O código está apontando para tabela errada?
3. A feature foi removida mas o código ficou?
4. A migration não foi executada?

### 9. Workflows e Automações

```bash
# GitHub Actions
ls .github/workflows/ 2>/dev/null

# Cron jobs / scheduled tasks
grep -rn "cron\|schedule" .github/workflows/ 2>/dev/null

# Supabase Edge Functions
# Verificar no Dashboard → Edge Functions

# Keep-alive ou health checks
grep -rn "keep-alive\|health" --include="*.yml" --include="*.yaml" . 2>/dev/null
```

## Formato do Relatório Final

```markdown
# 📊 RELATÓRIO DE AUDITORIA - [Nome do Projeto]

**Data:** [data]
**Localização:** [path]

## 1. Tech Stack

[tabela ou lista]

## 2. Estrutura de Pastas

[árvore simplificada]

## 3. Status de Funcionalidades

✅ Funcionando: [lista]
⚠️ Parcial: [lista]
❌ Quebrado: [lista]

## 4. Estado do Git

- Branch: [atual]
- Status: [clean/dirty]
- Último commit: [data e mensagem]
- Pendências: [lista]

## 5. Dependências

[tabela com status]

## 6. Segurança

🔴 Crítico: [lista]
🟡 Médio: [lista]
🟢 Baixo: [lista]

## 7. Qualidade do Código

- Arquivos grandes: [lista top 5]
- TODOs: [contagem]
- Lint issues: [contagem e principais]

## 8. Reconciliação UI × Código × Banco

| #   | Feature na UI | Componente | Tabela (código) | Tabela (banco) | Status |
| --- | ------------- | ---------- | --------------- | -------------- | ------ |

[tabela completa]

### Problemas Encontrados:

[lista de cada 🚨 BUG com investigação]

## 9. Workflows e Automações

[status de cada workflow]

## 10. Resumo Executivo

### Pontos Fortes

### Problemas Críticos

### Recomendações (priorizadas)

## 11. Estado do Banco (para copiar no CLAUDE.md)

### Tabelas Ativas

| Tabela | Registros | Descrição | Última alteração |
| ------ | --------- | --------- | ---------------- |

[preencher com dados reais]

### Tabelas Órfãs (considerar remoção)

[lista]

## 12. Checklist de Ação Imediata

[ ] Ação 1 — prioridade ALTA
[ ] Ação 2 — prioridade ALTA
[ ] ...
```

## Notas

- Este skill é o **PRIMEIRO PASSO** antes de melhorar qualquer projeto existente
- A **Reconciliação (seção 8)** é a parte mais importante — é onde bugs escondidos aparecem
- O relatório gerado deve ser levado ao App Planner para gerar CLAUDE.md e PROJECT_PLAN.md atualizados
- A **seção 11 (Estado do Banco)** deve ser copiada diretamente para o CLAUDE.md e PROJECT_PLAN.md
- **Não executar correções durante a auditoria** — apenas diagnosticar e documentar
