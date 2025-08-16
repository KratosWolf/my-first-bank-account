import { NextRequest, NextResponse } from 'next/server';
import { TempAuthService } from '@/lib/auth/temp-auth';
import { cookies } from 'next/headers';

// Mock settings storage - in real app would be database
const familySettings = new Map();

// Default settings
const defaultSettings = {
  familyName: 'Minha Família',
  currency: 'BRL',
  language: 'pt-BR',
  weeklyAllowanceDay: 'saturday',
  allowanceAmount: 10.00,
  maxSpendingPerDay: 5.00,
  requireApprovalOver: 20.00,
  enableGoalRewards: true,
  enableBadgeSystem: true,
  enableSpendingLimits: true,
  familyMission: 'Ensinar nossos filhos sobre o valor do dinheiro e a importância de poupar para seus sonhos.',
  savingsTips: true,
  parentNotifications: {
    newGoals: true,
    purchaseRequests: true,
    achievements: true,
    spendingAlerts: true
  },
  childRewards: {
    levelUpBonus: 5.00,
    goalCompletionBonus: 2.00,
    streakRewards: true
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

    // Get settings for this family or return defaults
    const settings = familySettings.get(user.id) || defaultSettings;

    return NextResponse.json({ settings });

  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
    const { settings } = body;

    // Validate required fields
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 });
    }

    // Validate numeric values
    if (settings.allowanceAmount && (isNaN(settings.allowanceAmount) || settings.allowanceAmount < 0)) {
      return NextResponse.json({ error: 'Invalid allowance amount' }, { status: 400 });
    }

    if (settings.maxSpendingPerDay && (isNaN(settings.maxSpendingPerDay) || settings.maxSpendingPerDay < 0)) {
      return NextResponse.json({ error: 'Invalid daily spending limit' }, { status: 400 });
    }

    if (settings.requireApprovalOver && (isNaN(settings.requireApprovalOver) || settings.requireApprovalOver < 0)) {
      return NextResponse.json({ error: 'Invalid approval threshold' }, { status: 400 });
    }

    // Merge with existing settings to preserve any missing fields
    const currentSettings = familySettings.get(user.id) || defaultSettings;
    const updatedSettings = { ...currentSettings, ...settings };

    // Save settings (in real app would save to database)
    familySettings.set(user.id, updatedSettings);

    return NextResponse.json({ 
      success: true,
      settings: updatedSettings,
      message: 'Configurações salvas com sucesso'
    });

  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Export settings for use by other parts of the app
export function getFamilySettings(parentId: string) {
  return familySettings.get(parentId) || defaultSettings;
}