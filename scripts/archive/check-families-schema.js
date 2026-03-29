const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSchema() {
  console.log('🔍 Verificando schema da tabela families...\n');

  // Tentar inserir um registro vazio para ver o erro
  const { data, error } = await supabase.from('families').select('*').limit(1);

  if (error) {
    console.log('Erro:', error.message);
  } else {
    console.log(
      'Colunas encontradas:',
      data.length > 0 ? Object.keys(data[0]) : 'Nenhum registro encontrado'
    );
  }

  // Tentar ver dados existentes
  const { data: all, error: allError } = await supabase
    .from('families')
    .select('*');

  if (!allError && all) {
    console.log('\nRegistros existentes:', all.length);
    if (all.length > 0) {
      console.log('Exemplo:', JSON.stringify(all[0], null, 2));
    }
  }
}

checkSchema().then(() => process.exit(0));
