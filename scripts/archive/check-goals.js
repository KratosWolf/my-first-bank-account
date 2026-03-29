// Script para verificar sonhos do Rafael e Gabriel
// Apenas consulta, não deleta

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGoals() {
  console.log('🔍 Verificando sonhos do Rafael e Gabriel...\n');

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

    if (!children || children.length === 0) {
      console.log(
        '⚠️  Nenhuma criança encontrada com os nomes Rafael ou Gabriel'
      );
      return;
    }

    console.log(
      `✅ Crianças encontradas: ${children.map(c => c.name).join(', ')}\n`
    );

    // 2. Buscar todos os sonhos
    const childIds = children.map(c => c.id);

    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .in('child_id', childIds)
      .order('created_at', { ascending: false });

    if (goalsError) {
      throw goalsError;
    }

    // 3. Mostrar resultados
    if (!goals || goals.length === 0) {
      console.log('📭 Nenhum sonho encontrado para Rafael e Gabriel');
      console.log('✅ Tabela goals está limpa!\n');
      return;
    }

    console.log(`📋 Total de sonhos encontrados: ${goals.length}\n`);

    // Agrupar por criança
    children.forEach(child => {
      const childGoals = goals.filter(g => g.child_id === child.id);

      if (childGoals.length === 0) {
        console.log(`📭 ${child.name}: Nenhum sonho`);
        return;
      }

      console.log(`\n🎯 ${child.name} (${childGoals.length} sonho(s)):`);
      console.log('─'.repeat(60));

      childGoals.forEach((goal, index) => {
        console.log(`\n   ${index + 1}. "${goal.name}"`);
        console.log(`      💰 Valor alvo: R$ ${goal.target_amount.toFixed(2)}`);
        console.log(
          `      📊 Valor atual: R$ ${goal.current_amount.toFixed(2)}`
        );

        const progress = (goal.current_amount / goal.target_amount) * 100;
        console.log(`      📈 Progresso: ${progress.toFixed(1)}%`);

        console.log(`      ✅ Completo: ${goal.is_completed ? 'Sim' : 'Não'}`);
        console.log(`      🆔 ID: ${goal.id}`);

        if (goal.category) {
          console.log(`      🏷️  Categoria: ${goal.category}`);
        }

        if (goal.deadline) {
          const deadline = new Date(goal.deadline);
          console.log(
            `      📅 Deadline: ${deadline.toLocaleDateString('pt-BR')}`
          );
        }

        if (goal.created_at) {
          const created = new Date(goal.created_at);
          console.log(
            `      🕐 Criado em: ${created.toLocaleDateString('pt-BR')} ${created.toLocaleTimeString('pt-BR')}`
          );
        }
      });
    });

    // 4. Resumo geral
    console.log('\n\n📊 RESUMO GERAL:');
    console.log('─'.repeat(60));

    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.is_completed).length;
    const totalTargetAmount = goals.reduce(
      (sum, g) => sum + g.target_amount,
      0
    );
    const totalCurrentAmount = goals.reduce(
      (sum, g) => sum + g.current_amount,
      0
    );
    const totalProgress =
      totalTargetAmount > 0
        ? (totalCurrentAmount / totalTargetAmount) * 100
        : 0;

    console.log(`   Total de sonhos: ${totalGoals}`);
    console.log(`   Sonhos completos: ${completedGoals}`);
    console.log(`   Sonhos em andamento: ${totalGoals - completedGoals}`);
    console.log(
      `   Valor total dos sonhos: R$ ${totalTargetAmount.toFixed(2)}`
    );
    console.log(`   Valor já guardado: R$ ${totalCurrentAmount.toFixed(2)}`);
    console.log(`   Progresso geral: ${totalProgress.toFixed(1)}%`);

    // 5. Pergunta sobre deleção
    console.log('\n\n❓ PRÓXIMO PASSO:');
    console.log('─'.repeat(60));
    console.log('   Esses sonhos são de TESTE?');
    console.log('   Se sim, você pode deletá-los executando:');
    console.log('   \n   node scripts/delete-goals.js --confirm\n');
    console.log(
      '   (Script ainda não criado - confirme primeiro se deve deletar)\n'
    );
  } catch (error) {
    console.error('\n❌ Erro ao verificar sonhos:', error);
    process.exit(1);
  }
}

checkGoals();
