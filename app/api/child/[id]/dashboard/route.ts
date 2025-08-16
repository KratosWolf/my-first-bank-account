import { NextRequest, NextResponse } from 'next/server';
import { TempAuthService } from '@/lib/auth/temp-auth';
import { mockData } from '@/lib/db';
import { GoalStorage } from '@/lib/storage/goals';
import { GamificationStorage } from '@/lib/storage/gamification';
import { SpendingStorage } from '@/lib/storage/spending';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user from session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = TempAuthService.validateSession(sessionToken);
    if (!user || user.role !== 'child') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const resolvedParams = await params;
    const childId = parseInt(resolvedParams.id);
    
    // Verify the child belongs to the authenticated user
    if (user.id !== childId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get child data
    const child = mockData.children.find(c => c.id === childId);
    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Get real goals data
    const goals = GoalStorage.getActiveByChild(childId).map(goal => ({
      ...goal,
      progressPercent: GoalStorage.getProgress(goal.id)
    }));

    // Get real gamification data
    const childStats = GamificationStorage.getChildStats(childId);
    const earnedBadges = GamificationStorage.getEarnedBadgesByChild(childId).slice(0, 3); // Show last 3 badges
    const recentPointTransactions = GamificationStorage.getPointTransactionsByChild(childId).slice(0, 5); // Last 5 point transactions

    // Get recent spending transactions
    const recentTransactions = SpendingStorage.getTransactionsByChild(childId)
      .slice(0, 5)
      .map(transaction => ({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        timestamp: transaction.createdAt,
        status: 'completed',
      }));

    // Award daily login points
    GamificationStorage.handleDailyLogin(childId);

    function calculateRank(points: number): string {
      if (points >= 2000) return 'Mestre Financeiro';
      if (points >= 1500) return 'Especialista';
      if (points >= 1000) return 'Avançado';
      if (points >= 500) return 'Intermediário';
      if (points >= 200) return 'Iniciante Avançado';
      if (points >= 50) return 'Iniciante';
      return 'Novato';
    }

    return NextResponse.json({
      child: {
        id: child.id,
        name: child.name,
        balance: child.balance,
        level: childStats.currentLevel,
        points: childStats.totalPoints,
        avatar: child.avatar,
      },
      levelProgress: {
        currentLevel: childStats.currentLevel,
        currentPoints: childStats.totalPoints,
        pointsForNext: childStats.pointsToNextLevel,
        progressPercent: childStats.levelProgress,
      },
      goals,
      recentTransactions,
      earnedBadges: earnedBadges.map(badge => ({
        id: badge.id,
        name: badge.badge.name,
        description: badge.badge.description,
        icon: badge.badge.icon,
        rarity: badge.badge.rarity,
        earnedAt: badge.earnedAt,
      })),
      recentPointTransactions,
      gamificationStats: {
        totalBadges: childStats.earnedBadges,
        currentRank: calculateRank(childStats.totalPoints),
        streakDays: childStats.streakDays,
      },
      availableCategories: mockData.categories,
    });

  } catch (error) {
    console.error('Child dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}