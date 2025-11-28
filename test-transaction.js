const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testTransaction() {
  console.log('🧪 TESTANDO SISTEMA DE TRANSAÇÕES\n');

  // 1. Buscar Rafael
  const { data: children, error: childrenError } = await supabase
    .from('children')
    .select('*')
    .eq('name', 'Rafael')
    .single();

  if (childrenError || !children) {
    console.log('❌ Erro ao buscar Rafael:', childrenError?.message);
    return;
  }

  console.log('✅ Rafael encontrado:');
  console.log('   ID:', children.id);
  console.log('   Saldo atual: R$', children.balance);
  console.log('');

  // 2. Verificar se a tabela transactions existe
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .limit(1);

  if (txError) {
    console.log('⚠️ Tabela transactions:', txError.message);
  } else {
    console.log('✅ Tabela transactions: OK');
  }

  console.log('\n📱 Agora você pode testar no browser:');
  console.log('1. Acesse: http://localhost:3002/dashboard');
  console.log('2. Clique no botão +💰 do Rafael');
  console.log('3. Digite: Valor = 50, Descrição = "Mesada semanal"');
  console.log('4. Clique em "Adicionar"');
  console.log('\n✨ O sistema deve:');
  console.log('  • Atualizar o saldo do Rafael para R$ 50.00');
  console.log('  • Salvar a transação no Supabase');
  console.log('  • Mostrar mensagem de sucesso');
}

testTransaction();
