// Storage service for children data
export interface Child {
  id: string;
  name: string;
  pin: string;
  balance: number;
  level: number;
  points: number;
  avatar: string;
  createdAt: string;
  parentId: string;
}

const STORAGE_KEY = 'banco-familia-children';

export class ChildrenStorage {
  static getAll(parentId: string): Child[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const allChildren: Child[] = JSON.parse(data);
      return allChildren.filter(child => child.parentId === parentId);
    } catch (error) {
      console.error('Error loading children:', error);
      return [];
    }
  }

  static save(child: Child): void {
    try {
      const allChildren = this.getAllRaw();
      const existingIndex = allChildren.findIndex(c => c.id === child.id);
      
      if (existingIndex >= 0) {
        allChildren[existingIndex] = child;
      } else {
        allChildren.push(child);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allChildren));
    } catch (error) {
      console.error('Error saving child:', error);
      throw new Error('Falha ao salvar criança');
    }
  }

  static delete(childId: string): void {
    try {
      const allChildren = this.getAllRaw();
      const filtered = allChildren.filter(c => c.id !== childId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting child:', error);
      throw new Error('Falha ao remover criança');
    }
  }

  static generateId(): string {
    return `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static getAllRaw(): Child[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading raw children data:', error);
      return [];
    }
  }

  static validatePin(pin: string): boolean {
    return /^\d{4}$/.test(pin);
  }

  static validateName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 50;
  }
}

// Avatar options for children
export const AVATAR_OPTIONS = [
  '👧', '👦', '🧒', '👶', '🐱', '🐶', '🦊', '🐼', 
  '🦄', '🌟', '⭐', '🎈', '🎯', '🎨', '🚀', '⚽'
];