// Development data for testing - only runs in development mode

export const createSampleData = () => {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }

  console.log('🔧 Creating sample data for development...');

  // Sample children data
  const sampleChildren = [
    {
      id: 'child-001',
      name: 'Ana',
      pin: '1234',
      balance: 85.5,
      level: 3,
      points: 450,
      avatar: '👧',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      parentId: 'parent-001',
    },
    {
      id: 'child-002',
      name: 'João',
      pin: '5678',
      balance: 120.25,
      level: 4,
      points: 680,
      avatar: '👦',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      parentId: 'parent-001',
    },
    {
      id: 'child-003',
      name: 'Maria',
      pin: '9999',
      balance: 42.75,
      level: 2,
      points: 220,
      avatar: '🧒',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      parentId: 'parent-001',
    },
  ];

  // Sample transactions for each child
  const sampleTransactions = [
    // Ana's transactions
    {
      id: 'tx-001',
      childId: 'child-001',
      amount: 20.0,
      category: 'allowance',
      description: 'Mesada semanal',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'tx-002',
      childId: 'child-001',
      amount: -5.5,
      category: 'purchase',
      description: 'Doces na escola',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'tx-003',
      childId: 'child-001',
      amount: 10.0,
      category: 'chore',
      description: 'Arrumou o quarto',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    },

    // João's transactions
    {
      id: 'tx-004',
      childId: 'child-002',
      amount: 50.0,
      category: 'allowance',
      description: 'Mesada mensal',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'tx-005',
      childId: 'child-002',
      amount: -15.75,
      category: 'purchase',
      description: 'Livro escolar',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'tx-006',
      childId: 'child-002',
      amount: 25.0,
      category: 'reward',
      description: 'Bom desempenho na escola',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },

    // Maria's transactions
    {
      id: 'tx-007',
      childId: 'child-003',
      amount: 15.0,
      category: 'allowance',
      description: 'Mesada semanal',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'tx-008',
      childId: 'child-003',
      amount: -3.25,
      category: 'purchase',
      description: 'Chiclete',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Save to localStorage
  try {
    localStorage.setItem(
      'banco-familia-children',
      JSON.stringify(sampleChildren)
    );
    localStorage.setItem(
      'banco-familia-transactions',
      JSON.stringify(sampleTransactions)
    );

    console.log('✅ Sample data created:');
    console.log(`- ${sampleChildren.length} children`);
    console.log(`- ${sampleTransactions.length} transactions`);
    console.log('');
    console.log('👶 Children login credentials:');
    sampleChildren.forEach(child => {
      console.log(
        `- ${child.name} (${child.avatar}): PIN ${child.pin} | Saldo: R$ ${child.balance}`
      );
    });
    console.log('');
    console.log('🔍 Test the child login at: http://localhost:3003');
  } catch (error) {
    console.error('❌ Failed to create sample data:', error);
  }
};

export const clearSampleData = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem('banco-familia-children');
    localStorage.removeItem('banco-familia-transactions');
    console.log('🗑️ Sample data cleared');
  } catch (error) {
    console.error('❌ Failed to clear sample data:', error);
  }
};

export const getSampleDataInfo = () => {
  if (typeof window === 'undefined') {
    return {
      hasChildren: false,
      hasTransactions: false,
      childrenCount: 0,
      transactionsCount: 0,
    };
  }

  try {
    const children = localStorage.getItem('banco-familia-children');
    const transactions = localStorage.getItem('banco-familia-transactions');

    return {
      hasChildren: !!children && JSON.parse(children).length > 0,
      hasTransactions: !!transactions && JSON.parse(transactions).length > 0,
      childrenCount: children ? JSON.parse(children).length : 0,
      transactionsCount: transactions ? JSON.parse(transactions).length : 0,
    };
  } catch (error) {
    return {
      hasChildren: false,
      hasTransactions: false,
      childrenCount: 0,
      transactionsCount: 0,
    };
  }
};
