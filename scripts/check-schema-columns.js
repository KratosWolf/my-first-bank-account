const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Erro: Variáveis não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('\n🔍 Verificando schema de spending_categories...\n');

  const { data, error } = await supabase
    .from('spending_categories')
    .select('*')
    .limit(1);

  if (error) {
    console.log('❌ Erro:', error.message);
    process.exit(1);
  }

  if (data && data.length > 0) {
    console.log('✅ Colunas encontradas:');
    Object.keys(data[0]).forEach(col => {
      const value = data[0][col];
      const type = typeof value;
      console.log(`   - ${col}: ${type} (exemplo: ${value})`);
    });

    console.log('\n📋 Colunas necessárias para a interface:');
    const needed = [
      'id',
      'name',
      'icon',
      'color',
      'monthly_limit',
      'quarterly_limit',
      'enabled',
    ];
    const missing = [];

    needed.forEach(col => {
      if (data[0].hasOwnProperty(col)) {
        console.log(`   ✅ ${col}`);
      } else {
        console.log(`   ❌ ${col} - FALTANDO`);
        missing.push(col);
      }
    });

    if (missing.length > 0) {
      console.log('\n⚠️  ATENÇÃO: Colunas faltando:', missing.join(', '));
      console.log('\nSQL para adicionar colunas:');
      if (missing.includes('color')) {
        console.log(
          "ALTER TABLE spending_categories ADD COLUMN color VARCHAR(7) DEFAULT '#3B82F6';"
        );
      }
    } else {
      console.log('\n✅ Todas as colunas necessárias estão presentes!');
    }
  } else {
    console.log('⚠️  Tabela vazia');
  }

  console.log('\n');
}

checkSchema()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  });
