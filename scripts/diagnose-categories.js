const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Erro: Variáveis de ambiente do Supabase não configuradas');
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseCategoriesSystem() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 DIAGNÓSTICO: SISTEMA DE CATEGORIAS - FASE 2.5');
  console.log('='.repeat(80) + '\n');

  // 1. LISTAR TODAS AS CATEGORIAS
  console.log('📋 1. CATEGORIAS NA TABELA spending_categories\n');

  const { data: categories, error: catError } = await supabase
    .from('spending_categories')
    .select(
      'id, name, icon, color, spending_limit, requires_approval, is_active'
    )
    .order('name');

  if (catError) {
    console.log('❌ Erro ao buscar categorias:', catError.message);
  } else {
    const total = categories?.length || 0;
    console.log(`   Total de categorias: ${total}\n`);

    if (categories && categories.length > 0) {
      categories.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.icon} ${cat.name}`);
        console.log(`      ID: ${cat.id}`);
        console.log(`      Cor: ${cat.color}`);
        console.log(
          `      Limite por transação: ${cat.spending_limit ? 'R$ ' + cat.spending_limit : 'Sem limite'}`
        );
        console.log(
          `      Requer aprovação: ${cat.requires_approval ? 'Sim' : 'Não'}`
        );
        console.log(`      Ativo: ${cat.is_active ? 'Sim' : 'Não'}`);
        console.log('');
      });

      // 2. VERIFICAR DUPLICATAS
      console.log('\n' + '='.repeat(80));
      console.log('🔎 2. VERIFICAÇÃO DE DUPLICATAS\n');

      const names = categories.map(c => c.name.toLowerCase());
      const duplicates = names.filter(
        (name, index) => names.indexOf(name) !== index
      );

      if (duplicates.length > 0) {
        console.log('⚠️  ATENÇÃO: Categorias duplicadas encontradas!\n');
        const uniqueDuplicates = [...new Set(duplicates)];
        uniqueDuplicates.forEach(dupName => {
          const items = categories.filter(
            c => c.name.toLowerCase() === dupName
          );
          console.log(`   - "${items[0].name}": ${items.length} ocorrências`);
          items.forEach((item, i) => {
            console.log(
              `     ${i + 1}. ID: ${item.id} | Ativo: ${item.is_active ? 'Sim' : 'Não'}`
            );
          });
          console.log('');
        });
      } else {
        console.log('   ✅ Nenhuma categoria duplicada encontrada\n');
      }
    } else {
      console.log('   ℹ️  Nenhuma categoria cadastrada no Supabase\n');
    }
  }

  // 3. VERIFICAR LIMITES DE GASTO POR CRIANÇA
  console.log('\n' + '='.repeat(80));
  console.log('💰 3. LIMITES CONFIGURADOS (child_spending_limits)\n');

  const { data: limits, error: limitsError } = await supabase
    .from('child_spending_limits')
    .select(
      `
      id,
      child_id,
      category_id,
      daily_limit,
      weekly_limit,
      monthly_limit,
      requires_approval_over,
      is_active,
      spending_categories (name, icon)
    `
    )
    .limit(10);

  if (limitsError) {
    console.log(`   ❌ Erro ao buscar limites: ${limitsError.message}\n`);
  } else {
    const totalLimits = limits?.length || 0;
    console.log(`   Total de limites configurados: ${totalLimits}\n`);

    if (limits && limits.length > 0) {
      limits.forEach((limit, index) => {
        const categoryName =
          limit.spending_categories?.name || 'Categoria desconhecida';
        const categoryIcon = limit.spending_categories?.icon || '❓';

        console.log(`   ${index + 1}. ${categoryIcon} ${categoryName}`);
        console.log(`      Child ID: ${limit.child_id}`);
        console.log(`      Limite diário: R$ ${limit.daily_limit || 0}`);
        console.log(`      Limite semanal: R$ ${limit.weekly_limit || 0}`);
        console.log(`      Limite mensal: R$ ${limit.monthly_limit || 0}`);
        console.log(
          `      Aprovação necessária acima de: R$ ${limit.requires_approval_over || 0}`
        );
        console.log(`      Ativo: ${limit.is_active ? 'Sim' : 'Não'}`);
        console.log('');
      });
    } else {
      console.log('   ℹ️  Nenhum limite configurado ainda\n');
    }
  }

  // 4. RESUMO E ANÁLISE DE GAP
  console.log('\n' + '='.repeat(80));
  console.log('📊 4. ANÁLISE DE GAP (Frontend vs Backend)\n');

  console.log('   BACKEND (Supabase):');
  console.log(
    `   ✓ Tabela spending_categories: ${categories?.length || 0} registos`
  );
  console.log(
    `   ✓ Tabela child_spending_limits: ${limits?.length || 0} registos`
  );
  console.log(
    `   ✓ Campos disponíveis: daily_limit, weekly_limit, monthly_limit`
  );
  console.log('');

  console.log('   FRONTEND (localStorage):');
  console.log('   ✓ CategoriesManager.tsx: usa localStorage');
  console.log('   ✓ categoriesService.ts: 10 categorias hardcoded');
  console.log('   ✗ Interface Category: NÃO tem campos de limite');
  console.log('   ✗ Nenhuma integração com Supabase');
  console.log('');

  console.log('   🎯 AÇÕES NECESSÁRIAS PARA FASE 2.5:');
  console.log('   1. Atualizar interface Category para incluir spending_limit');
  console.log('   2. Migrar CategoriesManager de localStorage para Supabase');
  console.log(
    '   3. Criar interface para configurar limites por criança/categoria'
  );
  console.log('   4. Implementar validação de limites nas transações');
  console.log('   5. Adicionar alertas quando limites forem atingidos');

  console.log('\n' + '='.repeat(80) + '\n');
}

diagnoseCategoriesSystem()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\n❌ Erro fatal:', err.message);
    console.error(err);
    process.exit(1);
  });
