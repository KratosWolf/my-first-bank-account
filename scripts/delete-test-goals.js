// Script para deletar sonhos de teste do Rafael e Gabriel
// Remove o sonho "undefined" do Rafael

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteTestGoals() {
  console.log('🗑️  Iniciando remoção de sonhos de teste...\n');

  try {
    // 1. Buscar dados das crianças
    const { data: children, error: childrenError } = await supabase
      .from('children')
      .select('id, name')
      .in('name', ['Rafael', 'Gabriel'])
      .order('name');

    if (childrenError) {
      throw childrenError;
    }

    console.log(
      `✅ Crianças encontradas: ${children.map(c => c.name).join(', ')}\n`
    );

    const childIds = children.map(c => c.id);

    // 2. Buscar sonhos ANTES da deleção
    const { data: goalsBefore, error: goalsBeforeError } = await supabase
      .from('goals')
      .select('*')
      .in('child_id', childIds);

    if (goalsBeforeError) {
      throw goalsBeforeError;
    }

    console.log('📊 ANTES da deleção:');
    console.log('─'.repeat(60));

    if (!goalsBefore || goalsBefore.length === 0) {
      console.log('   Nenhum sonho encontrado - já está limpo!\n');
      return;
    }

    goalsBefore.forEach(goal => {
      const child = children.find(c => c.id === goal.child_id);
      console.log(`   ${child?.name}: "${goal.name}" (ID: ${goal.id})`);
      console.log(
        `      💰 R$ ${goal.current_amount.toFixed(2)} / R$ ${goal.target_amount.toFixed(2)}\n`
      );
    });

    console.log(`   Total: ${goalsBefore.length} sonho(s)\n`);

    // 3. Deletar TODOS os sonhos do Rafael e Gabriel
    console.log('🔧 Executando deleção...');

    const { data: deletedGoals, error: deleteError } = await supabase
      .from('goals')
      .delete()
      .in('child_id', childIds)
      .select();

    if (deleteError) {
      throw deleteError;
    }

    console.log(`✅ ${deletedGoals.length} sonho(s) deletado(s)\n`);

    // 4. Verificar APÓS deleção
    const { data: goalsAfter, error: goalsAfterError } = await supabase
      .from('goals')
      .select('id')
      .in('child_id', childIds);

    if (goalsAfterError) {
      throw goalsAfterError;
    }

    console.log('📊 APÓS a deleção:');
    console.log('─'.repeat(60));

    children.forEach(child => {
      const childGoalsAfter = goalsAfter.filter(g => g.child_id === child.id);
      console.log(`   ${child.name}: ${childGoalsAfter.length} sonho(s)`);
    });

    const totalAfter = goalsAfter.length;
    console.log(`\n   Total: ${totalAfter} sonho(s)`);

    // 5. Validação final
    if (totalAfter === 0) {
      console.log('\n\n✅ SUCESSO! Todos os sonhos de teste foram removidos.');
      console.log('🎉 Tabela goals 100% limpa!\n');
      console.log('📋 Status Final:');
      console.log('   - Rafael: 0 sonhos ✅');
      console.log('   - Gabriel: 0 sonhos ✅');
      console.log('   - Sistema pronto para uso real! 🚀\n');
    } else {
      console.log('\n\n⚠️  ATENÇÃO: Ainda existem sonhos restantes.');
      console.log('Verifique os dados acima.\n');
    }
  } catch (error) {
    console.error('\n❌ Erro ao deletar sonhos:', error);
    process.exit(1);
  }
}

deleteTestGoals();
