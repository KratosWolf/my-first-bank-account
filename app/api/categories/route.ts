import { NextRequest, NextResponse } from 'next/server';
import { TempAuthService } from '@/lib/auth/temp-auth';
import { SpendingStorage } from '@/lib/storage/spending';
import { mockData } from '@/lib/db';
import { cookies } from 'next/headers';

// GET - List categories
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

    let categories;

    if (user.role === 'parent') {
      const parentId = parseInt(user.id);
      categories = SpendingStorage.getCategoriesByParent(parentId);
    } else if (user.role === 'child') {
      // Get parent ID from child data
      const childId = parseInt(user.id.toString());
      const child = mockData.children.find(c => c.id === childId);
      if (!child) {
        return NextResponse.json({ error: 'Child not found' }, { status: 404 });
      }
      categories = SpendingStorage.getCategoriesByParent(child.parentId);
    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 403 });
    }

    return NextResponse.json({
      categories: categories.sort((a, b) => a.name.localeCompare(b.name))
    });

  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new category (parents only)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = TempAuthService.validateSession(sessionToken);
    if (!user || user.role !== 'parent') {
      return NextResponse.json({ error: 'Only parents can create categories' }, { status: 403 });
    }

    const { name, icon, color, monthlyBudget, childId } = await request.json();

    // Validate input
    if (!name || !icon || !color) {
      return NextResponse.json({ error: 'Name, icon, and color are required' }, { status: 400 });
    }

    // Check if category name already exists for this parent
    const parentId = parseInt(user.id);
    const existingCategories = SpendingStorage.getCategoriesByParent(parentId);
    const nameExists = existingCategories.some(cat => 
      cat.name.toLowerCase() === name.toLowerCase()
    );

    if (nameExists) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
    }

    // Create category
    const newCategory = SpendingStorage.createCategory({
      name: name.trim(),
      icon,
      color,
      parentId,
      childId: childId || undefined,
      isActive: true,
      monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : undefined,
    });

    return NextResponse.json({
      success: true,
      category: newCategory
    });

  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}