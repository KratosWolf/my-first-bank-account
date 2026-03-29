import { supabase } from '../supabase';

// ============================================================
// TIPOS - PEDIDOS DE EMPRÉSTIMO (purchase_requests)
// ============================================================
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

// ============================================================
// TIPOS - EMPRÉSTIMOS ATIVOS (loans)
// ============================================================
export interface Loan {
  id: string;
  child_id: string;
  purchase_request_id?: string;
  total_amount: number;
  installment_count: number;
  installment_amount: number;
  paid_amount: number;
  status: 'active' | 'paid_off' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// ============================================================
// TIPOS - PARCELAS DE EMPRÉSTIMO (loan_installments)
// ============================================================
export interface LoanInstallment {
  id: string;
  loan_id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  paid_date?: string;
  paid_from?: 'allowance' | 'manual' | 'gift';
  status: 'pending' | 'paid' | 'overdue';
  created_at: string;
}

// ============================================================
// TIPOS - DETALHES COMPLETOS DE EMPRÉSTIMO
// ============================================================
export interface LoanDetails extends Loan {
  installments: LoanInstallment[];
  child_name?: string;
}

export class LoanService {
  // Carregar todos os pedidos de empréstimo
  static async getLoanRequests(): Promise<LoanRequest[]> {
    try {
      // Primeiro tentar do Supabase usando a tabela purchase_requests
      const { data: purchases, error } = await supabase
        .from('purchase_requests')
        .select(
          `
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
        `
        )
        .eq('category', 'Empréstimo')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn(
          '⚠️ Supabase não disponível para empréstimos, usando localStorage:',
          error.message
        );
        return this.getLoanRequestsFromLocalStorage();
      }

      // Converter para formato de empréstimo
      const loanRequests: LoanRequest[] =
        purchases?.map(purchase => ({
          id: purchase.id,
          type: 'loan',
          child_id: purchase.child_id,
          child_name:
            (purchase.children as any)?.name || 'Criança Desconhecida',
          reason: purchase.title,
          category: 'Empréstimo',
          categoryIcon: '💰',
          amount: purchase.amount,
          status: purchase.status as 'pending' | 'completed' | 'rejected',
          requestedAt: purchase.created_at,
          approvedAt:
            purchase.updated_at !== purchase.created_at
              ? purchase.updated_at
              : undefined,
        })) || [];

      console.log(
        '✅ Pedidos de empréstimo carregados do Supabase:',
        loanRequests
      );

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
      console.error(
        '❌ Erro ao carregar empréstimos do Supabase, usando localStorage:',
        error
      );
      return this.getLoanRequestsFromLocalStorage();
    }
  }

  // Criar novo pedido de empréstimo
  static async createLoanRequest(
    loanData: Omit<LoanRequest, 'id' | 'status' | 'requestedAt'>
  ): Promise<LoanRequest | null> {
    try {
      // Tentar salvar no Supabase como purchase_request
      const { data: purchase, error } = await supabase
        .from('purchase_requests')
        .insert([
          {
            child_id: loanData.child_id,
            title: loanData.reason,
            description: `Empréstimo solicitado: ${loanData.reason}`,
            amount: loanData.amount,
            category: 'Empréstimo',
            status: 'pending',
          },
        ])
        .select(
          `
          id,
          child_id,
          title,
          description,
          amount,
          category,
          status,
          created_at,
          children!inner(name)
        `
        )
        .single();

      if (error) {
        console.warn(
          '⚠️ Erro no Supabase, salvando empréstimo no localStorage:',
          error.message
        );
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

      console.log(
        '✅ Pedido de empréstimo criado no Supabase:',
        newLoanRequest
      );

      // Também salvar no localStorage como backup
      this.addToLocalStorage(newLoanRequest);

      return newLoanRequest;
    } catch (error) {
      console.error(
        '❌ Erro ao criar empréstimo no Supabase, usando localStorage:',
        error
      );
      return this.createLoanRequestInLocalStorage(loanData);
    }
  }

  // Aprovar ou rejeitar pedido de empréstimo
  static async updateLoanStatus(
    id: string,
    status: 'completed' | 'rejected',
    parentNote?: string
  ): Promise<boolean> {
    try {
      // Tentar atualizar no Supabase primeiro
      const { error } = await supabase
        .from('purchase_requests')
        .update({
          status,
          parent_note: parentNote,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.warn(
          '⚠️ Erro no Supabase, atualizando empréstimo no localStorage:',
          error.message
        );
        return this.updateLoanStatusInLocalStorage(id, status, parentNote);
      }

      console.log('✅ Status do empréstimo atualizado no Supabase:', {
        id,
        status,
      });

      // Também atualizar no localStorage
      this.updateLoanStatusInLocalStorage(id, status, parentNote);

      return true;
    } catch (error) {
      console.error(
        '❌ Erro ao atualizar empréstimo no Supabase, usando localStorage:',
        error
      );
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
        const loanRequests = allRequests.filter(
          (req: any) => req.type === 'loan'
        );
        console.log(
          '📱 Pedidos de empréstimo carregados do localStorage:',
          loanRequests
        );
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
      const existing = JSON.parse(
        localStorage.getItem('familyPendingRequests') || '[]'
      );
      existing.unshift(loanRequest);
      localStorage.setItem('familyPendingRequests', JSON.stringify(existing));
      console.log('📱 Empréstimo salvo no localStorage');
    } catch (error) {
      console.error('❌ Erro ao salvar empréstimo no localStorage:', error);
    }
  }

  private static createLoanRequestInLocalStorage(
    loanData: Omit<LoanRequest, 'id' | 'status' | 'requestedAt'>
  ): LoanRequest {
    const newLoanRequest: LoanRequest = {
      ...loanData,
      id: Date.now().toString(),
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    this.addToLocalStorage(newLoanRequest);
    console.log(
      '📱 Pedido de empréstimo criado no localStorage:',
      newLoanRequest
    );

    return newLoanRequest;
  }

  private static updateLoanStatusInLocalStorage(
    id: string,
    status: 'completed' | 'rejected',
    parentNote?: string
  ): boolean {
    try {
      const requests = JSON.parse(
        localStorage.getItem('familyPendingRequests') || '[]'
      );
      const index = requests.findIndex((req: LoanRequest) => req.id === id);

      if (index === -1) return false;

      requests[index] = {
        ...requests[index],
        status,
        parent_note: parentNote,
        ...(status === 'completed' && { approvedAt: new Date().toISOString() }),
        ...(status === 'rejected' && { rejectedAt: new Date().toISOString() }),
      };

      localStorage.setItem('familyPendingRequests', JSON.stringify(requests));
      console.log('📱 Status do empréstimo atualizado no localStorage:', {
        id,
        status,
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar empréstimo no localStorage:', error);
      return false;
    }
  }

  // ============================================================
  // MÉTODOS PARA EMPRÉSTIMOS ATIVOS (loans)
  // ============================================================

  /**
   * Criar novo empréstimo com parcelas
   * @param childId ID da criança
   * @param purchaseRequestId ID do pedido de compra (opcional)
   * @param totalAmount Valor total do empréstimo
   * @param installmentCount Número de parcelas
   * @returns Empréstimo criado com parcelas
   */
  static async createLoan(
    childId: string,
    purchaseRequestId: string | null,
    totalAmount: number,
    installmentCount: number
  ): Promise<LoanDetails | null> {
    try {
      // Calcular valor da parcela
      const installmentAmount = parseFloat(
        (totalAmount / installmentCount).toFixed(2)
      );

      // Criar empréstimo
      const { data: loan, error: loanError } = await supabase
        .from('loans')
        .insert([
          {
            child_id: childId,
            purchase_request_id: purchaseRequestId,
            total_amount: totalAmount,
            installment_count: installmentCount,
            installment_amount: installmentAmount,
            paid_amount: 0,
            status: 'active',
          },
        ])
        .select()
        .single();

      if (loanError) {
        console.error('❌ Erro ao criar empréstimo:', loanError);
        return null;
      }

      // Criar parcelas
      const installments: Partial<LoanInstallment>[] = [];
      const today = new Date();

      for (let i = 1; i <= installmentCount; i++) {
        const dueDate = new Date(today);
        dueDate.setMonth(dueDate.getMonth() + i);

        installments.push({
          loan_id: loan.id,
          installment_number: i,
          amount: installmentAmount,
          due_date: dueDate.toISOString().split('T')[0], // YYYY-MM-DD
          status: 'pending',
        });
      }

      const { data: createdInstallments, error: installmentsError } =
        await supabase.from('loan_installments').insert(installments).select();

      if (installmentsError) {
        console.error('❌ Erro ao criar parcelas:', installmentsError);
        // Reverter criação do empréstimo
        await supabase.from('loans').delete().eq('id', loan.id);
        return null;
      }

      console.log('✅ Empréstimo criado com sucesso:', loan.id);

      return {
        ...loan,
        installments: createdInstallments || [],
      };
    } catch (error) {
      console.error('❌ Erro ao criar empréstimo:', error);
      return null;
    }
  }

  /**
   * Listar empréstimos de uma criança
   * @param childId ID da criança
   * @returns Lista de empréstimos
   */
  static async getLoansByChild(childId: string): Promise<Loan[]> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar empréstimos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar empréstimos:', error);
      return [];
    }
  }

  /**
   * Obter detalhes completos de um empréstimo
   * @param loanId ID do empréstimo
   * @returns Empréstimo com parcelas
   */
  static async getLoanDetails(loanId: string): Promise<LoanDetails | null> {
    try {
      // Buscar empréstimo
      const { data: loan, error: loanError } = await supabase
        .from('loans')
        .select(
          `
          *,
          children!inner(name)
        `
        )
        .eq('id', loanId)
        .single();

      if (loanError) {
        console.error('❌ Erro ao buscar empréstimo:', loanError);
        return null;
      }

      // Buscar parcelas
      const { data: installments, error: installmentsError } = await supabase
        .from('loan_installments')
        .select('*')
        .eq('loan_id', loanId)
        .order('installment_number', { ascending: true });

      if (installmentsError) {
        console.error('❌ Erro ao buscar parcelas:', installmentsError);
        return null;
      }

      return {
        ...loan,
        child_name: (loan.children as any)?.name,
        installments: installments || [],
      };
    } catch (error) {
      console.error('❌ Erro ao buscar detalhes do empréstimo:', error);
      return null;
    }
  }

  /**
   * Pagar uma parcela do empréstimo
   * @param installmentId ID da parcela
   * @param paidFrom Origem do pagamento ('allowance', 'manual', 'gift')
   * @returns true se pagamento bem-sucedido
   */
  static async payInstallment(
    installmentId: string,
    paidFrom: 'allowance' | 'manual' | 'gift'
  ): Promise<boolean> {
    try {
      // Buscar parcela
      const { data: installment, error: installmentError } = await supabase
        .from('loan_installments')
        .select('*, loans!inner(*)')
        .eq('id', installmentId)
        .single();

      if (installmentError || !installment) {
        console.error('❌ Erro ao buscar parcela:', installmentError);
        return false;
      }

      if (installment.status === 'paid') {
        console.warn('⚠️ Parcela já está paga');
        return false;
      }

      // Atualizar parcela como paga
      const { error: updateError } = await supabase
        .from('loan_installments')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString(),
          paid_from: paidFrom,
        })
        .eq('id', installmentId);

      if (updateError) {
        console.error('❌ Erro ao atualizar parcela:', updateError);
        return false;
      }

      // Atualizar valor pago do empréstimo
      const loan = (installment as any).loans;
      const newPaidAmount =
        parseFloat(loan.paid_amount) + parseFloat(installment.amount);
      const isFullyPaid = newPaidAmount >= parseFloat(loan.total_amount);

      const { error: loanUpdateError } = await supabase
        .from('loans')
        .update({
          paid_amount: newPaidAmount,
          status: isFullyPaid ? 'paid_off' : 'active',
        })
        .eq('id', installment.loan_id);

      if (loanUpdateError) {
        console.error('❌ Erro ao atualizar empréstimo:', loanUpdateError);
        return false;
      }

      console.log('✅ Parcela paga com sucesso:', installmentId);
      if (isFullyPaid) {
        console.log('🎉 Empréstimo quitado completamente!');
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao pagar parcela:', error);
      return false;
    }
  }

  /**
   * Cancelar um empréstimo (apenas parcelas pendentes)
   * @param loanId ID do empréstimo
   * @returns true se cancelamento bem-sucedido
   */
  static async cancelLoan(loanId: string): Promise<boolean> {
    try {
      // Verificar se há parcelas pagas
      const { data: paidInstallments, error: checkError } = await supabase
        .from('loan_installments')
        .select('id')
        .eq('loan_id', loanId)
        .eq('status', 'paid');

      if (checkError) {
        console.error('❌ Erro ao verificar parcelas:', checkError);
        return false;
      }

      if (paidInstallments && paidInstallments.length > 0) {
        console.warn(
          '⚠️ Não é possível cancelar empréstimo com parcelas pagas'
        );
        return false;
      }

      // Atualizar empréstimo como cancelado
      const { error: loanError } = await supabase
        .from('loans')
        .update({ status: 'cancelled' })
        .eq('id', loanId);

      if (loanError) {
        console.error('❌ Erro ao cancelar empréstimo:', loanError);
        return false;
      }

      // Cancelar parcelas pendentes
      const { error: installmentsError } = await supabase
        .from('loan_installments')
        .delete()
        .eq('loan_id', loanId)
        .eq('status', 'pending');

      if (installmentsError) {
        console.error('❌ Erro ao cancelar parcelas:', installmentsError);
        return false;
      }

      console.log('✅ Empréstimo cancelado com sucesso:', loanId);
      return true;
    } catch (error) {
      console.error('❌ Erro ao cancelar empréstimo:', error);
      return false;
    }
  }
}
