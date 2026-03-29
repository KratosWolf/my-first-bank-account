const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Erro: Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testValue(annual_rate, minimum_balance, description) {
  const testConfig = {
    child_id: '3a4fb20b-f56e-43b9-a194-c9cf37f0ac6b',
    annual_rate: annual_rate,
    compound_frequency: 'monthly',
    minimum_balance: minimum_balance,
    is_active: true,
  };

  const { data, error } = await supabase
    .from('interest_config')
    .insert([testConfig])
    .select()
    .single();

  if (error) {
    console.log(`   ❌ ${description}`);
    console.log(
      `      annual_rate: ${annual_rate}, minimum_balance: ${minimum_balance}`
    );
    console.log(`      Erro: ${error.message}\n`);
    return false;
  } else {
    console.log(`   ✅ ${description}`);
    console.log(
      `      annual_rate: ${data.annual_rate}, minimum_balance: ${data.minimum_balance}`
    );
    console.log(`      ID: ${data.id}\n`);

    // Remover registro de teste
    await supabase.from('interest_config').delete().eq('id', data.id);
    return true;
  }
}

async function testInterestValues() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TESTE DE LIMITES - interest_config');
  console.log('='.repeat(80) + '\n');

  // Testar valores crescentes para encontrar o limite
  await testValue(1.0, 1.0, 'Teste 1: Valores mínimos (1.0, 1.0)');
  await testValue(5.0, 5.0, 'Teste 2: Valores pequenos (5.0, 5.0)');
  await testValue(9.0, 9.0, 'Teste 3: Um dígito máximo (9.0, 9.0)');
  await testValue(10.0, 10.0, 'Teste 4: Dois dígitos (10.0, 10.0)');
  await testValue(12.0, 10.0, 'Teste 5: Taxa 12% (12.0, 10.0)');
  await testValue(9.9, 10.0, 'Teste 6: Taxa 9.9% (9.9, 10.0)');
  await testValue(9.5, 10.0, 'Teste 7: Taxa 9.5% (9.5, 10.0)');

  console.log('='.repeat(80));
  console.log('💡 CONCLUSÃO\n');
  console.log('   Se Teste 3 passou mas Teste 4 falhou:');
  console.log('   → Coluna annual_rate é NUMERIC(2,1) (máx 9.9)');
  console.log('   → Precisa mudar para NUMERIC(5,2) para aceitar 12.00\n');

  console.log('   SQL para corrigir:');
  console.log(
    '   ALTER TABLE interest_config ALTER COLUMN annual_rate TYPE NUMERIC(5,2);'
  );
  console.log(
    '   ALTER TABLE interest_config ALTER COLUMN minimum_balance TYPE NUMERIC(10,2);\n'
  );

  console.log('='.repeat(80) + '\n');
}

testInterestValues()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('💥 Erro fatal:', err.message);
    console.error(err);
    process.exit(1);
  });
