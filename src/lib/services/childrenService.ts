import { supabase } from '../supabase';
import type { Child } from '../supabase';
import { generateUUID, isValidUUID } from '../utils/uuid';

export class ChildrenService {
  // Carregar crianças da família (familyId obrigatório)
  static async getChildren(familyId: string): Promise<Child[]> {
    if (!familyId) {
      console.error('❌ getChildren: familyId é obrigatório');
      return [];
    }

    try {
      const { data: children, error } = await supabase
        .from('children')
        .select('*')
        .eq('family_id', familyId);

      if (!error && children && children.length > 0) {
        this.saveChildrenToLocalStorage(children);
        return children;
      }

      // Fallback para localStorage
      const stored = localStorage.getItem('familyChildren');
      if (stored) {
        const localChildren = JSON.parse(stored);
        const filtered = localChildren.filter(
          (c: Child) => c.family_id === familyId
        );
        if (filtered.length > 0) {
          return filtered;
        }
      }

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

  // Adicionar nova criança (familyId obrigatório)
  static async addChild(
    childData: Omit<Child, 'id' | 'family_id' | 'created_at' | 'updated_at'>,
    familyId: string
  ): Promise<Child | null> {
    if (!familyId) {
      console.error('❌ addChild: familyId é obrigatório');
      return null;
    }

    try {
      const newChild: Omit<Child, 'id' | 'created_at' | 'updated_at'> = {
        ...childData,
        family_id: familyId,
        total_earned: childData.balance || 0,
        total_spent: 0,
        age: childData.age || 8,
      };

      // Tentar salvar no Supabase primeiro
      const { data: child, error } = await supabase
        .from('children')
        .insert([newChild])
        .select()
        .single();

      if (error) {
        console.warn(
          '⚠️ Erro no Supabase, salvando no localStorage:',
          error.message
        );
        return this.addChildToLocalStorage(childData, familyId);
      }

      console.log('✅ Criança adicionada ao Supabase:', child);

      // Atualizar localStorage como backup
      const children = await this.getChildren(familyId);
      this.saveChildrenToLocalStorage(children);

      return child;
    } catch (error) {
      console.error(
        '❌ Erro ao adicionar no Supabase, usando localStorage:',
        error
      );
      return this.addChildToLocalStorage(childData, familyId);
    }
  }

  // Atualizar criança existente
  static async updateChild(
    id: string,
    updates: Partial<Child>
  ): Promise<Child | null> {
    try {
      // Tentar atualizar no Supabase primeiro
      const { data: child, error } = await supabase
        .from('children')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.warn(
          '⚠️ Erro no Supabase, atualizando localStorage:',
          error.message
        );
        return this.updateChildInLocalStorage(id, updates);
      }

      console.log('✅ Criança atualizada no Supabase:', child);

      // Atualizar localStorage como backup
      if (child.family_id) {
        const children = await this.getChildren(child.family_id);
        this.saveChildrenToLocalStorage(children);
      }

      return child;
    } catch (error) {
      console.error(
        '❌ Erro ao atualizar no Supabase, usando localStorage:',
        error
      );
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
      const { error } = await supabase.from('children').delete().eq('id', id);

      if (error) {
        console.warn(
          '⚠️ Erro no Supabase (mas localStorage funcionou):',
          error.message
        );
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
        const hasInvalidIds = children.some(
          (child: Child) => !isValidUUID(child.id)
        );
        if (hasInvalidIds) {
          console.warn(
            '⚠️ Encontrados IDs inválidos no localStorage, limpando dados...'
          );
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

  private static addChildToLocalStorage(
    childData: any,
    familyId: string
  ): Child | null {
    try {
      const children = this.getChildrenFromLocalStorage();
      const newChild: Child = {
        id: generateUUID(),
        family_id: familyId,
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

  private static updateChildInLocalStorage(
    id: string,
    updates: Partial<Child>
  ): Child | null {
    try {
      const children = this.getChildrenFromLocalStorage();
      const index = children.findIndex(child => child.id === id);

      if (index === -1) return null;

      children[index] = {
        ...children[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
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
      console.log(
        '📱 Crianças antes do delete:',
        children.map(c => ({ id: c.id, name: c.name }))
      );

      const filtered = children.filter(child => {
        const keep = child.id !== id;
        console.log(`📱 ID: ${child.id}, manter: ${keep}`);
        return keep;
      });

      console.log(
        '📱 Crianças após filtro:',
        filtered.map(c => ({ id: c.id, name: c.name }))
      );

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
