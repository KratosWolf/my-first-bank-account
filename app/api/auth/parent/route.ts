import { NextRequest, NextResponse } from 'next/server';
import { TempAuthService } from '@/lib/auth/temp-auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await TempAuthService.authenticateParent(email);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create session token
    const sessionToken = TempAuthService.createSession(user);

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });

  } catch (error) {
    console.error('Parent auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}