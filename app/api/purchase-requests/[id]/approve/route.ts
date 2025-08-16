import { NextRequest, NextResponse } from 'next/server';
import { TempAuthService } from '@/lib/auth/temp-auth';
import { PurchaseRequestStorage } from '@/lib/storage/purchase-requests';
import { cookies } from 'next/headers';

export async function POST(
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
    if (!user || user.role !== 'parent') {
      return NextResponse.json({ error: 'Only parents can approve requests' }, { status: 403 });
    }

    const resolvedParams = await params;
    const requestId = parseInt(resolvedParams.id);
    const { action, comment } = await request.json();

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Find the request
    const purchaseRequest = PurchaseRequestStorage.getById(requestId);

    if (!purchaseRequest || purchaseRequest.parentId !== parseInt(user.id)) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (purchaseRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 });
    }

    // Update request
    const updatedRequest = PurchaseRequestStorage.update(requestId, {
      status: action === 'approve' ? 'approved' : 'rejected',
      processedAt: new Date().toISOString(),
      parentComment: comment || ''
    });

    if (!updatedRequest) {
      return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
    }

    // If approved, could update child's balance here (mock implementation)
    if (action === 'approve') {
      console.log(`Approved purchase: ${purchaseRequest.item} for ${purchaseRequest.childName}`);
    }

    return NextResponse.json({
      success: true,
      request: updatedRequest
    });

  } catch (error) {
    console.error('Approve purchase request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}