---
name: database-migration
description: Processo seguro para alterações de schema no banco de dados. Usar ao renomear colunas, adicionar/remover campos, criar/alterar tabelas, migrar dados, ou qualquer alteração estrutural no banco. Complementa o supabase-setup (que cobre criação inicial).
allowed-tools: Bash, Read, Write
---

# Database Migration — Alterações Seguras no Banco

## Quando Usar

- Renomear colunas ou tabelas
- Adicionar/remover campos
- Alterar tipos de dados
- Migrar dados entre colunas/tabelas
- Adicionar constraints, índices, ou triggers
- Qualquer ALTER TABLE / DROP / RENAME

## Regras Importantes

1. **NUNCA alterar banco de produção sem testar antes**
2. **SEMPRE ter SQL de rollback pronto ANTES de executar**
3. **SEMPRE fazer backup dos dados afetados antes de alterar**
4. **NUNCA executar migration sem aprovação do Tiago**
5. **SEMPRE atualizar Estado do Banco no CLAUDE.md e PROJECT_PLAN.md após executar**

## Processo

### Passo 1: Planejar a Migration

Antes de escrever qualquer SQL, documentar:

```markdown
## Migration: [nome descritivo]

**Data:** [data]
**Motivo:** [por que essa alteração é necessária]
**Tabelas afetadas:** [lista]
**Risco:** 🟢 Baixo | 🟡 Médio | 🔴 Alto

### O que muda:

- [ex: Coluna annual_rate renomeada para monthly_rate]
- [ex: Novo campo description adicionado à tabela X]

### Dados existentes:

- [ex: 2 registros na tabela interest_config serão afetados]
- [ex: Valores serão preservados, apenas o nome muda]
```

### Passo 2: Backup dos Dados Afetados

```sql
-- Verificar dados atuais ANTES de alterar
SELECT * FROM tabela_afetada;

-- Se possível, criar tabela de backup
CREATE TABLE tabela_afetada_backup_YYYYMMDD AS
SELECT * FROM tabela_afetada;
```

Para migrations simples (rename de coluna, adicionar campo nullable):

- Print/export dos dados atuais é suficiente

Para migrations complexas (migrar dados, alterar tipos):

- Backup obrigatório da tabela inteira

### Passo 3: Escrever o SQL de Migration

```sql
-- ============================================
-- MIGRATION: [nome descritivo]
-- Data: [data]
-- Projeto: [nome do projeto]
-- ============================================

-- DESCRIÇÃO: [o que esta migration faz]

BEGIN;

-- [SQL da alteração aqui]
-- Exemplos comuns:

-- Renomear coluna
ALTER TABLE tabela RENAME COLUMN nome_antigo TO nome_novo;

-- Adicionar coluna
ALTER TABLE tabela ADD COLUMN nova_coluna TIPO DEFAULT valor;

-- Remover coluna (CUIDADO)
ALTER TABLE tabela DROP COLUMN coluna_removida;

-- Alterar tipo
ALTER TABLE tabela ALTER COLUMN coluna TYPE novo_tipo USING coluna::novo_tipo;

-- Adicionar constraint
ALTER TABLE tabela ADD CONSTRAINT nome_constraint CHECK (condição);

-- Atualizar dados
UPDATE tabela SET coluna = novo_valor WHERE condição;

COMMIT;
```

### Passo 4: Escrever o SQL de Rollback

```sql
-- ============================================
-- ROLLBACK: [nome descritivo]
-- Usar APENAS se a migration der problema
-- ============================================

BEGIN;

-- [SQL reverso aqui]
-- Ex: ALTER TABLE tabela RENAME COLUMN nome_novo TO nome_antigo;

COMMIT;
```

### Passo 5: Validação Pré-Migration

Antes de executar, verificar:

```sql
-- Quantos registros serão afetados?
SELECT COUNT(*) FROM tabela_afetada;

-- Existem constraints que podem bloquear?
SELECT conname, contype, conrelid::regclass
FROM pg_constraint
WHERE conrelid = 'tabela_afetada'::regclass;

-- Existem views ou functions que referenciam a coluna?
SELECT routine_name FROM information_schema.routines
WHERE routine_definition LIKE '%nome_coluna%';
```

### Passo 6: Executar a Migration

**Opção A — Supabase Studio (recomendado para projetos pequenos):**

1. Abrir Supabase Dashboard → SQL Editor
2. Colar o SQL de migration
3. Executar
4. Verificar resultado

**Opção B — Arquivo de migration (recomendado para projetos maiores):**

1. Salvar como `supabase/migrations/XXX_nome_descritivo.sql`
2. Executar via CLI ou SQL Editor
3. Commitar o arquivo

### Passo 7: Validação Pós-Migration

```sql
-- Verificar que a estrutura mudou
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'tabela_afetada'
ORDER BY ordinal_position;

-- Verificar que os dados estão corretos
SELECT * FROM tabela_afetada LIMIT 10;

-- Verificar contagem (deve ser igual ao pré-migration)
SELECT COUNT(*) FROM tabela_afetada;
```

### Passo 8: Atualizar Código

Após migration executada com sucesso:

```bash
# Buscar TODAS as referências ao nome antigo no código
grep -rn "nome_antigo" --include="*.ts" --include="*.tsx" --include="*.dart" .

# Atualizar cada referência para o nome novo
# Testar compilação
npm run build  # ou flutter build

# Testar funcionalidade afetada
```

### Passo 9: Atualizar Documentação

Atualizar obrigatoriamente:

1. **CLAUDE.md → Estado do Banco** (tabelas, colunas, última alteração)
2. **PROJECT_PLAN.md → Estado do Banco** (mesma info)
3. **migrations.sql** (adicionar a nova migration ao histórico)

### Passo 10: Commit

```bash
git add .
# → Secret scan
git commit -m "feat: migration - [descrição curta]

Migration: [nome]
Tabelas afetadas: [lista]
Rollback disponível: sim"
git push
```

## Classificação de Risco

| Operação                   | Risco    | Cuidados                                 |
| -------------------------- | -------- | ---------------------------------------- |
| Adicionar coluna nullable  | 🟢 Baixo | Sem impacto em dados existentes          |
| Renomear coluna            | 🟡 Médio | Atualizar TODAS as referências no código |
| Adicionar constraint       | 🟡 Médio | Verificar se dados existentes atendem    |
| Alterar tipo de coluna     | 🟡 Médio | Verificar compatibilidade de dados       |
| Remover coluna             | 🔴 Alto  | Dados perdidos permanentemente           |
| Remover tabela             | 🔴 Alto  | Backup obrigatório                       |
| Migrar dados entre tabelas | 🔴 Alto  | Testar com subset antes                  |

## Checklist Rápido

```
[ ] Migration planejada e documentada
[ ] Backup dos dados afetados feito
[ ] SQL de migration escrito
[ ] SQL de rollback escrito
[ ] Validação pré-migration executada
[ ] Migration executada com sucesso
[ ] Validação pós-migration OK (estrutura + dados + contagem)
[ ] Código atualizado (grep + replace + build)
[ ] Funcionalidade testada no app
[ ] CLAUDE.md → Estado do Banco atualizado
[ ] PROJECT_PLAN.md → Estado do Banco atualizado
[ ] migrations.sql atualizado
[ ] Commit feito com descrição da migration
```

## Script de Validação (Template)

Salvar como `scripts/validate-migration.js` (ou `.py`) e adaptar:

```javascript
// Template — adaptar para cada migration
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function validate() {
  console.log('=== VALIDAÇÃO PÓS-MIGRATION ===\n');

  // 1. Verificar que coluna/tabela existe
  const { data, error } = await supabase
    .from('tabela_afetada')
    .select('*')
    .limit(5);

  if (error) {
    console.log('❌ ERRO:', error.message);
    return;
  }

  console.log(`✅ Tabela acessível — ${data.length} registros retornados`);
  console.log('Dados:', JSON.stringify(data, null, 2));

  // 2. Verificar valores específicos
  // [adaptar conforme a migration]
}

validate();
```

## Notas

- Este skill complementa o `supabase-setup` (que cobre criação inicial de tabelas)
- Para criar tabelas novas, usar `supabase-setup`
- Para alterar tabelas existentes, usar este skill
- Migrations complexas podem virar uma task dedicada no PROJECT_PLAN.md
