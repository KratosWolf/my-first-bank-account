const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixChildren() {
  console.log('🔧 Corrigindo dados das crianças...\n');

  // Corrigir Rafael - 9 anos, emoji menino
  const { error: error1 } = await supabase
    .from('children')
    .update({ age: 9, avatar: '👦' })
    .eq('name', 'Rafael');
  
  if (error1) console.log('❌ Erro Rafael:', error1.message);
  else console.log('✅ Rafael corrigido: 9 anos, 👦');

  // Corrigir Gabriel - 10 anos, emoji menino
  const { error: error2 } = await supabase
    .from('children')
    .update({ age: 10, avatar: '👦' })
    .eq('name', 'Gabriel');
  
  if (error2) console.log('❌ Erro Gabriel:', error2.message);
  else console.log('✅ Gabriel corrigido: 10 anos, 👦');

  console.log('\n🎉 Correções aplicadas! Recarregue o browser.');
}
fixChildren();
