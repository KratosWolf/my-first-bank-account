const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkChildren() {
  const { data, error } = await supabase.from('children').select('*');
  console.log('👶 Dados atuais das crianças:\n');
  data?.forEach(child => {
    console.log(`Nome: ${child.name}`);
    console.log(`  Idade: ${child.age}`);
    console.log(`  Avatar: ${child.avatar}`);
    console.log(`  Birth Date: ${child.birth_date || 'NÃO DEFINIDO'}`);
    console.log('');
  });
}
checkChildren();
