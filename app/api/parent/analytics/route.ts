import { NextRequest, NextResponse } from 'next/server';
import { TempAuthService } from '@/lib/auth/temp-auth';
import { mockData } from '@/lib/db';
import { cookies } from 'next/headers';

const generateAnalyticsData = (parentId: string, period: string) => {
  const children = mockData.children.filter(c => c.parentId.toString() === parentId);
  
  // Generate time series data based on period
  const now = new Date();
  let dataPoints: number;
  
  switch (period) {
    case 'week': dataPoints = 7; break;
    case 'quarter': dataPoints = 12; break; // 12 weeks
    case 'year': dataPoints = 12; break; // 12 months
    default: dataPoints = 30; break; // 30 days
  }

  // Generate family trends
  const totalBalance = children.reduce((sum, child) => sum + parseFloat(child.balance), 0);
  const generateTrendData = (baseValue: number, variance: number = 0.1) => {
    return Array.from({ length: dataPoints }, (_, i) => {
      const date = new Date(now.getTime() - (dataPoints - i - 1) * 24 * 60 * 60 * 1000);
      const fluctuation = (Math.random() - 0.5) * variance;
      const trend = i * 0.02; // Small upward trend
      return {
        date: date.toISOString(),
        amount: Math.max(0, baseValue * (1 + trend + fluctuation))
      };
    });
  };

  const familyTrends = {
    totalBalance: generateTrendData(totalBalance, 0.15),
    spendingTrend: generateTrendData(children.length * 25, 0.2),
    savingsRate: Array.from({ length: dataPoints }, (_, i) => {
      const date = new Date(now.getTime() - (dataPoints - i - 1) * 24 * 60 * 60 * 1000);
      const baseRate = 65;
      const fluctuation = (Math.random() - 0.5) * 10;
      const trend = i * 0.5;
      return {
        date: date.toISOString(),
        percentage: Math.min(95, Math.max(30, baseRate + trend + fluctuation))
      };
    })
  };

  // Generate children comparison
  const childrenComparison = children.map((child, index) => ({
    childId: child.id,
    childName: child.name,
    metrics: {
      totalBalance: parseFloat(child.balance),
      spendingThisMonth: 20 + (child.level * 5) + (Math.random() * 15),
      savingsRate: Math.min(95, 50 + (child.level * 4) + (Math.random() * 10)),
      goalCompletion: Math.min(100, 40 + (child.level * 6) + (Math.random() * 20)),
      behaviorScore: Math.min(95, 60 + (child.level * 3) + (Math.random() * 15))
    }
  }));

  // Generate category analysis
  const categories = [
    { name: 'Lanches e Comida', icon: '🍕', baseSpending: 120 },
    { name: 'Brinquedos e Jogos', icon: '🎮', baseSpending: 80 },
    { name: 'Livros e Educação', icon: '📚', baseSpending: 60 },
    { name: 'Roupas', icon: '👕', baseSpending: 40 },
    { name: 'Entretenimento', icon: '🎬', baseSpending: 50 },
    { name: 'Outros', icon: '🎯', baseSpending: 30 }
  ];

  const totalSpending = categories.reduce((sum, cat) => sum + cat.baseSpending, 0);
  
  const categoryAnalysis = categories.map((cat, index) => {
    const spentAmount = cat.baseSpending + (Math.random() * 20 - 10);
    const trends = ['up', 'down', 'stable'] as const;
    return {
      category: cat.name,
      totalSpent: spentAmount,
      percentage: Math.round((spentAmount / totalSpending) * 100),
      trend: trends[index % 3],
      icon: cat.icon
    };
  });

  // Generate insights
  const insights = [
    {
      type: 'achievement' as const,
      title: 'Meta de Poupança Alcançada!',
      description: 'A família superou a meta de poupança mensal em 15%. Parabéns!',
      priority: 'high' as const,
      actionable: true
    },
    {
      type: 'opportunity' as const,
      title: 'Oportunidade de Educação',
      description: 'Gastos com educação representam apenas 12% do total. Considere incentivar mais compras educativas.',
      priority: 'medium' as const,
      actionable: true
    },
    {
      type: 'warning' as const,
      title: 'Atenção aos Gastos com Entretenimento',
      description: 'Houve um aumento de 25% nos gastos com jogos e entretenimento nas últimas 2 semanas.',
      priority: 'medium' as const,
      actionable: true
    },
    {
      type: 'achievement' as const,
      title: 'Consistência Excelente',
      description: 'Todas as crianças mantiveram seus gastos dentro dos limites estabelecidos.',
      priority: 'low' as const,
      actionable: false
    },
    {
      type: 'opportunity' as const,
      title: 'Potencial para Novas Metas',
      description: 'Com base no progresso atual, a família pode estabelecer metas mais ambiciosas.',
      priority: 'low' as const,
      actionable: true
    }
  ];

  return {
    period,
    familyTrends,
    childrenComparison,
    categoryAnalysis,
    insights
  };
};

export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = TempAuthService.validateSession(sessionToken);
    if (!user || user.role !== 'parent') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    // Generate analytics data
    const analyticsData = generateAnalyticsData(user.id, period);

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Endpoint for generating custom analytics
export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = TempAuthService.validateSession(sessionToken);
    if (!user || user.role !== 'parent') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      metrics, 
      dateRange, 
      children: selectedChildren,
      compareWith 
    } = body;

    // Generate custom analytics based on requested metrics
    const baseData = generateAnalyticsData(user.id, 'month');
    
    // Filter and customize data based on request
    const customAnalytics = {
      requestedMetrics: metrics,
      dateRange,
      data: baseData,
      customInsights: [
        {
          type: 'custom',
          title: 'Análise Personalizada',
          description: 'Dados gerados com base nos parâmetros solicitados',
          priority: 'high',
          actionable: true
        }
      ]
    };

    return NextResponse.json({
      success: true,
      analytics: customAnalytics,
      message: 'Analytics personalizado gerado com sucesso'
    });

  } catch (error) {
    console.error('Custom analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}