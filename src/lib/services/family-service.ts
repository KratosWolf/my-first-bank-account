// Family Service - Handles family and children operations with Supabase
import { supabase } from '@/lib/supabase';
import { DatabaseService } from './database';
import type { Child } from '@/lib/supabase';

export interface ChildCreate {
  name: string;
  pin: string;
  avatar: string;
  familyId: string;
}

export interface ChildUpdate {
  name?: string;
  pin?: string;
  avatar?: string;
  balance?: number;
}

export class FamilyService {
  // Get current user's family ID from auth
  static getCurrentFamilyId(): string | null {
    // For now, we'll use a placeholder until we integrate NextAuth with Supabase
    // In real implementation, this would come from auth session
    return 'temp-family-id';
  }

  // Get all children for current family
  static async getChildren(): Promise<Child[]> {
    try {
      const familyId = this.getCurrentFamilyId();
      if (!familyId) {
        console.error('No family ID found');
        return [];
      }

      return await DatabaseService.getChildren(familyId);
    } catch (error) {
      console.error('Error fetching children:', error);
      // Fallback to localStorage if Supabase fails
      return this.getChildrenFromLocalStorage();
    }
  }

  // Create new child
  static async createChild(childData: ChildCreate): Promise<Child | null> {
    try {
      const newChild: Omit<Child, 'id' | 'created_at' | 'updated_at'> = {
        family_id: childData.familyId,
        name: childData.name.trim(),
        pin: childData.pin,
        avatar: childData.avatar,
        balance: 0,
        total_earned: 0,
        total_spent: 0,
        level: 1,
        xp: 0,
      };

      const result = await DatabaseService.createChild(newChild);

      if (result) {
        // Also save to localStorage as backup
        this.saveChildToLocalStorage(result);
      }

      return result;
    } catch (error) {
      console.error('Error creating child:', error);
      // Fallback to localStorage
      return this.createChildInLocalStorage(childData);
    }
  }

  // Update existing child
  static async updateChild(
    childId: string,
    updates: ChildUpdate
  ): Promise<Child | null> {
    try {
      const result = await DatabaseService.updateChild(childId, updates);

      if (result) {
        // Also update localStorage as backup
        this.updateChildInLocalStorage(childId, updates);
      }

      return result;
    } catch (error) {
      console.error('Error updating child:', error);
      // Fallback to localStorage
      return this.updateChildInLocalStorage(childId, updates);
    }
  }

  // Delete child
  static async deleteChild(childId: string): Promise<boolean> {
    try {
      const success = await DatabaseService.deleteChild(childId);

      if (success) {
        // Also remove from localStorage
        this.deleteChildFromLocalStorage(childId);
      }

      return success;
    } catch (error) {
      console.error('Error deleting child:', error);
      // Fallback to localStorage
      return this.deleteChildFromLocalStorage(childId);
    }
  }

  // Update child balance (quick transaction)
  static async updateChildBalance(
    childId: string,
    amountChange: number
  ): Promise<boolean> {
    try {
      await DatabaseService.updateChildBalance(childId, amountChange);

      // Also update localStorage
      this.updateChildBalanceInLocalStorage(childId, amountChange);

      return true;
    } catch (error) {
      console.error('Error updating balance:', error);
      // Fallback to localStorage
      return this.updateChildBalanceInLocalStorage(childId, amountChange);
    }
  }

  // Validate PIN uniqueness
  static async isPinUnique(
    pin: string,
    excludeChildId?: string
  ): Promise<boolean> {
    try {
      const children = await this.getChildren();
      return !children.some(
        child => child.pin === pin && child.id !== excludeChildId
      );
    } catch (error) {
      console.error('Error validating PIN:', error);
      return true; // Allow in case of error
    }
  }

  // FALLBACK METHODS - localStorage implementation
  private static getChildrenFromLocalStorage(): Child[] {
    try {
      const saved = localStorage.getItem('banco-familia-children');
      if (!saved) return [];

      const allChildren = JSON.parse(saved);
      const familyId = this.getCurrentFamilyId();

      return allChildren.filter(
        (c: any) => c.parentId === familyId || c.family_id === familyId
      );
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  private static saveChildToLocalStorage(child: Child): void {
    try {
      const saved = localStorage.getItem('banco-familia-children');
      const allChildren = saved ? JSON.parse(saved) : [];

      // Convert to old format for compatibility
      const legacyChild = {
        ...child,
        parentId: child.family_id,
        points: child.xp,
        createdAt: child.created_at,
      };

      allChildren.push(legacyChild);
      localStorage.setItem(
        'banco-familia-children',
        JSON.stringify(allChildren)
      );
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private static createChildInLocalStorage(childData: ChildCreate): Child {
    const newChild: Child = {
      id: `child_${Date.now()}`,
      family_id: childData.familyId,
      name: childData.name.trim(),
      pin: childData.pin,
      avatar: childData.avatar,
      balance: 0,
      total_earned: 0,
      total_spent: 0,
      level: 1,
      xp: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.saveChildToLocalStorage(newChild);
    return newChild;
  }

  private static updateChildInLocalStorage(
    childId: string,
    updates: ChildUpdate
  ): Child | null {
    try {
      const saved = localStorage.getItem('banco-familia-children');
      if (!saved) return null;

      const allChildren = JSON.parse(saved);
      const index = allChildren.findIndex((c: any) => c.id === childId);

      if (index >= 0) {
        allChildren[index] = { ...allChildren[index], ...updates };
        localStorage.setItem(
          'banco-familia-children',
          JSON.stringify(allChildren)
        );
        return allChildren[index];
      }

      return null;
    } catch (error) {
      console.error('Error updating in localStorage:', error);
      return null;
    }
  }

  private static deleteChildFromLocalStorage(childId: string): boolean {
    try {
      const saved = localStorage.getItem('banco-familia-children');
      if (!saved) return false;

      const allChildren = JSON.parse(saved);
      const filtered = allChildren.filter((c: any) => c.id !== childId);

      localStorage.setItem('banco-familia-children', JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting from localStorage:', error);
      return false;
    }
  }

  private static updateChildBalanceInLocalStorage(
    childId: string,
    amountChange: number
  ): boolean {
    try {
      const saved = localStorage.getItem('banco-familia-children');
      if (!saved) return false;

      const allChildren = JSON.parse(saved);
      const index = allChildren.findIndex((c: any) => c.id === childId);

      if (index >= 0) {
        allChildren[index].balance = Math.max(
          0,
          allChildren[index].balance + amountChange
        );
        localStorage.setItem(
          'banco-familia-children',
          JSON.stringify(allChildren)
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error updating balance in localStorage:', error);
      return false;
    }
  }
}
