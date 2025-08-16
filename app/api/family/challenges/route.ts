import { NextRequest, NextResponse } from 'next/server';
import { TempAuthService } from '@/lib/auth/temp-auth';
import { mockData } from '@/lib/db';
import { cookies } from 'next/headers';

// Mock challenges storage - in real app would be database
const familyChallenges = new Map();

const initializeChallenges = (parentId: string) => {
  if (!familyChallenges.has(parentId)) {
    const children = mockData.children.filter(c => c.parentId.toString() === parentId);
    
    const currentWeekChallenges = [
      {
        id: 1,
        title: 'Meta de Poupança Familiar',
        description: 'Toda a família deve economizar R$ 50 esta semana',
        type: 'saving',
        difficulty: 'medium',
        icon: '💰',
        points: 100,
        familyPoints: 250,
        duration: 7,
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        isCompleted: false,
        progress: {
          current: 32,
          target: 50,
          percentage: 64
        },
        participants: children.map((child, index) => ({
          childId: child.id,
          childName: child.name,
          contribution: 40 + (index * 20),
          isCompleted: index < children.length - 1
        })),
        rewards: {
          individual: '+50 pontos extras',
          family: 'Pizza em família',
          bonus: 'Escolha o próximo filme'
        }
      },
      {
        id: 2,
        title: 'Desafio dos Gastos Inteligentes',
        description: 'Cada criança deve fazer uma compra pensada e justificar o motivo',
        type: 'spending',
        difficulty: 'easy',
        icon: '🛒',
        points: 75,
        familyPoints: 150,
        duration: 7,
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        isCompleted: false,
        progress: {
          current: 1,
          target: children.length,
          percentage: Math.round((1 / children.length) * 100)
        },
        participants: children.map((child, index) => ({
          childId: child.id,
          childName: child.name,
          contribution: index === 0 ? 100 : 25,
          isCompleted: index === 0
        })),
        rewards: {
          individual: 'Badge "Comprador Esperto"',
          family: 'R$ 20 extras para a próxima meta'
        }
      },
      {
        id: 3,
        title: 'Academia de Educação Financeira',
        description: 'Assistir a 3 vídeos educativos sobre dinheiro em família',
        type: 'learning',
        difficulty: 'easy',
        icon: '📚',
        points: 50,
        familyPoints: 200,
        duration: 7,
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        isCompleted: false,
        progress: {
          current: 2,
          target: 3,
          percentage: 67
        },
        participants: children.map((child) => ({
          childId: child.id,
          childName: child.name,
          contribution: 67,
          isCompleted: false
        })),
        rewards: {
          individual: 'Certificado de "Expert Mirim"',
          family: 'Sessão pipoca educativa'
        }
      }
    ];

    const completedChallenges = [
      {
        id: 4,
        title: 'Semana Sem Compras Desnecessárias',
        description: 'Ninguém da família pode fazer compras por impulso',
        type: 'spending',
        difficulty: 'hard',
        icon: '🚫',
        points: 150,
        familyPoints: 400,
        duration: 7,
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: false,
        isCompleted: true,
        progress: {
          current: 7,
          target: 7,
          percentage: 100
        },
        participants: children.map((child) => ({
          childId: child.id,
          childName: child.name,
          contribution: 100,
          isCompleted: true
        })),
        rewards: {
          individual: 'Badge "Resistência Suprema"',
          family: 'Saída especial da família',
          bonus: 'R$ 30 extras na mesada'
        }
      },
      {
        id: 5,
        title: 'Construir Cofrinho Digital',
        description: 'Cada criança deve criar e personalizar seu cofrinho virtual',
        type: 'teamwork',
        difficulty: 'medium',
        icon: '🏦',
        points: 80,
        familyPoints: 180,
        duration: 3,
        startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: false,
        isCompleted: true,
        progress: {
          current: children.length,
          target: children.length,
          percentage: 100
        },
        participants: children.map((child) => ({
          childId: child.id,
          childName: child.name,
          contribution: 100,
          isCompleted: true
        })),
        rewards: {
          individual: 'Cofrinho personalizado',
          family: 'Tema visual escolhido pelas crianças'
        }
      }
    ];

    const upcomingChallenges = [
      {
        id: 6,
        title: 'Planejamento Financeiro Mensal',
        description: 'Família se reúne para planejar gastos do próximo mês',
        type: 'teamwork',
        difficulty: 'medium',
        icon: '📊',
        points: 120,
        familyPoints: 300,
        duration: 7,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: false,
        isCompleted: false,
        progress: {
          current: 0,
          target: 1,
          percentage: 0
        },
        participants: children.map((child) => ({
          childId: child.id,
          childName: child.name,
          contribution: 0,
          isCompleted: false
        })),
        rewards: {
          individual: 'Badge "Planejador Familiar"',
          family: 'R$ 50 extras para metas',
          bonus: 'Responsabilidade de uma decisão familiar'
        }
      }
    ];

    const data = {
      currentWeek: {
        weekNumber: Math.ceil((Date.now() - new Date(2024, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
        theme: 'Semana da Poupança Inteligente',
        challenges: currentWeekChallenges
      },
      familyStats: {
        totalChallenges: currentWeekChallenges.length + completedChallenges.length,
        completedChallenges: completedChallenges.length,
        weeklyStreak: 3,
        familyRank: 'Poupadores Expert',
        totalPoints: completedChallenges.reduce((sum, c) => sum + c.familyPoints, 0) + 
                     currentWeekChallenges.reduce((sum, c) => sum + Math.floor(c.familyPoints * (c.progress.percentage / 100)), 0)
      },
      upcomingChallenges,
      completedChallenges
    };

    familyChallenges.set(parentId, data);
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

    // Initialize challenges if needed
    initializeChallenges(user.id);

    // Get family challenges
    const challenges = familyChallenges.get(user.id);

    return NextResponse.json(challenges);

  } catch (error) {
    console.error('Family challenges API error:', error);
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

    // Parse request body for challenge updates
    const body = await request.json();
    const { challengeId, action, childId } = body;

    if (!challengeId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Initialize if needed
    initializeChallenges(user.id);
    const challengesData = familyChallenges.get(user.id);

    // Find the challenge
    const challenge = challengesData.currentWeek.challenges.find((c: any) => c.id === challengeId);
    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Handle different actions
    switch (action) {
      case 'complete_child':
        if (childId) {
          const participant = challenge.participants.find((p: any) => p.childId === childId);
          if (participant) {
            participant.isCompleted = true;
            participant.contribution = 100;
            
            // Update challenge progress
            const completedCount = challenge.participants.filter((p: any) => p.isCompleted).length;
            challenge.progress.current = completedCount;
            challenge.progress.percentage = Math.round((completedCount / challenge.participants.length) * 100);
            
            // Check if challenge is fully completed
            if (completedCount === challenge.participants.length) {
              challenge.isCompleted = true;
              challengesData.familyStats.completedChallenges += 1;
              challengesData.familyStats.totalPoints += challenge.familyPoints;
            }
          }
        }
        break;
        
      case 'update_progress':
        // Mock progress update
        challenge.progress.current = Math.min(challenge.progress.current + 1, challenge.progress.target);
        challenge.progress.percentage = Math.round((challenge.progress.current / challenge.progress.target) * 100);
        break;
    }

    // Save updated data
    familyChallenges.set(user.id, challengesData);

    return NextResponse.json({
      success: true,
      message: 'Challenge updated successfully',
      challenge
    });

  } catch (error) {
    console.error('Family challenges POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Export function to get family challenges
export function getFamilyChallenges(parentId: string) {
  initializeChallenges(parentId);
  return familyChallenges.get(parentId);
}