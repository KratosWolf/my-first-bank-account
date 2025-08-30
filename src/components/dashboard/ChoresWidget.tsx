'use client';

import { useState, useEffect } from 'react';
import { ChoresService } from '@/lib/services/chores';
import type { AssignedChore } from '@/lib/supabase';

interface ChoresWidgetProps {
  childId: string;
  childName: string;
}

const STATUS_COLORS = {
  assigned: 'from-blue-400 to-blue-600',
  in_progress: 'from-yellow-400 to-yellow-600',
  completed: 'from-orange-400 to-orange-600',
  approved: 'from-green-400 to-green-600',
  rejected: 'from-red-400 to-red-600'
};

const PRIORITY_ICONS = {
  low: '🔵',
  medium: '🟡',
  high: '🟠',
  urgent: '🔴'
};

export default function ChoresWidget({ childId, childName }: ChoresWidgetProps) {
  const [chores, setChores] = useState<AssignedChore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChore, setSelectedChore] = useState<AssignedChore | null>(null);

  useEffect(() => {
    loadChores();
  }, [childId]);

  const loadChores = async () => {
    try {
      const data = await ChoresService.getChildChores(childId);
      setChores(data.filter(chore => chore.status !== 'approved')); // Hide completed tasks
    } catch (error) {
      console.error('Error loading chores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChore = async (chore: AssignedChore) => {
    const updatedChore = await ChoresService.startChore(chore.id, 'Comecei a trabalhar nesta tarefa!');
    if (updatedChore) {
      setChores(prev => prev.map(c => c.id === chore.id ? updatedChore : c));
    }
  };

  const handleCompleteChore = async (chore: AssignedChore, notes?: string) => {
    const updatedChore = await ChoresService.completeChore(chore.id, notes);
    if (updatedChore) {
      setChores(prev => prev.map(c => c.id === chore.id ? updatedChore : c));
      setSelectedChore(null);
    }
  };

  const pendingChores = chores.filter(c => c.status === 'assigned' || c.status === 'in_progress');
  const waitingApproval = chores.filter(c => c.status === 'completed');
  const rejectedChores = chores.filter(c => c.status === 'rejected');

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full shadow-lg">
              <span className="text-xl">📝</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Minhas Tarefas</h3>
              <p className="text-sm text-gray-600">
                {pendingChores.length} pendentes • {waitingApproval.length} aguardando aprovação
              </p>
            </div>
          </div>

          {chores.length > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">
                {chores.reduce((total, chore) => total + chore.reward_amount, 0).toFixed(0)}
              </div>
              <div className="text-xs text-gray-500">R$ possíveis</div>
            </div>
          )}
        </div>

        {chores.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🎉</div>
            <h4 className="font-semibold text-gray-900 mb-2">Nenhuma tarefa pendente!</h4>
            <p className="text-sm text-gray-600">
              Você está em dia com todas as suas responsabilidades.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Urgent/High Priority Tasks */}
            {pendingChores
              .filter(chore => chore.priority === 'urgent' || chore.priority === 'high')
              .slice(0, 2)
              .map(chore => (
                <ChoreCard
                  key={chore.id}
                  chore={chore}
                  onStart={handleStartChore}
                  onComplete={() => setSelectedChore(chore)}
                  compact
                />
              ))}

            {/* Other Pending Tasks */}
            {pendingChores
              .filter(chore => chore.priority !== 'urgent' && chore.priority !== 'high')
              .slice(0, 1)
              .map(chore => (
                <ChoreCard
                  key={chore.id}
                  chore={chore}
                  onStart={handleStartChore}
                  onComplete={() => setSelectedChore(chore)}
                  compact
                />
              ))}

            {/* Waiting for Approval */}
            {waitingApproval.slice(0, 1).map(chore => (
              <div key={chore.id} className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">⏳</span>
                    <div>
                      <div className="font-semibold text-orange-900">{chore.name}</div>
                      <div className="text-sm text-orange-700">Aguardando aprovação dos pais</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-600">
                      R$ {chore.reward_amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Rejected Tasks */}
            {rejectedChores.slice(0, 1).map(chore => (
              <div key={chore.id} className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <div className="font-semibold text-red-900">{chore.name}</div>
                      <div className="text-sm text-red-700">Precisa ser refeita</div>
                    </div>
                  </div>
                </div>
                {chore.rejection_reason && (
                  <div className="mt-2 p-2 bg-red-100 rounded-lg">
                    <div className="text-sm text-red-800">{chore.rejection_reason}</div>
                  </div>
                )}
                <button
                  onClick={() => handleStartChore(chore)}
                  className="mt-3 w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-2 rounded-lg transition-all duration-300"
                >
                  🔄 Refazer Tarefa
                </button>
              </div>
            ))}

            {pendingChores.length + waitingApproval.length + rejectedChores.length > 3 && (
              <div className="text-center">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Ver todas as tarefas ({chores.length})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Complete Task Modal */}
      {selectedChore && (
        <CompleteTaskModal
          chore={selectedChore}
          childName={childName}
          onComplete={handleCompleteChore}
          onCancel={() => setSelectedChore(null)}
        />
      )}
    </>
  );
}

function ChoreCard({ 
  chore, 
  onStart, 
  onComplete, 
  compact = false 
}: {
  chore: AssignedChore;
  onStart: (chore: AssignedChore) => void;
  onComplete: () => void;
  compact?: boolean;
}) {
  const isOverdue = chore.due_date && new Date(chore.due_date) < new Date();
  const daysUntilDue = chore.due_date 
    ? Math.ceil((new Date(chore.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className={`bg-gradient-to-r ${STATUS_COLORS[chore.status]} rounded-xl p-4 text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span>{PRIORITY_ICONS[chore.priority]}</span>
          <span className="font-bold text-lg">{chore.name}</span>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold">R$ {chore.reward_amount.toFixed(2)}</div>
        </div>
      </div>

      {!compact && chore.description && (
        <p className="text-white/90 text-sm mb-3">{chore.description}</p>
      )}

      {chore.due_date && (
        <div className={`text-sm mb-3 ${isOverdue ? 'text-yellow-200' : 'text-white/80'}`}>
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

      <div className="flex space-x-2">
        {chore.status === 'assigned' && (
          <button
            onClick={() => onStart(chore)}
            className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            🚀 Começar
          </button>
        )}

        {chore.status === 'in_progress' && (
          <button
            onClick={onComplete}
            className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            ✅ Concluir
          </button>
        )}
      </div>
    </div>
  );
}

function CompleteTaskModal({ 
  chore, 
  childName, 
  onComplete, 
  onCancel 
}: {
  chore: AssignedChore;
  childName: string;
  onComplete: (chore: AssignedChore, notes?: string) => void;
  onCancel: () => void;
}) {
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState('');

  const handleSubmit = () => {
    onComplete(chore, notes || undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-3xl">🎉</span>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Parabéns, {childName}!
            </h3>
            <p className="text-gray-600">Você concluiu: {chore.name}</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-green-900">Recompensa</div>
              <div className="text-sm text-green-700">Será adicionada após aprovação</div>
            </div>
            <div className="text-2xl font-bold text-green-600">
              +R$ {chore.reward_amount.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Como foi fazer esta tarefa? (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
              placeholder="Conte como foi fazer essa tarefa, se foi fácil ou difícil..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tirou uma foto? (opcional)
            </label>
            <input
              type="text"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              placeholder="Cole o link da foto aqui"
            />
            <p className="text-xs text-gray-500 mt-1">
              📸 Tirar uma foto pode ajudar seus pais a aprovarem mais rápido!
            </p>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Voltar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🎉 Finalizar
          </button>
        </div>
      </div>
    </div>
  );
}