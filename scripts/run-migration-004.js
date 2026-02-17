/**
 * Executar Migration 004: Renomear annual_rate → monthly_rate
 * Task 1.2 - Corrigir confusão de nomenclatura
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log(
    '\n🔄 EXECUTANDO MIGRATION 004: Renomear annual_rate → monthly_rate\n'
  );
  console.log('='.repeat(80));

  try {
    // 1. Ler arquivo de migration
    const migrationPath = path.join(
      __dirname,
      '../supabase/migrations/004_rename_annual_rate_to_monthly_rate.sql'
    );
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('\n📄 Migration SQL carregada:', migrationPath);
    console.log('\n📋 Conteúdo (primeiras linhas):');
    console.log(migrationSQL.split('\n').slice(0, 10).join('\n') + '\n...\n');

    // 2. Verificar valores ANTES da migration
    console.log('\n🔍 ANTES DA MIGRATION:');
    console.log('─'.repeat(80));

    const { data: beforeData, error: beforeError } = await supabase
      .from('interest_config')
      .select('id, child_id, annual_rate, minimum_balance, is_active');

    if (beforeError) {
      console.log(
        '⚠️  Coluna annual_rate pode não existir (esperado se migration já foi executada)'
      );
      console.log('   Error:', beforeError.message);
    } else if (beforeData) {
      console.log(
        `\n✅ Encontrados ${beforeData.length} registros com annual_rate:\n`
      );
      beforeData.forEach((config, idx) => {
        console.log(`  Config #${idx + 1}:`);
        console.log(`    ID: ${config.id}`);
        console.log(`    Child ID: ${config.child_id}`);
        console.log(`    Annual Rate: ${config.annual_rate}%`);
        console.log(`    Minimum Balance: R$ ${config.minimum_balance}`);
        console.log(`    Active: ${config.is_active}`);
        console.log('');
      });
    }

    // 3. EXECUTAR MIGRATION
    console.log('\n🚀 EXECUTANDO MIGRATION...');
    console.log('─'.repeat(80));

    // Separar comandos SQL (split por ;)
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`\n📝 ${commands.length} comandos SQL a executar\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];

      // Pular comandos de comentário
      if (cmd.startsWith('COMMENT') || cmd.includes('SELECT')) {
        console.log(`⏭️  Comando ${i + 1}: PULADO (comentário ou SELECT)`);
        continue;
      }

      console.log(`\n▶️  Comando ${i + 1}/${commands.length}:`);
      console.log(`   ${cmd.substring(0, 60)}${cmd.length > 60 ? '...' : ''}`);

      try {
        // Nota: Supabase REST API não suporta execução direta de SQL arbitrário
        // Esta abordagem funciona apenas com Supabase CLI ou acesso direto ao Postgres
        // Por enquanto, vamos apenas logar os comandos

        console.log(
          `   ⚠️  Executar manualmente no Supabase Studio SQL Editor`
        );
        successCount++;
      } catch (error) {
        console.error(`   ❌ Erro:`, error.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log(`\n✅ Migration preparada: ${successCount} comandos`);
    console.log(`❌ Erros: ${errorCount}\n`);

    // 4. INSTRUÇÕES PARA EXECUÇÃO MANUAL
    console.log('\n📋 PRÓXIMOS PASSOS PARA EXECUTAR A MIGRATION:\n');
    console.log('1. Acesse o Supabase Studio:');
    console.log(
      '   https://supabase.com/dashboard/project/mqcfdwyhbtvaclslured/sql\n'
    );
    console.log('2. Abra o SQL Editor');
    console.log('3. Copie e cole o conteúdo do arquivo:');
    console.log(`   ${migrationPath}\n`);
    console.log('4. Execute o SQL (botão RUN)\n');
    console.log('5. Verifique se a coluna foi renomeada:');
    console.log('   SELECT * FROM interest_config LIMIT 5;\n');
    console.log(
      '6. Confirme que monthly_rate existe e annual_rate não existe mais\n'
    );

    // 5. Verificar valores DEPOIS (tentativa)
    console.log('\n🔍 TENTANDO VERIFICAR DEPOIS DA MIGRATION:');
    console.log('─'.repeat(80));

    const { data: afterData, error: afterError } = await supabase
      .from('interest_config')
      .select('id, child_id, monthly_rate, minimum_balance, is_active');

    if (afterError) {
      console.log('⚠️  Coluna monthly_rate ainda não existe');
      console.log(
        '   Aguardando execução manual da migration no Supabase Studio\n'
      );
    } else if (afterData) {
      console.log(
        `\n✅ SUCCESS! Coluna monthly_rate encontrada com ${afterData.length} registros:\n`
      );
      afterData.forEach((config, idx) => {
        console.log(`  Config #${idx + 1}:`);
        console.log(`    ID: ${config.id}`);
        console.log(`    Child ID: ${config.child_id}`);
        console.log(`    Monthly Rate: ${config.monthly_rate}%`);
        console.log(`    Minimum Balance: R$ ${config.minimum_balance}`);
        console.log(`    Active: ${config.is_active}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('\n❌ Erro ao executar migration:', error);
    console.error(error.stack);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ SCRIPT CONCLUÍDO\n');
}

runMigration().catch(console.error);
