import { NextRequest, NextResponse } from 'next/server';
import { TempAuthService } from '@/lib/auth/temp-auth';
import { GamificationStorage } from '@/lib/storage/gamification';
import { mockData } from '@/lib/db';
import { cookies } from 'next/headers';

// GET - Get badges (all available and earned by child)
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
    let childId: number | null = null;

    if (user.role === 'parent') {
      const requestedChildId = searchParams.get('childId');
      if (requestedChildId) {
        childId = parseInt(requestedChildId);
        // Verify child belongs to parent
        const child = mockData.children.find(c => c.id === childId && c.parentId === parseInt(user.id));
        if (!child) {
          return NextResponse.json({ error: 'Child not found or access denied' }, { status: 404 });
        }
      }
    } else if (user.role === 'child') {
      childId = parseInt(user.id.toString());
    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 403 });
    }

    const allBadges = GamificationStorage.getAllBadges();
    
    if (childId) {
      const earnedBadges = GamificationStorage.getEarnedBadgesByChild(childId);
      const earnedBadgeIds = earnedBadges.map(eb => eb.badgeId);

      const badgesWithStatus = allBadges.map(badge => ({
        ...badge,
        isEarned: earnedBadgeIds.includes(badge.id),
        earnedAt: earnedBadges.find(eb => eb.badgeId === badge.id)?.earnedAt || null,
        rarityColor: getRarityColor(badge.rarity),
        categoryColor: getCategoryColor(badge.category),
      }));

      // Group by category
      const badgesByCategory = badgesWithStatus.reduce((acc, badge) => {
        const category = badge.category;
        if (!acc[category]) {
          acc[category] = {
            name: getCategoryName(category),
            icon: getCategoryIcon(category),
            badges: [],
            earned: 0,
            total: 0,
          };
        }
        acc[category].badges.push(badge);
        acc[category].total++;
        if (badge.isEarned) acc[category].earned++;
        return acc;
      }, {} as Record<string, any>);

      return NextResponse.json({
        badges: badgesWithStatus,
        badgesByCategory,
        summary: {
          total: allBadges.length,
          earned: earnedBadges.length,
          percentage: Math.round((earnedBadges.length / allBadges.length) * 100),
          byRarity: {
            common: badgesWithStatus.filter(b => b.rarity === 'common' && b.isEarned).length,
            rare: badgesWithStatus.filter(b => b.rarity === 'rare' && b.isEarned).length,
            epic: badgesWithStatus.filter(b => b.rarity === 'epic' && b.isEarned).length,
            legendary: badgesWithStatus.filter(b => b.rarity === 'legendary' && b.isEarned).length,
          }
        }
      });
    } else {
      // Parent view without specific child - return all badges
      return NextResponse.json({
        badges: allBadges.map(badge => ({
          ...badge,
          rarityColor: getRarityColor(badge.rarity),
          categoryColor: getCategoryColor(badge.category),
        }))
      });
    }

  } catch (error) {
    console.error('Get badges error:', error);
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

function getCategoryColor(category: string): string {
  switch (category) {
    case 'saving': return '#10B981';
    case 'spending': return '#F59E0B';
    case 'goals': return '#8B5CF6';
    case 'consistency': return '#3B82F6';
    case 'milestone': return '#EF4444';
    default: return '#6B7280';
  }
}

function getCategoryName(category: string): string {
  switch (category) {
    case 'saving': return 'Poupança';
    case 'spending': return 'Gastos';
    case 'goals': return 'Objetivos';
    case 'consistency': return 'Consistência';
    case 'milestone': return 'Marcos';
    default: return 'Outros';
  }
}

function getCategoryIcon(category: string): string {
  switch (category) {
    case 'saving': return '💰';
    case 'spending': return '💸';
    case 'goals': return '🎯';
    case 'consistency': return '📅';
    case 'milestone': return '🏆';
    default: return '🏅';
  }
}