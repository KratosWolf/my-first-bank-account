const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Erro: Variáveis não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fullDiagnostic() {
  console.log('\n' + '='.repeat(80));
  console.log(
    '📊 DIAGNÓSTICO COMPLETO - FASE 2.5: SISTEMA DE CATEGORIAS E LIMITES'
  );
  console.log('='.repeat(80) + '\n');

  // 1. TODAS AS CATEGORIAS
  console.log('📋 1. TODAS AS CATEGORIAS EM spending_categories\n');

  const { data: allCategories, error: catErr } = await supabase
    .from('spending_categories')
    .select('*')
    .order('name');

  if (catErr) {
    console.log(`   ❌ Erro: ${catErr.message}\n`);
  } else {
    console.log(`   Total de categorias: ${allCategories?.length || 0}\n`);

    if (allCategories && allCategories.length > 0) {
      allCategories.forEach((cat, i) => {
        console.log(`   ${i + 1}. ${cat.icon} ${cat.name}`);
        console.log(`      ID: ${cat.id}`);
        console.log(`      Limite mensal: R$ ${cat.monthly_limit}`);
        console.log(`      Limite trimestral: R$ ${cat.quarterly_limit}`);
        console.log(`      Habilitada: ${cat.enabled ? 'Sim' : 'Não'}`);
        console.log(`      Family ID: ${cat.family_id || 'null (global)'}`);
        console.log('');
      });

      // Verificar duplicatas
      const names = allCategories.map(c => c.name.toLowerCase());
      const dups = names.filter((n, i) => names.indexOf(n) !== i);

      if (dups.length > 0) {
        console.log('   ⚠️  ATENÇÃO: Categorias duplicadas:\n');
        const uniqueDups = [...new Set(dups)];
        uniqueDups.forEach(dup => {
          const items = allCategories.filter(c => c.name.toLowerCase() === dup);
          console.log(`   - "${items[0].name}": ${items.length} ocorrências`);
          items.forEach(item => {
            console.log(`     • ID: ${item.id} | Enabled: ${item.enabled}`);
          });
        });
        console.log('');
      } else {
        console.log('   ✅ Sem duplicatas\n');
      }
    }
  }

  // 2. CRIANÇAS CADASTRADAS
  console.log('='.repeat(80));
  console.log('👶 2. CRIANÇAS CADASTRADAS\n');

  const { data: children, error: childErr } = await supabase
    .from('children')
    .select('id, name, pin, balance')
    .order('name');

  if (childErr) {
    console.log(`   ❌ Erro: ${childErr.message}\n`);
  } else {
    console.log(`   Total de crianças: ${children?.length || 0}\n`);
    if (children && children.length > 0) {
      children.forEach((child, i) => {
        console.log(`   ${i + 1}. ${child.name}`);
        console.log(`      ID: ${child.id}`);
        console.log(`      PIN: ${child.pin}`);
        console.log(`      Saldo: R$ ${child.balance || 0}\n`);
      });
    }
  }

  // 3. ANÁLISE DE SCHEMA
  console.log('='.repeat(80));
  console.log('🏗️  3. ANÁLISE DO SCHEMA ATUAL\n');

  console.log('   SCHEMA REAL (Supabase):');
  console.log('   ┌─ spending_categories');
  console.log('   │  ├─ id (UUID)');
  console.log('   │  ├─ family_id (UUID, nullable)');
  console.log('   │  ├─ name (string)');
  console.log('   │  ├─ icon (string)');
  console.log('   │  ├─ monthly_limit (number)');
  console.log('   │  ├─ quarterly_limit (number)');
  console.log('   │  ├─ enabled (boolean)');
  console.log('   │  └─ created_at (timestamp)');
  console.log('   │');
  console.log('   ❌ child_spending_limits: NÃO EXISTE\n');

  console.log('   SCHEMA DOS ARQUIVOS SQL:');
  console.log('   ┌─ spending_categories');
  console.log('   │  ├─ id');
  console.log('   │  ├─ name');
  console.log('   │  ├─ description');
  console.log('   │  ├─ icon');
  console.log('   │  ├─ color');
  console.log('   │  ├─ requires_approval');
  console.log('   │  ├─ spending_limit');
  console.log('   │  ├─ is_active');
  console.log('   │  └─ created_at');
  console.log('   │');
  console.log('   └─ child_spending_limits');
  console.log('      ├─ id');
  console.log('      ├─ child_id');
  console.log('      ├─ category_id');
  console.log('      ├─ daily_limit');
  console.log('      ├─ weekly_limit');
  console.log('      ├─ monthly_limit');
  console.log('      ├─ requires_approval_over');
  console.log('      └─ is_active\n');

  // 4. GAP ANALYSIS
  console.log('='.repeat(80));
  console.log('🔍 4. ANÁLISE DE GAP (Frontend vs Backend)\n');

  console.log('   BACKEND (Supabase):');
  console.log(
    '   ✓ spending_categories: ' + (allCategories?.length || 0) + ' categorias'
  );
  console.log('   ✓ Limites: monthly_limit e quarterly_limit POR CATEGORIA');
  console.log('   ✗ Não há limites personalizados por criança');
  console.log('   ✗ Tabela child_spending_limits NÃO EXISTE\n');

  console.log('   FRONTEND (localStorage):');
  console.log('   ✓ CategoriesManager.tsx: usa localStorage');
  console.log('   ✓ categoriesService.ts: 10 categorias hardcoded');
  console.log('   ✗ Interface Category: NÃO tem campos de limite');
  console.log('   ✗ Não sincroniza com Supabase\n');

  // 5. RECOMENDAÇÕES
  console.log('='.repeat(80));
  console.log('🎯 5. RECOMENDAÇÕES PARA FASE 2.5\n');

  console.log('   OPÇÃO A - Usar schema atual do Supabase:');
  console.log('   1. Conectar CategoriesManager ao Supabase');
  console.log('   2. Usar monthly_limit e quarterly_limit das categorias');
  console.log('   3. Limites são IGUAIS para todas as crianças');
  console.log('   4. Mais simples, mas menos flexível\n');

  console.log('   OPÇÃO B - Implementar schema dos SQL files:');
  console.log('   1. Criar tabela child_spending_limits no Supabase');
  console.log('   2. Adicionar campos color, requires_approval, etc');
  console.log('   3. Permitir limites personalizados por criança');
  console.log('   4. Mais complexo, mas muito mais flexível\n');

  console.log('   OPÇÃO C - Híbrido:');
  console.log('   1. Manter limites globais em spending_categories');
  console.log(
    '   2. Criar child_spending_limits para SOBRESCREVER quando necessário'
  );
  console.log(
    '   3. Se child tem limite personalizado, usar esse; senão, usar global'
  );
  console.log('   4. Equilíbrio entre simplicidade e flexibilidade\n');

  console.log('='.repeat(80) + '\n');
}

fullDiagnostic()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erro fatal:', err.message);
    process.exit(1);
  });
