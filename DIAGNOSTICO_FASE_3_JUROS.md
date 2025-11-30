# 💰 DIAGNÓSTICO COMPLETO - FASE 3: SISTEMA DE JUROS AUTOMÁTICO

**Data:** 2025-11-30
**Status:** Sistema parcialmente implementado (backend pronto, UI faltando)

---

## 📊 1. ESTADO ATUAL DO SUPABASE

### Tabela: `interest_config`

**Status:** ✅ Tabela EXISTE no Supabase

**Configurações cadastradas:** 0 (VAZIA)

**Schema da tabela:**

```sql
CREATE TABLE IF NOT EXISTS interest_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL UNIQUE,
  monthly_rate DECIMAL(5,4) DEFAULT 0.01,    -- 1% mensal (padrão educativo)
  annual_rate DECIMAL(5,4) DEFAULT 0.01,     -- DEPRECATED (usar monthly_rate)
  compound_frequency VARCHAR(20) DEFAULT 'monthly',  -- 'daily', 'weekly', 'monthly'
  minimum_balance DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  last_interest_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Crianças cadastradas:

| Nome    | Child ID    | Saldo    | Total Ganho | Total Gasto | Config Juros |
| ------- | ----------- | -------- | ----------- | ----------- | ------------ |
| Gabriel | 3a4fb20b... | R$ 16,00 | R$ 22,00    | R$ 6,00     | ❌ Não       |
| Rafael  | 317b190a... | R$ 18,00 | R$ 75,00    | R$ 57,00    | ❌ Não       |

### Transações de Juros:

**Total:** 0
**Status:** ❌ Nenhuma transação de juros foi aplicada ainda

---

## 🏗️ 2. ANÁLISE DE CÓDIGO EXISTENTE

### ✅ BACKEND (Implementado)

#### Interface TypeScript (`src/lib/supabase.ts:105-114`)

```typescript
export interface InterestConfig {
  id: string;
  child_id: string;
  annual_rate: number;
  compound_frequency: 'daily' | 'weekly' | 'monthly';
  minimum_balance: number;
  is_active: boolean;
  last_interest_date: string;
  created_at: string;
}
```

#### Serviço de Cálculo (`src/lib/services/transactions.ts:359`)

```typescript
static async calculateInterest(childId: string): Promise<Transaction | null> {
  // 1. Busca configuração de interest_config
  // 2. Verifica saldo mínimo
  // 3. Calcula juros sobre transações com 30+ dias
  // 4. Aplica 1% mensal
  // 5. Cria transação do tipo 'interest'
  // 6. Atualiza last_interest_date
}
```

**Lógica de cálculo:**

- Taxa padrão: **1% ao mês** (educativa)
- Aplica juros sobre saldo com **30+ dias** (para ensinar paciência)
- Saldo mínimo configurável
- Ignora valores < R$ 0,01

#### API Cron (`pages-backup/api/cron/apply-interest.ts`)

```typescript
POST /api/cron/apply-interest
Authorization: Bearer {CRON_SECRET}

// Lógica:
1. Busca todas as famílias
2. Para cada criança, chama TransactionService.calculateInterest()
3. Aplica juros se saldo >= minimum_balance
4. Retorna resumo completo
```

**⚠️ NOTA:** Arquivo está em `pages-backup/` (desativado)

### ❌ FRONTEND (Não Implementado)

**Arquivos encontrados com "interest/juros":**

- ✅ `src/lib/supabase.ts` - Interface TypeScript
- ✅ `src/lib/services/transactions.ts` - Lógica de cálculo
- ✅ `pages-backup/api/cron/apply-interest.ts` - Cron job
- ❌ Nenhuma UI/Modal para configurar juros
- ❌ Nenhum dashboard de rendimentos
- ❌ Nenhuma página de histórico

---

## 🔍 3. GAP ANALYSIS

### ✅ O QUE JÁ EXISTE

| Item                                | Status | Localização                               |
| ----------------------------------- | ------ | ----------------------------------------- |
| Tabela `interest_config`            | ✅     | Supabase (vazia)                          |
| Interface TypeScript                | ✅     | `src/lib/supabase.ts:105-114`             |
| Método `calculateInterest()`        | ✅     | `src/lib/services/transactions.ts:359`    |
| Tipo de transação `interest`        | ✅     | Definido no schema                        |
| API Cron para aplicação automática  | ✅     | `pages-backup/api/cron/apply-interest.ts` |
| Lógica de saldo com 30+ dias        | ✅     | Implementada no TransactionService        |
| Proteção de saldo mínimo            | ✅     | `minimum_balance` na configuração         |
| Taxa educativa padrão (1% mensal)   | ✅     | Hardcoded no schema                       |
| Atualização de `last_interest_date` | ✅     | Implementada ao aplicar juros             |
| Validação de valor mínimo (R$ 0,01) | ✅     | Implementada                              |

### ❌ O QUE FALTA IMPLEMENTAR

| Item                                         | Prioridade | Tempo Estimado |
| -------------------------------------------- | ---------- | -------------- |
| Configurações iniciais para Rafael e Gabriel | 🔴 Alta    | 15 min         |
| UI para pais configurarem taxa de juros      | 🔴 Alta    | 2-3h           |
| Dashboard de histórico de rendimentos        | 🟡 Média   | 2-3h           |
| Ativar Cron job (mover de pages-backup)      | 🟡 Média   | 1h             |
| Gráfico de evolução de saldo                 | 🟢 Baixa   | 2-3h           |
| Projeções futuras de rendimento              | 🟢 Baixa   | 1-2h           |
| Notificações quando juros forem aplicados    | 🟢 Baixa   | 1h             |
| Configuração automática ao criar criança     | 🟡 Média   | 30 min         |

---

## 🎯 4. PLANO DE AÇÃO RECOMENDADO

### FASE 3.1 - Setup Inicial (15-30 min) 🔴 URGENTE

**Objetivo:** Criar configurações padrão para as crianças existentes

**Tarefas:**

1. ✅ Diagnóstico completo (FEITO)
2. ⬜ Criar configuração padrão para Rafael:

   ```sql
   INSERT INTO interest_config (child_id, monthly_rate, compound_frequency, minimum_balance, is_active)
   VALUES (
     '317b190a-5e93-42ed-a923-c8769bcec196',  -- Rafael
     0.01,                                     -- 1% ao mês
     'monthly',                                -- Mensal
     10,                                       -- R$ 10 mínimo
     true                                      -- Ativo
   );
   ```

3. ⬜ Criar configuração padrão para Gabriel:

   ```sql
   INSERT INTO interest_config (child_id, monthly_rate, compound_frequency, minimum_balance, is_active)
   VALUES (
     '3a4fb20b-f56e-43b9-a194-c9cf37f0ac6b',  -- Gabriel
     0.01,                                     -- 1% ao mês
     'monthly',                                -- Mensal
     10,                                       -- R$ 10 mínimo
     true                                      -- Ativo
   );
   ```

4. ⬜ Testar `TransactionService.calculateInterest()` manualmente:

   ```bash
   # Criar API de teste temporária
   POST /api/test-interest
   { "child_id": "317b190a-5e93-42ed-a923-c8769bcec196" }
   ```

**Resultado esperado:**

- ✅ Rafael e Gabriel com configuração ativa
- ✅ Taxa de 1% ao mês
- ✅ Saldo mínimo R$ 10

---

### FASE 3.2 - Interface de Configuração (2-3h) 🟡

**Objetivo:** Permitir que Tiago configure juros via dashboard

**Tarefas:**

1. ⬜ Criar `components/InterestConfigModal.tsx`:
   - Input para taxa mensal (% ao mês)
   - Select para frequência (mensal recomendado)
   - Input para saldo mínimo
   - Toggle ativo/inativo
   - Preview do rendimento estimado
2. ⬜ Criar `src/lib/services/interestService.ts`:
   - `getConfig(childId)` - Buscar configuração
   - `updateConfig(childId, config)` - Atualizar taxa
   - `calculateEstimatedInterest(balance, rate)` - Preview
3. ⬜ Adicionar botão no dashboard parental:
   - "⚙️ Configurar Juros" nos cards das crianças
   - Abre modal com configuração individual
4. ⬜ Validações:
   - Taxa entre 0% e 5% ao mês (educativa)
   - Saldo mínimo >= R$ 0
   - Só pais podem alterar

**Wireframe da UI:**

```
┌─────────────────────────────────────────┐
│  ⚙️ Configurar Juros - Rafael           │
├─────────────────────────────────────────┤
│                                         │
│  Taxa de Juros:                         │
│  ┌─────────┐ % ao mês                   │
│  │  1.00   │ (padrão: 1%)               │
│  └─────────┘                             │
│  📊 Sobre R$ 18,00 = R$ 0,18/mês        │
│                                         │
│  Saldo Mínimo:                          │
│  ┌─────────┐                             │
│  │ R$ 10,00│                             │
│  └─────────┘                             │
│                                         │
│  Frequência:                            │
│  ● Mensal  ○ Semanal  ○ Diário          │
│                                         │
│  [ ] Ativo                              │
│                                         │
│  [Cancelar]  [Salvar Configuração]     │
└─────────────────────────────────────────┘
```

---

### FASE 3.3 - Automação (1h) 🟡

**Objetivo:** Ativar aplicação automática de juros

**Tarefas:**

1. ⬜ Mover `pages-backup/api/cron/apply-interest.ts` para `pages/api/cron/`:

   ```bash
   mv pages-backup/api/cron/apply-interest.ts pages/api/cron/
   ```

2. ⬜ Configurar variável `CRON_SECRET` no Vercel
3. ⬜ Criar configuração Vercel Cron (`vercel.json`):

   ```json
   {
     "crons": [
       {
         "path": "/api/cron/apply-interest",
         "schedule": "0 0 1 * *"
       }
     ]
   }
   ```

   - Executa todo dia 1º do mês às 00:00 UTC

4. ⬜ Adicionar logs no Supabase para auditoria
5. ⬜ Criar notificação quando juros forem aplicados

**Teste manual:**

```bash
curl -X POST http://localhost:3000/api/cron/apply-interest \
  -H "Authorization: Bearer dev-cron-secret-123"
```

---

### FASE 3.4 - Dashboard de Rendimentos (2-3h) 🟢

**Objetivo:** Visualizar histórico e projeções

**Tarefas:**

1. ⬜ Criar `components/InterestHistoryModal.tsx`:
   - Tabela de transações de juros
   - Filtro por período
   - Total rendido no mês/ano
2. ⬜ Criar gráfico de evolução:
   - Eixo X: meses
   - Eixo Y: saldo + rendimento acumulado
   - Linha de projeção futura
3. ⬜ Mostrar métricas no dashboard:
   - "💰 Rendimento este mês: R$ X,XX"
   - "📈 Total rendido: R$ X,XX"
   - "🎯 Projeção próximo mês: R$ X,XX"

---

## 📝 5. CÓDIGO DE EXEMPLO

### Script para Criar Configurações Iniciais

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupInitialInterestConfigs() {
  const configs = [
    {
      child_id: '317b190a-5e93-42ed-a923-c8769bcec196', // Rafael
      monthly_rate: 0.01, // 1% ao mês
      compound_frequency: 'monthly',
      minimum_balance: 10,
      is_active: true,
    },
    {
      child_id: '3a4fb20b-f56e-43b9-a194-c9cf37f0ac6b', // Gabriel
      monthly_rate: 0.01, // 1% ao mês
      compound_frequency: 'monthly',
      minimum_balance: 10,
      is_active: true,
    },
  ];

  for (const config of configs) {
    const { data, error } = await supabase
      .from('interest_config')
      .insert([config])
      .select();

    if (error) {
      console.error('❌ Erro:', error);
    } else {
      console.log('✅ Configuração criada:', data[0]);
    }
  }
}

setupInitialInterestConfigs();
```

### Componente InterestConfigModal (Esboço)

```typescript
import { useState } from 'react';
import { InterestConfig } from '@/lib/supabase';

interface Props {
  childId: string;
  childName: string;
  currentBalance: number;
  isOpen: boolean;
  onClose: () => void;
}

export function InterestConfigModal({ childId, childName, currentBalance, isOpen, onClose }: Props) {
  const [rate, setRate] = useState(1.0); // % ao mês
  const [minimumBalance, setMinimumBalance] = useState(10);
  const [frequency, setFrequency] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [isActive, setIsActive] = useState(true);

  const estimatedInterest = (currentBalance * (rate / 100)).toFixed(2);

  const handleSave = async () => {
    // Salvar no Supabase via interestService
    const config = {
      child_id: childId,
      monthly_rate: rate / 100,
      compound_frequency: frequency,
      minimum_balance: minimumBalance,
      is_active: isActive,
    };

    // await InterestService.updateConfig(childId, config);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <h2>⚙️ Configurar Juros - {childName}</h2>

      <div>
        <label>Taxa de Juros (% ao mês)</label>
        <input type="number" value={rate} onChange={e => setRate(parseFloat(e.target.value))} step="0.1" min="0" max="5" />
        <p>📊 Sobre R$ {currentBalance.toFixed(2)} = R$ {estimatedInterest}/mês</p>
      </div>

      <div>
        <label>Saldo Mínimo</label>
        <input type="number" value={minimumBalance} onChange={e => setMinimumBalance(parseFloat(e.target.value))} />
      </div>

      <div>
        <label>Frequência</label>
        <select value={frequency} onChange={e => setFrequency(e.target.value as any)}>
          <option value="monthly">Mensal</option>
          <option value="weekly">Semanal</option>
          <option value="daily">Diário</option>
        </select>
      </div>

      <div>
        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
        <label>Ativo</label>
      </div>

      <button onClick={onClose}>Cancelar</button>
      <button onClick={handleSave}>Salvar Configuração</button>
    </div>
  );
}
```

---

## 🔧 6. SCRIPTS DE DIAGNÓSTICO

### Criados nesta sessão:

- `scripts/diagnose-interest.js` - Diagnóstico completo do sistema

### Executar diagnóstico:

```bash
NEXT_PUBLIC_SUPABASE_URL=... \
NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
node scripts/diagnose-interest.js
```

---

## 📚 7. REFERÊNCIAS

**Arquivos relevantes:**

- `src/lib/supabase.ts:105-114` - Interface InterestConfig
- `src/lib/services/transactions.ts:359` - Método calculateInterest()
- `pages-backup/api/cron/apply-interest.ts` - API Cron (desativada)
- `database/transactions-schema.sql` - Schema da tabela interest_config

**Supabase:**

- URL: https://mqcfdwyhbtvaclslured.supabase.co
- Tabela: `interest_config` (vazia)
- Crianças: Rafael e Gabriel (sem configuração)

---

## ✅ 8. CONCLUSÃO

### Estado Atual:

- ✅ Backend 90% implementado
- ✅ Tabela interest_config existe
- ✅ Lógica de cálculo pronta
- ✅ API Cron implementada (mas desativada)
- ❌ Nenhuma configuração de juros ativa
- ❌ Frontend 0% implementado

### Próximo Passo Imediato:

**Implementar FASE 3.1** - Criar configurações padrão para Rafael e Gabriel

**Impacto esperado:**

- Crianças terão juros de 1% ao mês
- Saldo renderá automaticamente (quando cron for ativado)
- Base preparada para UI de configuração

**Tempo estimado:** 15-30 minutos

---

**Data:** 2025-11-30
**Aguardando:** Decisão de Tiago para iniciar FASE 3.1
