import { PersistentStorage } from '@/lib/storage/persistent-storage';

interface FamilySettings {
  savingsInterestRate: number;
  interestEnabled: boolean;
  interestApplicationDay: number;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  timestamp: string;
  balanceAfter?: number;
}

export class InterestService {
  
  /**
   * Verifica se é hora de aplicar rendimentos para todas as crianças
   */
  static checkAndApplyInterest(): boolean {
    const settings: FamilySettings | null = PersistentStorage.safeRead('familySettings');
    
    if (!settings || !settings.interestEnabled) {
      return false;
    }

    const today = new Date();
    const shouldApply = this.shouldApplyInterestToday(today, settings.interestApplicationDay);
    
    if (!shouldApply) {
      return false;
    }

    // Verifica se já foi aplicado este mês
    const lastApplication = PersistentStorage.safeRead('lastInterestApplication');
    const currentMonth = today.getFullYear() * 12 + today.getMonth();
    
    if (lastApplication && lastApplication.month === currentMonth) {
      return false; // Já foi aplicado este mês
    }

    // Aplicar rendimento para todas as crianças
    const applied = this.applyInterestToAllChildren(settings);
    
    if (applied) {
      // Registrar que foi aplicado
      PersistentStorage.safeWrite('lastInterestApplication', {
        month: currentMonth,
        date: today.toISOString(),
        rate: settings.savingsInterestRate
      });
    }
    
    return applied;
  }

  /**
   * Verifica se hoje é o dia de aplicar rendimentos
   */
  private static shouldApplyInterestToday(today: Date, applicationDay: number): boolean {
    if (applicationDay === 30) {
      // Último dia do mês
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      return today.getDate() === lastDayOfMonth;
    } else {
      // Dia específico do mês
      return today.getDate() === applicationDay;
    }
  }

  /**
   * Aplica rendimentos para todas as crianças
   */
  private static applyInterestToAllChildren(settings: FamilySettings): boolean {
    try {
      // Encontrar todas as crianças que têm dados
      const allKeys = Object.keys(localStorage);
      const childTransactionKeys = allKeys.filter(key => key.match(/^child-\d+-transactions$/));
      
      let anyInterestApplied = false;
      
      childTransactionKeys.forEach(key => {
        const match = key.match(/^child-(\d+)-transactions$/);
        if (match) {
          const childId = match[1];
          const interestApplied = this.applyInterestToChild(childId, settings.savingsInterestRate);
          if (interestApplied) {
            anyInterestApplied = true;
          }
        }
      });
      
      return anyInterestApplied;
    } catch (error) {
      console.error('Error applying interest to children:', error);
      return false;
    }
  }

  /**
   * Aplica rendimento para uma criança específica
   */
  private static applyInterestToChild(childId: string, interestRate: number): boolean {
    try {
      const transactions = JSON.parse(localStorage.getItem(`child-${childId}-transactions`) || '[]');
      
      // Calcular saldo mínimo do mês passado
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const minimumBalance = this.calculateMinimumBalanceForMonth(transactions, oneMonthAgo);
      
      if (minimumBalance <= 0) {
        return false; // Não há saldo para render
      }
      
      // Calcular rendimento
      const interestAmount = minimumBalance * (interestRate / 100);
      
      if (interestAmount < 0.01) {
        return false; // Rendimento muito pequeno (menos de 1 centavo)
      }
      
      // Criar transação de rendimento
      const interestTransaction: Transaction = {
        id: Date.now() + Math.random(),
        type: 'interest_earned',
        amount: parseFloat(interestAmount.toFixed(2)),
        description: `🏦 Rendimento da poupança (${interestRate}% sobre R$ ${minimumBalance.toFixed(2)})`,
        timestamp: new Date().toISOString()
      };
      
      // Adicionar à lista de transações
      transactions.push(interestTransaction);
      localStorage.setItem(`child-${childId}-transactions`, JSON.stringify(transactions));
      
      // Disparar evento para atualizar dashboards
      window.dispatchEvent(new StorageEvent('storage', {
        key: `child-${childId}-transactions`,
        newValue: JSON.stringify(transactions)
      }));
      
      console.log(`💰 Interest applied to child ${childId}: R$ ${interestAmount.toFixed(2)} (${interestRate}% of R$ ${minimumBalance.toFixed(2)})`);
      
      return true;
    } catch (error) {
      console.error(`Error applying interest to child ${childId}:`, error);
      return false;
    }
  }

  /**
   * Calcula o saldo mínimo que ficou durante um mês
   */
  private static calculateMinimumBalanceForMonth(transactions: Transaction[], targetMonth: Date): number {
    // Transações base padrão (mesmo do dashboard)
    const baseTransactions = [
      { amount: 25, timestamp: '2024-08-12T10:00:00Z' },
      { amount: -12.50, timestamp: '2024-08-11T14:30:00Z' },
      { amount: 25, timestamp: '2024-08-05T10:00:00Z' },
      { amount: 5, timestamp: '2024-08-03T18:00:00Z' },
      { amount: 50, timestamp: '2024-08-01T10:00:00Z' }
    ];
    
    // Combinar e ordenar transações
    const allTransactions = [...baseTransactions, ...transactions]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Encontrar início e fim do mês
    const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59);
    
    // Calcular saldo no início do mês
    let balanceAtMonthStart = 0;
    for (const transaction of allTransactions) {
      const transactionDate = new Date(transaction.timestamp);
      if (transactionDate < monthStart) {
        balanceAtMonthStart += transaction.amount;
      } else {
        break;
      }
    }
    
    // Calcular saldo mínimo durante o mês
    let runningBalance = balanceAtMonthStart;
    let minimumBalance = balanceAtMonthStart;
    
    for (const transaction of allTransactions) {
      const transactionDate = new Date(transaction.timestamp);
      
      if (transactionDate >= monthStart && transactionDate <= monthEnd) {
        runningBalance += transaction.amount;
        minimumBalance = Math.min(minimumBalance, runningBalance);
      }
    }
    
    return Math.max(0, minimumBalance); // Nunca retornar negativo
  }

  /**
   * Calcula o próximo rendimento estimado para uma criança
   */
  static calculateEstimatedInterest(childId: string): { amount: number; baseAmount: number; rate: number } | null {
    try {
      const settings: FamilySettings | null = PersistentStorage.safeRead('familySettings');
      
      if (!settings || !settings.interestEnabled) {
        return null;
      }
      
      const transactions = JSON.parse(localStorage.getItem(`child-${childId}-transactions`) || '[]');
      const currentMonth = new Date();
      
      const minimumBalance = this.calculateMinimumBalanceForMonth(transactions, currentMonth);
      const estimatedInterest = minimumBalance * (settings.savingsInterestRate / 100);
      
      return {
        amount: parseFloat(estimatedInterest.toFixed(2)),
        baseAmount: minimumBalance,
        rate: settings.savingsInterestRate
      };
    } catch (error) {
      console.error('Error calculating estimated interest:', error);
      return null;
    }
  }

  /**
   * Aplica rendimento manualmente (para testes)
   */
  static applyInterestManually(childId: string): boolean {
    const settings: FamilySettings | null = PersistentStorage.safeRead('familySettings');
    
    if (!settings || !settings.interestEnabled) {
      return false;
    }
    
    return this.applyInterestToChild(childId, settings.savingsInterestRate);
  }
}