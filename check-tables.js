const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTables() {
  console.log('🔍 Verificando tabelas existentes...\n');
  
  const tables = ['families', 'children', 'transactions', 'goals', 'purchase_requests', 'badges'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('count').limit(1);
    if (error) {
      console.log(`❌ ${table}: NÃO EXISTE ou erro - ${error.message}`);
    } else {
      console.log(`✅ ${table}: OK`);
    }
  }
}

checkTables().then(() => process.exit(0));
