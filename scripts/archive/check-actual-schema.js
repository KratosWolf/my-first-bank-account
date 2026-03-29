const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Erro: Variáveis não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkActualSchema() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 VERIFICANDO SCHEMA REAL DO SUPABASE');
  console.log('='.repeat(80) + '\n');

  // Tentar buscar spending_categories sem especificar colunas
  console.log('📋 1. TESTANDO: spending_categories\n');

  const { data: cats, error: e1 } = await supabase
    .from('spending_categories')
    .select('*')
    .limit(5);

  if (e1) {
    console.log(`   ❌ Erro: ${e1.message}`);
    console.log(`   Código: ${e1.code}`);
    console.log(`   Detalhes: ${e1.details}\n`);
  } else {
    console.log(`   ✅ Tabela existe! Registos: ${cats?.length || 0}\n`);
    if (cats && cats.length > 0) {
      console.log('   Colunas encontradas:');
      Object.keys(cats[0]).forEach(col => {
        console.log(`   - ${col}: ${typeof cats[0][col]}`);
      });
      console.log('\n   Primeiros registos:');
      cats.forEach((c, i) => {
        console.log(`   ${i + 1}. ${JSON.stringify(c, null, 2)}`);
      });
    } else {
      console.log('   ℹ️  Tabela vazia');
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📋 2. TESTANDO: child_spending_limits\n');

  const { data: limits, error: e2 } = await supabase
    .from('child_spending_limits')
    .select('*')
    .limit(5);

  if (e2) {
    console.log(`   ❌ Erro: ${e2.message}`);
    console.log(`   Código: ${e2.code}`);
    if (e2.code === '42P01') {
      console.log('   ⚠️  TABELA NÃO EXISTE no Supabase!\n');
    }
  } else {
    console.log(`   ✅ Tabela existe! Registos: ${limits?.length || 0}\n`);
    if (limits && limits.length > 0) {
      console.log('   Colunas encontradas:');
      Object.keys(limits[0]).forEach(col => {
        console.log(`   - ${col}: ${typeof limits[0][col]}`);
      });
    } else {
      console.log('   ℹ️  Tabela vazia');
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📋 3. TESTANDO: children\n');

  const { data: children, error: e3 } = await supabase
    .from('children')
    .select('id, name, pin')
    .limit(5);

  if (e3) {
    console.log(`   ❌ Erro: ${e3.message}`);
  } else {
    console.log(`   ✅ Tabela existe! Registos: ${children?.length || 0}\n`);
    if (children && children.length > 0) {
      children.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.name} (ID: ${c.id}, PIN: ${c.pin})`);
      });
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📋 4. TESTANDO: categories (nome alternativo)\n');

  const { data: altCats, error: e4 } = await supabase
    .from('categories')
    .select('*')
    .limit(5);

  if (e4) {
    console.log(`   ❌ Erro: ${e4.message}`);
    if (e4.code === '42P01') {
      console.log('   ℹ️  Tabela "categories" não existe\n');
    }
  } else {
    console.log(`   ✅ Tabela existe! Registos: ${altCats?.length || 0}\n`);
    if (altCats && altCats.length > 0) {
      console.log('   Colunas:');
      Object.keys(altCats[0]).forEach(col => {
        console.log(`   - ${col}`);
      });
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 RESUMO DO DIAGNÓSTICO:\n');

  if (e1 && e1.code === '42P01') {
    console.log('   ⚠️  PROBLEMA: spending_categories não existe');
  } else if (e1 && e1.message.includes('column')) {
    console.log(
      '   ⚠️  PROBLEMA: spending_categories existe mas schema não confere'
    );
  } else if (!e1) {
    console.log('   ✅ spending_categories: OK');
  }

  if (e2 && e2.code === '42P01') {
    console.log('   ❌ PROBLEMA: child_spending_limits NÃO EXISTE');
  } else if (!e2) {
    console.log('   ✅ child_spending_limits: OK');
  }

  if (!e3) {
    console.log('   ✅ children: OK');
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

checkActualSchema()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Erro fatal:', err);
    process.exit(1);
  });
