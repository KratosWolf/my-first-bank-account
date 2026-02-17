# FASE 3.1 - PROBLEMA DE SCHEMA DETECTADO

## 🔴 Problema Identificado

A tabela `interest_config` no Supabase foi criada com tipos de dados **INCORRETOS**:

```
annual_rate:      NUMERIC(2,1)  ❌ (aceita apenas 0.0 até 9.9)
minimum_balance:  NUMERIC(2,1)  ❌ (aceita apenas 0.0 até 9.9)
```

**Impacto:**

- ❌ Não é possível configurar taxa de 12% ao ano (valor ideal)
- ❌ Não é possível configurar saldo mínimo de R$ 10.00
- ❌ Setup inicial falhou com erro "numeric field overflow"

## ✅ Solução

### Passo 1: Executar Migração SQL no Supabase

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecione o projeto **MyFirstBA2**
3. Vá em **SQL Editor** (menu lateral esquerdo)
4. Cole o SQL abaixo:

```sql
-- Corrigir tipos de dados da tabela interest_config
ALTER TABLE interest_config
  ALTER COLUMN annual_rate TYPE NUMERIC(5,2);

ALTER TABLE interest_config
  ALTER COLUMN minimum_balance TYPE NUMERIC(10,2);
```

5. Clique em **Run** (ou pressione Cmd+Enter)

**Resultado esperado:**

```
Success. No rows returned
```

### Passo 2: Verificar Migração

Execute este SQL para confirmar:

```sql
SELECT
  column_name,
  data_type,
  numeric_precision,
  numeric_scale
FROM information_schema.columns
WHERE table_name = 'interest_config'
  AND column_name IN ('annual_rate', 'minimum_balance');
```

**Resultado esperado:**

```
column_name       | data_type | numeric_precision | numeric_scale
------------------|-----------|-------------------|---------------
annual_rate       | numeric   | 5                 | 2
minimum_balance   | numeric   | 10                | 2
```

### Passo 3: Executar Setup Novamente

Depois que a migração for aplicada, execute:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://mqcfdwyhbtvaclslured.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xY2Zkd3loYnR2YWNsc2x1cmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNDUzMjcsImV4cCI6MjA3MDkyMTMyN30.lpiqxTq-V18FhRSDd0V4xV4GvsTMVlU-GrHdvtzjQ4U \
node scripts/setup-interest.js
```

**Resultado esperado:**

```
✅ Gabriel: Configuração criada com sucesso
   Taxa: 12% ao ano
   Frequência: monthly

✅ Rafael: Configuração criada com sucesso
   Taxa: 12% ao ano
   Frequência: monthly
```

## 📊 Detalhes Técnicos

### Testes Realizados

| Teste | annual_rate | minimum_balance | Resultado |
| ----- | ----------- | --------------- | --------- |
| 1     | 1.0         | 1.0             | ✅ Passou |
| 2     | 5.0         | 5.0             | ✅ Passou |
| 3     | 9.0         | 9.0             | ✅ Passou |
| 4     | 10.0        | 10.0            | ❌ Falhou |
| 5     | 12.0        | 10.0            | ❌ Falhou |
| 6     | 9.9         | 10.0            | ✅ Passou |

**Conclusão:** Coluna aceita apenas valores de 0.0 a 9.9 (NUMERIC(2,1))

### Arquivos Criados

```
database/migrations/
└── 003_fix_interest_config_columns.sql  (Migração SQL completa)

scripts/
├── check-interest-schema.js              (Diagnóstico de schema)
├── test-interest-values.js               (Teste de limites)
└── setup-interest.js                     (Setup inicial - já existente)
```

## 🎯 Próximos Passos

Depois que a migração for aplicada e o setup executado:

### FASE 3.1 ✅ (Concluída)

- [x] Diagnosticar sistema de juros
- [x] Identificar problema de schema
- [x] Criar migração para corrigir
- [ ] **PENDENTE:** Aplicar migração no Supabase
- [ ] **PENDENTE:** Criar configurações para Rafael e Gabriel

### FASE 3.2 (Próxima)

- [ ] Criar modal para pais configurarem juros
- [ ] Permitir editar taxa, frequência, saldo mínimo
- [ ] Mostrar preview de rendimento estimado

### FASE 3.3 (Automação)

- [ ] Mover API cron de pages-backup/ para pages/api/
- [ ] Configurar Vercel Cron
- [ ] Testar aplicação automática

---

**Data:** 2025-11-30
**Status:** 🟡 Aguardando execução da migração SQL no Supabase
**Responsável:** Tiago Fernandes
