import { NextRequest, NextResponse } from 'next/server';
import { TempAuthService } from '@/lib/auth/temp-auth';
import { mockData } from '@/lib/db';
import { cookies } from 'next/headers';

// Mock family goals storage - in real app would be database
const familyGoals = new Map();

// Initialize with some sample family goals
const initializeSampleGoals = (parentId: string) => {
  if (!familyGoals.has(parentId)) {
    const children = mockData.children.filter(c => c.parentId.toString() === parentId);
    
    const sampleGoals = [
      {
        id: 1,
        title: 'Viagem para Disney',
        description: 'Toda a família economizando para uma viagem inesquecível à Disney!',
        targetAmount: 8000.00,
        currentAmount: 2450.00,
        progressPercent: 30.6,
        category: 'Viagem',
        icon: '🏰',
        isCompleted: false,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        targetDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        participants: children.map((child, index) => ({
          childId: child.id,
          childName: child.name,
          contribution: 300 + (index * 150),
          contributionPercent: Math.round(((300 + (index * 150)) / 2450) * 100)
        })),
        rewards: {
          familyBonus: 500.00,
          individualBonus: 100.00,
          specialReward: 'Dia extra no parque'
        }
      },
      {
        id: 2,
        title: 'Fundo de Emergência da Família',
        description: 'Construindo nossa reserva de segurança familiar juntos',
        targetAmount: 5000.00,
        currentAmount: 1200.00,
        progressPercent: 24.0,
        category: 'Emergência',
        icon: '🛡️',
        isCompleted: false,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        participants: children.map((child, index) => ({
          childId: child.id,
          childName: child.name,
          contribution: 200 + (index * 100),
          contributionPercent: Math.round(((200 + (index * 100)) / 1200) * 100)
        })),
        rewards: {
          familyBonus: 300.00,
          individualBonus: 50.00
        }
      }
    ];

    const completedGoals = [
      {
        id: 3,
        title: 'Computador Familiar',
        description: 'Novo computador para estudos e diversão da família',
        targetAmount: 3000.00,
        currentAmount: 3000.00,
        progressPercent: 100,
        category: 'Educação',
        icon: '💻',
        isCompleted: true,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        participants: children.map((child, index) => ({
          childId: child.id,
          childName: child.name,
          contribution: 400 + (index * 200),
          contributionPercent: Math.round(((400 + (index * 200)) / 3000) * 100)
        })),
        rewards: {
          familyBonus: 200.00,
          individualBonus: 75.00,
          specialReward: 'Primeiro jogo escolhido por cada criança'
        }
      }
    ];

    familyGoals.set(parentId, {
      activeGoals: sampleGoals,
      completedGoals: completedGoals,
      familyStats: {
        totalGoals: sampleGoals.length + completedGoals.length,
        totalSaved: [...sampleGoals, ...completedGoals].reduce((sum, goal) => sum + goal.currentAmount, 0),
        completionRate: Math.round((completedGoals.length / (sampleGoals.length + completedGoals.length)) * 100),
        averageContribution: children.length > 0 ? 
          [...sampleGoals, ...completedGoals]
            .reduce((sum, goal) => sum + goal.participants.reduce((pSum, p) => pSum + p.contribution, 0), 0) 
            / children.length / (sampleGoals.length + completedGoals.length) : 0
      }
    });
  }
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

    // Initialize sample goals if needed
    initializeSampleGoals(user.id);

    // Get family goals
    const goals = familyGoals.get(user.id);

    return NextResponse.json(goals);

  } catch (error) {
    console.error('Family goals API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    // Parse request body
    const body = await request.json();
    const { goal } = body;

    // Validate goal data
    if (!goal || !goal.title || !goal.targetAmount) {
      return NextResponse.json({ error: 'Invalid goal data' }, { status: 400 });
    }

    // Initialize if needed
    initializeSampleGoals(user.id);
    const currentGoals = familyGoals.get(user.id);

    // Create new goal
    const newGoal = {
      id: Date.now(), // Simple ID generation
      title: goal.title,
      description: goal.description || '',
      targetAmount: parseFloat(goal.targetAmount),
      currentAmount: 0,
      progressPercent: 0,
      category: goal.category || 'Geral',
      icon: goal.icon || '🎯',
      isCompleted: false,
      createdAt: new Date().toISOString(),
      targetDate: goal.targetDate || null,
      participants: goal.participants || [],
      rewards: {
        familyBonus: parseFloat(goal.rewards?.familyBonus || 0),
        individualBonus: parseFloat(goal.rewards?.individualBonus || 0),
        specialReward: goal.rewards?.specialReward || null
      }
    };

    // Add to active goals
    currentGoals.activeGoals.push(newGoal);

    // Update stats
    currentGoals.familyStats.totalGoals += 1;

    // Save updated goals
    familyGoals.set(user.id, currentGoals);

    return NextResponse.json({
      success: true,
      goal: newGoal,
      message: 'Meta familiar criada com sucesso'
    });

  } catch (error) {
    console.error('Family goals POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Export family goals getter for use by other parts of the app
export function getFamilyGoals(parentId: string) {
  initializeSampleGoals(parentId);
  return familyGoals.get(parentId);
}