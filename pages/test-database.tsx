import { useState, useEffect } from 'react';
import { StorageAdapter } from '@/lib/services/storage-adapter';
import type { Child } from '@/lib/supabase';

export default function TestDatabase() {
  const [status, setStatus] = useState('Loading...');
  const [children, setChildren] = useState<Child[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const testDatabase = async () => {
    addResult('🧪 Starting database tests...');

    try {
      // Test connection
      const response = await fetch('/api/test-db');
      const result = await response.json();
      
      if (result.success) {
        addResult('✅ Database connection: SUCCESS');
        setStatus('Connected');
      } else {
        addResult(`❌ Database connection: ${result.error}`);
        setStatus('Connection Failed');
        return;
      }

      // First create a family
      addResult('👨‍👩‍👧‍👦 Creating test family...');
      const testFamily = {
        parent_name: 'Test Parent',
        parent_email: `test-${Date.now()}@example.com`,
      };

      // Create family via direct Supabase call
      const familyResponse = await fetch('/api/debug-supabase');
      const familyResult = await familyResponse.json();
      const familyId = familyResult.results.find((r: string) => r.includes('Family created'))?.split(': ')[1];

      if (!familyId) {
        addResult('❌ Could not create test family');
        return;
      }
      
      addResult(`✅ Test family created: ${familyId}`);

      // Test creating a child
      addResult('📝 Testing child creation...');
      const testChild = {
        family_id: familyId,
        name: 'Test Child',
        pin: '1234',
        avatar: '👶',
        balance: 100.00,
        total_earned: 100.00,
        total_spent: 0.00,
        level: 1,
        xp: 0,
      };

      const createdChild = await StorageAdapter.createChild(testChild);
      if (createdChild) {
        addResult('✅ Child creation: SUCCESS');
        setChildren([createdChild]);

        // Test getting children
        addResult('🔍 Testing get children...');
        const retrievedChildren = await StorageAdapter.getChildren(familyId);
        addResult(`✅ Retrieved ${retrievedChildren.length} children`);

        // Test creating a transaction
        addResult('💰 Testing transaction creation...');
        const testTransaction = {
          child_id: createdChild.id,
          type: 'allowance' as const,
          amount: 20.00,
          description: 'Weekly allowance',
          category: 'allowance',
        };

        const createdTransaction = await StorageAdapter.createTransaction(testTransaction);
        if (createdTransaction) {
          addResult('✅ Transaction creation: SUCCESS');

          // Test getting transactions
          const transactions = await StorageAdapter.getTransactions(createdChild.id);
          addResult(`✅ Retrieved ${transactions.length} transactions`);
        } else {
          addResult('❌ Transaction creation: FAILED');
        }

      } else {
        addResult('❌ Child creation: FAILED - using localStorage fallback');
        
        // Test localStorage fallback
        const localChild = await StorageAdapter.createChild(testChild);
        if (localChild) {
          addResult('✅ localStorage fallback: SUCCESS');
          setChildren([localChild]);
        }
      }

    } catch (error) {
      addResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStatus('Test Failed');
    }
  };

  useEffect(() => {
    testDatabase();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🗃️ Database Connection Test
          </h1>
          
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                status === 'Connected' ? 'bg-green-100 text-green-800' :
                status === 'Loading...' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Results */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Test Results</h2>
              <div className="bg-gray-900 text-green-400 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
                {testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))}
              </div>
            </div>

            {/* Children Data */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Created Children</h2>
              {children.length > 0 ? (
                <div className="space-y-3">
                  {children.map((child) => (
                    <div key={child.id} className="border rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{child.avatar}</span>
                        <div>
                          <div className="font-medium">{child.name}</div>
                          <div className="text-sm text-gray-500">
                            Balance: R$ {child.balance.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {child.id}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  No children created yet
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <button
              onClick={() => {
                setTestResults([]);
                setChildren([]);
                testDatabase();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              🔄 Run Tests Again
            </button>
            
            <a
              href="/"
              className="ml-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors inline-block"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}