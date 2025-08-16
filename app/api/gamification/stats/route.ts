import { NextRequest, NextResponse } from 'next/server';
import { TempAuthService } from '@/lib/auth/temp-auth';
import { GamificationStorage } from '@/lib/storage/gamification';
import { mockData } from '@/lib/db';
import { cookies } from 'next/headers';

// GET - Get child's gamification stats
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

    // Get gamification data
    const stats = GamificationStorage.getChildStats(childId);
    const earnedBadges = GamificationStorage.getEarnedBadgesByChild(childId);
    const pointTransactions = GamificationStorage.getPointTransactionsByChild(childId).slice(0, 10); // Last 10 transactions
    const allBadges = GamificationStorage.getAllBadges();

    // Calculate additional stats
    const badgesByCategory = earnedBadges.reduce((acc, earnedBadge) => {
      const category = earnedBadge.badge.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const badgesByRarity = earnedBadges.reduce((acc, earnedBadge) => {
      const rarity = earnedBadge.badge.rarity;
      acc[rarity] = (acc[rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      stats,
      earnedBadges: earnedBadges.map(eb => ({
        ...eb,
        badge: {
          ...eb.badge,
          rarityColor: getRarityColor(eb.badge.rarity)
        }
      })),
      pointTransactions,
      availableBadges: allBadges.filter(badge => 
        !earnedBadges.some(eb => eb.badgeId === badge.id)
      ).slice(0, 5), // Next 5 available badges
      summary: {
        totalBadges: allBadges.length,
        earnedBadges: earnedBadges.length,
        completionPercentage: Math.round((earnedBadges.length / allBadges.length) * 100),
        badgesByCategory,
        badgesByRarity,
        currentStreak: stats.streakDays,
        rank: calculateRank(stats.totalPoints), // Simple ranking system
      }
    });

  } catch (error) {
    console.error('Get gamification stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return '#6B7280';
    case 'rare': return '#3B82F6';
    case 'epic': return '#8B5CF6';
    case 'legendary': return '#F59E0B';
    default: return '#6B7280';
  }
}

function calculateRank(points: number): string {
  if (points >= 2000) return 'Mestre Financeiro';
  if (points >= 1500) return 'Especialista';
  if (points >= 1000) return 'Avançado';
  if (points >= 500) return 'Intermediário';
  if (points >= 200) return 'Iniciante Avançado';
  if (points >= 50) return 'Iniciante';
  return 'Novato';
}