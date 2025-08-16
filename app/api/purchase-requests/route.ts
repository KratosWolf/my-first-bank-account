import { NextRequest, NextResponse } from 'next/server';
import { TempAuthService } from '@/lib/auth/temp-auth';
import { mockData } from '@/lib/db';
import { PurchaseRequestStorage } from '@/lib/storage/purchase-requests';
import { cookies } from 'next/headers';

// GET - List purchase requests
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

    let filteredRequests;

    if (user.role === 'parent') {
      // Parents see all requests for their children
      const parentId = parseInt(user.id);
      filteredRequests = PurchaseRequestStorage.getByParent(parentId);
    } else {
      // Children see only their own requests
      const childId = parseInt(user.id.toString());
      filteredRequests = PurchaseRequestStorage.getByChild(childId);
    }

    return NextResponse.json({
      requests: filteredRequests.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    });

  } catch (error) {
    console.error('Get purchase requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new purchase request
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = TempAuthService.validateSession(sessionToken);
    if (!user || user.role !== 'child') {
      return NextResponse.json({ error: 'Only children can create purchase requests' }, { status: 403 });
    }

    const { item, amount, category, description } = await request.json();

    // Validate input
    if (!item || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Item and valid amount are required' }, { status: 400 });
    }

    // Get child data
    const childId = parseInt(user.id.toString());
    const child = mockData.children.find(c => c.id === childId);
    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Create purchase request
    const newRequest = PurchaseRequestStorage.create({
      childId: child.id,
      childName: child.name,
      parentId: child.parentId,
      item: item.trim(),
      amount: parseFloat(amount),
      category: category || 'Outros',
      description: description || '',
    });

    return NextResponse.json({
      success: true,
      request: newRequest
    });

  } catch (error) {
    console.error('Create purchase request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}