import { supabase } from '../supabase';

// Tipo para pedidos de empréstimo
export interface LoanRequest {
  id: string;
  type: 'loan';
  child_id: string;
  child_name: string;
  reason: string;
  category: string;
  categoryIcon?: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  parent_note?: string;
}

// Family ID padrão para desenvolvimento
const DEMO_FAMILY_ID = 'demo-family-001';

export class LoanService {
  // Carregar todos os pedidos de empréstimo
  static async getLoanRequests(): Promise<LoanRequest[]> {
    try {
      // Primeiro tentar do Supabase usando a tabela purchase_requests
      const { data: purchases, error } = await supabase
        .from('purchase_requests')
        .select(`
          id,
          child_id,
          title,
          description,
          amount,
          category,
          status,
          created_at,
          updated_at,
          children!inner(name)
        `)
        .eq('category', 'Empréstimo')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('⚠️ Supabase não disponível para empréstimos, usando localStorage:', error.message);
        return this.getLoanRequestsFromLocalStorage();
      }

      // Converter para formato de empréstimo
      const loanRequests: LoanRequest[] = purchases?.map(purchase => ({
        id: purchase.id,
        type: 'loan',
        child_id: purchase.child_id,
        child_name: (purchase.children as any)?.name || 'Criança Desconhecida',
        reason: purchase.title,
        category: 'Empréstimo',
        categoryIcon: '💰',
        amount: purchase.amount,
        status: purchase.status as 'pending' | 'completed' | 'rejected',
        requestedAt: purchase.created_at,
        approvedAt: purchase.updated_at !== purchase.created_at ? purchase.updated_at : undefined,
      })) || [];

      console.log('✅ Pedidos de empréstimo carregados do Supabase:', loanRequests);
      
      // Também carregar do localStorage e combinar
      const localRequests = this.getLoanRequestsFromLocalStorage();
      const allRequests = [...loanRequests, ...localRequests];
      
      // Remover duplicatas por ID
      const uniqueRequests = allRequests.reduce((acc, current) => {
        if (!acc.find(item => item.id === current.id)) {
          acc.push(current);
        }
        return acc;
      }, [] as LoanRequest[]);

      return uniqueRequests;
    } catch (error) {
      console.error('❌ Erro ao carregar empréstimos do Supabase, usando localStorage:', error);
      return this.getLoanRequestsFromLocalStorage();
    }
  }

  // Criar novo pedido de empréstimo
  static async createLoanRequest(loanData: Omit<LoanRequest, 'id' | 'status' | 'requestedAt'>): Promise<LoanRequest | null> {
    try {
      // Tentar salvar no Supabase como purchase_request
      const { data: purchase, error } = await supabase
        .from('purchase_requests')
        .insert([{
          child_id: loanData.child_id,
          title: loanData.reason,
          description: `Empréstimo solicitado: ${loanData.reason}`,
          amount: loanData.amount,
          category: 'Empréstimo',
          status: 'pending'
        }])
        .select(`
          id,
          child_id,
          title,
          description,
          amount,
          category,
          status,
          created_at,
          children!inner(name)
        `)
        .single();

      if (error) {
        console.warn('⚠️ Erro no Supabase, salvando empréstimo no localStorage:', error.message);
        return this.createLoanRequestInLocalStorage(loanData);
      }

      const newLoanRequest: LoanRequest = {
        id: purchase.id,
        type: 'loan',
        child_id: purchase.child_id,
        child_name: (purchase.children as any)?.name || loanData.child_name,
        reason: purchase.title,
        category: 'Empréstimo',
        categoryIcon: '💰',
        amount: purchase.amount,
        status: purchase.status as 'pending',
        requestedAt: purchase.created_at,
      };

      console.log('✅ Pedido de empréstimo criado no Supabase:', newLoanRequest);
      
      // Também salvar no localStorage como backup
      this.addToLocalStorage(newLoanRequest);
      
      return newLoanRequest;
    } catch (error) {
      console.error('❌ Erro ao criar empréstimo no Supabase, usando localStorage:', error);
      return this.createLoanRequestInLocalStorage(loanData);
    }
  }

  // Aprovar ou rejeitar pedido de empréstimo
  static async updateLoanStatus(id: string, status: 'completed' | 'rejected', parentNote?: string): Promise<boolean> {
    try {
      // Tentar atualizar no Supabase primeiro
      const { error } = await supabase
        .from('purchase_requests')
        .update({
          status,
          parent_note: parentNote,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.warn('⚠️ Erro no Supabase, atualizando empréstimo no localStorage:', error.message);
        return this.updateLoanStatusInLocalStorage(id, status, parentNote);
      }

      console.log('✅ Status do empréstimo atualizado no Supabase:', { id, status });
      
      // Também atualizar no localStorage
      this.updateLoanStatusInLocalStorage(id, status, parentNote);
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar empréstimo no Supabase, usando localStorage:', error);
      return this.updateLoanStatusInLocalStorage(id, status, parentNote);
    }
  }

  // === MÉTODOS DE FALLBACK PARA LOCALSTORAGE ===

  private static getLoanRequestsFromLocalStorage(): LoanRequest[] {
    try {
      const stored = localStorage.getItem('familyPendingRequests');
      if (stored) {
        const allRequests = JSON.parse(stored);
        // Filtrar apenas empréstimos
        const loanRequests = allRequests.filter((req: any) => req.type === 'loan');
        console.log('📱 Pedidos de empréstimo carregados do localStorage:', loanRequests);
        return loanRequests;
      }
      return [];
    } catch (error) {
      console.error('❌ Erro ao ler empréstimos do localStorage:', error);
      return [];
    }
  }

  private static addToLocalStorage(loanRequest: LoanRequest): void {
    try {
      const existing = JSON.parse(localStorage.getItem('familyPendingRequests') || '[]');
      existing.unshift(loanRequest);
      localStorage.setItem('familyPendingRequests', JSON.stringify(existing));
      console.log('📱 Empréstimo salvo no localStorage');
    } catch (error) {
      console.error('❌ Erro ao salvar empréstimo no localStorage:', error);
    }
  }

  private static createLoanRequestInLocalStorage(loanData: Omit<LoanRequest, 'id' | 'status' | 'requestedAt'>): LoanRequest {
    const newLoanRequest: LoanRequest = {
      ...loanData,
      id: Date.now().toString(),
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    this.addToLocalStorage(newLoanRequest);
    console.log('📱 Pedido de empréstimo criado no localStorage:', newLoanRequest);
    
    return newLoanRequest;
  }

  private static updateLoanStatusInLocalStorage(id: string, status: 'completed' | 'rejected', parentNote?: string): boolean {
    try {
      const requests = JSON.parse(localStorage.getItem('familyPendingRequests') || '[]');
      const index = requests.findIndex((req: LoanRequest) => req.id === id);
      
      if (index === -1) return false;
      
      requests[index] = {
        ...requests[index],
        status,
        parent_note: parentNote,
        ...(status === 'completed' && { approvedAt: new Date().toISOString() }),
        ...(status === 'rejected' && { rejectedAt: new Date().toISOString() })
      };
      
      localStorage.setItem('familyPendingRequests', JSON.stringify(requests));
      console.log('📱 Status do empréstimo atualizado no localStorage:', { id, status });
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar empréstimo no localStorage:', error);
      return false;
    }
  }
}