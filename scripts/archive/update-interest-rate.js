#!/usr/bin/env node

/**
 * Script para corrigir taxa de juros de 9.9% para 1.0% ao mês
 *
 * CONTEXTO: A taxa estava incorretamente em 9.9% ao mês (muito alta).
 * CORREÇÃO: Atualizar para 1.0% ao mês (taxa educacional realista).
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error(
    '   Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateInterestRate() {
  console.log('🔧 Corrigindo taxa de juros...\n');

  // 1. Verificar configurações atuais
  console.log('📊 Estado ANTES da correção:');
  const { data: before, error: beforeError } = await supabase
    .from('interest_config')
    .select('*');

  if (beforeError) {
    console.error('❌ Erro ao buscar configurações:', beforeError);
    return;
  }

  console.table(
    before?.map(config => ({
      id: config.id,
      child_id: config.child_id,
      'taxa_mensal_%': config.monthly_rate,
      is_active: config.is_active,
    }))
  );

  // 2. Atualizar todas as taxas de 9.9% para 1.0%
  console.log('\n🔄 Atualizando taxas de 9.9% para 1.0%...');

  const { data: updated, error: updateError } = await supabase
    .from('interest_config')
    .update({ monthly_rate: 1.0 })
    .eq('monthly_rate', 9.9)
    .select();

  if (updateError) {
    console.error('❌ Erro ao atualizar:', updateError);
    return;
  }

  console.log(`✅ ${updated?.length || 0} registro(s) atualizado(s)\n`);

  // 3. Verificar resultado final
  console.log('📊 Estado DEPOIS da correção:');
  const { data: after, error: afterError } = await supabase
    .from('interest_config')
    .select('*');

  if (afterError) {
    console.error('❌ Erro ao buscar configurações:', afterError);
    return;
  }

  console.table(
    after?.map(config => ({
      id: config.id,
      child_id: config.child_id,
      'taxa_mensal_%': config.monthly_rate,
      is_active: config.is_active,
    }))
  );

  console.log('\n✅ Taxa de juros corrigida com sucesso!');
  console.log('📝 Taxa padrão agora: 1.0% ao mês');
}

updateInterestRate().catch(console.error);
