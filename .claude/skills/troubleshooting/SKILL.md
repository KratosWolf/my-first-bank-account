---
name: troubleshooting
description: Guia de diagnóstico e resolução de problemas comuns durante desenvolvimento. Usar quando build quebrar, funcionalidade parar de funcionar, dados sumirem, ou qualquer erro inesperado. Inclui árvores de decisão e comandos de diagnóstico rápido.
allowed-tools: Bash, Read, Grep, Glob
---

# Troubleshooting — Diagnóstico e Resolução de Problemas

## Quando Usar

- Build quebrou após mudança
- Funcionalidade que funcionava parou
- Dados não aparecem ou sumiram
- Erro inesperado no app
- Projeto retomado depois de pausa (não compila mais)
- Qualquer "estava funcionando ontem e hoje não"

## ⚠️ Regra de Ouro

> **PARE → DIAGNOSTIQUE → REPORTE → PROPONHA → AGUARDE**
>
> NUNCA tente resolver silenciosamente. Sempre mostrar ao Tiago
> o que aconteceu e propor soluções ANTES de implementar.

---

## Árvore 1: Build Quebrou

```
Build falhou
├── Depois de atualizar dependências?
│   ├── SIM → Rollback: git checkout -- pubspec.yaml / package.json
│   │         npm install / flutter pub get
│   │         Testar. Se voltar → atualizar uma dependência por vez.
│   └── NÃO → continuar ↓
├── Depois de alterar código?
│   ├── SIM → git diff (ver o que mudou)
│   │         Erro aponta para arquivo específico?
│   │         ├── SIM → Focar nesse arquivo
│   │         └── NÃO → git stash → build → funciona?
│   │                   ├── SIM → Problema no código novo. git stash pop e corrigir.
│   │                   └── NÃO → Problema pré-existente. Ver próximo item.
│   └── NÃO → continuar ↓
├── Projeto retomado depois de pausa?
│   ├── SIM → Limpar cache e rebuild:
│   │         Flutter: flutter clean && flutter pub get
│   │         Node: rm -rf node_modules .next && npm install
│   │         Testar build novamente.
│   └── NÃO → continuar ↓
└── Nenhum dos acima?
    → Verificar:
    1. Versão do SDK/runtime mudou? (node -v, flutter --version)
    2. Variáveis de ambiente (.env.local existe? tem valores?)
    3. Serviços externos online? (Supabase, Firebase)
    4. Espaço em disco
```

### Comandos de Diagnóstico Rápido — Build

```bash
# Flutter
flutter doctor
flutter clean && flutter pub get
flutter analyze
flutter build apk --debug 2>&1 | tail -30

# Node/Next.js
node -v && npm -v
rm -rf node_modules .next
npm install
npm run build 2>&1 | tail -30

# Verificar .env.local
cat .env.local | head -5  # SÓ as primeiras linhas (sem expor secrets)
test -f .env.local && echo "✅ .env.local existe" || echo "❌ .env.local NÃO EXISTE"
```

---

## Árvore 2: Funcionalidade Parou de Funcionar

```
Feature X não funciona mais
├── Mudou algo no código dessa feature?
│   ├── SIM → git log --oneline -10 (ver commits recentes)
│   │         git diff HEAD~3 -- [arquivo da feature]
│   │         Identificar o que mudou e reverter se necessário.
│   └── NÃO → continuar ↓
├── A feature depende de banco de dados?
│   ├── SIM → Verificar conexão e dados:
│   │         1. Tabela existe? (verificar no Supabase Dashboard)
│   │         2. Dados existem? (SELECT COUNT(*) FROM tabela)
│   │         3. RLS está bloqueando? (testar sem RLS temporariamente)
│   │         4. Coluna foi renomeada? (verificar schema atual)
│   └── NÃO → continuar ↓
├── A feature depende de API externa?
│   ├── SIM → Testar API isoladamente (curl/Postman)
│   │         Verificar se API key ainda é válida
│   │         Verificar se URL da API mudou
│   └── NÃO → continuar ↓
├── A feature depende de auth/sessão?
│   ├── SIM → Limpar sessão/cookies e testar novamente
│   │         Verificar se token expirou
│   │         Verificar se provider (Google, etc.) está configurado
│   └── NÃO → continuar ↓
└── Nenhum dos acima?
    → Verificar console do browser (F12) ou logs do app
    → Procurar erro exato e pesquisar
```

### Comandos de Diagnóstico Rápido — Feature

```bash
# Verificar se a tabela existe e tem dados
# (rodar no SQL Editor do Supabase ou via MCP)

# Verificar referências no código
grep -rn "nome_da_feature\|nome_da_tabela" --include="*.ts" --include="*.tsx" --include="*.dart" .

# Verificar se há erros no console (Next.js dev)
npm run dev 2>&1 | grep -i "error\|warn"

# Git: quando foi a última vez que esse arquivo mudou?
git log --oneline -5 -- [caminho/do/arquivo]
```

---

## Árvore 3: Dados Sumiram ou Não Aparecem

```
Dados não aparecem na UI
├── Dados existem no banco?
│   ├── NÃO → Foram deletados? Verificar:
│   │         - Alguém rodou DELETE/TRUNCATE?
│   │         - Migration recente afetou a tabela?
│   │         - Projeto Supabase correto? (dev vs prod)
│   │         → Se deletados: restaurar do backup ou recriar
│   └── SIM → Continuar ↓
├── Código está buscando da tabela/coluna certa?
│   ├── NÃO → Renomeou tabela/coluna mas não atualizou código?
│   │         grep -rn "nome_antigo" → atualizar referências
│   └── SIM → Continuar ↓
├── RLS está bloqueando?
│   ├── TALVEZ → Testar query no SQL Editor como service_role
│   │           Se retorna dados → RLS policy está bloqueando
│   │           Verificar policy: auth.uid() matches user_id?
│   └── NÃO → Continuar ↓
├── Filtro na query está excluindo?
│   ├── SIM → Verificar WHERE clauses, .eq(), .filter()
│   └── NÃO → Continuar ↓
└── Dados chegam no código mas não renderizam?
    → Verificar: console.log dos dados recebidos
    → Verificar: componente certo está sendo renderizado?
    → Verificar: chave do objeto mudou? (data.name vs data.nome)
```

### Comandos de Diagnóstico Rápido — Dados

```sql
-- No SQL Editor do Supabase:

-- 1. Tabela existe?
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;

-- 2. Quantos registros?
SELECT COUNT(*) FROM nome_da_tabela;

-- 3. Schema atual da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'nome_da_tabela'
ORDER BY ordinal_position;

-- 4. RLS policies ativas
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'nome_da_tabela';

-- 5. Dados mais recentes
SELECT * FROM nome_da_tabela ORDER BY created_at DESC LIMIT 5;
```

---

## Árvore 4: Projeto Retomado Após Pausa

```
Projeto parado há dias/semanas
├── 1. Compila?
│   ├── NÃO → Limpar cache:
│   │         Flutter: flutter clean && flutter pub get
│   │         Node: rm -rf node_modules .next && npm install
│   │         Tentar build novamente
│   └── SIM → Continuar ↓
├── 2. Git está limpo?
│   ├── NÃO → git status → resolver:
│   │         - Commitar se é trabalho válido
│   │         - git stash se quer guardar para depois
│   │         - git checkout -- . se quer descartar
│   └── SIM → Continuar ↓
├── 3. Dependências atualizadas?
│   ├── VERIFICAR → npm outdated / flutter pub outdated
│   │              Se muitas desatualizadas → rodar skill dependency-update
│   └── OK → Continuar ↓
├── 4. Serviços externos funcionando?
│   ├── VERIFICAR → Supabase Dashboard acessível?
│   │              Projeto não foi pausado/deletado?
│   │              Keep-alive workflows ativos?
│   └── OK → Continuar ↓
├── 5. .env.local intacto?
│   ├── VERIFICAR → Arquivo existe? Valores preenchidos?
│   └── OK → Continuar ↓
└── 6. Onde paramos?
    → Ler PROJECT_PLAN.md → identificar última task ✅
    → Próxima task ⬜ é o ponto de retomada
```

### Comando de Diagnóstico Completo — Retomada

```bash
echo "=== DIAGNÓSTICO DE RETOMADA ==="

echo "--- 1. Git Status ---"
git branch --show-current
git status --short
git log --oneline -3

echo "--- 2. Build ---"
# Node
npm run build 2>&1 | tail -5
# Flutter
# flutter build apk --debug 2>&1 | tail -5

echo "--- 3. Variáveis de Ambiente ---"
test -f .env.local && echo "✅ .env.local existe" || echo "❌ .env.local FALTANDO"

echo "--- 4. Dependências ---"
# Node
npm outdated 2>/dev/null | head -10
# Flutter
# flutter pub outdated 2>/dev/null | head -10

echo "--- 5. Última Atividade ---"
git log --oneline -1 --format="Último commit: %ar — %s"

echo "=== FIM DO DIAGNÓSTICO ==="
```

---

## Árvore 5: Erro de Conexão com Banco

```
Erro de conexão / timeout / auth
├── URL do Supabase correta?
│   → Verificar .env.local: SUPABASE_URL
│   → Comparar com Dashboard → Project Settings → API
├── Anon Key correta?
│   → Verificar .env.local: SUPABASE_ANON_KEY
│   → Comparar com Dashboard → Project Settings → API
├── Projeto Supabase ativo?
│   → Dashboard acessível? Projeto pausado?
│   → Free tier: projetos pausam após 7 dias sem uso
│   → Solução: restaurar no Dashboard ou ativar keep-alive
├── RLS bloqueando tudo?
│   → Tabela tem policies? Se não → tudo bloqueado por padrão
│   → Testar como service_role para confirmar
└── Network issue?
    → Testar: curl https://SEU_PROJECT.supabase.co/rest/v1/
    → Se falha: problema de rede/firewall
```

---

## Reconciliação Rápida (UI × Código × Banco)

Quando algo "deveria funcionar mas não funciona", rodar esta verificação:

```bash
echo "=== RECONCILIAÇÃO RÁPIDA ==="

echo "--- O que a UI mostra ---"
# Listar componentes/páginas que renderizam a feature
grep -rn "nome_da_feature" --include="*.tsx" --include="*.dart" -l .

echo "--- O que o código referencia ---"
# Listar tabelas/colunas que o código usa
grep -rn "from('nome_tabela')\|\.from.*nome_tabela" --include="*.ts" --include="*.tsx" --include="*.dart" .

echo "--- O que existe no banco ---"
# Verificar no Supabase Dashboard ou via MCP:
# SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
echo "(verificar manualmente no Supabase Dashboard)"

echo "=== Se as 3 respostas não batem, encontrou o problema ==="
```

---

## Protocolo de Comunicação ao Tiago

Ao encontrar qualquer problema, reportar neste formato:

```markdown
## 🚨 Problema Encontrado

**O que aconteceu:** [descrição simples]
**Onde:** [arquivo/tabela/feature afetada]
**Erro exato:** [mensagem de erro, se houver]
**Causa provável:** [o que você acha que causou]

### Opções:

1. **[Opção A]** — [descrição] | Risco: 🟢 | Esforço: [baixo/médio/alto]
2. **[Opção B]** — [descrição] | Risco: 🟡 | Esforço: [baixo/médio/alto]

**Recomendação:** Opção [X] porque [motivo].
**Aguardando sua aprovação para prosseguir.**
```

## Notas

- Este skill é um guia de DIAGNÓSTICO — não de implementação
- Sempre diagnosticar ANTES de tentar consertar
- Se o problema é complexo, pode virar uma task no PROJECT_PLAN.md
- Combina bem com o skill `project-audit` para diagnósticos mais profundos
