/**
 * Script one-time para reconciliar saldos das criancas.
 *
 * Calcula o saldo correto a partir das transacoes reais e atualiza children.
 *
 * Uso:
 *   node scripts/fix-balances.mjs
 *
 * Requer NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Carregar .env.local
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = Object.fromEntries(
  envContent
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx), line.slice(idx + 1)];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar em .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  // Buscar todas as criancas
  const { data: children, error: childErr } = await supabase
    .from('children')
    .select('id, name, balance, total_earned, total_spent');

  if (childErr) {
    console.error('❌ Erro ao buscar criancas:', childErr.message);
    process.exit(1);
  }

  for (const child of children) {
    // Calcular saldo correto a partir das transacoes
    const { data: txs, error: txErr } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('child_id', child.id);

    if (txErr) {
      console.error(`❌ Erro ao buscar transacoes de ${child.name}:`, txErr.message);
      continue;
    }

    let totalEarned = 0;
    let totalSpent = 0;
    let totalInterest = 0;

    for (const tx of txs) {
      const amt = parseFloat(tx.amount);
      if (tx.type === 'earning' || tx.type === 'allowance') {
        totalEarned += amt;
      } else if (tx.type === 'interest') {
        totalInterest += amt;
      } else if (tx.type === 'spending') {
        totalSpent += amt;
      }
    }

    const correctBalance = parseFloat((totalEarned + totalInterest - totalSpent).toFixed(2));
    const correctTotalEarned = parseFloat(totalEarned.toFixed(2));
    const correctTotalSpent = parseFloat(totalSpent.toFixed(2));

    const currentBalance = parseFloat(child.balance);
    const currentTotalSpent = parseFloat(child.total_spent);

    console.log(`\n👦 ${child.name}:`);
    console.log(`   Saldo atual:    R$ ${currentBalance.toFixed(2)} | total_spent: R$ ${currentTotalSpent.toFixed(2)}`);
    console.log(`   Saldo correto:  R$ ${correctBalance.toFixed(2)} | total_spent: R$ ${correctTotalSpent.toFixed(2)}`);

    if (currentBalance === correctBalance && currentTotalSpent === correctTotalSpent) {
      console.log('   ✅ Saldo já está correto!');
      continue;
    }

    const diff = currentBalance - correctBalance;
    console.log(`   ⚠️  Diferença: R$ ${diff.toFixed(2)}`);

    const { error: updateErr } = await supabase
      .from('children')
      .update({
        balance: correctBalance,
        total_earned: correctTotalEarned,
        total_spent: correctTotalSpent,
      })
      .eq('id', child.id);

    if (updateErr) {
      console.error(`   ❌ Erro ao atualizar: ${updateErr.message}`);
    } else {
      console.log(`   ✅ Corrigido! Novo saldo: R$ ${correctBalance.toFixed(2)}`);
    }
  }

  console.log('\n🏁 Reconciliação concluída.');
}

main();
