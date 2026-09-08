import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { pingHealthcheck } from '@/lib/healthcheck';

/**
 * API Cron para Aplicação Automática de Juros
 *
 * Chamada TODOS OS DIAS às 03:00 UTC pelo Vercel Cron (ver vercel.json).
 *
 * Sim, todos os dias — e não no dia 1. Decisão da Task 3.11: o endpoint já é
 * idempotente por mês (hasInterestInMonth) e já faz catch-up a partir de
 * last_interest_date, portanto correr 30x num mês credita uma vez só. Ganho:
 * se o dia 1 falhar, o dia 2 recupera sozinho em vez de se perder o mês
 * inteiro. É o mesmo mecanismo que salvou a mesada de setembro em 08/09.
 *
 * O agendamento no GitHub Actions foi desligado na Task 3.11 — o workflow
 * monthly-interest.yml ficou como ferramenta de disparo manual.
 *
 * Histórico: entre 2026-04 e 2026-09 este endpoint devolveu 200/success:true
 * todos os meses sem gravar nada. Escrevia com a chave `anon`, que o RLS
 * (policy `write_authenticated`) bloqueia; o erro virava `null` e era
 * traduzido para "saldo insuficiente". Reescrito na Task 3.9.
 *
 * Robustez (molde do apply-allowance.ts, que funciona em produção):
 * - supabaseAdmin (service_role) para TODA leitura e escrita.
 * - Erro de cada operação checado explicitamente — nunca vira skip silencioso.
 * - Saldo da criança é de facto ajustado (antes a transação era criada e o
 *   saldo nunca subia — não existe trigger em `transactions`).
 * - last_interest_date gravado na mesma operação lógica, com rollback do
 *   saldo e da transação se falhar (senão o mês seguinte duplicaria o juro).
 * - Idempotência por mês: já existe transaction type='interest' no mês alvo?
 * - Catch-up cronológico dos meses em atraso, compondo mês a mês.
 * - Motivos de skip distintos; 'erro' nunca é skip e força HTTP 500.
 * - ?dry_run=true calcula tudo e NÃO grava nada.
 * - Ping no healthchecks.io no fim (Task 3.11), excepto em dry_run: um
 *   dry-run não prova que o cron real correu. A AUSÊNCIA de ping é que
 *   deteta o cron que nunca correu.
 *
 * A fórmula de juros e a regra do "saldo elegível de 30 dias" foram
 * transportadas sem alteração de TransactionService.calculateInterest().
 */

/** Tipos que a regra dos 30 dias considera "entrada". Transportado sem alteração. */
const INCOME_TYPES_30D = [
  'earning',
  'allowance',
  'reward',
  'transfer',
  'interest',
];

type SkipReason =
  | 'config_inativa'
  | 'ja_aplicado'
  | 'saldo_abaixo_do_minimo'
  | 'juro_insignificante';

interface MonthOutcome {
  mes: string; // YYYY-MM
  data_aplicacao: string; // YYYY-MM-DD
  saldo_base: number;
  entradas_ultimos_30d: number;
  saldo_elegivel: number;
  taxa_mensal_pct: number;
  juro_calculado: number;
  saldo_resultante: number;
  acao: 'aplicado' | 'simulado' | 'pulado';
  motivo?: SkipReason;
}

interface ChildResult {
  child_id: string;
  child_name: string | null;
  status: 'success' | 'skipped' | 'erro' | 'dry_run';
  motivo?: SkipReason;
  error?: string;
  saldo_inicial?: number;
  saldo_final?: number;
  last_interest_date_anterior?: string | null;
  last_interest_date_novo?: string | null;
  months: MonthOutcome[];
}

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

  const dryRun = req.query.dry_run === 'true';

  // O Vercel Cron invoca por GET; POST fica para chamada manual e para o
  // workflow_dispatch do GitHub, que continua a usar -X POST.
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Dry-run não pinga (não prova nada sobre o cron real). Auth e método
  // falhados também não: um probe externo não pode disparar alarme falso —
  // esses casos aparecem no watchdog como AUSÊNCIA de ping.
  const hcUrl = dryRun ? undefined : process.env.HC_PING_INTEREST;

  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD UTC

    // Todas as configs (inclusive inativas — viram skip explícito, não silêncio)
    const { data: configs, error: configError } = await supabaseAdmin
      .from('interest_config')
      .select(`*, children (*)`);

    if (configError) {
      console.error('Erro ao buscar interest_config:', configError);
      throw configError;
    }

    if (!configs || configs.length === 0) {
      // Zero configs é anomalia, não sucesso — significa banco inacessível ou
      // interest_config vazia. O monthly-interest.yml tratava total_children=0
      // como falha; ao tirar-lhe o agendamento, essa guarda passa para aqui:
      // ping em /fail, apesar do HTTP 200 (a forma da resposta não muda, para
      // não partir quem já a consome).
      const payload = {
        success: true,
        dry_run: dryRun,
        message: 'Nenhuma configuração de juros encontrada',
        summary: {
          timestamp: new Date().toISOString(),
          reference_date: today,
          total_children: 0,
          total_interest_applied: 0,
          results: [],
        },
      };
      await pingHealthcheck(hcUrl, { fail: true, body: payload });
      return res.status(200).json(payload);
    }

    let totalInterestApplied = 0;
    let hasErrors = false;
    const results: ChildResult[] = [];

    for (const config of configs) {
      const child = (config as any).children;

      if (!child) {
        hasErrors = true;
        results.push({
          child_id: config.child_id,
          child_name: null,
          status: 'erro',
          error: 'Criança não encontrada para esta interest_config',
          months: [],
        });
        continue;
      }

      if (!config.is_active) {
        results.push({
          child_id: config.child_id,
          child_name: child.name,
          status: 'skipped',
          motivo: 'config_inativa' as SkipReason,
          months: [],
        });
        continue;
      }

      const monthlyRate = Number(config.monthly_rate);
      const minimumBalance = Number(config.minimum_balance);
      const monthlyDecimal = monthlyRate / 100;

      const targetMonths = listTargetMonths(config.last_interest_date, today);

      // Âncora de saldo: o saldo ATUAL da criança. Ver nota de limitação no
      // relatório da Task 3.9 — o saldo histórico não é reconstruível neste
      // banco (correções manuais de 2026-03-30 e da Fase C).
      let runningBalance = Number(child.balance);
      let runningGoals: Array<{
        id: string;
        title: string;
        amount: number;
        created_at: string;
      }> | null = null;

      const months: MonthOutcome[] = [];
      let childError: string | null = null;
      let lastAppliedDate: string | null = null;

      for (const anchor of targetMonths) {
        const asOf = `${anchor}T00:00:00.000Z`;

        // --- Idempotência por mês -------------------------------------------
        const already = await hasInterestInMonth(config.child_id, anchor);
        if (already.error) {
          childError = `Falha na checagem de idempotência (${anchor}): ${already.error}`;
          break;
        }
        if (already.exists) {
          months.push(
            outcome(anchor, runningBalance, 0, runningBalance, monthlyRate, 0, {
              acao: 'pulado',
              motivo: 'ja_aplicado',
            })
          );
          continue;
        }

        // --- Gate 1: saldo bruto vs mínimo (transportado sem alteração) -----
        if (runningBalance < minimumBalance) {
          months.push(
            outcome(anchor, runningBalance, 0, runningBalance, monthlyRate, 0, {
              acao: 'pulado',
              motivo: 'saldo_abaixo_do_minimo',
            })
          );
          continue;
        }

        // --- Regra dos 30 dias (transportada; âncora = data do mês alvo) ----
        const windowStart = new Date(
          Date.parse(asOf) - 30 * 24 * 60 * 60 * 1000
        ).toISOString();

        const { data: recentTx, error: txError } = await supabaseAdmin
          .from('transactions')
          .select('amount, type, created_at')
          .eq('child_id', config.child_id)
          .gte('created_at', windowStart)
          .lt('created_at', asOf)
          .in('type', INCOME_TYPES_30D)
          .order('created_at', { ascending: true });

        if (txError) {
          console.error('Erro ao buscar transações recentes:', txError);
          childError = `Falha ao ler transações dos 30 dias (${anchor}): ${txError.message}`;
          break;
        }

        const recentDeposits = (recentTx ?? []).reduce(
          (sum, tx) => sum + Number(tx.amount),
          0
        );
        const eligibleBalance = Math.max(0, runningBalance - recentDeposits);

        if (eligibleBalance < minimumBalance) {
          months.push(
            outcome(
              anchor,
              runningBalance,
              recentDeposits,
              eligibleBalance,
              monthlyRate,
              0,
              { acao: 'pulado', motivo: 'saldo_abaixo_do_minimo' }
            )
          );
          continue;
        }

        const interestAmount =
          Math.round(eligibleBalance * monthlyDecimal * 100) / 100;

        if (interestAmount < 0.01) {
          months.push(
            outcome(
              anchor,
              runningBalance,
              recentDeposits,
              eligibleBalance,
              monthlyRate,
              0,
              { acao: 'pulado', motivo: 'juro_insignificante' }
            )
          );
          continue;
        }

        // --- Dry-run: calcula, compõe, não grava ----------------------------
        if (dryRun) {
          months.push(
            outcome(
              anchor,
              runningBalance,
              recentDeposits,
              eligibleBalance,
              monthlyRate,
              interestAmount,
              { acao: 'simulado' }
            )
          );
          runningBalance = round2(runningBalance + interestAmount);
          totalInterestApplied = round2(totalInterestApplied + interestAmount);
          continue;
        }

        // --- Escrita real ---------------------------------------------------
        const createdAtIso = `${anchor}T03:00:00+00:00`;

        const { data: txData, error: insertError } = await supabaseAdmin
          .from('transactions')
          .insert([
            {
              child_id: config.child_id,
              type: 'interest',
              amount: interestAmount,
              description: `Rendimento mensal (${monthlyRate.toFixed(1)}% sobre R$ ${eligibleBalance.toFixed(2)})`,
              category: 'interest',
              status: 'completed',
              requires_approval: false,
              approved_by_parent: true,
              created_at: createdAtIso,
            },
          ])
          .select('id')
          .single();

        if (insertError) {
          console.error('Erro ao criar transação de juros:', insertError);
          childError = `Falha ao criar transação (${anchor}): ${insertError.message}`;
          break;
        }

        // Ajuste atómico do saldo (mesma RPC usada pelo apply-allowance)
        const { error: balanceError } = await supabaseAdmin.rpc(
          'adjust_child_balance',
          {
            p_child_id: config.child_id,
            p_balance_delta: interestAmount,
            p_total_earned_delta: interestAmount,
            p_total_spent_delta: 0,
          }
        );

        if (balanceError) {
          console.error('Erro ao ajustar saldo, revertendo tx:', balanceError);
          await supabaseAdmin.from('transactions').delete().eq('id', txData.id);
          childError = `Falha ao ajustar saldo (${anchor}): ${balanceError.message}`;
          break;
        }

        // last_interest_date na mesma operação lógica. Se falhar, desfaz tudo:
        // transação + saldo sem marcação de data = juro duplicado no mês seguinte.
        const { error: dateError } = await supabaseAdmin
          .from('interest_config')
          .update({ last_interest_date: anchor })
          .eq('id', config.id);

        if (dateError) {
          console.error(
            'Erro ao gravar last_interest_date, revertendo tudo:',
            dateError
          );
          await supabaseAdmin.rpc('adjust_child_balance', {
            p_child_id: config.child_id,
            p_balance_delta: -interestAmount,
            p_total_earned_delta: -interestAmount,
            p_total_spent_delta: 0,
          });
          await supabaseAdmin.from('transactions').delete().eq('id', txData.id);
          childError = `Falha ao gravar last_interest_date (${anchor}): ${dateError.message}`;
          break;
        }

        months.push(
          outcome(
            anchor,
            runningBalance,
            recentDeposits,
            eligibleBalance,
            monthlyRate,
            interestAmount,
            { acao: 'aplicado' }
          )
        );

        runningBalance = round2(runningBalance + interestAmount);
        totalInterestApplied = round2(totalInterestApplied + interestAmount);
        lastAppliedDate = anchor;

        // --- Juros dos sonhos (transportado sem alteração de fórmula) -------
        const goalResult = await applyGoalInterest({
          childId: config.child_id,
          asOf,
          anchor,
          monthlyRate,
          monthlyDecimal,
          dryRun,
          cache: runningGoals,
        });

        if (goalResult.error) {
          // Fiel ao original: falha nos juros de sonhos não derruba o juro
          // principal, mas aqui deixa de ser silenciosa.
          console.error('Erro nos juros de sonhos:', goalResult.error);
        }
        runningGoals = goalResult.goals;
      }

      if (childError) {
        hasErrors = true;
        results.push({
          child_id: config.child_id,
          child_name: child.name,
          status: 'erro',
          error: childError,
          months,
        });
        continue;
      }

      results.push({
        child_id: config.child_id,
        child_name: child.name,
        status: months.some(m => m.acao === 'aplicado' || m.acao === 'simulado')
          ? dryRun
            ? 'dry_run'
            : 'success'
          : 'skipped',
        saldo_inicial: Number(child.balance),
        saldo_final: runningBalance,
        last_interest_date_anterior: config.last_interest_date,
        last_interest_date_novo: dryRun
          ? config.last_interest_date
          : (lastAppliedDate ?? config.last_interest_date),
        months,
      });
    }

    const summary = {
      timestamp: new Date().toISOString(),
      reference_date: today,
      total_children: configs.length,
      total_interest_applied: totalInterestApplied,
      results,
    };

    if (hasErrors) {
      const payload = {
        success: false,
        dry_run: dryRun,
        message: 'Juros processados com erros — ver results',
        summary,
      };
      await pingHealthcheck(hcUrl, { fail: true, body: payload });
      return res.status(500).json(payload);
    }

    const payload = {
      success: true,
      dry_run: dryRun,
      message: dryRun
        ? `SIMULAÇÃO (nada gravado): ${configs.length} criança(s), R$ ${totalInterestApplied.toFixed(2)} seriam distribuídos.`
        : `Juros aplicados: ${configs.length} criança(s), R$ ${totalInterestApplied.toFixed(2)} distribuídos.`,
      summary,
    };
    await pingHealthcheck(hcUrl, { body: payload });
    return res.status(200).json(payload);
  } catch (error) {
    console.error('Erro crítico na aplicação de juros:', error);

    const payload = {
      success: false,
      dry_run: dryRun,
      error: 'Erro interno na aplicação de juros',
      details: (error as Error).message,
      timestamp: new Date().toISOString(),
    };
    await pingHealthcheck(hcUrl, { fail: true, body: payload });
    return res.status(500).json(payload);
  }
}

/**
 * Juros sobre sonhos/metas. Fórmula e carência de 30 dias transportadas
 * sem alteração de TransactionService.calculateInterest().
 * `cache` mantém o current_amount composto entre meses no catch-up.
 */
async function applyGoalInterest(params: {
  childId: string;
  asOf: string;
  anchor: string;
  monthlyRate: number;
  monthlyDecimal: number;
  dryRun: boolean;
  cache: Array<{
    id: string;
    title: string;
    amount: number;
    created_at: string;
  }> | null;
}): Promise<{
  goals: Array<{
    id: string;
    title: string;
    amount: number;
    created_at: string;
  }> | null;
  error: string | null;
}> {
  let goals = params.cache;

  if (goals === null) {
    const { data, error } = await supabaseAdmin
      .from('goals')
      .select('*')
      .eq('child_id', params.childId)
      .eq('is_active', true)
      .gt('current_amount', 0);

    if (error) {
      return { goals: null, error: error.message };
    }

    goals = (data ?? []).map(g => ({
      id: g.id,
      title: g.title,
      amount: Number(g.current_amount),
      created_at: g.created_at,
    }));
  }

  const carencyLimit = Date.parse(params.asOf) - 30 * 24 * 60 * 60 * 1000;

  for (const goal of goals) {
    if (Date.parse(goal.created_at) > carencyLimit) {
      continue;
    }

    const goalInterest =
      Math.round(goal.amount * params.monthlyDecimal * 100) / 100;

    if (goalInterest < 0.01) {
      continue;
    }

    if (!params.dryRun) {
      const { error: rpcError } = await supabaseAdmin.rpc(
        'adjust_goal_amount',
        {
          p_goal_id: goal.id,
          p_amount_delta: goalInterest,
        }
      );

      if (rpcError) {
        return { goals, error: rpcError.message };
      }

      const { error: txError } = await supabaseAdmin
        .from('transactions')
        .insert([
          {
            child_id: params.childId,
            type: 'goal_interest',
            amount: goalInterest,
            description: `Rendimento do sonho "${goal.title}" (${params.monthlyRate.toFixed(1)}% sobre R$ ${goal.amount.toFixed(2)})`,
            category: 'goal_interest',
            related_goal_id: goal.id,
            status: 'completed',
            requires_approval: false,
            approved_by_parent: true,
            created_at: `${params.anchor}T03:00:00+00:00`,
          },
        ]);

      if (txError) {
        // Reverte o incremento do sonho para não deixar dinheiro sem rasto
        await supabaseAdmin.rpc('adjust_goal_amount', {
          p_goal_id: goal.id,
          p_amount_delta: -goalInterest,
        });
        return { goals, error: txError.message };
      }
    }

    goal.amount = round2(goal.amount + goalInterest);
  }

  return { goals, error: null };
}

/** Já existe transaction type='interest' para esta criança no mês do `anchor`? */
async function hasInterestInMonth(
  childId: string,
  anchor: string
): Promise<{ exists: boolean; error: string | null }> {
  const [yearStr, monthStr] = anchor.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const monthStart = `${yearStr}-${monthStr}-01T00:00:00Z`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthEnd = `${yearStr}-${monthStr}-${String(lastDay).padStart(2, '0')}T23:59:59Z`;

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select('id')
    .eq('child_id', childId)
    .eq('type', 'interest')
    .gte('created_at', monthStart)
    .lte('created_at', monthEnd)
    .limit(1);

  if (error) {
    console.error('Erro na checagem de idempotência:', error);
    return { exists: false, error: error.message };
  }

  return { exists: (data?.length ?? 0) > 0, error: null };
}

/**
 * Meses a processar: do mês seguinte a last_interest_date até o mês corrente,
 * em ordem cronológica. Sem last_interest_date, processa só o mês corrente.
 */
function listTargetMonths(
  lastInterestDate: string | null,
  today: string
): string[] {
  const [ty, tm] = today.split('-').map(n => parseInt(n, 10));
  const currentAnchor = Date.UTC(ty, tm - 1, 1);

  if (!lastInterestDate) {
    return [isoAnchor(currentAnchor)];
  }

  const [ly, lm] = lastInterestDate.split('-').map(n => parseInt(n, 10));
  let cursor = Date.UTC(ly, lm, 1); // mês SEGUINTE ao último aplicado

  const months: string[] = [];
  // Guarda de sanidade: no máximo 24 meses de catch-up por execução
  while (cursor <= currentAnchor && months.length < 24) {
    months.push(isoAnchor(cursor));
    const d = new Date(cursor);
    d.setUTCMonth(d.getUTCMonth() + 1);
    cursor = d.getTime();
  }

  return months;
}

function isoAnchor(ms: number): string {
  return new Date(ms).toISOString().split('T')[0];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function outcome(
  anchor: string,
  saldoBase: number,
  entradas: number,
  elegivel: number,
  taxa: number,
  juro: number,
  extra: { acao: MonthOutcome['acao']; motivo?: SkipReason }
): MonthOutcome {
  return {
    mes: anchor.slice(0, 7),
    data_aplicacao: anchor,
    saldo_base: round2(saldoBase),
    entradas_ultimos_30d: round2(entradas),
    saldo_elegivel: round2(elegivel),
    taxa_mensal_pct: taxa,
    juro_calculado: round2(juro),
    saldo_resultante: round2(saldoBase + juro),
    acao: extra.acao,
    ...(extra.motivo ? { motivo: extra.motivo } : {}),
  };
}

/**
 * Para testar (simulação, não grava nada):
 *
 * curl "http://localhost:3000/api/cron/apply-interest?dry_run=true" \
 *   -H "Authorization: Bearer $CRON_SECRET"
 */
