// Script para verificar se tabela allowance_config existe no Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllowanceTable() {
  console.log('🔍 Verificando tabela allowance_config...\n');

  try {
    // Tentar buscar dados da tabela
    const { data, error, count } = await supabase
      .from('allowance_config')
      .select('*', { count: 'exact' })
      .limit(5);

    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Tabela allowance_config NÃO EXISTE');
        console.log('\n📝 Você precisa criar a tabela no Supabase:');
        console.log('\nSQL para criar a tabela:');
        console.log(`
CREATE TABLE allowance_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  day_of_week INTEGER, -- 0=Sunday, 1=Monday, etc.
  day_of_month INTEGER, -- 1-28
  is_active BOOLEAN NOT NULL DEFAULT true,
  next_payment_date DATE,
  last_paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(child_id)
);

-- Enable RLS
ALTER TABLE allowance_config ENABLE ROW LEVEL SECURITY;

-- Policy para permitir acesso
CREATE POLICY "Allow all access to allowance_config" ON allowance_config
  FOR ALL USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_allowance_config_updated_at
  BEFORE UPDATE ON allowance_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
        `);
        return false;
      }
      throw error;
    }

    console.log('✅ Tabela allowance_config EXISTE!');
    console.log(`📊 Total de configurações: ${count || 0}`);

    if (data && data.length > 0) {
      console.log('\n📋 Configurações existentes:');
      data.forEach((config, i) => {
        console.log(`\n${i + 1}. Config ID: ${config.id}`);
        console.log(`   Child ID: ${config.child_id}`);
        console.log(`   Valor: R$ ${config.amount}`);
        console.log(`   Frequência: ${config.frequency}`);
        console.log(`   Dia da semana: ${config.day_of_week || 'N/A'}`);
        console.log(`   Dia do mês: ${config.day_of_month || 'N/A'}`);
        console.log(
          `   Status: ${config.is_active ? '✅ Ativo' : '⏸️ Inativo'}`
        );
        console.log(
          `   Próximo pagamento: ${config.next_payment_date || 'Não definido'}`
        );
        console.log(`   Último pagamento: ${config.last_paid_at || 'Nunca'}`);
      });
    } else {
      console.log('\nℹ️  Nenhuma configuração de mesada cadastrada ainda');
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error);
    return false;
  }
}

checkAllowanceTable();
