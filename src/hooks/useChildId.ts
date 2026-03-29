/**
 * Hook para obter childId de forma inteligente
 * Ordem de prioridade:
 * 1. Query param (?childId=xxx)
 * 2. Sessão (se usuário é criança logada)
 * 3. Primeira criança da família (se usuário é pai)
 */

import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useChildId() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [childId, setChildId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      setIsLoading(false);
      return;
    }

    const getChildId = async () => {
      try {
        // 1. Query param (navegação explícita)
        if (router.query.childId && typeof router.query.childId === 'string') {
          setChildId(router.query.childId);
          setIsLoading(false);
          return;
        }

        // 2. Sessão (criança logada)
        const user = session?.user as any;
        if (user?.role === 'child' && user?.childId) {
          setChildId(user.childId);
          setIsLoading(false);
          return;
        }

        // 3. Primeira criança da família (pai visualizando)
        if (user?.role === 'parent' && user?.familyId) {
          const { data: children } = await supabase
            .from('children')
            .select('id')
            .eq('family_id', user.familyId)
            .order('created_at', { ascending: true })
            .limit(1);

          if (children && children.length > 0) {
            setChildId(children[0].id);
            setIsLoading(false);
            return;
          }
        }

        // Se chegou aqui, não encontrou childId
        console.warn('⚠️ Nenhum childId disponível');
        setError(
          'Não foi possível identificar a criança. Por favor, volte ao dashboard e tente novamente.'
        );
        setIsLoading(false);
      } catch (err) {
        console.error('❌ Erro ao obter childId:', err);
        setError('Erro ao carregar dados. Tente novamente.');
        setIsLoading(false);
      }
    };

    getChildId();
  }, [router.query.childId, session, status]);

  return { childId, isLoading, error };
}
