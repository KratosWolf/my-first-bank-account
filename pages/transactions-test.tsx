import { useState, useEffect } from 'react';
import { StorageAdapter } from '@/lib/services/storage-adapter';
import { TransactionService } from '@/lib/services/transactions';
import type { Child, Transaction, SpendingCategory } from '@/lib/supabase';

export default function TransactionsTest() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<SpendingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    loadTestData();
  }, []);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const loadTestData = async () => {
    try {
      addResult('💰 Loading Financial System test data...');

      // Get test children
      const testChildren = await StorageAdapter.getChildren('ad3bf4c0-b441-48ae-9c7d-4a2e29237c36');
      
      if (testChildren.length === 0) {
        addResult('❌ No test children found. Please run database tests first.');
        return;
      }

      addResult(`✅ Found ${testChildren.length} test children`);
      setChildren(testChildren);
      setSelectedChild(testChildren[0]);

      // Load spending categories
      const spendingCategories = await TransactionService.getSpendingCategories();
      setCategories(spendingCategories);
      addResult(`✅ Loaded ${spendingCategories.length} spending categories`);

      // Load transactions for first child
      const childTransactions = await TransactionService.getChildTransactions(testChildren[0].id);
      setTransactions(childTransactions);
      addResult(`✅ Loaded ${childTransactions.length} existing transactions`);

      addResult('🚀 Financial System loaded successfully!');

    } catch (error) {
      addResult(`❌ Error loading test data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error loading test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEarning = async () => {
    if (!selectedChild) return;

    try {
      addResult('💵 Adding earning...');
      
      const earnings = [
        { amount: 25, description: 'Completed all weekly chores', category: 'chores' },
        { amount: 50, description: 'Birthday gift from grandparents', category: 'gift' },
        { amount: 10, description: 'Sold old toys', category: 'selling' },
        { amount: 30, description: 'Good grades bonus', category: 'academic' }
      ];

      const randomEarning = earnings[Math.floor(Math.random() * earnings.length)];
      
      const transaction = await TransactionService.addEarning(
        selectedChild.id,
        randomEarning.amount,
        randomEarning.description,
        randomEarning.category
      );

      if (transaction) {
        addResult(`✅ Added R$ ${randomEarning.amount} earning: "${randomEarning.description}"`);
        await refreshData();
      } else {
        addResult('❌ Failed to add earning');
      }
    } catch (error) {
      addResult(`❌ Error adding earning: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const addAllowance = async () => {
    if (!selectedChild) return;

    try {
      addResult('💰 Adding allowance payment...');
      
      const transaction = await TransactionService.addAllowance(
        selectedChild.id,
        25.00,
        'Weekly'
      );

      if (transaction) {
        addResult(`✅ Added R$ 25.00 weekly allowance`);
        await refreshData();
      } else {
        addResult('❌ Failed to add allowance');
      }
    } catch (error) {
      addResult(`❌ Error adding allowance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const requestSpending = async () => {
    if (!selectedChild) return;

    try {
      addResult('🛒 Requesting spending...');
      
      const spendingRequests = [
        { amount: 15, description: 'New book about space', category: 'Books & Education' },
        { amount: 35, description: 'Video game', category: 'Toys & Games' },
        { amount: 8, description: 'Ice cream with friends', category: 'Food & Snacks' },
        { amount: 50, description: 'New sneakers', category: 'Clothes & Accessories' }
      ];

      const randomSpending = spendingRequests[Math.floor(Math.random() * spendingRequests.length)];
      
      // Check if category requires approval
      const category = categories.find(c => c.name === randomSpending.category);
      const requiresApproval = category?.requires_approval ?? true;

      const transaction = await TransactionService.requestSpending(
        selectedChild.id,
        randomSpending.amount,
        randomSpending.description,
        randomSpending.category,
        requiresApproval
      );

      if (transaction) {
        const status = requiresApproval ? 'pending approval' : 'completed';
        addResult(`✅ Spending request: R$ ${randomSpending.amount} for "${randomSpending.description}" (${status})`);
        await refreshData();
      } else {
        addResult('❌ Failed to create spending request');
      }
    } catch (error) {
      addResult(`❌ Error requesting spending: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const transferMoney = async () => {
    if (!selectedChild || children.length < 2) {
      addResult('❌ Need at least 2 children for transfers');
      return;
    }

    try {
      addResult('🔄 Transferring money between children...');
      
      const otherChild = children.find(c => c.id !== selectedChild.id);
      if (!otherChild) return;

      const transaction = await TransactionService.transferMoney(
        selectedChild.id,
        otherChild.id,
        20.00,
        `Transfer from ${selectedChild.name} to ${otherChild.name}`
      );

      if (transaction) {
        addResult(`✅ Transferred R$ 20.00 from ${selectedChild.name} to ${otherChild.name}`);
        await refreshData();
      } else {
        addResult('❌ Failed to transfer money');
      }
    } catch (error) {
      addResult(`❌ Error transferring money: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const calculateInterest = async () => {
    if (!selectedChild) return;

    try {
      addResult('📈 Calculating monthly interest...');
      
      const transaction = await TransactionService.calculateInterest(selectedChild.id);

      if (transaction) {
        addResult(`✅ Interest payment: R$ ${transaction.amount.toFixed(2)}`);
        await refreshData();
      } else {
        addResult('ℹ️ No interest earned (balance below minimum or rate too low)');
      }
    } catch (error) {
      addResult(`❌ Error calculating interest: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const refreshData = async () => {
    if (!selectedChild) return;
    
    // Refresh child data
    const updatedChildren = await StorageAdapter.getChildren('ad3bf4c0-b441-48ae-9c7d-4a2e29237c36');
    setChildren(updatedChildren);
    const updatedSelectedChild = updatedChildren.find(c => c.id === selectedChild.id);
    if (updatedSelectedChild) {
      setSelectedChild(updatedSelectedChild);
    }

    // Refresh transactions
    const childTransactions = await TransactionService.getChildTransactions(selectedChild.id);
    setTransactions(childTransactions);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'earning': return '💵';
      case 'allowance': return '💰';
      case 'spending': return '🛒';
      case 'transfer': return '🔄';
      case 'interest': return '📈';
      case 'goal_deposit': return '🎯';
      default: return '💳';
    }
  };

  const getStatusBadge = (transaction: Transaction) => {
    switch (transaction.status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">✅ Completed</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">⏳ Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">❌ Rejected</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">🚫 Cancelled</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            💰 Financial Transaction System Test
          </h1>
          
          {/* Child selector */}
          {children.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Child:
              </label>
              <div className="flex space-x-2">
                {children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChild(child)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedChild?.id === child.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {child.avatar} {child.name}
                    <div className="text-xs opacity-80">
                      {formatCurrency(child.balance)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Test Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={addEarning}
              disabled={!selectedChild}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              💵 Add Earning
            </button>
            
            <button
              onClick={addAllowance}
              disabled={!selectedChild}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              💰 Add Allowance
            </button>
            
            <button
              onClick={requestSpending}
              disabled={!selectedChild}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              🛒 Request Spending
            </button>
            
            <button
              onClick={transferMoney}
              disabled={!selectedChild || children.length < 2}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              🔄 Transfer Money
            </button>
            
            <button
              onClick={calculateInterest}
              disabled={!selectedChild}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              📈 Calculate Interest
            </button>
            
            <button
              onClick={loadTestData}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              🔄 Refresh Data
            </button>
          </div>

          {/* Test Results */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Test Results</h3>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm">
              {testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Balance Summary */}
          {selectedChild && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                💳 {selectedChild.name}'s Financial Summary
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedChild.balance)}
                  </div>
                  <div className="text-sm text-green-700">Current Balance</div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(selectedChild.total_earned)}
                  </div>
                  <div className="text-sm text-blue-700">Total Earned</div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(selectedChild.total_spent)}
                  </div>
                  <div className="text-sm text-red-700">Total Spent</div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {transactions.length}
                  </div>
                  <div className="text-sm text-purple-700">Transactions</div>
                </div>
              </div>
            </div>
          )}

          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Recent Transactions</h2>
            
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">💳</div>
                <p className="text-gray-500">No transactions yet</p>
                <p className="text-sm text-gray-400">Try adding some earnings or spending!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {transaction.description}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.category} • {new Date(transaction.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-bold ${
                        ['earning', 'allowance', 'interest'].includes(transaction.type)
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {['earning', 'allowance', 'interest'].includes(transaction.type) ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="mt-1">
                        {getStatusBadge(transaction)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <a
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}