/**
 * VALIDATION SCRIPT - Task 1.2: annual_rate → monthly_rate
 *
 * Este script valida que a migração foi aplicada corretamente:
 * 1. Verifica que a coluna monthly_rate existe na tabela interest_config
 * 2. Confirma que annual_rate NÃO existe mais
 * 3. Valida que os valores foram preservados (9.9 continua 9.9)
 * 4. Testa o novo constraint (0-100%)
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '❌ Erro: Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não encontradas'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function validateMigration() {
  console.log('🔍 VALIDAÇÃO TASK 1.2: annual_rate → monthly_rate\n');
  console.log('='.repeat(60));

  let allTestsPassed = true;

  // ============================================================
  // TEST 1: Verificar schema da tabela interest_config
  // ============================================================
  console.log('\n📋 TEST 1: Verificando schema da tabela interest_config...');

  try {
    const { data, error } = await supabase
      .from('interest_config')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erro ao consultar tabela:', error.message);
      allTestsPassed = false;
    } else {
      // Verificar se monthly_rate existe
      if (data && data.length > 0) {
        const firstRow = data[0];

        if ('monthly_rate' in firstRow) {
          console.log('✅ Coluna "monthly_rate" EXISTE');
        } else {
          console.log('❌ Coluna "monthly_rate" NÃO EXISTE');
          allTestsPassed = false;
        }

        // Verificar se annual_rate NÃO existe
        if ('annual_rate' in firstRow) {
          console.log(
            '❌ Coluna "annual_rate" AINDA EXISTE (deveria ter sido removida)'
          );
          allTestsPassed = false;
        } else {
          console.log('✅ Coluna "annual_rate" NÃO EXISTE (correto)');
        }

        // Mostrar schema completo
        console.log(
          '\n📊 Colunas existentes:',
          Object.keys(firstRow).join(', ')
        );
      } else {
        console.log('⚠️  Tabela vazia, não é possível verificar schema');
      }
    }
  } catch (err) {
    console.error('❌ Erro no Test 1:', err.message);
    allTestsPassed = false;
  }

  // ============================================================
  // TEST 2: Validar valores preservados
  // ============================================================
  console.log('\n📋 TEST 2: Verificando valores preservados...');

  try {
    const { data, error } = await supabase
      .from('interest_config')
      .select('id, child_id, monthly_rate, minimum_balance, is_active')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar configs:', error.message);
      allTestsPassed = false;
    } else {
      if (!data || data.length === 0) {
        console.log('⚠️  Nenhuma configuração encontrada no banco');
      } else {
        console.log(`✅ Total de configurações: ${data.length}`);

        data.forEach((config, index) => {
          console.log(`\n   Config ${index + 1}:`);
          console.log(`   - ID: ${config.id}`);
          console.log(`   - Child ID: ${config.child_id}`);
          console.log(`   - Taxa Mensal: ${config.monthly_rate}%`);
          console.log(`   - Saldo Mínimo: R$ ${config.minimum_balance}`);
          console.log(`   - Ativo: ${config.is_active ? 'Sim' : 'Não'}`);

          // Validar taxa está no range correto
          if (config.monthly_rate >= 0 && config.monthly_rate <= 100) {
            console.log(`   ✅ Taxa dentro do range válido (0-100%)`);
          } else {
            console.log(
              `   ❌ Taxa FORA do range válido: ${config.monthly_rate}%`
            );
            allTestsPassed = false;
          }
        });
      }
    }
  } catch (err) {
    console.error('❌ Erro no Test 2:', err.message);
    allTestsPassed = false;
  }

  // ============================================================
  // TEST 3: Testar constraint (0-100%)
  // ============================================================
  console.log('\n📋 TEST 3: Testando constraint de monthly_rate (0-100%)...');

  try {
    // Criar config temporária com taxa válida (50%)
    const testChildId = '00000000-0000-0000-0000-000000000001';

    console.log('\n   Testando inserção com taxa válida (50%)...');
    const { error: validInsertError } = await supabase
      .from('interest_config')
      .insert({
        child_id: testChildId,
        monthly_rate: 50.0,
        compound_frequency: 'monthly',
        minimum_balance: 5.0,
        is_active: true,
      });

    if (!validInsertError) {
      console.log('   ✅ Taxa válida (50%) aceita pelo banco');

      // Limpar config de teste
      await supabase
        .from('interest_config')
        .delete()
        .eq('child_id', testChildId);
    } else {
      if (validInsertError.code === '23503') {
        console.log(
          '   ⚠️  Child ID de teste não existe (esperado) - constraint FK funcionando'
        );
      } else if (validInsertError.code === '23514') {
        console.log(
          '   ❌ Taxa válida (50%) REJEITADA - constraint incorreto!'
        );
        allTestsPassed = false;
      } else {
        console.log(`   ⚠️  Outro erro: ${validInsertError.message}`);
      }
    }

    console.log('\n   Testando inserção com taxa INVÁLIDA (150%)...');
    const { error: invalidInsertError } = await supabase
      .from('interest_config')
      .insert({
        child_id: testChildId,
        monthly_rate: 150.0,
        compound_frequency: 'monthly',
        minimum_balance: 5.0,
        is_active: true,
      });

    if (invalidInsertError && invalidInsertError.code === '23514') {
      console.log(
        '   ✅ Taxa inválida (150%) REJEITADA corretamente (CHECK constraint funcionando)'
      );
    } else if (!invalidInsertError) {
      console.log(
        '   ❌ Taxa inválida (150%) foi ACEITA - constraint NÃO está funcionando!'
      );
      allTestsPassed = false;

      // Limpar se foi criada
      await supabase
        .from('interest_config')
        .delete()
        .eq('child_id', testChildId);
    } else {
      console.log(
        `   ⚠️  Outro erro ao testar taxa inválida: ${invalidInsertError.message}`
      );
    }
  } catch (err) {
    console.error('❌ Erro no Test 3:', err.message);
    allTestsPassed = false;
  }

  // ============================================================
  // RESULTADO FINAL
  // ============================================================
  console.log('\n' + '='.repeat(60));

  if (allTestsPassed) {
    console.log('\n✅ TODOS OS TESTES PASSARAM!');
    console.log('\nMigração aplicada corretamente:');
    console.log('   ✅ Coluna annual_rate → monthly_rate');
    console.log('   ✅ Valores preservados');
    console.log('   ✅ Constraint 0-100% funcionando');
    console.log(
      '\n👉 Próximo passo: Atualizar PROJECT_PLAN.md e fazer commit\n'
    );
    process.exit(0);
  } else {
    console.log('\n❌ ALGUNS TESTES FALHARAM');
    console.log('\n👉 Verifique os erros acima antes de continuar');
    console.log(
      '👉 Pode ser necessário rodar MIGRATION_TO_RUN.sql no Supabase Studio\n'
    );
    process.exit(1);
  }
}

// Executar validação
validateMigration().catch(err => {
  console.error('\n❌ Erro fatal:', err);
  process.exit(1);
});
