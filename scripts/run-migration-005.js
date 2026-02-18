/**
 * Script para executar migration 005 - Criar tabelas de empréstimos
 * Uso: node scripts/run-migration-005.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://mqcfdwyhbtvaclslured.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error(
    '❌ SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY não encontrada'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Iniciando migration 005 - Criar tabelas de empréstimos...\n');

  try {
    // Ler o arquivo de migration
    const migrationPath = path.join(
      __dirname,
      '../supabase/migrations/005_create_loans_tables.sql'
    );
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL carregada:', migrationPath);
    console.log('📏 Tamanho:', migrationSQL.length, 'caracteres\n');

    // Executar a migration usando o SQL direto
    // NOTA: Supabase JS client não suporta executar SQL direto por segurança
    // Então vamos dividir em partes e executar via API

    console.log(
      '⚠️  ATENÇÃO: Este script precisa ser executado manualmente no Supabase SQL Editor'
    );
    console.log(
      '📍 Acesse: https://supabase.com/dashboard/project/mqcfdwyhbtvaclslured/sql'
    );
    console.log('\n📋 Copie e cole o conteúdo do arquivo:');
    console.log('   supabase/migrations/005_create_loans_tables.sql');
    console.log(
      '\n✅ Após executar no SQL Editor, as tabelas serão criadas com RLS e policies.\n'
    );

    // Verificar se as tabelas já existem
    const { data: loansCheck, error: loansError } = await supabase
      .from('loans')
      .select('id')
      .limit(1);

    const { data: installmentsCheck, error: installmentsError } = await supabase
      .from('loan_installments')
      .select('id')
      .limit(1);

    if (!loansError && !installmentsError) {
      console.log('✅ Tabelas já existem no banco:');
      console.log('   - loans ✓');
      console.log('   - loan_installments ✓');
      console.log('\n🎉 Migration 005 já foi aplicada!\n');
    } else {
      console.log(
        'ℹ️  Tabelas ainda não existem. Execute a migration no SQL Editor do Supabase.\n'
      );
    }
  } catch (error) {
    console.error('❌ Erro ao verificar migration:', error.message);
    process.exit(1);
  }
}

runMigration();
