const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testConnection() {
  console.log('🔍 Testando conexão com Supabase...\n');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  console.log('\n');

  try {
    const { data, error } = await supabase
      .from('families')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Erro na conexão:', error.message);
      return false;
    }

    console.log('✅ Conexão com Supabase OK!\n');
    return true;
  } catch (err) {
    console.log('❌ Erro:', err.message);
    return false;
  }
}

testConnection().then(() => process.exit(0));
