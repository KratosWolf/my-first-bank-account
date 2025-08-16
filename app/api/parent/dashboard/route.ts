import { NextRequest, NextResponse } from 'next/server';
import { TempAuthService } from '@/lib/auth/temp-auth';
import { mockData } from '@/lib/db';
import { PurchaseRequestStorage } from '@/lib/storage/purchase-requests';
import { cookies } from 'next/headers';

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

    // Get parent data
    const parent = mockData.parents.find(p => p.id.toString() === user.id);
    if (!parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
    }

    // Get children data
    const children = mockData.children.filter(c => c.parentId.toString() === user.id);
    
    // Calculate family statistics
    const totalBalance = children.reduce((sum, child) => sum + parseFloat(child.balance), 0);
    const totalChildren = children.length;
    const totalPoints = children.reduce((sum, child) => sum + child.points, 0);
    
    // Mock additional stats (in real app, these would come from database)
    const totalSpent = children.reduce((sum, child) => sum + (child.level * 5), 0); // Mock spending based on level
    const totalBadges = children.reduce((sum, child) => sum + Math.floor(child.level / 2), 0); // Mock badges
    const activeGoals = children.reduce((sum, child) => sum + Math.min(child.level, 3), 0); // Mock active goals

    // Get real pending requests count
    const pendingRequests = PurchaseRequestStorage.getPendingCount(parseInt(user.id));

    // Enhanced children data with additional mock stats
    const enhancedChildren = children.map(child => ({
      id: child.id,
      name: child.name,
      balance: child.balance,
      level: child.level,
      points: child.points,
      avatar: child.avatar,
      earnedBadges: Math.floor(child.level / 2), // Mock badges based on level
      activeGoals: Math.min(child.level, 3), // Mock goals (max 3)
      pendingRequests: Math.floor(Math.random() * 3), // Mock pending requests (0-2)
      totalSpent: child.level * 5, // Mock total spent
      monthlySpent: child.level * 2, // Mock monthly spending
      lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // Mock recent activity
    }));

    // Enhanced recent activity with more variety
    const activityTypes = ['goal', 'purchase', 'badge', 'spending'];
    const recentActivity = children.flatMap((child, index) => 
      Array.from({ length: 2 }, (_, i) => ({
        id: index * 2 + i + 1,
        childName: child.name,
        action: ['criou objetivo', 'fez compra', 'ganhou medalha', 'gastou dinheiro'][i % 4],
        description: [
          `Criou objetivo "Bicicleta Nova"`,
          `Comprou doces - R$ ${(Math.random() * 10 + 5).toFixed(2)}`,
          `Conquistou medalha "Poupador Iniciante"`,
          `Gastou R$ ${(Math.random() * 15 + 5).toFixed(2)} em lanches`
        ][i % 4],
        timestamp: new Date(Date.now() - (i + 1) * 2 * 60 * 60 * 1000).toISOString(),
        type: activityTypes[i % activityTypes.length] as 'goal' | 'purchase' | 'badge' | 'spending'
      }))
    ).slice(0, 8); // Show last 8 activities

    // Family stats for the comprehensive dashboard
    const familyStats = {
      totalChildren,
      totalSavings: totalBalance,
      totalSpent,
      totalPoints,
      totalBadges,
      pendingRequests,
      activeGoals
    };

    return NextResponse.json({
      children: enhancedChildren,
      familyStats,
      recentActivity,
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}