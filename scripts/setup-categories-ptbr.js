const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Erro: Variáveis não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapeamento de traduções e cores
const translations = {
  'Toys & Games': { name: 'Brinquedos e Jogos', color: '#EC4899' },
  'Books & Education': { name: 'Livros e Educação', color: '#8B5CF6' },
  'Clothes & Accessories': { name: 'Roupas e Acessórios', color: '#06B6D4' },
  'Food & Snacks': { name: 'Lanches e Doces', color: '#F59E0B' },
  'Digital & Apps': { name: 'Eletrônicos e Apps', color: '#3B82F6' },
  'Sports & Activities': { name: 'Esportes e Atividades', color: '#10B981' },
  'Art & Crafts': { name: 'Arte e Artesanato', color: '#F97316' },
  Other: { name: 'Outros', color: '#6B7280' },
  'Savings Transfer': { name: 'Transferência Poupança', color: '#14B8A6' },
  'Charity & Giving': { name: 'Caridade e Doação', color: '#EF4444' },
};

async function setupCategories() {
  console.log('\n' + '='.repeat(80));
  console.log('🔧 SETUP: Traduzir categorias para PT-BR e adicionar cores');
  console.log('='.repeat(80) + '\n');

  // 1. Buscar todas as categorias atuais
  console.log('📋 1. Buscando categorias atuais...\n');

  const { data: categories, error: fetchError } = await supabase
    .from('spending_categories')
    .select('*')
    .order('name');

  if (fetchError) {
    console.log('❌ Erro ao buscar categorias:', fetchError.message);
    process.exit(1);
  }

  console.log(`   Encontradas: ${categories.length} categorias\n`);

  // 2. Verificar se coluna color existe
  const hasColor =
    categories.length > 0 && categories[0].hasOwnProperty('color');

  if (!hasColor) {
    console.log('⚠️  ATENÇÃO: Coluna "color" não existe na tabela!');
    console.log('   Execute este SQL no Supabase Dashboard:\n');
    console.log(
      "   ALTER TABLE spending_categories ADD COLUMN color VARCHAR(7) DEFAULT '#3B82F6';\n"
    );
    console.log('   Depois execute este script novamente.\n');
    process.exit(1);
  }

  // 3. Atualizar cada categoria
  console.log('🔄 2. Atualizando categorias...\n');

  let updated = 0;
  let skipped = 0;

  for (const category of categories) {
    const translation = translations[category.name];

    if (translation) {
      const { error: updateError } = await supabase
        .from('spending_categories')
        .update({
          name: translation.name,
          color: translation.color,
        })
        .eq('id', category.id);

      if (updateError) {
        console.log(
          `   ❌ Erro ao atualizar "${category.name}":`,
          updateError.message
        );
      } else {
        console.log(
          `   ✅ ${category.icon} ${category.name} → ${translation.name} (${translation.color})`
        );
        updated++;
      }
    } else {
      console.log(
        `   ⚠️  ${category.icon} ${category.name} - SEM TRADUÇÃO (mantida)`
      );
      skipped++;
    }
  }

  // 4. Resumo
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESUMO\n');
  console.log(`   ✅ Atualizadas: ${updated}`);
  console.log(`   ⚠️  Ignoradas: ${skipped}`);
  console.log(`   📋 Total: ${categories.length}`);

  // 5. Listar categorias finais
  console.log('\n' + '='.repeat(80));
  console.log('📋 CATEGORIAS ATUALIZADAS\n');

  const { data: finalCategories } = await supabase
    .from('spending_categories')
    .select('*')
    .order('name');

  if (finalCategories) {
    finalCategories.forEach((cat, i) => {
      console.log(`   ${i + 1}. ${cat.icon} ${cat.name}`);
      console.log(`      Cor: ${cat.color || 'N/A'}`);
      console.log(`      Limite mensal: R$ ${cat.monthly_limit}`);
      console.log(`      Limite trimestral: R$ ${cat.quarterly_limit}\n`);
    });
  }

  console.log('='.repeat(80) + '\n');
  console.log('✅ Setup completo!\n');
}

setupCategories()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erro fatal:', err.message);
    console.error(err);
    process.exit(1);
  });
