import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MigrateToRealApp() {
  const [migrationStatus, setMigrationStatus] = useState<
    'not_started' | 'loading' | 'completed' | 'error'
  >('not_started');
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(1);
  const [parentEmail, setParentEmail] = useState('');

  useEffect(() => {
    // Try to get parent email from session
    try {
      const parentSession = localStorage.getItem('parent-session');
      if (parentSession) {
        const session = JSON.parse(parentSession);
        setParentEmail(session.email || '');
      }
    } catch (e) {
      console.log('No parent session found');
    }
  }, []);

  const steps = [
    {
      id: 1,
      title: 'Verificar Dados',
      description: 'Analisando dados no localStorage',
    },
    {
      id: 2,
      title: 'Criar/Encontrar Família',
      description: 'Configurando sua família no banco de dados',
    },
    {
      id: 3,
      title: 'Migrar Crianças',
      description: 'Transferindo dados das crianças',
    },
    {
      id: 4,
      title: 'Migrar Transações',
      description: 'Transferindo histórico financeiro',
    },
    {
      id: 5,
      title: 'Finalizar',
      description: 'App transformado em banco real!',
    },
  ];

  const runMigration = async () => {
    if (!parentEmail) {
      setError('Email do responsável é obrigatório');
      return;
    }

    setMigrationStatus('loading');
    setError('');
    setCurrentStep(1);

    try {
      // Step 1: Check localStorage data
      const localChildren = JSON.parse(
        localStorage.getItem('banco-familia-children') || '[]'
      );
      const localTransactions = JSON.parse(
        localStorage.getItem('banco-familia-transactions') || '[]'
      );

      setTimeout(() => setCurrentStep(2), 1000);

      // Step 2-5: Run migration
      const response = await fetch('/api/migrate-to-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parentEmail: parentEmail.trim(),
        }),
      });

      const data = await response.json();

      setTimeout(() => setCurrentStep(3), 1500);
      setTimeout(() => setCurrentStep(4), 2000);
      setTimeout(() => setCurrentStep(5), 2500);

      if (data.success) {
        setResults(data);
        setMigrationStatus('completed');

        // Store family info for future use
        localStorage.setItem(
          'family-info',
          JSON.stringify({
            id: data.family.id,
            parent_name: data.family.parent_name,
            parent_email: data.family.parent_email,
            migrated: true,
          })
        );
      } else {
        setError(data.error);
        setMigrationStatus('error');
      }
    } catch (err: any) {
      setError(err.message);
      setMigrationStatus('error');
    }
  };

  const getStepIcon = (stepId: number) => {
    if (stepId < currentStep) return '✅';
    if (stepId === currentStep && migrationStatus === 'loading') return '⏳';
    if (stepId === currentStep && migrationStatus === 'error') return '❌';
    return '⭕';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              🚀 Transformar em App Real
            </h1>
            <p className="text-gray-600 text-lg">
              Vamos migrar seus dados do localStorage para um banco de dados
              real!
              <br />
              Assim você pode acessar de qualquer dispositivo 📱💻
            </p>
          </div>

          {migrationStatus === 'not_started' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="font-semibold text-blue-800 mb-3">
                  🎯 O que vai acontecer:
                </h2>
                <ul className="text-blue-700 space-y-2 text-sm">
                  <li>
                    • ✨ Seus dados ficarão salvos no Supabase (banco de dados
                    na nuvem)
                  </li>
                  <li>• 🌍 Você pode acessar de qualquer lugar</li>
                  <li>• 🔒 Dados seguros e sincronizados</li>
                  <li>• 📊 Relatórios e analytics avançados</li>
                  <li>• 👨‍👩‍👧‍👦 Acesso multi-dispositivo para toda família</li>
                </ul>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📧 Email do Responsável
                  </label>
                  <input
                    type="email"
                    value={parentEmail}
                    onChange={e => setParentEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Este será usado para identificar sua família no banco de
                    dados
                  </p>
                </div>

                <button
                  onClick={runMigration}
                  disabled={!parentEmail.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  🚀 Migrar para Banco Real
                </button>
              </div>
            </div>
          )}

          {migrationStatus === 'loading' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Migrando seus dados...
                </h2>
              </div>

              <div className="space-y-4">
                {steps.map(step => (
                  <div key={step.id} className="flex items-center space-x-3">
                    <span className="text-2xl">{getStepIcon(step.id)}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {step.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        {step.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {migrationStatus === 'completed' && results && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  Migração Concluída com Sucesso!
                </h2>
                <p className="text-gray-600">
                  Seu app agora é um banco de dados real!
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-800 mb-3">
                  📊 Resumo da Migração:
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-green-700">
                      <strong>👨‍👩‍👧‍👦 Família:</strong> {results.family.parent_name}
                    </div>
                    <div className="text-green-700">
                      <strong>📧 Email:</strong> {results.family.parent_email}
                    </div>
                    <div className="text-green-700">
                      <strong>🆔 ID:</strong>{' '}
                      {results.family.id.substring(0, 8)}...
                    </div>
                  </div>
                  <div>
                    <div className="text-green-700">
                      <strong>👧👦 Crianças migradas:</strong>{' '}
                      {results.children_count}
                    </div>
                    <div className="text-green-700">
                      <strong>💰 Saldo total:</strong> R${' '}
                      {results.total_balance.toFixed(2)}
                    </div>
                    <div className="text-green-700">
                      <strong>📅 Criado:</strong>{' '}
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {results.children_summary &&
                  results.children_summary.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-green-800 mb-2">
                        Crianças:
                      </h4>
                      <div className="space-y-1">
                        {results.children_summary.map(
                          (child: any, index: number) => (
                            <div key={index} className="text-green-700 text-sm">
                              • {child.name}: R$ {child.balance.toFixed(2)}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>

              <div className="flex gap-4">
                <Link
                  href="/demo-parent-view"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
                >
                  🏠 Ir para Dashboard
                </Link>
                <Link
                  href="/supabase-setup"
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
                >
                  🔧 Testar Banco
                </Link>
              </div>
            </div>
          )}

          {migrationStatus === 'error' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">😕</div>
                <h2 className="text-2xl font-bold text-red-600 mb-2">
                  Erro na Migração
                </h2>
                <p className="text-gray-600">
                  Algo deu errado durante a migração
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="font-semibold text-red-800 mb-2">❌ Erro:</h3>
                <pre className="text-red-700 text-sm bg-red-100 p-3 rounded">
                  {error}
                </pre>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setMigrationStatus('not_started');
                    setError('');
                    setCurrentStep(1);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  🔄 Tentar Novamente
                </button>
                <Link
                  href="/supabase-setup"
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
                >
                  🔧 Testar Conexão
                </Link>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <Link
                href="/demo-parent-view"
                className="hover:text-blue-600 transition-colors"
              >
                ← Voltar ao Dashboard
              </Link>
              <div>🛠️ Powered by Supabase</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
