import { NextRequest, NextResponse } from 'next/server';
import { TempAuthService } from '@/lib/auth/temp-auth';
import { cookies } from 'next/headers';

// Mock theme storage - in real app would be database
const familyThemes = new Map();

// Available themes
const availableThemes = [
  'ocean', 'forest', 'sunset', 'galaxy', 'strawberry', 'classic'
];

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

    // Get theme for this family or return default
    const theme = familyThemes.get(user.id) || 'ocean';

    return NextResponse.json({ 
      currentTheme: theme,
      availableThemes 
    });

  } catch (error) {
    console.error('Theme GET error:', error);
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
    const { themeId } = body;

    // Validate theme
    if (!themeId || !availableThemes.includes(themeId)) {
      return NextResponse.json({ error: 'Invalid theme selected' }, { status: 400 });
    }

    // Save theme (in real app would save to database)
    familyThemes.set(user.id, themeId);

    return NextResponse.json({ 
      success: true,
      theme: themeId,
      message: 'Tema salvo com sucesso'
    });

  } catch (error) {
    console.error('Theme PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Export theme getter for use by other parts of the app
export function getFamilyTheme(parentId: string): string {
  return familyThemes.get(parentId) || 'ocean';
}