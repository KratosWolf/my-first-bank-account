const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Usar service_role key para operações administrativas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQLFile(filename) {
  console.log(`📄 Lendo arquivo: ${filename}\n`);

  const sql = fs.readFileSync(filename, 'utf8');

  console.log('🔧 Executando SQL no Supabase...\n');

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.log('❌ Erro ao executar SQL:', error.message);
      console.log('\n⚠️  O método RPC pode não estar disponível.');
      console.log('\n📋 OPÇÃO MANUAL:');
      console.log(
        '1. Acesse: https://supabase.com/dashboard/project/mqcfdwyhbtvaclslured/editor'
      );
      console.log('2. Vá em "SQL Editor"');
      console.log('3. Cole o conteúdo do arquivo create-purchase-requests.sql');
      console.log('4. Execute o SQL\n');
      return false;
    }

    console.log('✅ SQL executado com sucesso!\n');
    return true;
  } catch (err) {
    console.log('❌ Erro:', err.message);
    console.log('\n📋 EXECUTE MANUALMENTE:');
    console.log(
      '1. Acesse: https://supabase.com/dashboard/project/mqcfdwyhbtvaclslured/editor'
    );
    console.log('2. Vá em "SQL Editor"');
    console.log('3. Cole o SQL abaixo:\n');
    console.log('---SQL START---');
    console.log(sql);
    console.log('---SQL END---\n');
    return false;
  }
}

executeSQLFile('create-purchase-requests.sql').then(success => {
  if (success) {
    console.log('🎉 Tabela purchase_requests criada com sucesso!');
  }
  process.exit(success ? 0 : 1);
});
