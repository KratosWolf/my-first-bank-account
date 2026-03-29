// Script para zerar saldos do Rafael e Gabriel
// Prepara o sistema para uso em produção

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetChildrenBalances() {
  console.log('🔄 Iniciando reset de saldos do Rafael e Gabriel...\n');

  try {
    // 1. Buscar dados ANTES do reset
    const { data: childrenBefore, error: beforeError } = await supabase
      .from('children')
      .select('id, name, balance, total_earned, total_spent')
      .in('name', ['Rafael', 'Gabriel'])
      .order('name');

    if (beforeError) {
      throw beforeError;
    }

    if (!childrenBefore || childrenBefore.length === 0) {
      console.log(
        '⚠️  Nenhuma criança encontrada com os nomes Rafael ou Gabriel'
      );
      return;
    }

    console.log('📊 Saldos ANTES do reset:');
    childrenBefore.forEach(child => {
      console.log(`\n   ${child.name}:`);
      console.log(`   - Saldo: R$ ${child.balance.toFixed(2)}`);
      console.log(
        `   - Total ganho: R$ ${(child.total_earned || 0).toFixed(2)}`
      );
      console.log(
        `   - Total gasto: R$ ${(child.total_spent || 0).toFixed(2)}`
      );
    });

    // 2. Executar o reset
    console.log('\n\n🔧 Executando reset para R$ 0.00...');

    const { data: updatedChildren, error: updateError } = await supabase
      .from('children')
      .update({
        balance: 0,
        total_earned: 0,
        total_spent: 0,
      })
      .in('name', ['Rafael', 'Gabriel'])
      .select();

    if (updateError) {
      throw updateError;
    }

    console.log(`✅ ${updatedChildren.length} criança(s) atualizada(s)\n`);

    // 3. Verificar dados APÓS o reset
    const { data: childrenAfter, error: afterError } = await supabase
      .from('children')
      .select('id, name, balance, total_earned, total_spent')
      .in('name', ['Rafael', 'Gabriel'])
      .order('name');

    if (afterError) {
      throw afterError;
    }

    console.log('📊 Saldos APÓS o reset:');
    childrenAfter.forEach(child => {
      console.log(`\n   ${child.name}:`);
      console.log(`   - Saldo: R$ ${child.balance.toFixed(2)}`);
      console.log(
        `   - Total ganho: R$ ${(child.total_earned || 0).toFixed(2)}`
      );
      console.log(
        `   - Total gasto: R$ ${(child.total_spent || 0).toFixed(2)}`
      );
    });

    // 4. Validação final
    const allZero = childrenAfter.every(
      child =>
        child.balance === 0 &&
        child.total_earned === 0 &&
        child.total_spent === 0
    );

    if (allZero) {
      console.log('\n\n✅ SUCESSO! Todos os saldos foram zerados.');
      console.log('🎉 Sistema pronto para uso real!\n');
    } else {
      console.log('\n\n⚠️  ATENÇÃO: Alguns valores podem não estar zerados.');
      console.log('Verifique os dados acima.\n');
    }
  } catch (error) {
    console.error('\n❌ Erro durante o reset:', error);
    process.exit(1);
  }
}

resetChildrenBalances();
