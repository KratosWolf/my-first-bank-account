'use client';

import { useState, useEffect } from 'react';
import { ChoresService } from '@/lib/services/chores';
import type { AssignedChore, Child } from '@/lib/supabase';

interface AssignedChoresManagerProps {
  familyId: string;
  children: Child[];
}

const STATUS_COLORS = {
  assigned: 'from-blue-400 to-blue-600',
  in_progress: 'from-yellow-400 to-yellow-600',
  completed: 'from-orange-400 to-orange-600',
  approved: 'from-green-400 to-green-600',
  rejected: 'from-red-400 to-red-600'
};

const STATUS_LABELS = {
  assigned: '📋 Atribuída',
  in_progress: '⏳ Em Progresso',
  completed: '✅ Concluída',
  approved: '🎉 Aprovada',
  rejected: '❌ Rejeitada'
};

const PRIORITY_COLORS = {
  low: 'text-gray-500 bg-gray-100',
  medium: 'text-blue-600 bg-blue-100',
  high: 'text-orange-600 bg-orange-100',
  urgent: 'text-red-600 bg-red-100'
};

const PRIORITY_LABELS = {
  low: '🔵 Baixa',
  medium: '🟡 Média',
  high: '🟠 Alta',
  urgent: '🔴 Urgente'
};

export default function AssignedChoresManager({ familyId, children }: AssignedChoresManagerProps) {
  const [chores, setChores] = useState<AssignedChore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedChild, setSelectedChild] = useState<string>('all');

  useEffect(() => {
    loadChores();
  }, [familyId]);

  const loadChores = async () => {
    try {
      // TODO: Replace with actual family chores fetch
      // For now, load all children's chores
      const allChores: AssignedChore[] = [];
      for (const child of children) {
        const childChores = await ChoresService.getChildChores(child.id);
        allChores.push(...childChores);
      }
      setChores(allChores);
    } catch (error) {
      console.error('Error loading chores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveChore = async (choreId: string, qualityRating: number, bonusReward?: number) => {
    const updatedChore = await ChoresService.approveChore(choreId, 'parent-id', qualityRating, bonusReward);
    if (updatedChore) {
      setChores(prev => prev.map(c => c.id === choreId ? updatedChore : c));
    }
  };

  const handleRejectChore = async (choreId: string, reason: string) => {
    const updatedChore = await ChoresService.rejectChore(choreId, 'parent-id', reason);
    if (updatedChore) {
      setChores(prev => prev.map(c => c.id === choreId ? updatedChore : c));
    }
  };

  const filteredChores = chores.filter(chore => {
    if (selectedStatus !== 'all' && chore.status !== selectedStatus) return false;
    if (selectedChild !== 'all' && chore.child_id !== selectedChild) return false;
    return true;
  });

  const choresByStatus = {
    assigned: filteredChores.filter(c => c.status === 'assigned').length,
    in_progress: filteredChores.filter(c => c.status === 'in_progress').length,
    completed: filteredChores.filter(c => c.status === 'completed').length,
    approved: filteredChores.filter(c => c.status === 'approved').length,
    rejected: filteredChores.filter(c => c.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tarefas Atribuídas</h2>
          <p className="text-gray-600">Acompanhe e aprove as tarefas das crianças</p>
        </div>

        {/* Quick Stats */}
        <div className="flex space-x-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{choresByStatus.completed}</div>
            <div className="text-gray-500">Aguardando</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{choresByStatus.in_progress}</div>
            <div className="text-gray-500">Em Progresso</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{choresByStatus.approved}</div>
            <div className="text-gray-500">Aprovadas</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">Todos os Status</option>
            <option value="assigned">📋 Atribuídas</option>
            <option value="in_progress">⏳ Em Progresso</option>
            <option value="completed">✅ Concluídas</option>
            <option value="approved">🎉 Aprovadas</option>
            <option value="rejected">❌ Rejeitadas</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Criança
          </label>
          <select
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">Todas as Crianças</option>
            {children.map(child => (
              <option key={child.id} value={child.id}>
                {child.avatar} {child.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChores.map(chore => (
          <AssignedChoreCard
            key={chore.id}
            chore={chore}
            onApprove={handleApproveChore}
            onReject={handleRejectChore}
          />
        ))}
      </div>

      {filteredChores.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhuma tarefa encontrada
          </h3>
          <p className="text-gray-600">
            {selectedStatus !== 'all' || selectedChild !== 'all' 
              ? 'Tente ajustar os filtros para ver mais tarefas'
              : 'Comece criando e atribuindo tarefas para as crianças'
            }
          </p>
        </div>
      )}
    </div>
  );
}

function AssignedChoreCard({ 
  chore, 
  onApprove, 
  onReject 
}: {
  chore: AssignedChore;
  onApprove: (choreId: string, qualityRating: number, bonusReward?: number) => void;
  onReject: (choreId: string, reason: string) => void;
}) {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  const isOverdue = chore.due_date && new Date(chore.due_date) < new Date();
  const daysUntilDue = chore.due_date 
    ? Math.ceil((new Date(chore.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${PRIORITY_COLORS[chore.priority]}`}>
            {PRIORITY_LABELS[chore.priority]}
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${STATUS_COLORS[chore.status]}`}>
            {STATUS_LABELS[chore.status]}
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2">{chore.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{chore.description}</p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{chore.child?.avatar}</span>
            <div>
              <div className="font-medium text-gray-900">{chore.child?.name}</div>
              <div className="text-sm text-gray-500">Responsável</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">R$ {chore.reward_amount.toFixed(2)}</div>
            <div className="text-xs text-gray-500">Recompensa</div>
          </div>
        </div>

        {chore.due_date && (
          <div className={`text-sm mb-4 ${isOverdue ? 'text-red-600' : daysUntilDue && daysUntilDue <= 2 ? 'text-orange-600' : 'text-gray-600'}`}>
            {isOverdue 
              ? `⚠️ Atrasada há ${Math.abs(daysUntilDue || 0)} dias`
              : daysUntilDue === 0 
                ? '⏰ Vence hoje'
                : daysUntilDue === 1 
                  ? '📅 Vence amanhã'
                  : `📅 ${daysUntilDue} dias restantes`
            }
          </div>
        )}

        {chore.notes && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="text-sm font-medium text-blue-900 mb-1">Notas da criança:</div>
            <div className="text-sm text-blue-800">{chore.notes}</div>
          </div>
        )}

        {chore.status === 'completed' && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowApprovalModal(true)}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              ✅ Aprovar
            </button>
            <button
              onClick={() => setShowRejectionModal(true)}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              ❌ Rejeitar
            </button>
          </div>
        )}

        {chore.completed_at && (
          <div className="text-sm text-gray-500 mt-2">
            Concluída em: {new Date(chore.completed_at).toLocaleDateString('pt-BR')}
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <ApprovalModal
          chore={chore}
          onApprove={onApprove}
          onCancel={() => setShowApprovalModal(false)}
        />
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <RejectionModal
          chore={chore}
          onReject={onReject}
          onCancel={() => setShowRejectionModal(false)}
        />
      )}
    </>
  );
}

function ApprovalModal({ chore, onApprove, onCancel }: {
  chore: AssignedChore;
  onApprove: (choreId: string, qualityRating: number, bonusReward?: number) => void;
  onCancel: () => void;
}) {
  const [qualityRating, setQualityRating] = useState(5);
  const [bonusReward, setBonusReward] = useState(0);

  const handleSubmit = () => {
    onApprove(chore.id, qualityRating, bonusReward || undefined);
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Aprovar Tarefa: {chore.name}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qualidade do trabalho (1-5 estrelas)
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => setQualityRating(rating)}
                  className={`text-2xl ${rating <= qualityRating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bônus extra (opcional)
            </label>
            <div className="flex items-center space-x-2">
              <span>R$</span>
              <input
                type="number"
                min="0"
                step="0.50"
                value={bonusReward}
                onChange={(e) => setBonusReward(parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-sm font-medium text-green-900">
              Total a ser pago: R$ {(chore.reward_amount + bonusReward).toFixed(2)}
            </div>
            <div className="text-xs text-green-600">
              Recompensa base: R$ {chore.reward_amount.toFixed(2)}
              {bonusReward > 0 && ` + Bônus: R$ ${bonusReward.toFixed(2)}`}
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            ✅ Aprovar
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectionModal({ chore, onReject, onCancel }: {
  chore: AssignedChore;
  onReject: (choreId: string, reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (reason.trim()) {
      onReject(chore.id, reason);
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Rejeitar Tarefa: {chore.name}
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo da rejeição *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
            placeholder="Explique por que a tarefa precisa ser refeita..."
            required
          />
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim()}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none"
          >
            ❌ Rejeitar
          </button>
        </div>
      </div>
    </div>
  );
}