import { NextRequest, NextResponse } from 'next/server';
import { TempAuthService } from '@/lib/auth/temp-auth';
import { GamificationStorage } from '@/lib/storage/gamification';
import { mockData } from '@/lib/db';
import { cookies } from 'next/headers';

// GET - Get point transactions for a child
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = TempAuthService.validateSession(sessionToken);
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let childId: number;

    if (user.role === 'parent') {
      const requestedChildId = searchParams.get('childId');
      if (!requestedChildId) {
        return NextResponse.json({ error: 'Child ID is required for parents' }, { status: 400 });
      }
      childId = parseInt(requestedChildId);
      
      // Verify child belongs to parent
      const child = mockData.children.find(c => c.id === childId && c.parentId === parseInt(user.id));
      if (!child) {
        return NextResponse.json({ error: 'Child not found or access denied' }, { status: 404 });
      }
    } else if (user.role === 'child') {
      childId = parseInt(user.id.toString());
    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 403 });
    }

    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const allTransactions = GamificationStorage.getPointTransactionsByChild(childId);
    const transactions = allTransactions.slice(offset, offset + limit);
    const totalPoints = GamificationStorage.getTotalPointsByChild(childId);

    // Group transactions by action type for analytics
    const pointsByAction = allTransactions.reduce((acc, transaction) => {
      acc[transaction.actionType] = (acc[transaction.actionType] || 0) + transaction.points;
      return acc;
    }, {} as Record<string, number>);

    // Get transactions from last 7 days for trend
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recentTransactions = allTransactions.filter(t => 
      new Date(t.createdAt) >= last7Days
    );
    const recentPoints = recentTransactions.reduce((sum, t) => sum + t.points, 0);

    return NextResponse.json({
      transactions: transactions.map(transaction => ({
        ...transaction,
        actionTypeLabel: getActionTypeLabel(transaction.actionType),
        actionTypeIcon: getActionTypeIcon(transaction.actionType),
        actionTypeColor: getActionTypeColor(transaction.actionType),
      })),
      pagination: {
        total: allTransactions.length,
        limit,
        offset,
        hasMore: offset + limit < allTransactions.length,
      },
      summary: {
        totalPoints,
        totalTransactions: allTransactions.length,
        averagePerTransaction: allTransactions.length > 0 ? Math.round(totalPoints / allTransactions.length) : 0,
        last7DaysPoints: recentPoints,
        pointsByAction,
      }
    });

  } catch (error) {
    console.error('Get point transactions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Award points manually (parents only)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = TempAuthService.validateSession(sessionToken);
    if (!user || user.role !== 'parent') {
      return NextResponse.json({ error: 'Only parents can award points manually' }, { status: 403 });
    }

    const { childId, points, reason } = await request.json();

    if (!childId || !points || !reason) {
      return NextResponse.json({ error: 'Child ID, points, and reason are required' }, { status: 400 });
    }

    if (points <= 0 || points > 100) {
      return NextResponse.json({ error: 'Points must be between 1 and 100' }, { status: 400 });
    }

    // Verify child belongs to parent
    const child = mockData.children.find(c => c.id === parseInt(childId) && c.parentId === parseInt(user.id));
    if (!child) {
      return NextResponse.json({ error: 'Child not found or access denied' }, { status: 404 });
    }

    const transaction = GamificationStorage.addPoints(
      parseInt(childId),
      parseInt(points),
      reason,
      'badge_earned' // Using badge_earned as a generic manual award type
    );

    // Check for any new badges
    const newBadges = GamificationStorage.checkAndAwardBadges(parseInt(childId), 'manual_award');

    return NextResponse.json({
      success: true,
      transaction,
      newBadges,
      message: `${points} pontos adicionados para ${child.name}`
    });

  } catch (error) {
    console.error('Award points error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getActionTypeLabel(actionType: string): string {
  switch (actionType) {
    case 'goal_created': return 'Objetivo Criado';
    case 'goal_completed': return 'Objetivo Concluído';
    case 'purchase_approved': return 'Compra Aprovada';
    case 'daily_login': return 'Login Diário';
    case 'spending_tracked': return 'Gasto Registrado';
    case 'badge_earned': return 'Medalha Conquistada';
    case 'level_up': return 'Subiu de Nível';
    default: return 'Pontos Ganhos';
  }
}

function getActionTypeIcon(actionType: string): string {
  switch (actionType) {
    case 'goal_created': return '🎯';
    case 'goal_completed': return '🏆';
    case 'purchase_approved': return '💳';
    case 'daily_login': return '📅';
    case 'spending_tracked': return '📊';
    case 'badge_earned': return '🏅';
    case 'level_up': return '⬆️';
    default: return '⭐';
  }
}

function getActionTypeColor(actionType: string): string {
  switch (actionType) {
    case 'goal_created': return '#8B5CF6';
    case 'goal_completed': return '#10B981';
    case 'purchase_approved': return '#3B82F6';
    case 'daily_login': return '#F59E0B';
    case 'spending_tracked': return '#6B7280';
    case 'badge_earned': return '#EF4444';
    case 'level_up': return '#10B981';
    default: return '#6B7280';
  }
}