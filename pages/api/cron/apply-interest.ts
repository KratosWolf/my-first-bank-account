import { NextApiRequest, NextApiResponse } from 'next';
import { TransactionService } from '@/lib/services/transactions';
import { DatabaseService } from '@/lib/services/database';

/**
 * API Cron para Aplicação Automática de Juros
 *
 * Esta API deve ser chamada automaticamente todo dia 1º do mês
 * Via Vercel Cron, GitHub Actions ou serviço externo de cron
 *
 * Segurança: Usa CRON_SECRET para autenticação
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verificação de segurança
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return res.status(500).json({ error: 'CRON_SECRET not configured' });
  }

  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Buscar todas as crianças ativas
    const families = await DatabaseService.getAllFamilies();
    let totalChildrenProcessed = 0;
    let totalInterestApplied = 0;
    const results = [];

    for (const family of families) {
      const children = await DatabaseService.getChildren(family.id);

      for (const child of children) {
        try {
          // Aplicar juros para cada criança
          const interestTransaction =
            await TransactionService.calculateInterest(child.id);

          if (interestTransaction) {
            totalInterestApplied += interestTransaction.amount;
            results.push({
              child_id: child.id,
              child_name: child.name,
              interest_amount: interestTransaction.amount,
              new_balance: child.balance + interestTransaction.amount,
              status: 'success',
            });
          } else {
            results.push({
              child_id: child.id,
              child_name: child.name,
              interest_amount: 0,
              reason: 'Saldo insuficiente ou juros muito baixos',
              status: 'skipped',
            });
          }

          totalChildrenProcessed++;
        } catch (error) {
          console.error(`❌ Erro ao processar ${child.name}:`, error);
          results.push({
            child_id: child.id,
            child_name: child.name,
            error: (error as Error).message,
            status: 'error',
          });
        }
      }
    }

    const summary = {
      timestamp: new Date().toISOString(),
      total_families: families.length,
      total_children: totalChildrenProcessed,
      total_interest_applied: totalInterestApplied,
      results,
    };

    return res.status(200).json({
      success: true,
      message: `Juros aplicados com sucesso! ${totalChildrenProcessed} crianças processadas, R$ ${totalInterestApplied.toFixed(2)} distribuídos.`,
      summary,
    });
  } catch (error) {
    console.error('💥 Erro crítico na aplicação de juros:', error);

    return res.status(500).json({
      success: false,
      error: 'Erro interno na aplicação de juros',
      details: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Para testar manualmente:
 *
 * curl -X POST http://localhost:3002/api/cron/apply-interest \
 *   -H "Authorization: Bearer $CRON_SECRET" \
 *   -H "Content-Type: application/json"
 */
