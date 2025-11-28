// Serviço para gerenciar categorias de gastos e sonhos

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'spending' | 'dream' | 'both'; // Tipo de categoria
  color?: string; // Cor opcional para personalização
}

// Categorias padrão do sistema
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Jogos', icon: '🎮', type: 'both' },
  { id: '2', name: 'Roupas', icon: '👕', type: 'both' },
  { id: '3', name: 'Livros', icon: '📚', type: 'both' },
  { id: '4', name: 'Esportes', icon: '⚽', type: 'both' },
  { id: '5', name: 'Eletrônicos', icon: '📱', type: 'both' },
  { id: '6', name: 'Brinquedos', icon: '🧸', type: 'both' },
  { id: '7', name: 'Alimentação', icon: '🍕', type: 'spending' },
  { id: '8', name: 'Educação', icon: '📖', type: 'both' },
  { id: '9', name: 'Viagem', icon: '✈️', type: 'dream' },
  { id: '10', name: 'Música', icon: '🎵', type: 'both' },
];

export class CategoriesService {
  private static STORAGE_KEY = 'familyCategories';

  // Carregar categorias do localStorage ou usar padrão
  static getCategories(): Category[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const categories = JSON.parse(stored);
        console.log('📂 Categorias carregadas do localStorage:', categories);
        return categories;
      }
      
      // Usar categorias padrão na primeira execução
      this.saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    } catch (error) {
      console.error('❌ Erro ao carregar categorias:', error);
      return DEFAULT_CATEGORIES;
    }
  }

  // Salvar categorias no localStorage
  static saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(categories));
      console.log('📂 Categorias salvas no localStorage');
    } catch (error) {
      console.error('❌ Erro ao salvar categorias:', error);
    }
  }

  // Adicionar nova categoria
  static addCategory(category: Omit<Category, 'id'>): Category {
    const categories = this.getCategories();
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(), // ID simples baseado em timestamp
    };
    
    categories.push(newCategory);
    this.saveCategories(categories);
    
    console.log('✅ Nova categoria adicionada:', newCategory);
    return newCategory;
  }

  // Atualizar categoria existente
  static updateCategory(id: string, updates: Partial<Omit<Category, 'id'>>): Category | null {
    const categories = this.getCategories();
    const index = categories.findIndex(cat => cat.id === id);
    
    if (index === -1) {
      console.error('❌ Categoria não encontrada:', id);
      return null;
    }
    
    categories[index] = { ...categories[index], ...updates };
    this.saveCategories(categories);
    
    console.log('✅ Categoria atualizada:', categories[index]);
    return categories[index];
  }

  // Remover categoria
  static deleteCategory(id: string): boolean {
    const categories = this.getCategories();
    const filteredCategories = categories.filter(cat => cat.id !== id);
    
    if (filteredCategories.length === categories.length) {
      console.error('❌ Categoria não encontrada para exclusão:', id);
      return false;
    }
    
    this.saveCategories(filteredCategories);
    console.log('✅ Categoria removida:', id);
    return true;
  }

  // Obter categorias por tipo
  static getCategoriesByType(type: 'spending' | 'dream' | 'both'): Category[] {
    const categories = this.getCategories();
    
    if (type === 'both') {
      return categories;
    }
    
    return categories.filter(cat => cat.type === type || cat.type === 'both');
  }

  // Obter categoria por nome (para compatibilidade com código existente)
  static getCategoryByName(name: string): Category | undefined {
    const categories = this.getCategories();
    return categories.find(cat => cat.name === name);
  }

  // Resetar para categorias padrão
  static resetToDefault(): void {
    this.saveCategories(DEFAULT_CATEGORIES);
    console.log('🔄 Categorias resetadas para padrão');
  }
}