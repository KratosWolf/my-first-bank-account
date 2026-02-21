import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

/**
 * API Cron para Aplicação Automática de Mesadas
 *
 * Esta API deve ser chamada automaticamente todo dia às 08:00
 * Via Vercel Cron
 *
 * Segurança: Usa CRON_SECRET para autenticação
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verificação de segurança
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET || 'dev-cron-secret-123';

  if (authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📅 Iniciando aplicação automática de mesadas...');

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Buscar todas as configurações ativas que tem pagamento hoje
    const { data: configs, error: configError } = await supabase
      .from('allowance_config')
      .select(
        `
        *,
        children (*)
      `
      )
      .eq('is_active', true)
      .eq('next_payment_date', today);

    if (configError) {
      console.error('❌ Erro ao buscar configurações:', configError);
      throw configError;
    }

    if (!configs || configs.length === 0) {
      console.log('ℹ️  Nenhuma mesada programada para hoje:', today);
      return res.status(200).json({
        success: true,
        message: 'Nenhuma mesada programada para hoje',
        summary: {
          timestamp: new Date().toISOString(),
          payment_date: today,
          total_configs_processed: 0,
          total_amount_paid: 0,
          results: [],
        },
      });
    }

    console.log(`💰 ${configs.length} mesadas programadas para hoje`);

    let totalAmountPaid = 0;
    const results = [];

    for (const config of configs) {
      try {
        const child = (config as any).children;
        if (!child) {
          console.error(`❌ Criança não encontrada para config:`, config.id);
          results.push({
            config_id: config.id,
            child_id: config.child_id,
            error: 'Criança não encontrada',
            status: 'error',
          });
          continue;
        }

        console.log(
          `💵 Processando mesada: ${child.name} - R$ ${config.amount}`
        );

        // 1. Criar transação de mesada
        const { error: txError } = await supabase.from('transactions').insert([
          {
            child_id: config.child_id,
            type: 'allowance',
            amount: config.amount,
            description: `Mesada automática (${getFrequencyText(config.frequency)})`,
            category: 'Mesada',
            status: 'completed',
            requires_approval: false,
            approved_by_parent: true,
          },
        ]);

        if (txError) {
          console.error(`❌ Erro ao criar transação:`, txError);
          results.push({
            config_id: config.id,
            child_id: config.child_id,
            child_name: child.name,
            amount: config.amount,
            error: txError.message,
            status: 'error',
          });
          continue;
        }

        // 2. Atualizar saldo da criança
        const newBalance = (child.balance || 0) + config.amount;
        const newTotalEarned = (child.total_earned || 0) + config.amount;

        const { error: updateError } = await supabase
          .from('children')
          .update({
            balance: newBalance,
            total_earned: newTotalEarned,
          })
          .eq('id', config.child_id);

        if (updateError) {
          console.error(`❌ Erro ao atualizar saldo:`, updateError);
          results.push({
            config_id: config.id,
            child_id: config.child_id,
            child_name: child.name,
            amount: config.amount,
            error: updateError.message,
            status: 'error',
          });
          continue;
        }

        // 3. Calcular próxima data de pagamento
        const nextPaymentDate = calculateNextPaymentDate(config);

        // 4. Atualizar configuração (next_payment_date)
        const { error: configUpdateError } = await supabase
          .from('allowance_config')
          .update({
            next_payment_date: nextPaymentDate,
          })
          .eq('id', config.id);

        if (configUpdateError) {
          console.error(
            `⚠️ Erro ao atualizar configuração:`,
            configUpdateError
          );
          // Não bloqueia, pois o pagamento já foi efetuado
        }

        totalAmountPaid += config.amount;

        results.push({
          config_id: config.id,
          child_id: config.child_id,
          child_name: child.name,
          amount: config.amount,
          new_balance: newBalance,
          next_payment_date: nextPaymentDate,
          status: 'success',
        });

        console.log(
          `✅ Mesada aplicada: ${child.name} recebeu R$ ${config.amount.toFixed(2)}`
        );
      } catch (error) {
        console.error(`❌ Erro ao processar config ${config.id}:`, error);
        results.push({
          config_id: config.id,
          child_id: config.child_id,
          error: (error as Error).message,
          status: 'error',
        });
      }
    }

    const summary = {
      timestamp: new Date().toISOString(),
      payment_date: today,
      total_configs_processed: configs.length,
      total_amount_paid: totalAmountPaid,
      results,
    };

    console.log('🎉 Aplicação de mesadas concluída:', summary);

    return res.status(200).json({
      success: true,
      message: `Mesadas aplicadas com sucesso! ${configs.length} crianças receberam R$ ${totalAmountPaid.toFixed(2)}.`,
      summary,
    });
  } catch (error) {
    console.error('💥 Erro crítico na aplicação de mesadas:', error);

    return res.status(500).json({
      success: false,
      error: 'Erro interno na aplicação de mesadas',
      details: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
}

// Calcular próxima data de pagamento
function calculateNextPaymentDate(config: any): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (config.frequency) {
    case 'daily':
      // Amanhã
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];

    case 'weekly':
      // Próxima semana, mesmo dia
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek.toISOString().split('T')[0];

    case 'biweekly':
      // Quinzenal: se hoje é dia 1, próximo é dia 15; se hoje é dia 15, próximo é dia 1 do mês seguinte
      const currentDay = today.getDate();
      const nextBiweekly = new Date(today);

      if (currentDay === 1) {
        nextBiweekly.setDate(15);
      } else {
        // Próximo mês, dia 1
        nextBiweekly.setMonth(nextBiweekly.getMonth() + 1);
        nextBiweekly.setDate(1);
      }

      return nextBiweekly.toISOString().split('T')[0];

    case 'monthly':
      // Próximo mês, mesmo dia
      const nextMonthly = new Date(today);
      nextMonthly.setMonth(nextMonthly.getMonth() + 1);

      // Validar se o mês tem esse dia (ex: 31 em fevereiro)
      const dayOfMonth = config.day_of_month || 1;
      nextMonthly.setDate(dayOfMonth);

      if (nextMonthly.getDate() !== dayOfMonth) {
        // Se não tem, usar último dia do mês
        nextMonthly.setDate(0);
      }

      return nextMonthly.toISOString().split('T')[0];

    default:
      return '';
  }
}

// Obter texto de frequência
function getFrequencyText(frequency: string): string {
  switch (frequency) {
    case 'daily':
      return 'diária';
    case 'weekly':
      return 'semanal';
    case 'biweekly':
      return 'quinzenal';
    case 'monthly':
      return 'mensal';
    default:
      return frequency;
  }
}

/**
 * Para testar manualmente:
 *
 * curl -X POST http://localhost:3000/api/cron/apply-allowance \
 *   -H "Authorization: Bearer dev-cron-secret-123" \
 *   -H "Content-Type: application/json"
 */
