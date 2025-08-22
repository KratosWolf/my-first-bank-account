// Storage for children's savings goals
export interface Goal {
  id: number;
  childId: number;
  childName: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  icon: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Global storage for goals
if (!(globalThis as any).__goals) {
  (globalThis as any).__goals = [];
  (globalThis as any).__goalNextId = 1;
}

const goals = (globalThis as any).__goals as Goal[];
let nextId = (globalThis as any).__goalNextId as number;

export const GoalStorage = {
  getAll: (): Goal[] => {
    return [...goals];
  },

  getByChild: (childId: number): Goal[] => {
    return goals.filter(goal => goal.childId === childId);
  },

  getActiveByChild: (childId: number): Goal[] => {
    return goals.filter(goal => goal.childId === childId && !goal.isCompleted);
  },

  getCompletedByChild: (childId: number): Goal[] => {
    return goals.filter(goal => goal.childId === childId && goal.isCompleted);
  },

  getById: (id: number): Goal | undefined => {
    return goals.find(goal => goal.id === id);
  },

  create: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'currentAmount' | 'isCompleted'>): Goal => {
    const newGoal: Goal = {
      ...goal,
      id: nextId++,
      currentAmount: 0,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    goals.push(newGoal);
    (globalThis as any).__goalNextId = nextId;
    return newGoal;
  },

  update: (id: number, updates: Partial<Goal>): Goal | null => {
    const index = goals.findIndex(goal => goal.id === id);
    if (index === -1) return null;

    goals[index] = {
      ...goals[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return goals[index];
  },

  delete: (id: number): boolean => {
    const index = goals.findIndex(goal => goal.id === id);
    if (index === -1) return false;

    goals.splice(index, 1);
    return true;
  },

  addProgress: (id: number, amount: number): Goal | null => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return null;

    goal.currentAmount += amount;
    goal.updatedAt = new Date().toISOString();

    // Check if goal is completed
    if (goal.currentAmount >= goal.targetAmount && !goal.isCompleted) {
      goal.isCompleted = true;
      goal.completedAt = new Date().toISOString();
    }

    return goal;
  },

  getProgress: (id: number): number => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return 0;
    
    return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  }
};