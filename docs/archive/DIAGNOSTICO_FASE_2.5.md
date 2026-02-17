# 🔍 DIAGNÓSTICO COMPLETO - FASE 2.5: CATEGORIAS E LIMITES DE GASTO

**Data**: 2025-11-29
**Projeto**: MyFirstBankAccount
**Objetivo**: Implementar sistema de limites de gasto por categoria

---

## 📊 1. ESTADO ATUAL DO SUPABASE

### Tabela: `spending_categories`

**10 categorias cadastradas:**

| #   | Nome                  | Ícone | Limite Mensal | Limite Trimestral | Status |
| --- | --------------------- | ----- | ------------- | ----------------- | ------ |
| 1   | Art & Crafts          | 🎨    | R$ 20         | R$ 60             | Ativa  |
| 2   | Books & Education     | 📚    | R$ 20         | R$ 60             | Ativa  |
| 3   | Charity & Giving      | ❤️    | R$ 20         | R$ 60             | Ativa  |
| 4   | Clothes & Accessories | 👕    | R$ 20         | R$ 60             | Ativa  |
| 5   | Digital & Apps        | 📱    | R$ 20         | R$ 60             | Ativa  |
| 6   | Food & Snacks         | 🍿    | R$ 20         | R$ 60             | Ativa  |
| 7   | Other                 | 🛍️    | R$ 20         | R$ 60             | Ativa  |
| 8   | Savings Transfer      | 💰    | R$ 20         | R$ 60             | Ativa  |
| 9   | Sports & Activities   | ⚽    | R$ 20         | R$ 60             | Ativa  |
| 10  | Toys & Games          | 🧸    | R$ 20         | R$ 60             | Ativa  |

**Schema da tabela:**

```sql
spending_categories (
  id UUID PRIMARY KEY,
  family_id UUID NULL,          -- null = categoria global
  name VARCHAR NOT NULL,
  icon VARCHAR NOT NULL,
  monthly_limit NUMERIC,        -- R$ 20
  quarterly_limit NUMERIC,      -- R$ 60
  enabled BOOLEAN,
  created_at TIMESTAMP
)
```

**✅ Sem duplicatas encontradas**

### Tabela: `children`

**2 crianças cadastradas:**

| Nome    | ID                                   | PIN  | Saldo    |
| ------- | ------------------------------------ | ---- | -------- |
| Gabriel | 3a4fb20b-f56e-43b9-a194-c9cf37f0ac6b | 5678 | R$ 16,00 |
| Rafael  | 317b190a-5e93-42ed-a923-c8769bcec196 | 1234 | R$ 18,00 |

### ❌ Tabela `child_spending_limits`: NÃO EXISTE

---

## 🏗️ 2. ANÁLISE DE ARQUITETURA

### Frontend (localStorage)

**Arquivo**: `components/CategoriesManager.tsx` (387 linhas)

**Interface TypeScript:**

```typescript
interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'spending' | 'dream' | 'both';
  color?: string;
}
```

**⚠️ PROBLEMAS:**

- ❌ Não tem campos de limites (monthly_limit, quarterly_limit)
- ❌ Usa 100% localStorage (chave: 'familyCategories')
- ❌ Não sincroniza com Supabase
- ❌ 10 categorias hardcoded como padrão

**Arquivo**: `src/lib/services/categoriesService.ts` (126 linhas)

**Funcionalidades:**

- `getCategories()` - Busca do localStorage
- `addCategory()` - Adiciona no localStorage
- `updateCategory()` - Atualiza no localStorage
- `deleteCategory()` - Remove do localStorage
- `resetToDefault()` - Restaura 10 categorias padrão

**⚠️ PROBLEMA:** Completamente desconectado do Supabase

### Backend (Supabase)

**Schema REAL (em produção):**

```
spending_categories
├─ id (UUID)
├─ family_id (UUID, nullable)
├─ name (string)
├─ icon (string)
├─ monthly_limit (number)    ← Limite mensal
├─ quarterly_limit (number)  ← Limite trimestral
├─ enabled (boolean)
└─ created_at (timestamp)
```

**Schema dos ARQUIVOS SQL (não aplicado):**

```
spending_categories
├─ id
├─ name
├─ description
├─ icon
├─ color
├─ requires_approval
├─ spending_limit
├─ is_active
└─ created_at

child_spending_limits (NÃO EXISTE)
├─ id
├─ child_id
├─ category_id
├─ daily_limit
├─ weekly_limit
├─ monthly_limit
├─ requires_approval_over
└─ is_active
```

**⚠️ PROBLEMA:** Schema real difere dos arquivos SQL

---

## 🔍 3. GAP ANALYSIS

### Comparação: Frontend vs Backend

| Aspecto             | Frontend (localStorage) | Backend (Supabase)                     | Status                |
| ------------------- | ----------------------- | -------------------------------------- | --------------------- |
| Categorias          | 10 hardcoded            | 10 reais                               | ✅ Mesma quantidade   |
| Nomes               | Português               | Inglês                                 | ⚠️ Idiomas diferentes |
| Limites             | ❌ Não tem              | ✓ monthly + quarterly                  | ❌ Não conectado      |
| Limites por criança | ❌ Não tem              | ❌ Não tem                             | ❌ Não implementado   |
| Persistência        | localStorage            | PostgreSQL                             | ❌ Desconectados      |
| Interface           | Category (type, color)  | Spending_category (family_id, enabled) | ⚠️ Incompatíveis      |

### Principais GAPs:

1. **❌ Frontend não usa Supabase** - Todas as operações em localStorage
2. **❌ Interfaces incompatíveis** - Category vs SpendingCategory
3. **❌ Não há limites personalizados por criança** - Apenas limites globais
4. **❌ Idiomas diferentes** - Frontend PT-BR, Backend EN
5. **❌ Tabela child_spending_limits não existe** - Não há como configurar limites individuais

---

## 🎯 4. OPÇÕES DE IMPLEMENTAÇÃO

### OPÇÃO A: Usar Schema Atual (Simples)

**Descrição:** Conectar frontend ao Supabase mantendo schema atual

**Implementação:**

1. Atualizar interface `Category` para incluir `monthly_limit` e `quarterly_limit`
2. Migrar `CategoriesService` de localStorage para Supabase
3. Aplicar limites globais (mesmos para todas as crianças)
4. Mostrar limites no dashboard parental

**Prós:**

- ✅ Mais simples e rápido
- ✅ Schema já existe no Supabase
- ✅ 10 categorias já cadastradas
- ✅ Sem migrations necessárias

**Contras:**

- ❌ Não permite limites personalizados por criança
- ❌ Menos flexível
- ❌ Rafael e Gabriel terão os mesmos limites

**Tempo estimado:** 2-3 horas

---

### OPÇÃO B: Implementar Schema SQL Completo (Avançado)

**Descrição:** Criar tabela `child_spending_limits` e permitir personalização

**Implementação:**

1. Adicionar campos faltantes em `spending_categories` (color, requires_approval, etc)
2. Criar tabela `child_spending_limits` com daily/weekly/monthly limits
3. Atualizar interfaces TypeScript
4. Criar UI para configurar limites por criança
5. Implementar lógica de validação nas transações

**Prós:**

- ✅ Muito flexível
- ✅ Limites personalizados por criança
- ✅ Limites diários, semanais E mensais
- ✅ Sistema completo e profissional

**Contras:**

- ❌ Mais complexo
- ❌ Requer migrations no Supabase
- ❌ Mais tempo de desenvolvimento
- ❌ UI mais elaborada necessária

**Tempo estimado:** 8-12 horas

---

### OPÇÃO C: Híbrido (RECOMENDADO)

**Descrição:** Limites globais + sobrescritas opcionais

**Implementação:**

1. **FASE 1 (Imediata - 2-3h):**
   - Conectar frontend ao Supabase (limites globais)
   - Usar monthly_limit e quarterly_limit atuais
   - Validar transações contra limites globais

2. **FASE 2 (Futuro - 6-8h):**
   - Criar tabela `child_spending_limits` opcional
   - Se criança tem limite personalizado → usar esse
   - Se não tem → usar limite global da categoria

**Prós:**

- ✅ Funcionalidade imediata (Fase 1)
- ✅ Escalável para o futuro (Fase 2)
- ✅ Backward compatible
- ✅ Equilíbrio complexidade/funcionalidade

**Contras:**

- ⚠️ Requer lógica de fallback (personalizado → global)
- ⚠️ Duas fases de desenvolvimento

**Tempo total:** 3h (Fase 1) + 6-8h (Fase 2 opcional)

---

## 🚀 5. PLANO DE AÇÃO RECOMENDADO

### FASE 2.5.1 - Conexão Básica (IMEDIATO)

**Objetivo:** Conectar CategoriesManager ao Supabase

**Tarefas:**

1. ✅ Diagnóstico completo (FEITO)
2. ⬜ Atualizar interface `Category` em `categoriesService.ts`:

   ```typescript
   interface Category {
     id: string;
     name: string;
     icon: string;
     type: 'spending' | 'dream' | 'both';
     color?: string;
     monthly_limit: number; // NOVO
     quarterly_limit: number; // NOVO
     enabled: boolean; // NOVO (renomear de is_active)
   }
   ```

3. ⬜ Migrar `CategoriesService` para Supabase:
   - `getCategories()` → SELECT \* FROM spending_categories
   - `addCategory()` → INSERT INTO spending_categories
   - `updateCategory()` → UPDATE spending_categories
   - `deleteCategory()` → DELETE FROM spending_categories

4. ⬜ Adicionar campos de limite no `CategoriesManager.tsx`:
   - Input para monthly_limit
   - Input para quarterly_limit
   - Visualização dos limites nas cards

5. ⬜ Sincronizar categorias PT-BR com EN:
   - Decidir se traduz backend para PT-BR
   - OU mantém EN e adiciona campo de tradução

6. ⬜ Testar CRUD completo de categorias via Supabase

**Resultado esperado:**

- ✅ Frontend gerencia categorias do Supabase
- ✅ Pais podem configurar limites mensais/trimestrais
- ✅ Limites aplicam-se a todas as crianças

---

### FASE 2.5.2 - Validação de Limites (POSTERIOR)

**Objetivo:** Validar transações contra limites

**Tarefas:**

1. ⬜ Criar serviço para calcular gastos do mês/trimestre
2. ⬜ Validar antes de aprovar transação
3. ⬜ Mostrar alertas quando limite for atingido
4. ⬜ Dashboard com progresso dos limites

---

### FASE 2.5.3 - Limites Personalizados (FUTURO)

**Objetivo:** Permitir limites diferentes por criança

**Tarefas:**

1. ⬜ Criar migration para `child_spending_limits`
2. ⬜ UI para configurar limites por criança
3. ⬜ Lógica de fallback (personalizado → global)
4. ⬜ Dashboard com limites individuais

---

## 📝 6. DECISÕES NECESSÁRIAS

Antes de iniciar FASE 2.5.1, decidir:

### 1. Idioma das Categorias

- [ ] **Opção A:** Traduzir backend para PT-BR
- [ ] **Opção B:** Manter EN e adicionar campo `name_pt`
- [ ] **Opção C:** Usar EN no sistema todo

### 2. Schema de Limites

- [ ] **Opção A:** Usar apenas limites globais (atual Supabase)
- [ ] **Opção B:** Implementar child_spending_limits (SQL files)
- [x] **Opção C:** Híbrido - começar com global, depois personalizar

### 3. Tipos de Limite

- [ ] **Atual Supabase:** monthly + quarterly
- [ ] **SQL Files:** daily + weekly + monthly
- [ ] **Híbrido:** Todos os tipos disponíveis

---

## 🔧 7. SCRIPTS DE DIAGNÓSTICO CRIADOS

Para executar novamente o diagnóstico:

```bash
# Diagnóstico completo
NEXT_PUBLIC_SUPABASE_URL=https://mqcfdwyhbtvaclslured.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... \
node scripts/full-diagnostic.js

# Verificar schema real
node scripts/check-actual-schema.js

# Categorias e limites
node scripts/diagnose-categories.js
```

**Scripts disponíveis:**

- `scripts/full-diagnostic.js` - Diagnóstico completo
- `scripts/check-actual-schema.js` - Verificação de schema
- `scripts/diagnose-categories.js` - Categorias e limites

---

## 📚 8. REFERÊNCIAS

**Arquivos relevantes:**

- `components/CategoriesManager.tsx` - UI de gestão de categorias
- `src/lib/services/categoriesService.ts` - Lógica de categorias (localStorage)
- `src/lib/supabase.ts` - Interfaces TypeScript
- `database/transactions-schema.sql` - Schema SQL proposto
- `CLAUDE.md` - Documentação do projeto

**Supabase:**

- URL: https://mqcfdwyhbtvaclslured.supabase.co
- Tabelas: `spending_categories`, `children`
- RLS: Ativo (verificar permissões se necessário)

---

## ✅ 9. CONCLUSÃO

### Estado Atual:

- ✅ Supabase tem 10 categorias com limites mensais/trimestrais
- ✅ Frontend tem UI completa de gestão de categorias
- ❌ Frontend e backend estão DESCONECTADOS
- ❌ Não há limites personalizados por criança
- ❌ Não há validação de limites nas transações

### Próximo Passo Imediato:

**Implementar FASE 2.5.1** - Conectar CategoriesManager ao Supabase

**Impacto esperado:**

- Pais poderão configurar limites de gasto por categoria
- Categorias serão persistidas no Supabase (não localStorage)
- Base preparada para validação de limites futura

**Tempo estimado:** 2-3 horas de desenvolvimento

---

**Última atualização:** 2025-11-29
**Status:** Diagnóstico completo ✅
**Aguardando:** Decisão sobre implementação (Opção A/B/C)
