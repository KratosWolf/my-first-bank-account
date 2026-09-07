/**
 * Backfill pontual dos juros mensais de abril a setembro de 2026 (Task 3.9).
 *
 * Contexto: o cron de juros ficou 5 meses a devolver 200/success:true sem
 * gravar nada (a chave anon não passa na policy RLS `write_authenticated`).
 * A correção do endpoint está em fix/monthly-interest; este script trata
 * apenas do passado.
 *
 * As bases elegíveis abaixo NÃO são recalculadas por este script. Foram
 * reconstruídas de trás para a frente a partir do saldo atual e aprovadas
 * pelo Tiago (Opção C), validadas contra duas âncoras independentes:
 * a transação de 01/03/2026 gravada pelo próprio sistema e os saldos de
 * 05/04/2026 no PROJECT_PLAN. O catch-up do endpoint NÃO serve para isto:
 * ele parte do saldo de hoje, que é justamente a distorção que evitamos.
 *
 * Sem composição entre meses — decisão consciente: a diferença é de centavos
 * e a rastreabilidade vale mais.
 *
 * Uso:
 *   npx tsx scripts/backfill-interest-2026.ts              # dry-run (padrão)
 *   npx tsx scripts/backfill-interest-2026.ts --execute    # grava de verdade
 */

import { config } from 'dotenv';
import { appendFileSync } from 'fs';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const EXECUTE = process.argv.includes('--execute');
const AUDIT_LOG = resolve(process.cwd(), 'backfill-interest-2026.audit.log');

/** Taxa vigente nas duas configs. Usada só para montar a description. */
const MONTHLY_RATE = 1.0;

interface Entry {
  date: string; // YYYY-MM-DD
  base: number; // base elegível aprovada
  juro: number; // valor a creditar
}

interface Target {
  childId: string;
  childName: string;
  expectedTotal: number;
  entries: Entry[];
}

/** Tabela FECHADA e aprovada. Não recalcular, não "melhorar". */
const TARGETS: Target[] = [
  {
    childId: '3a4fb20b-f56e-43b9-a194-c9cf37f0ac6b',
    childName: 'Gabriel',
    expectedTotal: 13.88,
    entries: [
      { date: '2026-04-01', base: 559.17, juro: 5.59 },
      { date: '2026-05-01', base: 226.17, juro: 2.26 },
      // 2026-06 excluído de propósito: elegível R$1,17 < minimum_balance R$5,00
      { date: '2026-07-01', base: 101.17, juro: 1.01 },
      { date: '2026-08-01', base: 201.17, juro: 2.01 },
      { date: '2026-09-01', base: 301.17, juro: 3.01 },
    ],
  },
  {
    childId: '317b190a-5e93-42ed-a923-c8769bcec196',
    childName: 'Rafael',
    expectedTotal: 17.66,
    entries: [
      { date: '2026-04-01', base: 611.07, juro: 6.11 },
      { date: '2026-05-01', base: 297.07, juro: 2.97 },
      { date: '2026-06-01', base: 422.07, juro: 4.22 },
      { date: '2026-07-01', base: 162.07, juro: 1.62 },
      { date: '2026-08-01', base: 262.07, juro: 2.62 },
      { date: '2026-09-01', base: 12.07, juro: 0.12 },
    ],
  },
];

const TOTAL_ENTRIES = TARGETS.reduce((n, t) => n + t.entries.length, 0);
const FINAL_INTEREST_DATE = '2026-09-01';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function audit(line: string): void {
  if (!EXECUTE) return;
  appendFileSync(AUDIT_LOG, `${new Date().toISOString()} ${line}\n`, 'utf-8');
}

function fail(msg: string): never {
  console.error(`\n❌ ABORTADO: ${msg}`);
  audit(`ABORT ${msg}`);
  process.exit(1);
}

async function main() {
  // --- Guarda 1: a tabela aprovada não foi adulterada ---------------------
  for (const t of TARGETS) {
    const soma = round2(t.entries.reduce((s, e) => s + e.juro, 0));
    if (soma !== t.expectedTotal) {
      fail(
        `Tabela de ${t.childName} inconsistente: soma R$ ${soma.toFixed(2)} ≠ esperado R$ ${t.expectedTotal.toFixed(2)}`
      );
    }
  }

  const { supabaseAdmin } = await import('../src/lib/supabaseAdmin');

  console.log('='.repeat(72));
  console.log(
    `BACKFILL DE JUROS abr-set/2026 — modo ${EXECUTE ? '🔴 EXECUTE (GRAVA)' : '🟢 DRY-RUN (não grava)'}`
  );
  console.log('='.repeat(72));

  // --- Estado inicial, lido do banco --------------------------------------
  const { data: childrenBefore, error: beforeError } = await supabaseAdmin
    .from('children')
    .select('id, name, balance, total_earned')
    .in(
      'id',
      TARGETS.map(t => t.childId)
    );

  if (beforeError) fail(`Falha ao ler estado inicial: ${beforeError.message}`);

  console.log('\nEstado ANTES:');
  for (const t of TARGETS) {
    const c = childrenBefore?.find(x => x.id === t.childId);
    if (!c) fail(`Criança ${t.childName} (${t.childId}) não encontrada`);
    console.log(
      `  ${t.childName.padEnd(8)} balance=${Number(c.balance).toFixed(2).padStart(9)}  total_earned=${Number(c.total_earned).toFixed(2).padStart(9)}`
    );
  }

  let gravadas = 0;
  let jaExistiam = 0;
  let totalCreditado = 0;

  for (const target of TARGETS) {
    console.log(`\n${'-'.repeat(72)}\n${target.childName}`);

    for (const entry of target.entries) {
      const mes = entry.date.slice(0, 7);
      const monthStart = `${mes}-01T00:00:00Z`;
      const lastDay = new Date(
        Date.UTC(
          parseInt(mes.slice(0, 4), 10),
          parseInt(mes.slice(5, 7), 10),
          0
        )
      ).getUTCDate();
      const monthEnd = `${mes}-${String(lastDay).padStart(2, '0')}T23:59:59Z`;

      // --- Idempotência: já existe juro neste mês para esta criança? ------
      const { data: existing, error: checkError } = await supabaseAdmin
        .from('transactions')
        .select('id, amount, created_at')
        .eq('child_id', target.childId)
        .eq('type', 'interest')
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd)
        .limit(1);

      if (checkError) {
        fail(`Checagem de idempotência falhou (${mes}): ${checkError.message}`);
      }

      if (existing && existing.length > 0) {
        jaExistiam++;
        console.log(
          `  ${mes}  PULADO — já existe transação de juros (id ${existing[0].id}, R$ ${Number(existing[0].amount).toFixed(2)})`
        );
        continue;
      }

      const description = `Rendimento mensal (${MONTHLY_RATE.toFixed(1)}% sobre R$ ${entry.base.toFixed(2)})`;

      if (!EXECUTE) {
        console.log(
          `  ${mes}  [dry-run] +R$ ${entry.juro.toFixed(2).padStart(5)}  created_at=${entry.date}T03:00:00+00:00`
        );
        console.log(`           "${description}"`);
        gravadas++;
        totalCreditado = round2(totalCreditado + entry.juro);
        continue;
      }

      // --- 1) Transação --------------------------------------------------
      audit(`INSERT_TRY ${target.childName} ${mes} ${entry.juro}`);

      const { data: txData, error: insertError } = await supabaseAdmin
        .from('transactions')
        .insert([
          {
            child_id: target.childId,
            type: 'interest',
            amount: entry.juro,
            description,
            category: 'interest',
            status: 'completed',
            requires_approval: false,
            approved_by_parent: true,
            created_at: `${entry.date}T03:00:00+00:00`,
          },
        ])
        .select('id')
        .single();

      if (insertError || !txData) {
        fail(
          `INSERT falhou em ${target.childName}/${mes}: ${insertError?.message ?? 'sem dados'}. ` +
            `Gravadas até aqui: ${gravadas}. last_interest_date NÃO foi alterado.`
        );
      }

      audit(`INSERT_OK ${target.childName} ${mes} tx=${txData.id}`);

      // --- 2) Saldo + total_earned (atómico, mesma RPC do apply-allowance)
      const { error: balanceError } = await supabaseAdmin.rpc(
        'adjust_child_balance',
        {
          p_child_id: target.childId,
          p_balance_delta: entry.juro,
          p_total_earned_delta: entry.juro,
          p_total_spent_delta: 0,
        }
      );

      if (balanceError) {
        // Rollback da transação para não deixar juro sem saldo
        const { error: rollbackError } = await supabaseAdmin
          .from('transactions')
          .delete()
          .eq('id', txData.id);

        if (rollbackError) {
          audit(`ROLLBACK_FAIL tx=${txData.id} ${rollbackError.message}`);
          fail(
            `Saldo falhou em ${target.childName}/${mes} (${balanceError.message}) E o rollback também ` +
              `(${rollbackError.message}). ⚠️ TRANSAÇÃO ÓRFÃ id=${txData.id} — apagar à mão antes de repetir.`
          );
        }

        audit(`ROLLBACK_OK tx=${txData.id}`);
        fail(
          `Ajuste de saldo falhou em ${target.childName}/${mes}: ${balanceError.message}. ` +
            `Transação revertida. Gravadas até aqui: ${gravadas}. last_interest_date NÃO foi alterado.`
        );
      }

      audit(`BALANCE_OK ${target.childName} ${mes} +${entry.juro}`);

      gravadas++;
      totalCreditado = round2(totalCreditado + entry.juro);
      console.log(
        `  ${mes}  ✅ +R$ ${entry.juro.toFixed(2).padStart(5)}  tx=${txData.id}`
      );
    }
  }

  // --- 3) last_interest_date, só se as 11 estiverem no lugar --------------
  const completas = gravadas + jaExistiam;
  console.log(`\n${'='.repeat(72)}`);
  console.log(
    `Transações: ${gravadas} ${EXECUTE ? 'gravadas' : 'a gravar'}, ${jaExistiam} já existiam, ${completas}/${TOTAL_ENTRIES} no total`
  );
  console.log(`Total creditado: R$ ${totalCreditado.toFixed(2)}`);

  if (completas !== TOTAL_ENTRIES) {
    fail(
      `Apenas ${completas}/${TOTAL_ENTRIES} transações no lugar — last_interest_date NÃO será alterado.`
    );
  }

  if (!EXECUTE) {
    console.log(
      `\n[dry-run] last_interest_date passaria a ${FINAL_INTEREST_DATE} nas 2 crianças.`
    );
    console.log('\n🟢 DRY-RUN — nada foi gravado. Use --execute para aplicar.');
    return;
  }

  for (const target of TARGETS) {
    const { error: dateError } = await supabaseAdmin
      .from('interest_config')
      .update({ last_interest_date: FINAL_INTEREST_DATE })
      .eq('child_id', target.childId);

    if (dateError) {
      fail(
        `As ${TOTAL_ENTRIES} transações estão gravadas, mas last_interest_date de ${target.childName} ` +
          `falhou: ${dateError.message}. ⚠️ Corrigir à mão para ${FINAL_INTEREST_DATE}, senão o próximo ` +
          `cron tenta recreditar abr-set (a idempotência por mês protege, mas o log ficará confuso).`
      );
    }
    audit(`LAST_INTEREST_DATE_OK ${target.childName} ${FINAL_INTEREST_DATE}`);
  }

  // --- 4) Estado final, lido do banco (não assumido) ----------------------
  const { data: childrenAfter, error: afterError } = await supabaseAdmin
    .from('children')
    .select('id, name, balance, total_earned')
    .in(
      'id',
      TARGETS.map(t => t.childId)
    );

  if (afterError) {
    console.error(
      `⚠️ Gravação concluída, mas a leitura final falhou: ${afterError.message}`
    );
    return;
  }

  console.log('\nEstado DEPOIS (lido do banco):');
  for (const t of TARGETS) {
    const c = childrenAfter?.find(x => x.id === t.childId);
    console.log(
      `  ${t.childName.padEnd(8)} balance=${Number(c?.balance).toFixed(2).padStart(9)}  total_earned=${Number(c?.total_earned).toFixed(2).padStart(9)}`
    );
  }

  console.log('\n✅ Backfill concluído.');
}

main().catch(err => {
  console.error('\n💥 Erro não tratado:', err);
  audit(`UNHANDLED ${err?.message ?? err}`);
  process.exit(1);
});
