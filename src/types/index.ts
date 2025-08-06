export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  role: 'parent' | 'child';
  pin?: string; // 4-digit PIN for children
  parentId?: string; // For child accounts
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  type: 'master' | 'child';
  balance: number;
  name: string;
  color: string; // For UI customization
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  description: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string; // Parent ID
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpendingRequest {
  id: string;
  childAccountId: string;
  parentAccountId: string;
  amount: number;
  description: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  reason?: string; // For rejection
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: Date;
}

export interface SpendingRule {
  id: string;
  parentAccountId: string;
  category: string;
  maxAmount: number;
  period: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  userId: string;
  type: 'saving' | 'spending' | 'learning';
  title: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt: Date;
}

export interface Badge {
  id: string;
  userId: string;
  type: 'savings' | 'responsibility' | 'learning';
  title: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'request' | 'approval' | 'achievement' | 'reminder';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface AppSettings {
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  soundEffects: boolean;
  language: 'pt-BR' | 'en-US';
  createdAt: Date;
  updatedAt: Date;
}
