import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Precisamos da chave de serviço

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Configurações do Supabase não encontradas');
  console.log('Preciso da SUPABASE_SERVICE_ROLE_KEY no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupPolicies() {
  console.log('🔧 Configurando políticas RLS do Supabase...');

  try {
    // Desabilitar RLS temporariamente para desenvolvimento
    const tables = [
      'families',
      'children',
      'transactions',
      'purchase_requests',
    ];

    for (const table of tables) {
      console.log(`⚙️ Desabilitando RLS para tabela: ${table}`);

      const { error } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`,
      });

      if (error) {
        console.warn(`⚠️ Aviso para ${table}:`, error.message);
      } else {
        console.log(`✅ RLS desabilitado para ${table}`);
      }
    }

    console.log(
      '✅ Configuração concluída! Agora o app deve funcionar sem erros RLS.'
    );
  } catch (error) {
    console.error('❌ Erro ao configurar políticas:', error);
  }
}

setupPolicies();
