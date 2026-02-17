/**
 * DIAGNÓSTICO DO BANCO DE DADOS SUPABASE
 * Lista todas as tabelas com campos, tipos e foreign keys
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.log(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY:',
    supabaseKey ? 'Definida' : 'Não definida'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseDatabaseSchema() {
  console.log('\n🔍 DIAGNÓSTICO COMPLETO DO BANCO DE DADOS\n');
  console.log('='.repeat(80));

  // Query para listar todas as tabelas com informações detalhadas
  const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT
        table_name,
        table_schema
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `,
  });

  // Como o RPC pode não estar disponível, vamos usar uma abordagem alternativa
  // Vamos fazer queries diretas nas tabelas conhecidas

  const knownTables = [
    'accounts',
    'transactions',
    'interest_config',
    'savings_goals',
    'children',
    'families',
    'users',
    'profiles',
    'purchase_requests',
    'chores',
    'chore_completions',
    'gamification_badges',
    'gamification_streaks',
    'gamification_levels',
    'notifications',
    'allowance_config',
    'goal_contributions',
    'goal_transactions',
    'categories',
    'loan_requests',
    'loan_payments',
  ];

  console.log(`\n📊 Testando ${knownTables.length} tabelas conhecidas...\n`);

  for (const tableName of knownTables) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${tableName.padEnd(25)} - NÃO EXISTE ou SEM ACESSO`);
      } else {
        console.log(`✅ ${tableName.padEnd(25)} - ${count || 0} registros`);
      }
    } catch (err) {
      console.log(`❌ ${tableName.padEnd(25)} - ERRO: ${err.message}`);
    }
  }

  // Agora vamos buscar detalhes das tabelas principais
  console.log('\n' + '='.repeat(80));
  console.log('📋 DETALHES DAS TABELAS PRINCIPAIS\n');

  const criticalTables = [
    'transactions',
    'interest_config',
    'savings_goals',
    'accounts',
    'children',
  ];

  for (const tableName of criticalTables) {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📌 TABELA: ${tableName.toUpperCase()}`);
    console.log('─'.repeat(80));

    try {
      // Buscar um registro de exemplo para ver os campos
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Erro ao acessar: ${error.message}`);
        continue;
      }

      if (data && data.length > 0) {
        const sample = data[0];
        console.log('\n🔑 CAMPOS ENCONTRADOS:');
        Object.entries(sample).forEach(([key, value]) => {
          const type = typeof value;
          const displayValue =
            value === null
              ? 'NULL'
              : type === 'string'
                ? `"${value.substring(0, 30)}${value.length > 30 ? '...' : ''}"`
                : type === 'object'
                  ? JSON.stringify(value).substring(0, 50)
                  : value;
          console.log(
            `  - ${key.padEnd(25)} : ${type.padEnd(10)} = ${displayValue}`
          );
        });

        // Buscar contagem total
        const { count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        console.log(`\n📊 Total de registros: ${count || 0}`);
      } else {
        console.log('\n⚠️  Tabela existe mas está vazia');
      }
    } catch (err) {
      console.log(`❌ Erro: ${err.message}`);
    }
  }

  // Testar especificamente a estrutura de interest_config
  console.log('\n' + '='.repeat(80));
  console.log('💰 ANÁLISE DETALHADA: INTEREST_CONFIG');
  console.log('='.repeat(80));

  try {
    const { data: configs, error } = await supabase
      .from('interest_config')
      .select('*')
      .limit(5);

    if (error) {
      console.log(`❌ Erro: ${error.message}`);
    } else if (configs && configs.length > 0) {
      console.log(
        `\n✅ Encontrados ${configs.length} registros de configuração:\n`
      );
      configs.forEach((config, idx) => {
        console.log(`Config #${idx + 1}:`);
        console.log(`  ID: ${config.id}`);
        console.log(`  Child ID: ${config.child_id}`);
        console.log(`  Family ID: ${config.family_id || 'N/A'}`);

        // Verificar quais campos de taxa existem
        if ('annual_rate' in config)
          console.log(`  Annual Rate: ${config.annual_rate}%`);
        if ('monthly_rate' in config)
          console.log(`  Monthly Rate: ${config.monthly_rate}%`);
        if ('interest_rate' in config)
          console.log(`  Interest Rate: ${config.interest_rate}%`);
        if ('rate' in config) console.log(`  Rate: ${config.rate}%`);

        console.log(`  Updated: ${config.updated_at}`);
        console.log('');
      });
    } else {
      console.log('⚠️  Tabela vazia');
    }
  } catch (err) {
    console.log(`❌ Erro: ${err.message}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ DIAGNÓSTICO CONCLUÍDO\n');
}

diagnoseDatabaseSchema().catch(console.error);
