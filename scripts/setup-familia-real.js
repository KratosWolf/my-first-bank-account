const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function setupFamiliaReal() {
  console.log('🏠 Configurando família real...\n');

  // 1. Limpar dados antigos
  console.log('🧹 Limpando dados antigos...');
  await supabase
    .from('purchase_requests')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase
    .from('transactions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase
    .from('goals')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase
    .from('children')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase
    .from('families')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('✅ Dados antigos removidos\n');

  // 2. Criar família (tentar com apenas colunas obrigatórias)
  console.log('👨‍👩‍👧‍👦 Criando família...');
  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({
      parent_name: 'Tiago e Helena',
      parent_email: 'tiago@familiareal.com',
    })
    .select()
    .single();

  if (familyError) {
    console.log('❌ Erro ao criar família:', familyError.message);
    return;
  }
  console.log('✅ Família criada:', family.id);
  console.log('   Colunas disponíveis:', Object.keys(family));
  console.log('\n');

  // 3. Criar filhos
  console.log('👶 Criando filhos...');

  const { data: rafael, error: rafaelError } = await supabase
    .from('children')
    .insert({
      family_id: family.id,
      name: 'Rafael',
      pin: '1234',
      avatar: '👦',
    })
    .select()
    .single();

  if (rafaelError) {
    console.log('❌ Erro ao criar Rafael:', rafaelError.message);
  } else {
    console.log('✅ Rafael criado - PIN: 1234');
  }

  const { data: gabriel, error: gabrielError } = await supabase
    .from('children')
    .insert({
      family_id: family.id,
      name: 'Gabriel',
      pin: '5678',
      avatar: '🧒',
    })
    .select()
    .single();

  if (gabrielError) {
    console.log('❌ Erro ao criar Gabriel:', gabrielError.message);
  } else {
    console.log('✅ Gabriel criado - PIN: 5678');
  }

  // 4. Resumo
  console.log('\n' + '='.repeat(50));
  console.log('🎉 FAMÍLIA CONFIGURADA COM SUCESSO!');
  console.log('='.repeat(50));
  console.log('\n👨‍👩‍👧‍👦 Família Fernandes');
  console.log('   👨 Pai: Tiago');
  console.log('   👩 Mãe: Helena');
  console.log('   👦 Rafael (9 anos) - PIN: 1234');
  console.log('   🧒 Gabriel (10 anos) - PIN: 5678');
  console.log('\n💰 Saldo inicial: R$ 0,00 cada');
  console.log('\n📱 Agora recarregue o app no browser!');
  console.log('🌐 URL: http://localhost:3002');
}

setupFamiliaReal()
  .then(() => process.exit(0))
  .catch(console.error);
