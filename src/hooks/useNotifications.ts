import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// Tipos de notificação calculada
export interface AppNotification {
  id: string;
  type:
    | 'interest'
    | 'goal_completed'
    | 'installment_due'
    | 'installment_overdue';
  icon: string;
  title: string;
  message: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
}

const STORAGE_KEY = 'mfba_read_notifications';

// Retorna IDs de notificações marcadas como lidas no localStorage
function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as { ids: string[]; expiry: number };
    // Expira lidos após 30 dias
    if (Date.now() > parsed.expiry) {
      localStorage.removeItem(STORAGE_KEY);
      return new Set();
    }
    return new Set(parsed.ids);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 dias
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ids: Array.from(ids), expiry })
  );
}

// Gera um ID determinístico para cada notificação (evita duplicatas)
function makeId(type: string, key: string): string {
  return `${type}_${key}`;
}

export function useNotifications(childId: string | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Calcula notificações a partir dos dados existentes
  const calculateNotifications = useCallback(async () => {
    if (!childId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const threeDaysFromNow = new Date(
        now.getTime() + 3 * 24 * 60 * 60 * 1000
      );

      // Buscar dados em paralelo
      const [transactionsRes, goalsRes, installmentsRes] = await Promise.all([
        // 1. Transações de rendimento (interest + goal_interest) dos últimos 30 dias
        supabase
          .from('transactions')
          .select('id, type, amount, description, created_at')
          .eq('child_id', childId)
          .in('type', ['interest', 'goal_interest'])
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(10),

        // 2. Metas completas (current_amount >= target_amount)
        supabase
          .from('goals')
          .select(
            'id, title, target_amount, current_amount, completed_at, updated_at'
          )
          .eq('child_id', childId)
          .eq('is_completed', true)
          .gte('updated_at', thirtyDaysAgo.toISOString())
          .order('updated_at', { ascending: false })
          .limit(10),

        // 3. Parcelas pendentes (vencendo em 3 dias ou atrasadas)
        supabase
          .from('loan_installments')
          .select('id, amount, due_date, status, loan_id')
          .eq('status', 'pending')
          .lte('due_date', threeDaysFromNow.toISOString())
          .order('due_date', { ascending: true })
          .limit(20),
      ]);

      const calculated: AppNotification[] = [];

      // --- Rendimentos creditados ---
      if (transactionsRes.data) {
        for (const tx of transactionsRes.data) {
          const id = makeId('interest', tx.id);
          calculated.push({
            id,
            type: 'interest',
            icon: '💎',
            title: 'Rendimento creditado',
            message: `Seu dinheiro rendeu R$ ${tx.amount.toFixed(2)} este mês!`,
            date: tx.created_at,
            priority: 'low',
          });
        }
      }

      // --- Metas atingidas ---
      if (goalsRes.data) {
        for (const goal of goalsRes.data) {
          const id = makeId('goal', goal.id);
          calculated.push({
            id,
            type: 'goal_completed',
            icon: '🎉',
            title: 'Sonho completo!',
            message: `"${goal.title}" está completo!`,
            date: goal.completed_at || goal.updated_at,
            priority: 'medium',
          });
        }
      }

      // --- Parcelas (filtrar pelo child_id via loans) ---
      if (installmentsRes.data && installmentsRes.data.length > 0) {
        // Buscar loan_ids para verificar quais pertencem a este child
        const loanIds = [...new Set(installmentsRes.data.map(i => i.loan_id))];
        const { data: loans } = await supabase
          .from('loans')
          .select('id')
          .eq('child_id', childId)
          .in('id', loanIds);

        const childLoanIds = new Set((loans || []).map(l => l.id));

        for (const inst of installmentsRes.data) {
          if (!childLoanIds.has(inst.loan_id)) continue;

          const dueDate = new Date(inst.due_date);
          const isOverdue = dueDate < now;
          const daysUntilDue = Math.ceil(
            (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          const id = makeId('installment', inst.id);

          if (isOverdue) {
            calculated.push({
              id,
              type: 'installment_overdue',
              icon: '❌',
              title: 'Parcela em atraso',
              message: `Você tem uma parcela atrasada de R$ ${inst.amount.toFixed(2)}`,
              date: inst.due_date,
              priority: 'high',
            });
          } else {
            calculated.push({
              id,
              type: 'installment_due',
              icon: '⚠️',
              title: 'Parcela vencendo',
              message: `Parcela de R$ ${inst.amount.toFixed(2)} vence em ${daysUntilDue} dia${daysUntilDue !== 1 ? 's' : ''}`,
              date: inst.due_date,
              priority: 'high',
            });
          }
        }
      }

      // Ordenar: alta prioridade primeiro, depois por data mais recente
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      calculated.sort((a, b) => {
        const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (pDiff !== 0) return pDiff;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      // Carregar read IDs do localStorage
      const currentReadIds = getReadIds();
      setReadIds(currentReadIds);
      setNotifications(calculated);
      setUnreadCount(calculated.filter(n => !currentReadIds.has(n.id)).length);
    } catch (error) {
      console.error('Erro ao calcular notificações:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    calculateNotifications();
  }, [calculateNotifications]);

  // Marcar uma notificação como lida
  const markAsRead = useCallback(
    (notificationId: string) => {
      setReadIds(prev => {
        const next = new Set(prev);
        next.add(notificationId);
        saveReadIds(next);
        setUnreadCount(notifications.filter(n => !next.has(n.id)).length);
        return next;
      });
    },
    [notifications]
  );

  // Marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    const allIds = new Set(notifications.map(n => n.id));
    // Merge com os que já estavam lidos
    const merged = new Set([...readIds, ...allIds]);
    saveReadIds(merged);
    setReadIds(merged);
    setUnreadCount(0);
  }, [notifications, readIds]);

  // Verifica se uma notificação está lida
  const isRead = useCallback(
    (notificationId: string) => readIds.has(notificationId),
    [readIds]
  );

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    isRead,
    refresh: calculateNotifications,
  };
}
