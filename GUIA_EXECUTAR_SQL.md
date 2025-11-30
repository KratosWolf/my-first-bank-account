# 🔧 GUIA: Executar SQL no Supabase Dashboard

## PASSO 1: Acessar Supabase Dashboard

1. Abra seu navegador
2. Acesse: https://supabase.com/dashboard
3. Faça login com sua conta
4. Selecione o projeto: **mqcfdwyhbtvaclslured**

## PASSO 2: Abrir SQL Editor

1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique no botão **"+ New query"**

## PASSO 3: Executar o SQL

Copie e cole este SQL no editor:

```sql
-- FASE 2.5.1: Adicionar coluna color à tabela spending_categories
ALTER TABLE spending_categories
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3B82F6';
```

Clique no botão **"Run"** (ou pressione Ctrl+Enter / Cmd+Enter)

## PASSO 4: Verificar resultado

Você deve ver a mensagem: **"Success. No rows returned"**

Para confirmar que funcionou, execute esta query:

```sql
SELECT id, name, icon, color, monthly_limit, quarterly_limit, enabled
FROM spending_categories
ORDER BY name
LIMIT 5;
```

Você deve ver a coluna `color` com o valor `#3B82F6` (azul padrão)

## PASSO 5: Voltar para o terminal

Depois de executar o SQL, volte ao terminal e informe que está pronto.

Eu vou executar o script para traduzir as categorias para PT-BR automaticamente.

---

## ⚠️ ALTERNATIVA: Se tiver problemas

Se não conseguir acessar o Supabase Dashboard, me avise e podemos tentar outra abordagem.

## ✅ PRÓXIMOS PASSOS (após executar o SQL)

1. ✅ Coluna `color` adicionada
2. 🔄 Executar script para traduzir categorias
3. 🔄 Refatorar CategoriesManager.tsx
4. 🔄 Testar CRUD completo
