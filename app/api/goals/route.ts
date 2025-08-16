import { NextRequest, NextResponse } from 'next/server';
import { TempAuthService } from '@/lib/auth/temp-auth';
import { GoalStorage } from '@/lib/storage/goals';
import { GamificationStorage } from '@/lib/storage/gamification';
import { mockData } from '@/lib/db';
import { cookies } from 'next/headers';

// GET - List goals for a child
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

    let goals;

    if (user.role === 'child') {
      const childId = parseInt(user.id.toString());
      goals = GoalStorage.getByChild(childId);
    } else if (user.role === 'parent') {
      // Parents can see all goals from their children
      const parentId = parseInt(user.id);
      const children = mockData.children.filter(c => c.parentId === parentId);
      goals = children.flatMap(child => GoalStorage.getByChild(child.id));
    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 403 });
    }

    return NextResponse.json({
      goals: goals.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    });

  } catch (error) {
    console.error('Get goals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new goal
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = TempAuthService.validateSession(sessionToken);
    if (!user || user.role !== 'child') {
      return NextResponse.json({ error: 'Only children can create goals' }, { status: 403 });
    }

    const { name, description, targetAmount, category, icon } = await request.json();

    // Validate input
    if (!name || !targetAmount || targetAmount <= 0) {
      return NextResponse.json({ error: 'Name and valid target amount are required' }, { status: 400 });
    }

    // Get child data
    const childId = parseInt(user.id.toString());
    const child = mockData.children.find(c => c.id === childId);
    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Create goal
    const newGoal = GoalStorage.create({
      childId: child.id,
      childName: child.name,
      name: name.trim(),
      description: description || '',
      targetAmount: parseFloat(targetAmount),
      category: category || 'Outros',
      icon: icon || '🎯',
    });

    // Award points for creating a goal
    const gamificationResult = GamificationStorage.handleGoalCreated(child.id);

    return NextResponse.json({
      success: true,
      goal: newGoal,
      pointsEarned: gamificationResult.points.points,
      newBadges: gamificationResult.badges,
    });

  } catch (error) {
    console.error('Create goal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}