// Script para adicionar colunas de fulfillment na tabela goals
// Executa migração via tentativa de INSERT com novas colunas

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addFulfillmentColumns() {
  console.log(
    '🔧 MIGRAÇÃO: Adicionando colunas de fulfillment à tabela goals\n'
  );
  console.log('═'.repeat(70));

  try {
    // 1. Verificar estrutura atual
    console.log('\n1️⃣  Verificando estrutura atual da tabela goals...\n');

    const { data: currentGoals, error: selectError } = await supabase
      .from('goals')
      .select('*')
      .limit(1);

    if (selectError) {
      console.error('❌ Erro ao acessar tabela goals:', selectError.message);
      process.exit(1);
    }

    const currentColumns =
      currentGoals && currentGoals.length > 0
        ? Object.keys(currentGoals[0])
        : [];

    console.log('   📊 Colunas atuais:');
    if (currentColumns.length > 0) {
      currentColumns.forEach(col => console.log(`      ✓ ${col}`));
    } else {
      console.log('      ⚠️  Tabela vazia - não foi possível detectar colunas');
    }
    console.log('');

    // 2. Verificar se colunas já existem
    const fulfillmentColumns = [
      'fulfillment_status',
      'fulfillment_requested_at',
      'fulfillment_resolved_at',
      'fulfillment_resolved_by',
    ];

    const missingColumns =
      currentColumns.length > 0
        ? fulfillmentColumns.filter(col => !currentColumns.includes(col))
        : fulfillmentColumns;

    if (missingColumns.length === 0 && currentColumns.length > 0) {
      console.log('2️⃣  ✅ Todas as colunas de fulfillment já existem!\n');
      console.log('   Estrutura da tabela goals:');
      currentColumns.forEach(col => console.log(`      ✓ ${col}`));
      console.log(
        '\n✅ Migração não necessária - tabela já está atualizada!\n'
      );
      return;
    }

    console.log('2️⃣  ⚠️  Colunas faltando:');
    missingColumns.forEach(col => console.log(`      ❌ ${col}`));
    console.log('');

    // 3. Como o Supabase JS não suporta ALTER TABLE, precisamos instruir execução manual
    console.log('3️⃣  EXECUÇÃO DA MIGRAÇÃO:\n');
    console.log('   ' + '─'.repeat(66));
    console.log(
      '\n   ⚠️  ATENÇÃO: Supabase JS Client não suporta ALTER TABLE.\n'
    );
    console.log(
      '   Você precisa executar o SQL manualmente no Supabase Dashboard:\n'
    );
    console.log(
      '   🔗 URL: https://supabase.com/dashboard/project/mqcfdwyhbtvaclslured/sql/new\n'
    );
    console.log('   ' + '─'.repeat(66));
    console.log('\n   📋 COPIE E EXECUTE O SQL ABAIXO:\n');
    console.log('   ' + '─'.repeat(66));

    const sql = `
-- Migração: Sistema de Realização de Sonhos
-- Data: 2025-11-30

ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT NULL;

ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS fulfillment_requested_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS fulfillment_resolved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS fulfillment_resolved_by TEXT DEFAULT NULL;

COMMENT ON COLUMN goals.fulfillment_status IS 'Status: NULL, pending, approved, rejected';
COMMENT ON COLUMN goals.fulfillment_requested_at IS 'Data que criança solicitou realização';
COMMENT ON COLUMN goals.fulfillment_resolved_at IS 'Data que pais aprovaram/recusaram';
COMMENT ON COLUMN goals.fulfillment_resolved_by IS 'ID do pai que resolveu';
`;

    console.log(sql);
    console.log('   ' + '─'.repeat(66));

    console.log('\n\n4️⃣  APÓS EXECUTAR O SQL:\n');
    console.log('   Execute este script novamente para verificar:');
    console.log('   \n   node scripts/add-fulfillment-columns.js\n');

    console.log('\n   Ou verifique manualmente com:');
    console.log('   \n   SELECT column_name FROM information_schema.columns');
    console.log("   WHERE table_name = 'goals' ORDER BY ordinal_position;\n");

    console.log('\n═'.repeat(70));
    console.log('\n📌 RESUMO:');
    console.log('   ✅ Scripts de migração criados');
    console.log('   ⚠️  Execução manual necessária no Supabase Dashboard');
    console.log('   📁 Arquivo SQL: scripts/add-fulfillment-columns.sql\n');
  } catch (error) {
    console.error('\n❌ Erro durante verificação:', error);
    process.exit(1);
  }
}

addFulfillmentColumns();
