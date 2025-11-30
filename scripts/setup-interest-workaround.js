const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Erro: Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupInterestConfigsWorkaround() {
  console.log('\n' + '='.repeat(80));
  console.log('💰 SETUP FASE 3.1: CONFIGURAÇÕES DE JUROS (WORKAROUND)');
  console.log('='.repeat(80) + '\n');

  console.log(
    '⚠️  NOTA: Usando taxa de 9.9% ao ano devido à limitação do schema atual'
  );
  console.log(
    '   Para usar 12%, execute a migração 003_fix_interest_config_columns.sql\n'
  );

  // 1. BUSCAR CRIANÇAS
  console.log('📋 1. BUSCANDO CRIANÇAS CADASTRADAS\n');

  const { data: children, error: childrenError } = await supabase
    .from('children')
    .select('id, name, balance')
    .order('name');

  if (childrenError) {
    console.log('❌ Erro ao buscar crianças:', childrenError.message);
    process.exit(1);
  }

  console.log(`   Total de crianças: ${children?.length || 0}\n`);

  if (!children || children.length === 0) {
    console.log(
      '   ⚠️  Nenhuma criança cadastrada. Não há nada para configurar.\n'
    );
    process.exit(0);
  }

  children.forEach((child, i) => {
    console.log(`   ${i + 1}. ${child.name}`);
    console.log(`      ID: ${child.id}`);
    console.log(`      Saldo: R$ ${child.balance.toFixed(2)}\n`);
  });

  // 2. CONFIGURAÇÃO PADRÃO (ADAPTADA PARA NUMERIC(2,1))
  console.log('='.repeat(80));
  console.log('⚙️  2. CONFIGURAÇÃO PADRÃO DE JUROS (WORKAROUND)\n');

  const defaultConfig = {
    annual_rate: 9.9, // Máximo permitido por NUMERIC(2,1) - equivale a 0.825% ao mês
    compound_frequency: 'monthly',
    minimum_balance: 5.0, // R$ 5 (dentro do limite de 9.9)
    is_active: true,
    last_interest_date: null,
  };

  console.log('   Taxa anual: 9.9% (equivale a ~0.825% ao mês)');
  console.log('   Frequência: Mensal');
  console.log('   Saldo mínimo: R$ 5.00');
  console.log('   Status: Ativo\n');

  console.log('   💡 Com 9.9% ao ano:');
  console.log('      - Saldo de R$ 100 → R$ 0.83/mês → R$ 9.90/ano');
  console.log('      - Saldo de R$ 50  → R$ 0.41/mês → R$ 4.95/ano');
  console.log('      - Saldo de R$ 20  → R$ 0.17/mês → R$ 1.98/ano\n');

  // 3. VERIFICAR CONFIGURAÇÕES EXISTENTES
  console.log('='.repeat(80));
  console.log('🔍 3. VERIFICANDO CONFIGURAÇÕES EXISTENTES\n');

  const { data: existingConfigs, error: configError } = await supabase
    .from('interest_config')
    .select('*');

  if (configError) {
    console.log('❌ Erro ao verificar configurações:', configError.message);
    process.exit(1);
  }

  console.log(`   Configurações existentes: ${existingConfigs?.length || 0}\n`);

  // 4. CRIAR CONFIGURAÇÕES PARA CADA CRIANÇA
  console.log('='.repeat(80));
  console.log('🚀 4. CRIANDO CONFIGURAÇÕES DE JUROS\n');

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const child of children) {
    // Verificar se já existe configuração para esta criança
    const hasConfig = existingConfigs?.some(c => c.child_id === child.id);

    if (hasConfig) {
      console.log(`   ⏭️  ${child.name}: Configuração já existe (ignorando)`);
      skipped++;
      continue;
    }

    // Criar nova configuração
    const newConfig = {
      ...defaultConfig,
      child_id: child.id,
    };

    const { data, error } = await supabase
      .from('interest_config')
      .insert([newConfig])
      .select()
      .single();

    if (error) {
      console.log(`   ❌ ${child.name}: Erro ao criar configuração`);
      console.log(`      Erro: ${error.message}\n`);
      errors++;
    } else {
      console.log(`   ✅ ${child.name}: Configuração criada com sucesso`);
      console.log(`      ID: ${data.id}`);
      console.log(
        `      Taxa: ${data.annual_rate}% ao ano (~${(data.annual_rate / 12).toFixed(3)}% ao mês)`
      );
      console.log(`      Frequência: ${data.compound_frequency}`);
      console.log(
        `      Saldo mínimo: R$ ${data.minimum_balance.toFixed(2)}\n`
      );
      created++;
    }
  }

  // 5. RESUMO FINAL
  console.log('='.repeat(80));
  console.log('📊 5. RESUMO FINAL\n');

  console.log(`   ✅ Configurações criadas: ${created}`);
  console.log(`   ⏭️  Configurações existentes: ${skipped}`);
  console.log(`   ❌ Erros: ${errors}`);
  console.log(`   📋 Total de crianças: ${children.length}\n`);

  // 6. LISTAR TODAS AS CONFIGURAÇÕES
  console.log('='.repeat(80));
  console.log('📋 6. CONFIGURAÇÕES FINAIS\n');

  const { data: finalConfigs, error: finalError } = await supabase
    .from('interest_config')
    .select(
      `
      *,
      children (name)
    `
    )
    .order('children(name)');

  if (finalError) {
    console.log(
      '   ❌ Erro ao buscar configurações finais:',
      finalError.message
    );
  } else {
    if (finalConfigs && finalConfigs.length > 0) {
      finalConfigs.forEach((config, i) => {
        const childName = config.children?.name || 'N/A';
        const monthlyRate = (config.annual_rate / 12).toFixed(3);
        console.log(`   ${i + 1}. ${childName}`);
        console.log(`      ID Config: ${config.id}`);
        console.log(
          `      Taxa anual: ${config.annual_rate}% (~${monthlyRate}% ao mês)`
        );
        console.log(`      Frequência: ${config.compound_frequency}`);
        console.log(
          `      Saldo mínimo: R$ ${config.minimum_balance.toFixed(2)}`
        );
        console.log(`      Ativo: ${config.is_active ? 'Sim' : 'Não'}`);
        console.log(
          `      Último rendimento: ${config.last_interest_date || 'Nunca'}\n`
        );
      });
    } else {
      console.log('   ℹ️  Nenhuma configuração encontrada\n');
    }
  }

  // 7. PRÓXIMOS PASSOS
  console.log('='.repeat(80));
  console.log('🎯 PRÓXIMOS PASSOS\n');

  if (created > 0) {
    console.log('   FASE 3.1 ✅ COMPLETA (COM WORKAROUND)');
    console.log('   - Configurações padrão criadas para todas as crianças');
    console.log('   - Taxa de 9.9% ao ano (~0.825% ao mês)\n');

    console.log('   ⚠️  OPCIONAL: Aplicar migração para usar 12%');
    console.log(
      '   - Execute database/migrations/003_fix_interest_config_columns.sql'
    );
    console.log(
      '   - Depois execute scripts/setup-interest.js para reconfigurar\n'
    );
  }

  console.log('   PRÓXIMO: FASE 3.2 - Interface de Configuração');
  console.log('   - Criar modal para pais configurarem taxa de juros');
  console.log('   - Permitir editar: taxa, frequência, saldo mínimo');
  console.log('   - Mostrar preview do rendimento estimado\n');

  console.log('   PRÓXIMO: FASE 3.3 - Automação');
  console.log('   - Mover API cron de pages-backup/ para pages/api/');
  console.log('   - Configurar Vercel Cron ou GitHub Actions');
  console.log('   - Testar aplicação automática de juros\n');

  console.log('='.repeat(80) + '\n');
}

setupInterestConfigsWorkaround()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('💥 Erro fatal:', err.message);
    console.error(err);
    process.exit(1);
  });
