// Script de diagnóstico da estrutura da tabela goals
// Verifica colunas, tipos e constraints

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseGoalsStructure() {
  console.log('🔍 DIAGNÓSTICO DA ESTRUTURA DA TABELA GOALS\n');
  console.log('═'.repeat(70));

  try {
    // 1. Verificar se a tabela existe e buscar dados de exemplo
    console.log('\n1️⃣  VERIFICANDO EXISTÊNCIA DA TABELA...\n');

    const { data: sampleGoals, error: tableError } = await supabase
      .from('goals')
      .select('*')
      .limit(1);

    if (tableError) {
      console.log('❌ Erro ao acessar tabela goals:');
      console.log(`   ${tableError.message}`);
      console.log('\n⚠️  A tabela "goals" pode não existir ainda!\n');
      return;
    }

    console.log('✅ Tabela "goals" existe e é acessível\n');

    // 2. Mostrar estrutura detectada a partir dos dados
    if (sampleGoals && sampleGoals.length > 0) {
      const sampleGoal = sampleGoals[0];

      console.log('2️⃣  ESTRUTURA DETECTADA (baseada em dados existentes):\n');
      console.log('   Colunas encontradas:');
      console.log('   ' + '─'.repeat(66));

      Object.keys(sampleGoal).forEach(column => {
        const value = sampleGoal[column];
        const type = typeof value;
        console.log(
          `   ✓ ${column.padEnd(25)} | Tipo: ${type.padEnd(10)} | Valor: ${JSON.stringify(value)}`
        );
      });
    } else {
      console.log('2️⃣  ESTRUTURA:\n');
      console.log('   ⚠️  Nenhum dado encontrado na tabela (tabela vazia)');
      console.log('   Não foi possível detectar estrutura automaticamente\n');
    }

    // 3. Verificar campos específicos que precisamos para o sistema de realização
    console.log(
      '\n3️⃣  VERIFICANDO CAMPOS NECESSÁRIOS PARA REALIZAÇÃO DE SONHOS:\n'
    );
    console.log('   ' + '─'.repeat(66));

    const requiredFields = {
      id: 'ID único do sonho',
      child_id: 'ID da criança dona do sonho',
      name: 'Nome do sonho',
      target_amount: 'Valor alvo (meta)',
      current_amount: 'Valor atual guardado',
      is_completed: 'Se atingiu 100% da meta',
      category: 'Categoria do sonho',
      created_at: 'Data de criação',
    };

    const desiredNewFields = {
      awaiting_fulfillment: 'Se está aguardando realização pelos pais',
      fulfilled_at: 'Data em que foi realizado',
      fulfilled_by: 'ID do pai que aprovou a realização',
    };

    if (sampleGoals && sampleGoals.length > 0) {
      const columns = Object.keys(sampleGoals[0]);

      console.log('\n   ✅ CAMPOS EXISTENTES:');
      Object.entries(requiredFields).forEach(([field, description]) => {
        const exists = columns.includes(field);
        const status = exists ? '✅' : '❌';
        console.log(`   ${status} ${field.padEnd(20)} - ${description}`);
      });

      console.log('\n   🆕 CAMPOS QUE PRECISAM SER ADICIONADOS:');
      Object.entries(desiredNewFields).forEach(([field, description]) => {
        const exists = columns.includes(field);
        if (exists) {
          console.log(`   ✅ ${field.padEnd(20)} - ${description} (JÁ EXISTE)`);
        } else {
          console.log(
            `   ⭕ ${field.padEnd(20)} - ${description} (PRECISA CRIAR)`
          );
        }
      });
    }

    // 4. Contar registros
    const { count, error: countError } = await supabase
      .from('goals')
      .select('*', { count: 'exact', head: true });

    console.log('\n4️⃣  ESTATÍSTICAS:\n');
    console.log('   ' + '─'.repeat(66));

    if (!countError) {
      console.log(`   Total de sonhos cadastrados: ${count || 0}`);
    }

    // 5. Mostrar SQL sugerido para adicionar campos
    console.log('\n5️⃣  SQL SUGERIDO PARA ADICIONAR CAMPOS FALTANTES:\n');
    console.log('   ' + '─'.repeat(66));
    console.log(`
   -- Adicionar campos para sistema de realização de sonhos
   ALTER TABLE goals
     ADD COLUMN IF NOT EXISTS awaiting_fulfillment BOOLEAN DEFAULT FALSE;

   ALTER TABLE goals
     ADD COLUMN IF NOT EXISTS fulfilled_at TIMESTAMP WITH TIME ZONE;

   ALTER TABLE goals
     ADD COLUMN IF NOT EXISTS fulfilled_by TEXT;
    `);

    console.log('\n═'.repeat(70));
    console.log('✅ Diagnóstico concluído!\n');
  } catch (error) {
    console.error('\n❌ Erro durante diagnóstico:', error);
    process.exit(1);
  }
}

diagnoseGoalsStructure();
