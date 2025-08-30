'use client';

import { useState, useEffect } from 'react';
import { StorageAdapter } from '@/lib/services/storage-adapter';
import DetailedStatement from '../src/components/statements/DetailedStatement';
import MonthlyStatement from '../src/components/statements/MonthlyStatement';
import type { Child } from '@/lib/supabase';

export default function StatementsTest() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'detailed' | 'monthly'>('detailed');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadTestData();
  }, []);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const loadTestData = async () => {
    try {
      addResult('📊 Loading Statements test data...');

      // Get or create test children
      let testChildren = await StorageAdapter.getChildren('ad3bf4c0-b441-48ae-9c7d-4a2e29237c36');
      
      if (testChildren.length === 0) {
        addResult('📝 Creating test children with financial history...');
        
        const children = [
          {
            family_id: 'ad3bf4c0-b441-48ae-9c7d-4a2e29237c36',
            name: 'Lucas Financeiro',
            pin: '1111',
            avatar: '👦',
            balance: 245.75,
            total_earned: 500.0,
            total_spent: 254.25,
            level: 6,
            xp: 720
          },
          {
            family_id: 'ad3bf4c0-b441-48ae-9c7d-4a2e29237c36',
            name: 'Maria Organizadora',
            pin: '2222',
            avatar: '👧',
            balance: 189.50,
            total_earned: 350.0,
            total_spent: 160.50,
            level: 4,
            xp: 480
          }
        ];

        for (const childData of children) {
          const child = await StorageAdapter.createChild(childData);
          if (child) testChildren.push(child);
        }
        
        addResult(`✅ Created ${testChildren.length} test children with financial profiles`);
      }

      setChildren(testChildren);
      setSelectedChild(testChildren[0] || null);
      addResult('📊 Statements system ready for testing!');

    } catch (error) {
      addResult(`❌ Error loading test data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error loading test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRichTransactionHistory = async () => {
    if (children.length === 0) return;

    try {
      addResult('💳 Generating rich transaction history...');

      const transactionTypes = {
        income: [
          { desc: 'Tarefa: Organizar quarto', amount: [5, 15], category: 'task' },
          { desc: 'Ajudar na cozinha', amount: [8, 20], category: 'chore' },
          { desc: 'Lição de casa completa', amount: [10, 25], category: 'task' },
          { desc: 'Cuidar do jardim', amount: [12, 30], category: 'chore' },
          { desc: 'Mesada semanal', amount: [50, 100], category: 'mesada' }
        ],
        expense: [
          { desc: 'Compra de brinquedo', amount: [15, 50], category: 'purchase' },
          { desc: 'Doces na cantina', amount: [3, 12], category: 'purchase' },
          { desc: 'Livro novo', amount: [20, 40], category: 'purchase' },
          { desc: 'Presente para amigo', amount: [25, 60], category: 'gift' }
        ],
        reward: [
          { desc: 'Bônus por boas notas', amount: [20, 50], category: 'bonus' },
          { desc: 'Meta alcançada', amount: [30, 80], category: 'goal' },
          { desc: 'Comportamento exemplar', amount: [15, 35], category: 'bonus' }
        ]
      };

      // Generate 90 days of transaction history
      const transactions = [];
      let currentBalance = 0;

      for (const child of children) {
        currentBalance = 50; // Starting balance
        
        for (let dayOffset = 90; dayOffset >= 0; dayOffset--) {
          const transactionDate = new Date();
          transactionDate.setDate(transactionDate.getDate() - dayOffset);
          
          // 60% chance of having transactions on any given day
          if (Math.random() < 0.6) {
            const numTransactions = Math.floor(Math.random() * 3) + 1; // 1-3 transactions per day
            
            for (let i = 0; i < numTransactions; i++) {
              // Random transaction type (70% income/rewards, 30% expenses)
              const isPositive = Math.random() < 0.7;
              const typeKey = isPositive 
                ? (Math.random() < 0.8 ? 'income' : 'reward')
                : 'expense';
              
              const templates = transactionTypes[typeKey];
              const template = templates[Math.floor(Math.random() * templates.length)];
              const amount = Math.floor(Math.random() * (template.amount[1] - template.amount[0])) + template.amount[0];
              
              // Update balance
              if (isPositive) {
                currentBalance += amount;
              } else {
                // Don't go negative
                const actualAmount = Math.min(amount, currentBalance);
                currentBalance -= actualAmount;
              }
              
              // Add some random time to the date
              const transactionTime = new Date(transactionDate);
              transactionTime.setHours(Math.floor(Math.random() * 16) + 8); // 8 AM to 11 PM
              transactionTime.setMinutes(Math.floor(Math.random() * 60));

              const transaction = {
                id: `transaction-${child.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                child_id: child.id,
                type: typeKey,
                category: template.category,
                amount: isPositive ? amount : -Math.abs(amount),
                balance_after: currentBalance,
                description: template.desc,
                created_at: transactionTime.toISOString(),
                notes: Math.random() < 0.3 ? 'Gerado automaticamente para teste' : undefined,
                tags: Math.random() < 0.2 ? ['teste', 'mock'] : undefined
              };

              transactions.push(transaction);
            }
          }
        }

        // Update child balance
        child.balance = currentBalance;
        addResult(`✅ Generated ${transactions.filter(t => t.child_id === child.id).length} transactions for ${child.name}`);
      }

      // Save to localStorage
      localStorage.setItem('banco-familia-statement-transactions', JSON.stringify(transactions));
      addResult(`💾 Saved ${transactions.length} transactions to localStorage`);
      addResult('✅ Rich transaction history generated successfully!');

    } catch (error) {
      addResult(`❌ Error generating transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const generateMonthlyPatterns = async () => {
    try {
      addResult('📅 Creating monthly spending patterns...');

      // Generate specific monthly patterns for better insights
      const monthlyData = [];
      
      for (let month = 0; month < 6; month++) { // Last 6 months
        const date = new Date();
        date.setMonth(date.getMonth() - month);
        
        for (const child of children) {
          // Weekly allowance pattern
          for (let week = 0; week < 4; week++) {
            const weekDate = new Date(date);
            weekDate.setDate(1 + (week * 7)); // First Sunday of each week
            
            monthlyData.push({
              id: `monthly-allowance-${child.id}-${month}-${week}`,
              child_id: child.id,
              type: 'allowance',
              category: 'mesada',
              amount: 50,
              balance_after: 0, // Will be calculated
              description: 'Mesada semanal',
              created_at: weekDate.toISOString()
            });
          }

          // Monthly goal contributions
          const goalDate = new Date(date);
          goalDate.setDate(15); // Mid-month goal contribution
          
          monthlyData.push({
            id: `monthly-goal-${child.id}-${month}`,
            child_id: child.id,
            type: 'expense',
            category: 'goal',
            amount: -30,
            balance_after: 0,
            description: 'Contribuição para meta mensal',
            created_at: goalDate.toISOString()
          });
        }
      }

      // Merge with existing transactions
      const existing = JSON.parse(localStorage.getItem('banco-familia-statement-transactions') || '[]');
      const combined = [...existing, ...monthlyData];
      
      localStorage.setItem('banco-familia-statement-transactions', JSON.stringify(combined));
      
      addResult(`✅ Added ${monthlyData.length} monthly pattern transactions`);

    } catch (error) {
      addResult(`❌ Error generating monthly patterns: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const generateCategoryInsights = async () => {
    try {
      addResult('🏷️ Creating category-specific transaction patterns...');

      const categoryPatterns = {
        task: [
          'Arrumar a cama diariamente',
          'Estudar por 1 hora',
          'Ajudar com pets',
          'Organizar materiais escolares'
        ],
        purchase: [
          'Lanche na escola',
          'Revista em quadrinhos',
          'Adesivos colecionáveis',
          'Sorvete no parque'
        ],
        goal: [
          'Economizando para bicicleta',
          'Guardando para viagem',
          'Juntando para videogame',
          'Poupando para presente'
        ],
        bonus: [
          'Nota máxima na prova',
          'Comportamento exemplar',
          'Ajuda extra em casa',
          'Liderança em projeto'
        ]
      };

      const categoryTransactions = [];
      
      for (const child of children) {
        Object.entries(categoryPatterns).forEach(([category, descriptions]) => {
          descriptions.forEach(desc => {
            // Generate 3-5 transactions per pattern over last 60 days
            const count = Math.floor(Math.random() * 3) + 3;
            
            for (let i = 0; i < count; i++) {
              const daysAgo = Math.floor(Math.random() * 60);
              const date = new Date();
              date.setDate(date.getDate() - daysAgo);
              
              const isPositive = ['task', 'bonus', 'goal'].includes(category);
              const baseAmount = category === 'task' ? 10 : category === 'purchase' ? 15 : category === 'bonus' ? 25 : 20;
              const amount = baseAmount + Math.floor(Math.random() * 20);
              
              categoryTransactions.push({
                id: `category-${category}-${child.id}-${i}-${Date.now()}`,
                child_id: child.id,
                type: isPositive ? (category === 'bonus' ? 'reward' : 'income') : 'expense',
                category,
                amount: isPositive ? amount : -amount,
                balance_after: 0, // Will be calculated
                description: desc,
                created_at: date.toISOString(),
                tags: [category, 'pattern']
              });
            }
          });
        });

        addResult(`✅ Generated category patterns for ${child.name}`);
      }

      // Merge with existing
      const existing = JSON.parse(localStorage.getItem('banco-familia-statement-transactions') || '[]');
      const combined = [...existing, ...categoryTransactions];
      
      localStorage.setItem('banco-familia-statement-transactions', JSON.stringify(combined));
      
      addResult(`💾 Added ${categoryTransactions.length} category-specific transactions`);

    } catch (error) {
      addResult(`❌ Error generating category insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runCompleteStatementGeneration = async () => {
    try {
      addResult('🚀 Running complete statement generation...');
      
      // Clear existing data
      localStorage.removeItem('banco-familia-statement-transactions');
      
      await generateRichTransactionHistory();
      await generateMonthlyPatterns();
      await generateCategoryInsights();

      addResult('✨ Complete statement dataset generated!');
      addResult('📊 You can now test detailed and monthly statements');

    } catch (error) {
      addResult(`❌ Error in complete generation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearStatementData = () => {
    try {
      localStorage.removeItem('banco-familia-statement-transactions');
      addResult('🗑️ All statement data cleared');
      addResult('💡 Generate new data to test statements again');
    } catch (error) {
      addResult(`❌ Error clearing data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-2xl animate-spin">
            📊
          </div>
          <p className="text-gray-600 font-medium">Loading Statements System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full shadow-lg">
              <span className="text-3xl">📊</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Sistema de Extratos Test
            </h1>
          </div>

          {/* Child selector */}
          {children.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-800 mb-3">
                Selecionar Criança:
              </label>
              <div className="flex space-x-2">
                {children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChild(child)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                      selectedChild?.id === child.id
                        ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg'
                        : 'bg-white/70 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                    }`}
                  >
                    {child.avatar} {child.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-800 mb-3">
              Modo de Visualização:
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  viewMode === 'detailed'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📋 Extrato Detalhado
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  viewMode === 'monthly'
                    ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📅 Extrato Mensal
              </button>
            </div>
          </div>

          {/* Monthly Statement Controls */}
          {viewMode === 'monthly' && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-800 mb-3">
                Período:
              </label>
              <div className="flex space-x-4">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2024, i).toLocaleDateString('pt-BR', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
            </div>
          )}

          {/* Test Actions */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={generateRichTransactionHistory}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>💳</span>
              <span>Generate Transactions</span>
            </button>
            
            <button
              onClick={generateMonthlyPatterns}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>📅</span>
              <span>Monthly Patterns</span>
            </button>
            
            <button
              onClick={generateCategoryInsights}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>🏷️</span>
              <span>Category Patterns</span>
            </button>

            <button
              onClick={runCompleteStatementGeneration}
              className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>🚀</span>
              <span>Complete Dataset</span>
            </button>

            <button
              onClick={clearStatementData}
              className="flex items-center space-x-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>🗑️</span>
              <span>Clear Data</span>
            </button>
          </div>

          {/* Info */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">💡</div>
              <div className="flex-1">
                <h4 className="font-bold text-green-900 mb-2">Como Usar o Sistema de Extratos</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• <strong>Generate Transactions:</strong> Cria histórico detalhado de 90 dias</li>
                  <li>• <strong>Monthly Patterns:</strong> Simula padrões mensais recorrentes</li>
                  <li>• <strong>Category Patterns:</strong> Gera insights por categoria específica</li>
                  <li>• <strong>Complete Dataset:</strong> Gera conjunto completo para teste</li>
                  <li>• <strong>Extrato Detalhado:</strong> Visualização com filtros avançados</li>
                  <li>• <strong>Extrato Mensal:</strong> Relatório completo do mês com insights</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Statement Display */}
          <div className="lg:col-span-3">
            {selectedChild && viewMode === 'detailed' && (
              <DetailedStatement child={selectedChild} />
            )}
            
            {selectedChild && viewMode === 'monthly' && (
              <MonthlyStatement 
                childId={selectedChild.id} 
                year={selectedYear} 
                month={selectedMonth} 
              />
            )}
            
            {!selectedChild && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
                <div className="text-6xl mb-4">👤</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Selecione uma Criança</h3>
                <p className="text-gray-600">Escolha uma criança acima para ver seu extrato.</p>
              </div>
            )}
          </div>

          {/* Test Results */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full shadow-lg">
                <span className="text-lg">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Test Results</h3>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-black text-green-400 rounded-2xl p-6 h-[600px] overflow-y-auto font-mono text-sm shadow-2xl border border-gray-700">
              {testResults.map((result, index) => (
                <div key={index} className="mb-2 opacity-90 hover:opacity-100 transition-opacity">
                  {result}
                </div>
              ))}
              {testResults.length === 0 && (
                <div className="text-gray-500 italic">Running tests...</div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/parental-dashboard-test"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          >
            <span>👨‍👩‍👧‍👦</span>
            <span>Test Parental Dashboard</span>
          </a>
          <a
            href="/analytics-test"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          >
            <span>←</span>
            <span>Back to Analytics</span>
          </a>
        </div>
      </div>
    </div>
  );
}