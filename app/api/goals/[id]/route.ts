import { NextRequest, NextResponse } from 'next/server';
import { TempAuthService } from '@/lib/auth/temp-auth';
import { GoalStorage } from '@/lib/storage/goals';
import { cookies } from 'next/headers';

// GET - Get specific goal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const goalId = parseInt(resolvedParams.id);
    const goal = GoalStorage.getById(goalId);

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Check permissions
    if (user.role === 'child' && goal.childId !== parseInt(user.id.toString())) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      goal: {
        ...goal,
        progressPercent: GoalStorage.getProgress(goalId)
      }
    });

  } catch (error) {
    console.error('Get goal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update goal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = TempAuthService.validateSession(sessionToken);
    if (!user || user.role !== 'child') {
      return NextResponse.json({ error: 'Only children can update their goals' }, { status: 403 });
    }

    const resolvedParams = await params;
    const goalId = parseInt(resolvedParams.id);
    const goal = GoalStorage.getById(goalId);

    if (!goal || goal.childId !== parseInt(user.id.toString())) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const { name, description, targetAmount, category, icon } = await request.json();

    // Validate input
    if (name && name.trim().length === 0) {
      return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
    }

    if (targetAmount && (targetAmount <= 0 || targetAmount < goal.currentAmount)) {
      return NextResponse.json({ error: 'Target amount must be greater than current amount' }, { status: 400 });
    }

    // Update goal
    const updates: any = {};
    if (name) updates.name = name.trim();
    if (description !== undefined) updates.description = description;
    if (targetAmount) updates.targetAmount = parseFloat(targetAmount);
    if (category) updates.category = category;
    if (icon) updates.icon = icon;

    const updatedGoal = GoalStorage.update(goalId, updates);

    return NextResponse.json({
      success: true,
      goal: {
        ...updatedGoal,
        progressPercent: GoalStorage.getProgress(goalId)
      }
    });

  } catch (error) {
    console.error('Update goal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete goal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = TempAuthService.validateSession(sessionToken);
    if (!user || user.role !== 'child') {
      return NextResponse.json({ error: 'Only children can delete their goals' }, { status: 403 });
    }

    const resolvedParams = await params;
    const goalId = parseInt(resolvedParams.id);
    const goal = GoalStorage.getById(goalId);

    if (!goal || goal.childId !== parseInt(user.id.toString())) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const deleted = GoalStorage.delete(goalId);

    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Goal deleted successfully'
    });

  } catch (error) {
    console.error('Delete goal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}