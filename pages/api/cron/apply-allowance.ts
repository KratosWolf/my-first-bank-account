import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * API Cron para Aplicação Automática de Mesadas
 *
 * Chamada todo dia às 08:00 UTC pelo GitHub Actions (daily-allowance.yml).
 *
 * Robustez:
 * - Query `.lte` em vez de `.eq` — captura configs com data vencida (catch-up).
 * - Loop `while` — processa todos os meses atrasados em uma única execução.
 * - Idempotência por mês — se já existe transação 'allowance' no mês alvo,
 *   só avança a data sem creditar de novo.
 * - Backdate do created_at — transações atrasadas ficam datadas correctamente.
 * - Falha do adjust_child_balance é fatal para aquela criança (rollback da
 *   transação criada) e gera HTTP 500 ao final se algum config falhou.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return res.status(500).json({ error: 'CRON_SECRET not configured' });
  }

  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD UTC

    // Captura configs com pagamento HOJE ou ATRASADO
    const { data: configs, error: configError } = await supabaseAdmin
      .from('allowance_config')
      .select(`*, children (*)`)
      .eq('is_active', true)
      .lte('next_payment_date', today);

    if (configError) {
      console.error('Erro ao buscar configurações:', configError);
      throw configError;
    }

    if (!configs || configs.length === 0) {
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

    let totalAmountPaid = 0;
    let totalPaymentsCreated = 0;
    let hasErrors = false;
    const results = [];

    for (const config of configs) {
      const child = (config as any).children;
      if (!child) {
        hasErrors = true;
        results.push({
          config_id: config.id,
          child_id: config.child_id,
          error: 'Criança não encontrada',
          status: 'error',
        });
        continue;
      }

      const paymentsForThisChild: Array<{
        payment_date: string;
        amount: number;
        action: 'created' | 'skipped_idempotent';
      }> = [];
      let currentNextDate: string = config.next_payment_date;
      let configError: string | null = null;

      // Loop de catch-up: processa cada data vencida até alcançar hoje
      while (currentNextDate && currentNextDate <= today) {
        const paymentDate = currentNextDate;

        // Idempotência: já existe allowance no mês alvo?
        const alreadyPaid = await hasAllowanceInMonth(
          config.child_id,
          paymentDate
        );

        if (alreadyPaid) {
          paymentsForThisChild.push({
            payment_date: paymentDate,
            amount: Number(config.amount),
            action: 'skipped_idempotent',
          });
        } else {
          // 1. Criar transação com created_at = data do pagamento (backdate)
          const monthLabel = formatMonthLabel(paymentDate);
          const createdAtIso = `${paymentDate}T08:35:00+00:00`;

          const { data: txData, error: txError } = await supabaseAdmin
            .from('transactions')
            .insert([
              {
                child_id: config.child_id,
                type: 'allowance',
                amount: config.amount,
                description: `Mesada automática (${getFrequencyText(config.frequency)}) - ${monthLabel}`,
                category: 'Mesada',
                status: 'completed',
                requires_approval: false,
                approved_by_parent: true,
                created_at: createdAtIso,
              },
            ])
            .select('id')
            .single();

          if (txError) {
            console.error('Erro ao criar transação:', txError);
            configError = `Falha ao criar transação (${paymentDate}): ${txError.message}`;
            break;
          }

          // 2. Ajustar saldo (atómico)
          const { error: updateError } = await supabaseAdmin.rpc(
            'adjust_child_balance',
            {
              p_child_id: config.child_id,
              p_balance_delta: config.amount,
              p_total_earned_delta: config.amount,
              p_total_spent_delta: 0,
            }
          );

          if (updateError) {
            console.error('Erro ao ajustar saldo, revertendo tx:', updateError);
            // Rollback da transação para evitar inconsistência
            if (txData?.id) {
              await supabaseAdmin
                .from('transactions')
                .delete()
                .eq('id', txData.id);
            }
            configError = `Falha ao ajustar saldo (${paymentDate}): ${updateError.message}`;
            break;
          }

          paymentsForThisChild.push({
            payment_date: paymentDate,
            amount: Number(config.amount),
            action: 'created',
          });
          totalAmountPaid += Number(config.amount);
          totalPaymentsCreated += 1;
        }

        // 3. Avança a data — independentemente de ter creditado ou pulado
        currentNextDate = calculateNextPaymentDateFrom(paymentDate, config);
      }

      // 4. Persiste o novo next_payment_date (mesmo se houve erro parcial)
      if (currentNextDate !== config.next_payment_date) {
        const { error: configUpdateError } = await supabaseAdmin
          .from('allowance_config')
          .update({
            next_payment_date: currentNextDate,
            updated_at: new Date().toISOString(),
          })
          .eq('id', config.id);

        if (configUpdateError) {
          console.error(
            'Erro ao atualizar next_payment_date:',
            configUpdateError
          );
          configError =
            configError ??
            `Falha ao atualizar next_payment_date: ${configUpdateError.message}`;
        }
      }

      if (configError) {
        hasErrors = true;
      }

      results.push({
        config_id: config.id,
        child_id: config.child_id,
        child_name: child.name,
        payments: paymentsForThisChild,
        next_payment_date: currentNextDate,
        error: configError,
        status: configError ? 'error' : 'success',
      });
    }

    const summary = {
      timestamp: new Date().toISOString(),
      payment_date: today,
      total_configs_processed: configs.length,
      total_payments_created: totalPaymentsCreated,
      total_amount_paid: totalAmountPaid,
      results,
    };

    if (hasErrors) {
      return res.status(500).json({
        success: false,
        message: 'Mesadas processadas com erros — ver results',
        summary,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Mesadas aplicadas: ${totalPaymentsCreated} pagamento(s), R$ ${totalAmountPaid.toFixed(2)} total.`,
      summary,
    });
  } catch (error) {
    console.error('Erro crítico na aplicação de mesadas:', error);

    return res.status(500).json({
      success: false,
      error: 'Erro interno na aplicação de mesadas',
      details: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Verifica se já existe transação 'allowance' para a criança no mês de `paymentDate`.
 * Idempotência por janela [início_do_mês, fim_do_mês].
 */
async function hasAllowanceInMonth(
  childId: string,
  paymentDate: string
): Promise<boolean> {
  const [yearStr, monthStr] = paymentDate.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const monthStart = `${yearStr}-${monthStr}-01T00:00:00Z`;
  // Último dia do mês: dia 0 do mês seguinte
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthEnd = `${yearStr}-${monthStr}-${String(lastDay).padStart(2, '0')}T23:59:59Z`;

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select('id')
    .eq('child_id', childId)
    .eq('type', 'allowance')
    .gte('created_at', monthStart)
    .lte('created_at', monthEnd)
    .limit(1);

  if (error) {
    console.error('Erro na checagem de idempotência:', error);
    // Em caso de falha, ser conservador: assumir que já pagou (evita duplicar)
    return true;
  }

  return (data?.length ?? 0) > 0;
}

/**
 * Calcula a próxima data de pagamento a partir de uma data específica
 * (em vez de `new Date()`). Permite o loop de catch-up.
 */
function calculateNextPaymentDateFrom(fromDate: string, config: any): string {
  const [y, m, d] = fromDate.split('-').map(n => parseInt(n, 10));
  // Data base em UTC para evitar problemas de timezone
  const base = new Date(Date.UTC(y, m - 1, d));

  switch (config.frequency) {
    case 'daily': {
      base.setUTCDate(base.getUTCDate() + 1);
      return base.toISOString().split('T')[0];
    }

    case 'weekly': {
      base.setUTCDate(base.getUTCDate() + 7);
      return base.toISOString().split('T')[0];
    }

    case 'biweekly': {
      const currentDay = base.getUTCDate();
      if (currentDay === 1) {
        base.setUTCDate(15);
      } else {
        base.setUTCMonth(base.getUTCMonth() + 1);
        base.setUTCDate(1);
      }
      return base.toISOString().split('T')[0];
    }

    case 'monthly': {
      const dayOfMonth = config.day_of_month || 1;
      // Avança 1 mês a partir do dia 1 (evita "stickiness" de dias inválidos)
      base.setUTCDate(1);
      base.setUTCMonth(base.getUTCMonth() + 1);
      // Tenta colocar no dayOfMonth, com fallback para último dia do mês
      const targetYear = base.getUTCFullYear();
      const targetMonth = base.getUTCMonth();
      const lastDayOfMonth = new Date(
        Date.UTC(targetYear, targetMonth + 1, 0)
      ).getUTCDate();
      const actualDay = Math.min(dayOfMonth, lastDayOfMonth);
      base.setUTCDate(actualDay);
      return base.toISOString().split('T')[0];
    }

    default:
      return fromDate;
  }
}

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

function formatMonthLabel(dateStr: string): string {
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  const [y, m] = dateStr.split('-').map(n => parseInt(n, 10));
  return `${months[m - 1]} ${y}`;
}

/**
 * Para testar manualmente:
 *
 * curl -X POST http://localhost:3000/api/cron/apply-allowance \
 *   -H "Authorization: Bearer $CRON_SECRET" \
 *   -H "Content-Type: application/json"
 */
