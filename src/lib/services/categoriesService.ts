// Serviço para gerenciar categorias de gastos - CONECTADO AO SUPABASE
import { supabase } from '../supabase';

// Interface atualizada para refletir o schema do Supabase
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  monthly_limit: number;
  quarterly_limit: number;
  enabled: boolean;
  family_id?: string | null;
  created_at?: string;
}

// Tipo para criar/atualizar categorias (sem id, created_at)
export type CategoryInput = Omit<Category, 'id' | 'created_at'>;

export class CategoriesService {
  // Carregar todas as categorias ativas do Supabase
  static async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('spending_categories')
        .select('*')
        .eq('enabled', true)
        .order('name');

      if (error) {
        console.error('❌ Erro ao carregar categorias do Supabase:', error);
        throw error;
      }

      console.log('📂 Categorias carregadas do Supabase:', data?.length || 0);
      return (data || []) as Category[];
    } catch (error) {
      console.error('❌ Erro ao buscar categorias:', error);
      return [];
    }
  }

  // Adicionar nova categoria
  static async addCategory(
    category: Partial<CategoryInput>
  ): Promise<Category | null> {
    try {
      const newCategory = {
        name: category.name || '',
        icon: category.icon || '📦',
        color: category.color || '#3B82F6',
        monthly_limit: category.monthly_limit || 0,
        quarterly_limit: category.quarterly_limit || 0,
        enabled: category.enabled !== undefined ? category.enabled : true,
        family_id: category.family_id || null,
      };

      const { data, error } = await supabase
        .from('spending_categories')
        .insert([newCategory])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao adicionar categoria:', error);
        throw error;
      }

      console.log('✅ Nova categoria adicionada:', data);
      return data as Category;
    } catch (error) {
      console.error('❌ Erro ao criar categoria:', error);
      return null;
    }
  }

  // Atualizar categoria existente
  static async updateCategory(
    id: string,
    updates: Partial<CategoryInput>
  ): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('spending_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar categoria:', error);
        throw error;
      }

      console.log('✅ Categoria atualizada:', data);
      return data as Category;
    } catch (error) {
      console.error('❌ Erro ao atualizar categoria:', error);
      return null;
    }
  }

  // Remover categoria (soft delete - marca como disabled)
  static async deleteCategory(id: string): Promise<boolean> {
    try {
      // Soft delete: apenas desabilita a categoria
      const { error } = await supabase
        .from('spending_categories')
        .update({ enabled: false })
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao remover categoria:', error);
        throw error;
      }

      console.log('✅ Categoria desabilitada:', id);
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar categoria:', error);
      return false;
    }
  }

  // Hard delete (remover permanentemente) - usar com cuidado
  static async permanentlyDeleteCategory(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('spending_categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao remover categoria permanentemente:', error);
        throw error;
      }

      console.log('✅ Categoria removida permanentemente:', id);
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar categoria:', error);
      return false;
    }
  }

  // Obter categoria por nome (para compatibilidade com código existente)
  static async getCategoryByName(name: string): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('spending_categories')
        .select('*')
        .eq('name', name)
        .eq('enabled', true)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar categoria por nome:', error);
        return null;
      }

      return data as Category;
    } catch (error) {
      console.error('❌ Erro ao buscar categoria:', error);
      return null;
    }
  }

  // Obter categoria por ID
  static async getCategoryById(id: string): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('spending_categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar categoria por ID:', error);
        return null;
      }

      return data as Category;
    } catch (error) {
      console.error('❌ Erro ao buscar categoria:', error);
      return null;
    }
  }

  // Obter todas as categorias (incluindo desabilitadas)
  static async getAllCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('spending_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Erro ao carregar todas as categorias:', error);
        throw error;
      }

      return (data || []) as Category[];
    } catch (error) {
      console.error('❌ Erro ao buscar categorias:', error);
      return [];
    }
  }
}
