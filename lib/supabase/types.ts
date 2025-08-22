export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      families: {
        Row: {
          id: string
          name: string
          currency: string
          allowance_amount: number
          allowance_frequency: string
          require_approval_over: number
          family_mission: string | null
          savings_interest_rate: number
          interest_enabled: boolean
          interest_application_day: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          currency?: string
          allowance_amount?: number
          allowance_frequency?: string
          require_approval_over?: number
          family_mission?: string | null
          savings_interest_rate?: number
          interest_enabled?: boolean
          interest_application_day?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          currency?: string
          allowance_amount?: number
          allowance_frequency?: string
          require_approval_over?: number
          family_mission?: string | null
          savings_interest_rate?: number
          interest_enabled?: boolean
          interest_application_day?: number
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          family_id: string
          name: string
          email: string | null
          pin: string | null
          role: 'parent' | 'child'
          balance: number
          total_spent: number
          total_saved: number
          level: number
          points: number
          badges: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          email?: string | null
          pin?: string | null
          role: 'parent' | 'child'
          balance?: number
          total_spent?: number
          total_saved?: number
          level?: number
          points?: number
          badges?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          email?: string | null
          pin?: string | null
          role?: 'parent' | 'child'
          balance?: number
          total_spent?: number
          total_saved?: number
          level?: number
          points?: number
          badges?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      spending_categories: {
        Row: {
          id: string
          family_id: string | null
          name: string
          icon: string
          monthly_limit: number
          quarterly_limit: number
          enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          family_id?: string | null
          name: string
          icon: string
          monthly_limit?: number
          quarterly_limit?: number
          enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string | null
          name?: string
          icon?: string
          monthly_limit?: number
          quarterly_limit?: number
          enabled?: boolean
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          family_id: string
          type: 'allowance' | 'purchase' | 'goal_deposit' | 'bonus' | 'interest' | 'request_approved'
          amount: number
          description: string
          category_id: string | null
          balance_after: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          family_id: string
          type: 'allowance' | 'purchase' | 'goal_deposit' | 'bonus' | 'interest' | 'request_approved'
          amount: number
          description: string
          category_id?: string | null
          balance_after: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          family_id?: string
          type?: 'allowance' | 'purchase' | 'goal_deposit' | 'bonus' | 'interest' | 'request_approved'
          amount?: number
          description?: string
          category_id?: string | null
          balance_after?: number
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          family_id: string
          name: string
          description: string | null
          target_amount: number
          current_amount: number
          icon: string
          is_completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          family_id: string
          name: string
          description?: string | null
          target_amount: number
          current_amount?: number
          icon?: string
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          family_id?: string
          name?: string
          description?: string | null
          target_amount?: number
          current_amount?: number
          icon?: string
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      purchase_requests: {
        Row: {
          id: string
          user_id: string
          family_id: string
          type: string
          amount: number
          description: string
          category_id: string | null
          status: 'pending' | 'approved' | 'rejected'
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          family_id: string
          type?: string
          amount: number
          description: string
          category_id?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          family_id?: string
          type?: string
          amount?: number
          description?: string
          category_id?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      monthly_balances: {
        Row: {
          id: string
          user_id: string
          family_id: string
          year: number
          month: number
          minimum_balance: number
          days_tracked: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          family_id: string
          year: number
          month: number
          minimum_balance: number
          days_tracked?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          family_id?: string
          year?: number
          month?: number
          minimum_balance?: number
          days_tracked?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'parent' | 'child'
      transaction_type: 'allowance' | 'purchase' | 'goal_deposit' | 'bonus' | 'interest' | 'request_approved'
      request_status: 'pending' | 'approved' | 'rejected'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Family = Database['public']['Tables']['families']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type SpendingCategory = Database['public']['Tables']['spending_categories']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Goal = Database['public']['Tables']['goals']['Row']
export type PurchaseRequest = Database['public']['Tables']['purchase_requests']['Row']
export type MonthlyBalance = Database['public']['Tables']['monthly_balances']['Row']

export type InsertFamily = Database['public']['Tables']['families']['Insert']
export type InsertUser = Database['public']['Tables']['users']['Insert']
export type InsertTransaction = Database['public']['Tables']['transactions']['Insert']
export type InsertGoal = Database['public']['Tables']['goals']['Insert']
export type InsertPurchaseRequest = Database['public']['Tables']['purchase_requests']['Insert']