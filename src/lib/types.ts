// Basic types for the financial education system

export interface Family {
  id: string;
  parentName: string;
  parentEmail: string;
  parentAvatar?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  familyId: string;
  name: string;
  pin: string;
  avatar: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  level: number;
  xp: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'earning' | 'spending' | 'transfer' | 'interest' | 'allowance';
  amount: number;
  description: string;
  category?: string;
  fromUserId?: string;
  toUserId?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  targetDate?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRequest {
  id: string;
  userId: string;
  title: string;
  description?: string;
  amount: number;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  parentNote?: string;
  createdAt: string;
  updatedAt: string;
}
