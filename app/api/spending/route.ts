import { NextRequest, NextResponse } from 'next/server';
import { TempAuthService } from '@/lib/auth/temp-auth';
import { SpendingStorage } from '@/lib/storage/spending';
import { GamificationStorage } from '@/lib/storage/gamification';
import { mockData } from '@/lib/db';
import { cookies } from 'next/headers';

// GET - List spending transactions
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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // week, month, year
    const childId = searchParams.get('childId');

    let transactions;
    let monthlySpending;

    if (user.role === 'parent') {
      const parentId = parseInt(user.id);
      if (childId) {
        // Get transactions for specific child
        const childIdNum = parseInt(childId);
        transactions = SpendingStorage.getTransactionsByChild(childIdNum);
        monthlySpending = SpendingStorage.getMonthlySpendingByChild(childIdNum);
      } else {
        // Get transactions for all children
        transactions = SpendingStorage.getTransactionsByParent(parentId);
        // For parent view, we'll aggregate all children's spending
        monthlySpending = [];
      }
    } else if (user.role === 'child') {
      const childIdNum = parseInt(user.id.toString());
      transactions = SpendingStorage.getTransactionsByChild(childIdNum);
      monthlySpending = SpendingStorage.getMonthlySpendingByChild(childIdNum);
    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 403 });
    }

    // Filter by period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const filteredTransactions = transactions.filter(transaction => 
      new Date(transaction.date) >= startDate
    );

    // Sort by date (newest first)
    const sortedTransactions = filteredTransactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({
      transactions: sortedTransactions,
      monthlySpending,
      summary: {
        totalSpent: filteredTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0),
        totalTransactions: filteredTransactions.length,
        period,
      }
    });

  } catch (error) {
    console.error('Get spending error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new spending transaction
export async function POST(request: NextRequest) {
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

    const { amount, description, categoryId, type, date, childId } = await request.json();

    // Validate input
    if (!amount || !categoryId || !type) {
      return NextResponse.json({ error: 'Amount, category, and type are required' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    // Get category info
    const category = SpendingStorage.getCategoryById(parseInt(categoryId));
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    let targetChildId: number;
    let childName: string;

    if (user.role === 'parent') {
      // Parents can create transactions for their children
      if (!childId) {
        return NextResponse.json({ error: 'Child ID is required for parent transactions' }, { status: 400 });
      }
      targetChildId = parseInt(childId);
      const child = mockData.children.find(c => c.id === targetChildId);
      if (!child) {
        return NextResponse.json({ error: 'Child not found' }, { status: 404 });
      }
      childName = child.name;
    } else if (user.role === 'child') {
      // Children can only create transactions for themselves
      targetChildId = parseInt(user.id.toString());
      const child = mockData.children.find(c => c.id === targetChildId);
      if (!child) {
        return NextResponse.json({ error: 'Child not found' }, { status: 404 });
      }
      childName = child.name;
    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 403 });
    }

    // Create transaction
    const newTransaction = SpendingStorage.createTransaction({
      childId: targetChildId,
      childName,
      amount: parseFloat(amount),
      description: description || '',
      category: category.name,
      categoryId: category.id,
      date: date || new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      type,
    });

    // Award points for tracking spending (only for expenses)
    let gamificationResult = null;
    if (type === 'expense') {
      gamificationResult = GamificationStorage.handleSpendingTracked(targetChildId, newTransaction.id);
    }

    return NextResponse.json({
      success: true,
      transaction: newTransaction,
      pointsEarned: gamificationResult?.points?.points || 0,
      newBadges: gamificationResult?.badges || [],
    });

  } catch (error) {
    console.error('Create spending transaction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}