# 📋 TODO - My First Bank Account

## 🔮 PRÓXIMA SESSÃO

### 🎯 MELHORIA PRIORITÁRIA: Sistema de Realização de Sonhos

**Problema Atual:**

- Quando criança completa um sonho (100% do valor guardado), apenas aparece "🎉 Parabéns!"
- O dinheiro já foi descontado gradualmente nas contribuições
- **Pais NÃO ficam sabendo** que precisam comprar o item de verdade
- Não há fluxo de "realizar o sonho" (pedir o item aos pais)

**Solução Proposta:**

#### 1️⃣ Adicionar Botão "Realizar Sonho"

- **Quando**: `current_amount >= target_amount`
- **Onde**: Tab "Sonhos" em `pages/demo-child-view.tsx`
- **Texto**: "🎁 Pedir aos Pais para Realizar"

#### 2️⃣ Criar Pedido de Aprovação

- Ao clicar, criar novo tipo de pedido: `goal_fulfillment`
- Salvar na tabela `transactions` ou criar nova tabela `goal_fulfillment_requests`
- Dados do pedido:
  - `goal_id`: ID do sonho
  - `child_id`: ID da criança
  - `amount`: Valor total do sonho
  - `status`: 'pending' | 'approved' | 'rejected' | 'fulfilled'
  - `item_name`: Nome do sonho
  - `category`: Categoria do sonho

#### 3️⃣ Notificação para Pais

- Mostrar no dashboard parental:

  ```
  📦 Pedidos de Realização de Sonhos

  🎯 Rafael completou o sonho "Bola Nova"!
  - Valor guardado: R$ 50.00
  - Data: 30/11/2025
  - [Aprovar] [Ver Detalhes]
  ```

#### 4️⃣ Fluxo de Aprovação

- Pai clica em "Aprovar":
  - Sonho marcado como `status: 'fulfilled'`
  - Dinheiro já está "gasto" (foi nas contribuições)
  - Aparece no histórico da criança: "✅ Sonho realizado!"
  - **Lembrete para o pai**: "Lembre-se de comprar o item para a criança!"

#### 5️⃣ Atualizar Campos da Tabela `goals`

**Adicionar campos:**

```sql
ALTER TABLE goals ADD COLUMN awaiting_fulfillment BOOLEAN DEFAULT FALSE;
ALTER TABLE goals ADD COLUMN fulfilled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE goals ADD COLUMN fulfilled_by TEXT; -- ID do pai que aprovou
```

---

### 📁 Arquivos a Modificar

#### `pages/demo-child-view.tsx`

- **Linha ~936-974**: Tab "Sonhos" - Adicionar botão condicional
- Novo código:
  ```typescript
  {/* Botão Realizar Sonho - só aparece quando 100% */}
  {goal.current >= goal.target && !goal.is_fulfilled && (
    <button
      onClick={() => requestGoalFulfillment(goal.id, goal.name)}
      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg mt-2"
    >
      🎁 Pedir aos Pais para Realizar
    </button>
  )}
  ```

#### Nova Função em `demo-child-view.tsx`

```typescript
const requestGoalFulfillment = async (goalId: string, goalName: string) => {
  if (!currentChild) return;

  const response = await fetch('/api/goal-fulfillment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      goal_id: goalId,
      child_id: currentChild.id,
      child_name: currentChild.name,
      goal_name: goalName,
    }),
  });

  const result = await response.json();

  if (result.success) {
    alert(`📨 Pedido enviado aos seus pais!

Sonho: ${goalName}
Valor guardado: R$ ${result.data.amount.toFixed(2)}

Seus pais vão aprovar e realizar seu sonho! 🎁`);

    await loadChildData(currentChild.id);
  }
};
```

#### Nova API `pages/api/goal-fulfillment.js`

```javascript
import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { goal_id, child_id, child_name, goal_name } = req.body;

  // 1. Buscar dados do sonho
  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .select('*')
    .eq('id', goal_id)
    .single();

  if (goalError || !goal) {
    return res.status(400).json({ error: 'Goal not found' });
  }

  if (!goal.is_completed) {
    return res.status(400).json({
      error: 'Goal must be completed first',
    });
  }

  // 2. Marcar sonho como "aguardando realização"
  const { error: updateError } = await supabase
    .from('goals')
    .update({ awaiting_fulfillment: true })
    .eq('id', goal_id);

  if (updateError) {
    return res.status(500).json({
      error: 'Failed to update goal',
    });
  }

  // 3. Criar pedido de realização (opcional: tabela separada)
  // Pode usar transactions com type 'goal_fulfillment_request'
  const { data: request, error: requestError } = await supabase
    .from('transactions')
    .insert([
      {
        child_id,
        type: 'spending', // ou criar novo tipo
        amount: goal.target_amount,
        description: `Pedido de realização: ${goal_name}`,
        category: 'Sonhos',
        requires_approval: true,
        item_name: goal_name,
        related_goal_id: goal_id, // adicionar campo se necessário
      },
    ])
    .select()
    .single();

  return res.status(201).json({
    success: true,
    data: {
      request,
      goal,
      amount: goal.target_amount,
    },
    message: 'Pedido de realização enviado com sucesso!',
  });
}
```

#### `pages/dashboard.tsx`

- Adicionar seção "Pedidos de Realização de Sonhos"
- Listar sonhos com `awaiting_fulfillment = true`
- Botão "Aprovar Realização"
- Ao aprovar:
  - Marcar `fulfilled_at = NOW()`
  - Marcar `awaiting_fulfillment = false`
  - Mostrar alerta: "✅ Lembre-se de comprar o item para a criança!"

---

### 🎯 Prioridade

**🔴 ALTA** - Esta funcionalidade é essencial para o fluxo familiar:

- Criança junta dinheiro
- Criança pede para realizar o sonho
- Pais aprovam
- **Pais compram o item de verdade**
- Fluxo completo de educação financeira

---

### ✅ Benefícios

1. **Fechamento do Ciclo**: Criança vê resultado concreto de guardar dinheiro
2. **Comunicação Pais-Filhos**: Pedido formal facilita decisão
3. **Gamificação**: Momento de celebração quando sonho é realizado
4. **Educação Financeira**: Ensina que juntar dinheiro tem recompensa real

---

### 📊 Status Atual (30/11/2025)

- ✅ Sistema de sonhos implementado
- ✅ Contribuições funcionando
- ✅ Detecção de sonho completo
- ❌ Falta botão "Realizar Sonho"
- ❌ Falta pedido de aprovação para pais
- ❌ Falta notificação no dashboard parental

---

## 🐛 BUGS E MELHORIAS MENORES

### Bug: Tipo de transação `goal_deposit`

- **Problema**: API cria transações tipo `goal_deposit`, mas tipo não existe no schema
- **Solução**: Usar `spending` com categoria `Sonhos`
- **Arquivo**: `pages/api/goal-contributions.js:129`
- **Status**: ⚠️ Precisa ser corrigido

### Melhoria: Avisos de Mesada

- **Problema**: Criança não sabe quando vai receber mesada
- **Solução**: Notificação 1 dia antes: "💰 Amanhã você recebe R$ 100!"
- **Prioridade**: 🟡 Média

### Melhoria: Dashboard de Gastos

- **Problema**: Pais não veem em que categorias as crianças gastam mais
- **Solução**: Gráfico de pizza com categorias de gastos
- **Prioridade**: 🟡 Média

---

## ✅ CONCLUÍDO RECENTEMENTE

- ✅ **30/11/2025**: Limpeza de transações de teste (16 transações removidas)
- ✅ **30/11/2025**: Correção da exibição de mesada (agora mostra R$ 100.00 na data correta)
- ✅ **30/11/2025**: Sistema de login com Google funcionando para crianças
- ✅ **30/11/2025**: Botões de navegação ocultos para crianças logadas
- ✅ **30/11/2025**: GitHub Actions configurado para cron jobs (mesada + juros)

---

**Última atualização**: 30/11/2025 15:35 UTC
**Próxima tarefa prioritária**: Implementar sistema de realização de sonhos
