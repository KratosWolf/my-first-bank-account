const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSchema() {
  console.log('🔍 Verificando schema de savings_goals/goals...\n');

  // Tentar ambos os nomes de tabela
  const { data: goals1, error: error1 } = await supabase
    .from('savings_goals')
    .select('*')
    .limit(1);
  const { data: goals2, error: error2 } = await supabase
    .from('goals')
    .select('*')
    .limit(1);

  if (!error1) {
    console.log('✅ Tabela savings_goals existe');
    if (goals1 && goals1[0]) {
      console.log('Colunas:', Object.keys(goals1[0]));
      console.log('Exemplo:', goals1[0]);
    } else {
      console.log('(Tabela vazia, verificando via error)');
    }
  } else {
    console.log('❌ savings_goals:', error1.message);
  }

  if (!error2) {
    console.log('\n✅ Tabela goals existe');
    if (goals2 && goals2[0]) {
      console.log('Colunas:', Object.keys(goals2[0]));
      console.log('Exemplo:', goals2[0]);
    } else {
      console.log('(Tabela vazia, verificando via error)');
    }
  } else {
    console.log('❌ goals:', error2.message);
  }

  console.log('\n🔍 Verificando schema de purchase_requests...\n');
  const { data: requests, error: error3 } = await supabase
    .from('purchase_requests')
    .select('*')
    .limit(1);

  if (!error3) {
    console.log('✅ Tabela purchase_requests existe');
    if (requests && requests[0]) {
      console.log('Colunas:', Object.keys(requests[0]));
      console.log('Exemplo:', requests[0]);
    } else {
      console.log('(Tabela vazia, verificando via error)');
    }
  } else {
    console.log('❌ purchase_requests:', error3.message);
  }

  // Verificar transações para ver os tipos existentes
  console.log('\n🔍 Verificando tipos de transações existentes...\n');
  const { data: txTypes } = await supabase
    .from('transactions')
    .select('type')
    .limit(100);

  if (txTypes) {
    const uniqueTypes = [...new Set(txTypes.map(t => t.type))];
    console.log('Tipos de transações encontrados:', uniqueTypes);
  }
}

checkSchema().catch(console.error);
