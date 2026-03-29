// Script para limpar transações de teste
// IMPORTANTE: Mantém o saldo atual das crianças, apenas limpa o histórico

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearTestTransactions() {
  console.log('🧹 Iniciando limpeza de transações de teste...\n');

  try {
    // 1. Buscar saldos atuais das crianças (para confirmar no final)
    const { data: childrenBefore, error: childrenError } = await supabase
      .from('children')
      .select('id, name, balance, total_earned, total_spent')
      .order('name');

    if (childrenError) {
      throw childrenError;
    }

    console.log('📊 Saldos ANTES da limpeza:');
    childrenBefore.forEach(child => {
      console.log(`   ${child.name}:`);
      console.log(`   - Saldo: R$ ${child.balance.toFixed(2)}`);
      console.log(
        `   - Total ganho: R$ ${(child.total_earned || 0).toFixed(2)}`
      );
      console.log(
        `   - Total gasto: R$ ${(child.total_spent || 0).toFixed(2)}`
      );
      console.log('');
    });

    // 2. Buscar todas as transações para ver quantas vamos deletar
    const { data: allTransactions, error: txError } = await supabase
      .from('transactions')
      .select('id, child_id, type, amount, description, created_at');

    if (txError) {
      throw txError;
    }

    console.log(
      `📋 Total de transações encontradas: ${allTransactions.length}`
    );
    console.log('\n🔍 Detalhes das transações:');

    // Agrupar por criança
    const transactionsByChild = {};
    allTransactions.forEach(tx => {
      if (!transactionsByChild[tx.child_id]) {
        transactionsByChild[tx.child_id] = [];
      }
      transactionsByChild[tx.child_id].push(tx);
    });

    // Mostrar detalhes por criança
    childrenBefore.forEach(child => {
      const childTxs = transactionsByChild[child.id] || [];
      console.log(`\n   ${child.name} (${childTxs.length} transações):`);
      childTxs.forEach(tx => {
        console.log(
          `      - ${tx.type}: R$ ${tx.amount.toFixed(2)} - ${tx.description || 'Sem descrição'}`
        );
      });
    });

    // 3. Perguntar confirmação
    console.log('\n⚠️  ATENÇÃO:');
    console.log('   - Todas as transações serão DELETADAS');
    console.log('   - Os saldos das crianças serão MANTIDOS');
    console.log('   - Esta ação NÃO pode ser desfeita!');
    console.log('\n🔧 Para executar, você precisa chamar:');
    console.log('   node scripts/clear-test-transactions.js --confirm');
    console.log('');

    // Verificar se foi passado --confirm
    const hasConfirm = process.argv.includes('--confirm');

    if (!hasConfirm) {
      console.log('ℹ️  Execução cancelada (adicione --confirm para executar)');
      return;
    }

    // 4. DELETAR todas as transações
    console.log('\n🗑️  Deletando transações...');
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletar TODAS (condição sempre verdadeira)

    if (deleteError) {
      throw deleteError;
    }

    console.log('✅ Transações deletadas com sucesso!');

    // 5. Verificar saldos após limpeza (devem estar iguais)
    const { data: childrenAfter, error: childrenAfterError } = await supabase
      .from('children')
      .select('id, name, balance, total_earned, total_spent')
      .order('name');

    if (childrenAfterError) {
      throw childrenAfterError;
    }

    console.log('\n📊 Saldos APÓS a limpeza (devem estar iguais):');
    childrenAfter.forEach(child => {
      console.log(`   ${child.name}:`);
      console.log(`   - Saldo: R$ ${child.balance.toFixed(2)}`);
      console.log(
        `   - Total ganho: R$ ${(child.total_earned || 0).toFixed(2)}`
      );
      console.log(
        `   - Total gasto: R$ ${(child.total_spent || 0).toFixed(2)}`
      );
      console.log('');
    });

    // 6. Verificar se há transações restantes
    const { data: remainingTxs, error: remainingError } = await supabase
      .from('transactions')
      .select('id');

    if (remainingError) {
      throw remainingError;
    }

    console.log(
      `✅ Verificação final: ${remainingTxs.length} transações restantes`
    );
    console.log('\n🎉 Limpeza concluída com sucesso!');
  } catch (error) {
    console.error('\n❌ Erro durante a limpeza:', error);
    process.exit(1);
  }
}

clearTestTransactions();
