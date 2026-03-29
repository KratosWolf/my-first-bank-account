import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../pages/api/auth/[...nextauth]';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Verifica autenticação em API routes.
 * Retorna a sessão se autenticado, ou envia 401 e retorna null.
 */
export async function requireAuth(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  return session;
}
