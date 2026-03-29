// Script para consultar dados da família no Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function queryFamilyData() {
  console.log('🔍 Buscando dados da família Fernandes...\n');

  // Buscar família
  const { data: families, error: familyError } = await supabase
    .from('families')
    .select('*');

  if (familyError) {
    console.error('❌ Erro ao buscar famílias:', familyError);
    return;
  }

  console.log('📊 Famílias encontradas:');
  console.log(JSON.stringify(families, null, 2));
  console.log('\n');

  // Buscar crianças
  const { data: children, error: childrenError } = await supabase
    .from('children')
    .select('*')
    .order('name');

  if (childrenError) {
    console.error('❌ Erro ao buscar crianças:', childrenError);
    return;
  }

  console.log('👶 Crianças encontradas:');
  console.log(JSON.stringify(children, null, 2));
  console.log('\n');

  // Procurar Rafael e Gabriel
  const rafael = children?.find(c => c.name.toLowerCase().includes('rafael'));
  const gabriel = children?.find(c => c.name.toLowerCase().includes('gabriel'));

  console.log('🎯 Dados específicos:');
  if (families && families.length > 0) {
    console.log(`Family ID: ${families[0].id}`);
  }
  if (rafael) {
    console.log(`Rafael ID: ${rafael.id}`);
  }
  if (gabriel) {
    console.log(`Gabriel ID: ${gabriel.id}`);
  }
}

queryFamilyData();
