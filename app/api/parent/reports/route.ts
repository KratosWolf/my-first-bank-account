import { NextRequest, NextResponse } from 'next/server';
import { TempAuthService } from '@/lib/auth/temp-auth';
import { mockData } from '@/lib/db';
import { cookies } from 'next/headers';

// Mock reports data - in real app would be generated from database analytics
const generateReportData = (parentId: string, period: string) => {
  const children = mockData.children.filter(c => c.parentId.toString() === parentId);
  
  // Calculate date range based on period
  const now = new Date();
  let startDate: Date;
  let description: string;
  
  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      description = 'Relatório Semanal';
      break;
    case 'quarter':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      description = 'Relatório Trimestral';
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      description = 'Relatório Anual';
      break;
    default: // month
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      description = 'Relatório Mensal';
  }

  // Generate family overview
  const totalFamilyBalance = children.reduce((sum, child) => sum + parseFloat(child.balance), 0);
  const totalFamilySpent = children.reduce((sum, child) => sum + (child.level * 25), 0); // Mock spending
  const totalFamilySaved = children.reduce((sum, child) => sum + (child.level * 15), 0); // Mock savings
  
  // Generate insights
  const insights = [
    {
      type: 'positive' as const,
      title: 'Excelente Progresso na Poupança!',
      description: 'A família aumentou sua taxa de poupança em 23% este mês.',
      recommendation: 'Continue incentivando as crianças com metas de poupança desafiadoras.',
      icon: '🎉'
    },
    {
      type: 'improvement' as const,
      title: 'Atenção aos Gastos com Entretenimento',
      description: 'Os gastos com jogos e brinquedos aumentaram 15% no período.',
      recommendation: 'Considere estabelecer limites específicos para esta categoria.',
      icon: '🎮'
    },
    {
      type: 'neutral' as const,
      title: 'Comportamento de Gastos Estável',
      description: 'As crianças mantiveram padrões consistentes de gastos.',
      recommendation: 'Ótimo controle! Continue monitorando as tendências.',
      icon: '📊'
    }
  ];

  // Generate children reports
  const childrenReports = children.map((child, index) => {
    const baseAmount = parseFloat(child.balance);
    const spentAmount = child.level * 20 + Math.random() * 30;
    const incomeAmount = child.level * 35;
    
    return {
      id: child.id,
      name: child.name,
      avatar: child.avatar,
      period: {
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
        totalDays: Math.floor((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
      },
      financialSummary: {
        startingBalance: baseAmount - incomeAmount + spentAmount,
        endingBalance: baseAmount,
        totalIncome: incomeAmount,
        totalSpent: spentAmount,
        totalSaved: incomeAmount - spentAmount,
        netChange: incomeAmount - spentAmount
      },
      spendingBreakdown: [
        {
          category: 'Lanches',
          amount: spentAmount * 0.4,
          percentage: 40,
          transactions: 8 + index,
          icon: '🍕'
        },
        {
          category: 'Brinquedos',
          amount: spentAmount * 0.3,
          percentage: 30,
          transactions: 3 + index,
          icon: '🧸'
        },
        {
          category: 'Livros',
          amount: spentAmount * 0.2,
          percentage: 20,
          transactions: 2,
          icon: '📚'
        },
        {
          category: 'Outros',
          amount: spentAmount * 0.1,
          percentage: 10,
          transactions: 1,
          icon: '🎯'
        }
      ],
      goalProgress: {
        activeGoals: Math.min(child.level, 3),
        completedGoals: Math.floor(child.level / 3),
        totalTargetAmount: child.level * 100,
        totalSavedAmount: child.level * 60,
        averageProgress: 60 + (child.level * 5)
      },
      achievements: {
        pointsEarned: child.points,
        badgesEarned: Math.floor(child.level / 2),
        levelProgress: child.level,
        streakDays: 5 + child.level
      },
      behaviors: {
        savingsRate: Math.min(95, 65 + child.level * 3),
        spendingConsistency: Math.min(90, 70 + child.level * 2),
        goalCommitment: Math.min(100, 60 + child.level * 4),
        overallScore: Math.min(95, 65 + child.level * 3)
      }
    };
  });

  // Find top performers
  const bestSaver = childrenReports.reduce((best, current) => 
    current.financialSummary.totalSaved > best.financialSummary.totalSaved ? current : best
  );
  
  const mostImproved = childrenReports.reduce((best, current) => 
    current.behaviors.overallScore > best.behaviors.overallScore ? current : best
  );

  const goalAchiever = childrenReports.reduce((best, current) => 
    current.goalProgress.completedGoals > best.goalProgress.completedGoals ? current : best
  );

  return {
    period: {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      description
    },
    familyOverview: {
      totalChildren: children.length,
      totalFamilyBalance,
      totalFamilySpent,
      totalFamilySaved,
      averageChildBalance: totalFamilyBalance / children.length
    },
    topPerformers: {
      bestSaver: {
        childId: bestSaver.id,
        childName: bestSaver.name,
        amount: bestSaver.financialSummary.totalSaved
      },
      mostImproved: {
        childId: mostImproved.id,
        childName: mostImproved.name,
        improvement: mostImproved.behaviors.overallScore
      },
      goalAchiever: {
        childId: goalAchiever.id,
        childName: goalAchiever.name,
        goalsCompleted: goalAchiever.goalProgress.completedGoals
      }
    },
    insights,
    childrenReports
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
    const childFilter = searchParams.get('child') || 'all';

    // Generate report data
    const reportData = generateReportData(user.id, period);

    // Filter by child if specified
    if (childFilter !== 'all') {
      const childId = parseInt(childFilter);
      reportData.childrenReports = reportData.childrenReports.filter(child => child.id === childId);
    }

    return NextResponse.json(reportData);

  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Additional endpoint for exporting reports
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
    const { format, period, children } = body;

    // Generate export data
    const reportData = generateReportData(user.id, period);
    
    // Filter children if specified
    if (children && children.length > 0) {
      reportData.childrenReports = reportData.childrenReports.filter(child => 
        children.includes(child.id)
      );
    }

    // In a real implementation, you would generate PDF/CSV/Excel files here
    // For now, return the structured data
    return NextResponse.json({
      success: true,
      format,
      data: reportData,
      message: `Relatório ${format.toUpperCase()} gerado com sucesso`,
      downloadUrl: `/exports/family-report-${Date.now()}.${format}` // Mock URL
    });

  } catch (error) {
    console.error('Export reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}