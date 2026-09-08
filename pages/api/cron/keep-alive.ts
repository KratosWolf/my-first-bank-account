import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Sonda de vida do Supabase — Task 3.11
 *
 * Substitui o workflow `keep-supabase-alive.yml`, que batia direto no
 * PostgREST com a anon key. Passar pelo app é melhor: exercita o mesmo
 * caminho que a aplicação usa de verdade (supabaseAdmin + service_role).
 *
 * NÃO tem entrada no vercel.json e NÃO faz ping no healthchecks.io:
 * o plano Hobby só permite 2 cron jobs, e esses foram para os dois
 * endpoints que mexem em dinheiro. Como `apply-allowance` e
 * `apply-interest` passaram a correr TODOS OS DIAS e ambos tocam no
 * banco, o Supabase já recebe tráfego diário — a auto-pausa por
 * inatividade deixou de ser um risco e esta sonda tornou-se redundante
 * para esse efeito.
 *
 * Fica como ferramenta manual (diagnóstico rápido de "o banco responde?")
 * e pronta a entrar no vercel.json caso o projeto passe a Pro.
 *
 * Uso manual:
 *   curl -X POST https://my-first-bank-account.vercel.app/api/cron/keep-alive \
 *     -H "Authorization: Bearer $CRON_SECRET"
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

  // GET porque é assim que o Vercel Cron invoca; POST para chamada manual.
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startedAt = Date.now();

  try {
    const { error } = await supabaseAdmin
      .from('families')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Keep-alive: Supabase respondeu com erro:', error);
      return res.status(500).json({
        success: false,
        message: 'Supabase inacessível',
        error: error.message,
        elapsed_ms: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Supabase acessível',
      elapsed_ms: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Keep-alive: erro crítico:', err);
    return res.status(500).json({
      success: false,
      message: 'Erro ao contactar o Supabase',
      error: (err as Error).message,
      elapsed_ms: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  }
}
