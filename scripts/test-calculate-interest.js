const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Erro: Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Replicar a lógica do TransactionService.calculateInterest()
async function calculateInterest(childId) {
  console.log('\n' + '-'.repeat(80));

  try {
    // 1. Buscar configuração de juros
    const { data: config, error: configError } = await supabase
      .from('interest_config')
      .select('*')
      .eq('child_id', childId)
      .eq('is_active', true)
      .single();

    if (configError || !config) {
      console.log(
        '❌ Nenhuma configuração de juros encontrada para este filho'
      );
      return null;
    }

    console.log('✅ Configuração de juros encontrada:');
    console.log(`   Taxa anual: ${config.annual_rate}%`);
    console.log(`   Frequência: ${config.compound_frequency}`);
    console.log(`   Saldo mínimo: R$ ${config.minimum_balance}`);
    console.log(`   Ativo: ${config.is_active}`);
    console.log(
      `   Último rendimento: ${config.last_interest_date || 'Nunca'}\n`
    );

    // 2. Buscar saldo atual da criança
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id, name, balance, created_at')
      .eq('id', childId)
      .single();

    if (childError || !child) {
      console.log('❌ Erro ao buscar dados da criança:', childError?.message);
      return null;
    }

    console.log(`📊 Criança: ${child.name}`);
    console.log(`   Saldo atual: R$ ${child.balance.toFixed(2)}\n`);

    // 3. Verificar se saldo atual atinge o mínimo
    if (child.balance < config.minimum_balance) {
      console.log(`⚠️  Saldo abaixo do mínimo para render juros`);
      console.log(`   Saldo atual: R$ ${child.balance.toFixed(2)}`);
      console.log(
        `   Mínimo necessário: R$ ${config.minimum_balance.toFixed(2)}\n`
      );
      return null;
    }

    // 4. Calcular saldo elegível (dinheiro há 30+ dias na conta)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log('🔍 Verificando transações dos últimos 30 dias...');
    console.log(
      `   Data de corte: ${thirtyDaysAgo.toISOString().split('T')[0]}\n`
    );

    const { data: recentTransactions, error: txError } = await supabase
      .from('transactions')
      .select('amount, type, created_at, description')
      .eq('child_id', childId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .in('type', ['earning', 'allowance', 'reward', 'transfer', 'interest'])
      .order('created_at', { ascending: true });

    if (txError) {
      console.log('❌ Erro ao buscar transações recentes:', txError.message);
      return null;
    }

    console.log(
      `   Transações recentes (30 dias): ${recentTransactions?.length || 0}`
    );

    if (recentTransactions && recentTransactions.length > 0) {
      console.log('   Entradas recentes:\n');
      recentTransactions.forEach((tx, i) => {
        const date = new Date(tx.created_at).toLocaleDateString('pt-BR');
        console.log(
          `   ${i + 1}. ${date} - ${tx.type}: R$ ${tx.amount.toFixed(2)}`
        );
        console.log(`      ${tx.description}\n`);
      });
    }

    // Calcular saldo elegível
    let eligibleBalance = child.balance;

    if (recentTransactions && recentTransactions.length > 0) {
      const recentDeposits = recentTransactions.reduce(
        (sum, tx) => sum + tx.amount,
        0
      );
      eligibleBalance = child.balance - recentDeposits;

      console.log('💰 Cálculo do saldo elegível:');
      console.log(`   Saldo atual: R$ ${child.balance.toFixed(2)}`);
      console.log(
        `   (-) Entradas recentes (30 dias): R$ ${recentDeposits.toFixed(2)}`
      );
      console.log(
        `   (=) Saldo elegível (30+ dias): R$ ${eligibleBalance.toFixed(2)}\n`
      );
    } else {
      console.log('💰 Saldo elegível:');
      console.log(`   Nenhuma entrada nos últimos 30 dias`);
      console.log(
        `   Todo o saldo é elegível: R$ ${eligibleBalance.toFixed(2)}\n`
      );
    }

    // Garantir não negativo
    eligibleBalance = Math.max(0, eligibleBalance);

    if (eligibleBalance < config.minimum_balance) {
      console.log('⚠️  Saldo elegível (30+ dias) abaixo do mínimo');
      console.log(`   Saldo elegível: R$ ${eligibleBalance.toFixed(2)}`);
      console.log(
        `   Mínimo necessário: R$ ${config.minimum_balance.toFixed(2)}\n`
      );
      return null;
    }

    // 5. Calcular juros
    let monthlyRate = config.annual_rate;
    if (monthlyRate > 1) {
      monthlyRate = monthlyRate / 100; // Converter percentual para decimal
    }

    const interestAmount =
      Math.round(eligibleBalance * monthlyRate * 100) / 100;

    console.log('📈 Cálculo dos juros:');
    console.log(`   Taxa anual: ${config.annual_rate}%`);
    console.log(
      `   Taxa mensal: ${(monthlyRate * 100).toFixed(3)}% (${monthlyRate.toFixed(5)} em decimal)`
    );
    console.log(`   Saldo elegível: R$ ${eligibleBalance.toFixed(2)}`);
    console.log(
      `   Fórmula: ${eligibleBalance.toFixed(2)} × ${monthlyRate.toFixed(5)} = ${interestAmount.toFixed(2)}`
    );
    console.log(
      `   \n   💵 JUROS A APLICAR: R$ ${interestAmount.toFixed(2)}\n`
    );

    if (interestAmount < 0.01) {
      console.log('⚠️  Valor de juros muito pequeno (< R$ 0.01)');
      console.log(`   Não será criada transação\n`);
      return null;
    }

    // 6. Criar transação de juros (simulação - não executar de verdade)
    console.log('📝 Transação que SERIA criada:');
    console.log(`   Tipo: interest`);
    console.log(`   Valor: R$ ${interestAmount.toFixed(2)}`);
    console.log(
      `   Descrição: "Rendimento mensal (${(monthlyRate * 100).toFixed(1)}% sobre R$ ${eligibleBalance.toFixed(2)})"`
    );
    console.log(`   Status: completed`);
    console.log(
      `   \n   ⚠️  NOTA: Este é apenas um TESTE - transação NÃO foi criada de verdade\n`
    );

    return {
      childName: child.name,
      currentBalance: child.balance,
      eligibleBalance: eligibleBalance,
      interestRate: config.annual_rate,
      monthlyRate: monthlyRate * 100,
      interestAmount: interestAmount,
      newBalance: child.balance + interestAmount,
    };
  } catch (error) {
    console.log('❌ Erro ao calcular juros:', error.message);
    console.error(error);
    return null;
  }
}

async function testInterestCalculation() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TESTE MANUAL: TransactionService.calculateInterest()');
  console.log('='.repeat(80) + '\n');

  console.log('⚠️  IMPORTANTE: Este script apenas SIMULA o cálculo de juros');
  console.log(
    '   Nenhuma transação será criada de verdade no banco de dados\n'
  );

  // 1. Buscar todas as crianças com configuração de juros
  const { data: configs, error: configsError } = await supabase
    .from('interest_config')
    .select(
      `
      *,
      children (id, name, balance)
    `
    )
    .eq('is_active', true)
    .order('children(name)');

  if (configsError) {
    console.log('❌ Erro ao buscar configurações:', configsError.message);
    process.exit(1);
  }

  if (!configs || configs.length === 0) {
    console.log('⚠️  Nenhuma configuração de juros ativa encontrada\n');
    process.exit(0);
  }

  console.log(
    `📋 Encontradas ${configs.length} configurações de juros ativas\n`
  );

  const results = [];

  // 2. Testar cada criança
  for (const config of configs) {
    const childName = config.children?.name || 'N/A';
    const childId = config.child_id;

    console.log('='.repeat(80));
    console.log(`🧒 TESTANDO: ${childName}`);

    const result = await calculateInterest(childId);
    if (result) {
      results.push(result);
    }
  }

  // 3. Resumo final
  console.log('='.repeat(80));
  console.log('📊 RESUMO DO TESTE\n');

  if (results.length === 0) {
    console.log(
      '   Nenhum rendimento seria gerado (saldos abaixo do mínimo)\n'
    );
  } else {
    console.log(`   ${results.length} crianças receberiam juros:\n`);

    let totalInterest = 0;

    results.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.childName}`);
      console.log(`      Saldo atual: R$ ${r.currentBalance.toFixed(2)}`);
      console.log(`      Saldo elegível: R$ ${r.eligibleBalance.toFixed(2)}`);
      console.log(`      Taxa mensal: ${r.monthlyRate.toFixed(3)}%`);
      console.log(`      Juros: R$ ${r.interestAmount.toFixed(2)}`);
      console.log(`      Novo saldo: R$ ${r.newBalance.toFixed(2)}\n`);

      totalInterest += r.interestAmount;
    });

    console.log(`   💰 Total de juros: R$ ${totalInterest.toFixed(2)}\n`);
  }

  console.log('='.repeat(80));
  console.log('✅ TESTE COMPLETO\n');
}

testInterestCalculation()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('💥 Erro fatal:', err.message);
    console.error(err);
    process.exit(1);
  });
