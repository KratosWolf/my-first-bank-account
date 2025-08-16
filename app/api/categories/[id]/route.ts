import { NextRequest, NextResponse } from 'next/server';
import { TempAuthService } from '@/lib/auth/temp-auth';
import { SpendingStorage } from '@/lib/storage/spending';
import { cookies } from 'next/headers';

// GET - Get specific category
export async function GET(
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
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const resolvedParams = await params;
    const categoryId = parseInt(resolvedParams.id);
    const category = SpendingStorage.getCategoryById(categoryId);

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check permissions
    if (user.role === 'parent') {
      const parentId = parseInt(user.id);
      if (category.parentId !== parentId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    } else if (user.role === 'child') {
      // Children can only view categories from their parent
      const childId = parseInt(user.id.toString());
      // Mock logic: assume child 1 belongs to parent 1
      if (category.parentId !== 1) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    return NextResponse.json({ category });

  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update category (parents only)
export async function PUT(
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
      return NextResponse.json({ error: 'Only parents can update categories' }, { status: 403 });
    }

    const resolvedParams = await params;
    const categoryId = parseInt(resolvedParams.id);
    const category = SpendingStorage.getCategoryById(categoryId);

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const parentId = parseInt(user.id);
    if (category.parentId !== parentId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { name, icon, color, monthlyBudget, isActive } = await request.json();

    // Validate input
    if (name && name.trim().length === 0) {
      return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
    }

    // Check if new name conflicts with existing categories
    if (name && name.toLowerCase() !== category.name.toLowerCase()) {
      const existingCategories = SpendingStorage.getCategoriesByParent(parentId);
      const nameExists = existingCategories.some(cat => 
        cat.id !== categoryId && cat.name.toLowerCase() === name.toLowerCase()
      );

      if (nameExists) {
        return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
      }
    }

    // Update category
    const updates: any = {};
    if (name) updates.name = name.trim();
    if (icon) updates.icon = icon;
    if (color) updates.color = color;
    if (monthlyBudget !== undefined) updates.monthlyBudget = monthlyBudget ? parseFloat(monthlyBudget) : undefined;
    if (isActive !== undefined) updates.isActive = isActive;

    const updatedCategory = SpendingStorage.updateCategory(categoryId, updates);

    return NextResponse.json({
      success: true,
      category: updatedCategory
    });

  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete category (parents only)
export async function DELETE(
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
      return NextResponse.json({ error: 'Only parents can delete categories' }, { status: 403 });
    }

    const resolvedParams = await params;
    const categoryId = parseInt(resolvedParams.id);
    const category = SpendingStorage.getCategoryById(categoryId);

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const parentId = parseInt(user.id);
    if (category.parentId !== parentId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const deleted = SpendingStorage.deleteCategory(categoryId);

    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}