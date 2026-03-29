const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColors() {
  console.log('🔍 Verificando cores das categorias no Supabase...\n');

  try {
    const { data: categories, error } = await supabase
      .from('spending_categories')
      .select('id, name, color')
      .order('name');

    if (error) {
      console.error('❌ Erro ao buscar categorias:', error);
      return;
    }

    console.log(`📊 Total de categorias: ${categories.length}\n`);

    let problemas = 0;

    categories.forEach((cat, index) => {
      const colorValue = cat.color || '';
      const isValid = /^#[0-9A-F]{6}$/i.test(colorValue);
      const status = isValid ? '✅' : '❌';

      console.log(`${index + 1}. ${status} ${cat.name}`);
      console.log(`   ID: ${cat.id}`);
      console.log(
        `   Cor: "${colorValue}" (${isValid ? 'VÁLIDA' : 'INVÁLIDA'})`
      );
      console.log('');

      if (!isValid) {
        problemas++;
      }
    });

    console.log('━'.repeat(60));
    if (problemas === 0) {
      console.log('✅ Todas as cores estão no formato correto!');
    } else {
      console.log(`❌ Encontrados ${problemas} problema(s) com cores!`);
      console.log('\n💡 Para corrigir, execute:');
      console.log('   NEXT_PUBLIC_SUPABASE_URL=... node scripts/fix-colors.js');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkColors();
