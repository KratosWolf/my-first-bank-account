import { NextRequest, NextResponse } from 'next/server';
import { TempAuthService } from '@/lib/auth/temp-auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();

    if (!pin || pin.length !== 4) {
      return NextResponse.json({ error: 'Valid 4-digit PIN is required' }, { status: 400 });
    }

    const child = await TempAuthService.authenticateChild(pin);

    if (!child) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }

    // Create session token
    const sessionToken = TempAuthService.createSession({ 
      ...child, 
      role: 'child' as const,
      email: '' // Children don't have email
    });

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day for children
    });

    return NextResponse.json({ 
      success: true, 
      user: { id: child.id, name: child.name, role: 'child' }
    });

  } catch (error) {
    console.error('Child auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}