const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Erro: Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkInterestSchema() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 VERIFICAR SCHEMA DA TABELA interest_config');
  console.log('='.repeat(80) + '\n');

  // Tentar inserir um registro de teste com valores pequenos
  console.log('📝 1. TESTE DE INSERÇÃO COM VALORES PEQUENOS\n');

  const testConfig = {
    child_id: '3a4fb20b-f56e-43b9-a194-c9cf37f0ac6b', // Gabriel
    annual_rate: 1.0, // Valor muito pequeno para testar
    compound_frequency: 'monthly',
    minimum_balance: 1.0,
    is_active: true,
  };

  console.log('   Tentando inserir configuração de teste:');
  console.log('   - annual_rate: 1.0');
  console.log('   - minimum_balance: 1.0\n');

  const { data, error } = await supabase
    .from('interest_config')
    .insert([testConfig])
    .select()
    .single();

  if (error) {
    console.log('   ❌ ERRO:', error.message);
    console.log('   Código:', error.code);
    console.log('   Detalhes:', error.details);
    console.log('   Hint:', error.hint);
    console.log('\n   DIAGNÓSTICO:');

    if (error.message.includes('numeric field overflow')) {
      console.log(
        '   A coluna provavelmente está definida como SMALLINT ao invés de NUMERIC'
      );
      console.log('   SMALLINT aceita apenas valores de -32768 a 32767');
      console.log(
        '   Mas como decimal, 12.0 é interpretado como 120 (escala incorreta)\n'
      );

      console.log('   SOLUÇÃO:');
      console.log('   Execute este SQL no Supabase Dashboard:\n');
      console.log('   -- Verificar tipos atuais');
      console.log(
        '   SELECT column_name, data_type, numeric_precision, numeric_scale'
      );
      console.log('   FROM information_schema.columns');
      console.log(
        "   WHERE table_name = 'interest_config' AND column_name IN ('annual_rate', 'minimum_balance');\n"
      );

      console.log('   -- Se estiver errado, alterar para NUMERIC:');
      console.log(
        '   ALTER TABLE interest_config ALTER COLUMN annual_rate TYPE NUMERIC(5,2);'
      );
      console.log(
        '   ALTER TABLE interest_config ALTER COLUMN minimum_balance TYPE NUMERIC(10,2);\n'
      );
    }
  } else {
    console.log('   ✅ SUCESSO! Configuração criada:');
    console.log('   ID:', data.id);
    console.log('   annual_rate:', data.annual_rate);
    console.log('   minimum_balance:', data.minimum_balance);
    console.log('\n   Schema está correto!\n');

    // Remover registro de teste
    console.log('🧹 2. REMOVENDO REGISTRO DE TESTE\n');
    const { error: deleteError } = await supabase
      .from('interest_config')
      .delete()
      .eq('id', data.id);

    if (deleteError) {
      console.log('   ⚠️  Erro ao remover teste:', deleteError.message);
    } else {
      console.log('   ✅ Registro de teste removido\n');
    }
  }

  console.log('='.repeat(80) + '\n');
}

checkInterestSchema()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('💥 Erro fatal:', err.message);
    console.error(err);
    process.exit(1);
  });
