import { supabase } from '../supabase';
import type { Child } from '../supabase';
import { generateUUID, isValidUUID } from '../utils/uuid';

// Family ID padrão para desenvolvimento - em produção seria baseado no usuário logado
const DEMO_FAMILY_ID = 'demo-family-001';

export class ChildrenService {
  // Carregar crianças da família
  static async getChildren(): Promise<Child[]> {
    try {
      console.log('📱 getChildren: Buscando do Supabase...');

      // Tentar Supabase primeiro
      const { data: children, error } = await supabase
        .from('children')
        .select('*');

      if (!error && children && children.length > 0) {
        console.log('✅ Crianças carregadas do Supabase:', children.length);
        // Salvar no localStorage como cache
        this.saveChildrenToLocalStorage(children);
        return children;
      }

      // Fallback para localStorage
      console.log('⚠️ Supabase vazio ou erro, tentando localStorage...');
      const stored = localStorage.getItem('familyChildren');
      if (stored) {
        const localChildren = JSON.parse(stored);
        if (localChildren.length > 0) {
          console.log('📱 Crianças carregadas do localStorage:', localChildren.length);
          return localChildren;
        }
      }

      // Retornar vazio (não criar mock data)
      console.log('📭 Nenhuma criança encontrada');
      return [];

    } catch (error) {
      console.error('❌ Erro ao buscar crianças:', error);
      return [];
    }
  }

  // Limpar dados corrompidos do localStorage (UUIDs inválidos)
  static clearCorruptedData(): void {
    try {
      console.log('🧹 Limpando dados corrompidos do localStorage...');

      // Remover dados de crianças com IDs inválidos
      localStorage.removeItem('familyChildren');

      // Remover outros dados relacionados que podem ter IDs inválidos
      localStorage.removeItem('familyPendingRequests');
      localStorage.removeItem('authenticatedChild');

      console.log('✅ Dados limpos - localStorage resetado');
    } catch (error) {
      console.error('❌ Erro ao limpar dados corrompidos:', error);
    }
  }

  // Adicionar nova criança
  static async addChild(childData: Omit<Child, 'id' | 'family_id' | 'created_at' | 'updated_at'>): Promise<Child | null> {
    try {
      const newChild: Omit<Child, 'id' | 'created_at' | 'updated_at'> = {
        ...childData,
        family_id: DEMO_FAMILY_ID,
        total_earned: childData.balance || 0,
        total_spent: 0,
        // Garantir que age existe baseado em birthDate
        age: childData.age || 8
      };

      // Tentar salvar no Supabase primeiro
      const { data: child, error } = await supabase
        .from('children')
        .insert([newChild])
        .select()
        .single();

      if (error) {
        console.warn('⚠️ Erro no Supabase, salvando no localStorage:', error.message);
        return this.addChildToLocalStorage(childData);
      }

      console.log('✅ Criança adicionada ao Supabase:', child);
      
      // Atualizar localStorage como backup
      const children = await this.getChildren();
      this.saveChildrenToLocalStorage(children);
      
      return child;
    } catch (error) {
      console.error('❌ Erro ao adicionar no Supabase, usando localStorage:', error);
      return this.addChildToLocalStorage(childData);
    }
  }

  // Atualizar criança existente
  static async updateChild(id: string, updates: Partial<Child>): Promise<Child | null> {
    try {
      // Tentar atualizar no Supabase primeiro
      const { data: child, error } = await supabase
        .from('children')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.warn('⚠️ Erro no Supabase, atualizando localStorage:', error.message);
        return this.updateChildInLocalStorage(id, updates);
      }

      console.log('✅ Criança atualizada no Supabase:', child);
      
      // Atualizar localStorage como backup
      const children = await this.getChildren();
      this.saveChildrenToLocalStorage(children);
      
      return child;
    } catch (error) {
      console.error('❌ Erro ao atualizar no Supabase, usando localStorage:', error);
      return this.updateChildInLocalStorage(id, updates);
    }
  }

  // Deletar criança
  static async deleteChild(id: string): Promise<boolean> {
    console.log('🗑️ ChildrenService.deleteChild chamado para ID:', id);
    
    // Primeiro sempre deletar do localStorage para garantir
    const localStorageSuccess = this.deleteChildFromLocalStorage(id);
    console.log('📱 Resultado localStorage delete:', localStorageSuccess);
    
    try {
      // Tentar deletar no Supabase também
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('⚠️ Erro no Supabase (mas localStorage funcionou):', error.message);
      } else {
        console.log('✅ Criança removida do Supabase também:', id);
      }
      
      return localStorageSuccess;
    } catch (error) {
      console.warn('❌ Erro no Supabase (mas localStorage funcionou):', error);
      return localStorageSuccess;
    }
  }

  // === MÉTODOS DE FALLBACK PARA LOCALSTORAGE ===

  private static getChildrenFromLocalStorage(): Child[] {
    try {
      const stored = localStorage.getItem('familyChildren');
      if (stored) {
        const children = JSON.parse(stored);

        // Verificar se há IDs inválidos e limpar se necessário
        const hasInvalidIds = children.some((child: Child) => !isValidUUID(child.id));
        if (hasInvalidIds) {
          console.warn('⚠️ Encontrados IDs inválidos no localStorage, limpando dados...');
          localStorage.removeItem('familyChildren');
          return [];
        }

        console.log('📱 Crianças carregadas do localStorage:', children);
        return children;
      }

      // Retornar vazio se não houver dados
      return [];
    } catch (error) {
      console.error('❌ Erro ao ler localStorage:', error);
      return [];
    }
  }

  private static saveChildrenToLocalStorage(children: Child[]): void {
    try {
      localStorage.setItem('familyChildren', JSON.stringify(children));
      console.log('📱 Crianças salvas no localStorage');
    } catch (error) {
      console.error('❌ Erro ao salvar localStorage:', error);
    }
  }

  private static addChildToLocalStorage(childData: any): Child | null {
    try {
      const children = this.getChildrenFromLocalStorage();
      const newChild: Child = {
        id: generateUUID(),
        family_id: DEMO_FAMILY_ID,
        ...childData,
        total_earned: childData.balance || 0,
        total_spent: 0,
        age: childData.age || 8,
        birthDate: childData.birthDate || '2015-01-01',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      children.push(newChild);
      this.saveChildrenToLocalStorage(children);
      console.log('📱 Criança adicionada ao localStorage:', newChild);
      
      return newChild;
    } catch (error) {
      console.error('❌ Erro ao adicionar no localStorage:', error);
      return null;
    }
  }

  private static updateChildInLocalStorage(id: string, updates: Partial<Child>): Child | null {
    try {
      const children = this.getChildrenFromLocalStorage();
      const index = children.findIndex(child => child.id === id);
      
      if (index === -1) return null;
      
      children[index] = { ...children[index], ...updates, updated_at: new Date().toISOString() };
      this.saveChildrenToLocalStorage(children);
      console.log('📱 Criança atualizada no localStorage:', children[index]);
      
      return children[index];
    } catch (error) {
      console.error('❌ Erro ao atualizar localStorage:', error);
      return null;
    }
  }

  private static deleteChildFromLocalStorage(id: string): boolean {
    try {
      console.log('📱 deleteChildFromLocalStorage: Tentando deletar ID:', id);
      
      const children = this.getChildrenFromLocalStorage();
      console.log('📱 Crianças antes do delete:', children.map(c => ({ id: c.id, name: c.name })));
      
      const filtered = children.filter(child => {
        const keep = child.id !== id;
        console.log(`📱 ID: ${child.id}, manter: ${keep}`);
        return keep;
      });
      
      console.log('📱 Crianças após filtro:', filtered.map(c => ({ id: c.id, name: c.name })));
      
      this.saveChildrenToLocalStorage(filtered);
      console.log('✅ Criança removida do localStorage:', id);
      return true;
    } catch (error) {
      console.error('❌ Erro ao remover do localStorage:', error);
      return false;
    }
  }

  // REMOVIDO: Mock data não é mais necessário
  // O sistema agora usa apenas dados reais do Supabase
  // private static getMockChildren(): Child[] { ... }
}