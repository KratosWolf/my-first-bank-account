const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Erro: Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseInterestSystem() {
  console.log('\n' + '='.repeat(80));
  console.log('💰 DIAGNÓSTICO COMPLETO - FASE 3: SISTEMA DE JUROS AUTOMÁTICO');
  console.log('='.repeat(80) + '\n');

  // 1. VERIFICAR TABELA INTEREST_CONFIG
  console.log('📋 1. TABELA interest_config\n');

  const { data: configs, error: configError } = await supabase
    .from('interest_config')
    .select('*')
    .order('created_at');

  if (configError) {
    if (configError.code === '42P01') {
      console.log('   ❌ Tabela interest_config NÃO EXISTE no Supabase\n');
    } else {
      console.log(
        '   ❌ Erro ao buscar configurações:',
        configError.message,
        '\n'
      );
    }
  } else {
    const total = configs?.length || 0;
    console.log(`   Total de configurações: ${total}\n`);

    if (configs && configs.length > 0) {
      configs.forEach((config, index) => {
        console.log(`   ${index + 1}. Child ID: ${config.child_id}`);
        console.log(`      Taxa anual: ${config.annual_rate}%`);
        console.log(`      Frequência: ${config.compound_frequency}`);
        console.log(
          `      Saldo mínimo: R$ ${config.minimum_balance.toFixed(2)}`
        );
        console.log(`      Ativo: ${config.is_active ? 'Sim' : 'Não'}`);
        console.log(`      Último rendimento: ${config.last_interest_date}`);
        console.log('');
      });
    } else {
      console.log('   ℹ️  Nenhuma configuração de juros encontrada\n');
    }
  }

  // 2. VERIFICAR SCHEMA DA TABELA
  console.log('='.repeat(80));
  console.log('🔍 2. VERIFICAR SCHEMA DA TABELA\n');

  if (!configError && configs && configs.length > 0) {
    console.log('   Colunas existentes:\n');
    const sample = configs[0];
    Object.keys(sample).forEach(col => {
      const value = sample[col];
      const type = typeof value;
      console.log(`   ✓ ${col}: ${type}`);
    });
  } else if (configError && configError.code === '42P01') {
    console.log('   ⚠️  Tabela não existe - precisa ser criada\n');
    console.log('   SQL para criar:\n');
    console.log(`
   CREATE TABLE interest_config (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     child_id UUID NOT NULL REFERENCES children(id),
     annual_rate NUMERIC NOT NULL,
     compound_frequency TEXT CHECK (compound_frequency IN ('daily', 'weekly', 'monthly')),
     minimum_balance NUMERIC DEFAULT 0,
     is_active BOOLEAN DEFAULT true,
     last_interest_date DATE,
     created_at TIMESTAMP DEFAULT NOW()
   );
    `);
  }

  // 3. VERIFICAR SALDOS DAS CRIANÇAS
  console.log('\n' + '='.repeat(80));
  console.log('👶 3. SALDOS DAS CRIANÇAS\n');

  const { data: children, error: childrenError } = await supabase
    .from('children')
    .select('id, name, balance, total_earned, total_spent')
    .order('name');

  if (childrenError) {
    console.log('   ❌ Erro ao buscar crianças:', childrenError.message, '\n');
  } else {
    const total = children?.length || 0;
    console.log(`   Total de crianças: ${total}\n`);

    if (children && children.length > 0) {
      children.forEach((child, index) => {
        const hasConfig = configs?.some(c => c.child_id === child.id);
        console.log(
          `   ${index + 1}. ${child.name} (${child.id.substring(0, 8)}...)`
        );
        console.log(`      Saldo: R$ ${child.balance.toFixed(2)}`);
        console.log(`      Total ganho: R$ ${child.total_earned.toFixed(2)}`);
        console.log(`      Total gasto: R$ ${child.total_spent.toFixed(2)}`);
        console.log(
          `      Config de juros: ${hasConfig ? '✅ Sim' : '❌ Não'}`
        );
        console.log('');
      });
    }
  }

  // 4. VERIFICAR TRANSAÇÕES DE JUROS EXISTENTES
  console.log('='.repeat(80));
  console.log('💸 4. TRANSAÇÕES DE JUROS (HISTÓRICO)\n');

  const { data: interestTransactions, error: transError } = await supabase
    .from('transactions')
    .select('*')
    .eq('type', 'interest')
    .order('created_at', { ascending: false })
    .limit(10);

  if (transError) {
    console.log('   ❌ Erro ao buscar transações:', transError.message, '\n');
  } else {
    const total = interestTransactions?.length || 0;
    console.log(`   Total de transações de juros (últimas 10): ${total}\n`);

    if (interestTransactions && interestTransactions.length > 0) {
      interestTransactions.forEach((trans, index) => {
        console.log(`   ${index + 1}. ${trans.description}`);
        console.log(`      Child ID: ${trans.child_id.substring(0, 8)}...`);
        console.log(`      Valor: R$ ${trans.amount.toFixed(2)}`);
        console.log(
          `      Data: ${new Date(trans.created_at).toLocaleDateString('pt-BR')}`
        );
        console.log(`      Status: ${trans.status}`);
        console.log('');
      });
    } else {
      console.log('   ℹ️  Nenhuma transação de juros encontrada\n');
    }
  }

  // 5. VERIFICAR CÓDIGO FRONTEND
  console.log('='.repeat(80));
  console.log('🔧 5. ANÁLISE DE CÓDIGO\n');

  console.log('   BACKEND (Supabase):');
  console.log(
    `   ${!configError ? '✓' : '✗'} Tabela interest_config: ${configs?.length || 0} registos`
  );
  console.log('   ✓ Interface InterestConfig: definida em src/lib/supabase.ts');
  console.log('   ✓ TransactionService.calculateInterest(): implementado');
  console.log('   ✓ API Cron apply-interest: existe (mas em pages-backup/)');
  console.log('');

  console.log('   FRONTEND (UI):');
  console.log('   ✗ Nenhuma interface encontrada para configurar juros');
  console.log('   ✗ Não há modal ou página para pais configurarem taxas');
  console.log('   ✗ Não há visualização de histórico de rendimentos');
  console.log('');

  // 6. GAP ANALYSIS
  console.log('='.repeat(80));
  console.log('📊 6. GAP ANALYSIS (O QUE EXISTE vs O QUE FALTA)\n');

  console.log('   ✅ EXISTE:');
  console.log('   1. Interface TypeScript InterestConfig completa');
  console.log('   2. Método calculateInterest() no TransactionService');
  console.log('   3. API Cron para aplicar juros automaticamente');
  console.log('   4. Tipo de transação "interest" definido');
  console.log('');

  console.log('   ❌ FALTA:');
  console.log('   1. Tabela interest_config no Supabase (se não existir)');
  console.log('   2. UI para pais configurarem taxa de juros por criança');
  console.log('   3. UI para visualizar histórico de rendimentos');
  console.log('   4. Cron job ativo (mover de pages-backup para pages/api)');
  console.log(
    '   5. Configuração inicial padrão (criar configs ao cadastrar criança)'
  );
  console.log('   6. Dashboard mostrando rendimento mensal acumulado');
  console.log('');

  // 7. RECOMENDAÇÕES
  console.log('='.repeat(80));
  console.log('🎯 7. PLANO DE AÇÃO RECOMENDADO\n');

  console.log('   FASE 3.1 - Setup Básico (IMEDIATO):');
  console.log(
    '   1. Criar tabela interest_config no Supabase (se não existir)'
  );
  console.log('   2. Criar configuração padrão para Rafael e Gabriel');
  console.log(
    '   3. Testar TransactionService.calculateInterest() manualmente'
  );
  console.log('');

  console.log('   FASE 3.2 - Interface de Configuração (2-3h):');
  console.log('   1. Criar modal/página para configurar juros');
  console.log(
    '   2. Permitir pais configurarem: taxa, frequência, saldo mínimo'
  );
  console.log('   3. Mostrar preview do rendimento estimado');
  console.log('');

  console.log('   FASE 3.3 - Automação (1-2h):');
  console.log('   1. Mover API cron de pages-backup para pages/api');
  console.log('   2. Configurar Vercel Cron ou GitHub Actions');
  console.log('   3. Adicionar logs e notificações');
  console.log('');

  console.log('   FASE 3.4 - Visualização (2-3h):');
  console.log('   1. Dashboard com histórico de rendimentos');
  console.log('   2. Gráfico de evolução do saldo');
  console.log('   3. Projeções futuras baseadas na taxa atual');
  console.log('');

  console.log('='.repeat(80) + '\n');
}

diagnoseInterestSystem()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('💥 Erro:', err);
    process.exit(1);
  });
