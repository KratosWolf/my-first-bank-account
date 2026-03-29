// Serviço para gerenciar configurações de mesada automática - CONECTADO AO SUPABASE
import { supabase } from '../supabase';
import type { AllowanceConfig, Child } from '../supabase';

// Tipo para criar/atualizar configurações (sem id, created_at, updated_at)
export type AllowanceConfigInput = Omit<
  AllowanceConfig,
  'id' | 'created_at' | 'updated_at'
>;

// Interface estendida com dados da criança
export interface AllowanceConfigWithChild extends AllowanceConfig {
  child?: Child;
}

export class AllowanceService {
  // Carregar todas as configurações de mesada do Supabase
  static async getAllConfigs(): Promise<AllowanceConfigWithChild[]> {
    try {
      const { data, error } = await supabase
        .from('allowance_config')
        .select(
          `
          *,
          children (*)
        `
        )
        .order('children(name)');

      if (error) {
        console.error('❌ Erro ao carregar configurações de mesada:', error);
        throw error;
      }

      return (data || []) as AllowanceConfigWithChild[];
    } catch (error) {
      console.error('❌ Erro ao buscar configurações:', error);
      return [];
    }
  }

  // Buscar configuração por child_id
  static async getConfigByChildId(
    childId: string
  ): Promise<AllowanceConfig | null> {
    try {
      const { data, error } = await supabase
        .from('allowance_config')
        .select('*')
        .eq('child_id', childId)
        .single();

      if (error) {
        // Erro 406 significa que não encontrou - isso é ok
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('❌ Erro ao buscar configuração:', error);
        throw error;
      }

      return data as AllowanceConfig;
    } catch (error) {
      console.error('❌ Erro ao buscar configuração:', error);
      return null;
    }
  }

  // Atualizar configuração existente
  static async updateConfig(
    childId: string,
    updates: Partial<AllowanceConfigInput>
  ): Promise<AllowanceConfig | null> {
    try {
      // Calcular next_payment_date se mudou frequência ou dia
      let nextPaymentDate = updates.next_payment_date;
      if (
        updates.frequency ||
        updates.day_of_week !== undefined ||
        updates.day_of_month !== undefined
      ) {
        const config = await this.getConfigByChildId(childId);
        if (config) {
          nextPaymentDate = this.calculateNextPaymentDate({
            ...config,
            ...updates,
          } as AllowanceConfig);
        }
      }

      const { data, error } = await supabase
        .from('allowance_config')
        .update({
          ...updates,
          next_payment_date: nextPaymentDate,
          updated_at: new Date().toISOString(),
        })
        .eq('child_id', childId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar configuração:', error);
        throw error;
      }

      return data as AllowanceConfig;
    } catch (error) {
      console.error('❌ Erro ao atualizar configuração:', error);
      return null;
    }
  }

  // Criar nova configuração
  static async createConfig(
    config: AllowanceConfigInput
  ): Promise<AllowanceConfig | null> {
    try {
      // Calcular next_payment_date
      const nextPaymentDate = this.calculateNextPaymentDate(
        config as AllowanceConfig
      );

      const newConfig = {
        child_id: config.child_id,
        amount: config.amount,
        frequency: config.frequency,
        day_of_week: config.day_of_week,
        day_of_month: config.day_of_month,
        is_active: config.is_active,
        next_payment_date: nextPaymentDate,
      };

      const { data, error } = await supabase
        .from('allowance_config')
        .insert([newConfig])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar configuração:', error);
        throw error;
      }

      return data as AllowanceConfig;
    } catch (error) {
      console.error('❌ Erro ao criar configuração:', error);
      return null;
    }
  }

  // Upsert (criar ou atualizar)
  static async upsertConfig(
    childId: string,
    updates: Partial<AllowanceConfigInput>
  ): Promise<AllowanceConfig | null> {
    try {
      // Verificar se já existe
      const existing = await this.getConfigByChildId(childId);

      if (existing) {
        // Atualizar
        return await this.updateConfig(childId, updates);
      } else {
        // Criar
        const fullConfig: AllowanceConfigInput = {
          child_id: childId,
          amount: updates.amount || 0,
          frequency: updates.frequency || 'weekly',
          day_of_week: updates.day_of_week || 0,
          day_of_month: updates.day_of_month || 1,
          is_active: updates.is_active !== undefined ? updates.is_active : true,
          next_payment_date: '',
        };
        return await this.createConfig(fullConfig);
      }
    } catch (error) {
      console.error('❌ Erro ao upsert configuração:', error);
      return null;
    }
  }

  // Desativar configuração de mesada
  static async deactivateConfig(childId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('allowance_config')
        .update({ is_active: false })
        .eq('child_id', childId);

      if (error) {
        console.error('❌ Erro ao desativar configuração:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao desativar configuração:', error);
      return false;
    }
  }

  // Ativar configuração de mesada
  static async activateConfig(childId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('allowance_config')
        .update({ is_active: true })
        .eq('child_id', childId);

      if (error) {
        console.error('❌ Erro ao ativar configuração:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao ativar configuração:', error);
      return false;
    }
  }

  // Calcular próxima data de pagamento
  static calculateNextPaymentDate(config: AllowanceConfig): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (config.frequency) {
      case 'daily':
        // Próximo dia (amanhã)
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];

      case 'weekly':
        // Próximo dia da semana
        const dayOfWeek = config.day_of_week || 0;
        const daysUntilNext = (dayOfWeek - today.getDay() + 7) % 7 || 7;
        const nextWeekly = new Date(today);
        nextWeekly.setDate(nextWeekly.getDate() + daysUntilNext);
        return nextWeekly.toISOString().split('T')[0];

      case 'biweekly':
        // Quinzenal: dias 1 e 15
        const currentDay = today.getDate();
        const nextBiweekly = new Date(today);

        if (currentDay < 1) {
          nextBiweekly.setDate(1);
        } else if (currentDay < 15) {
          nextBiweekly.setDate(15);
        } else {
          // Próximo mês, dia 1
          nextBiweekly.setMonth(nextBiweekly.getMonth() + 1);
          nextBiweekly.setDate(1);
        }

        return nextBiweekly.toISOString().split('T')[0];

      case 'monthly':
        // Próximo dia do mês
        const dayOfMonth = config.day_of_month || 1;
        const nextMonthly = new Date(today);

        if (today.getDate() >= dayOfMonth) {
          // Já passou neste mês, vai para o próximo
          nextMonthly.setMonth(nextMonthly.getMonth() + 1);
        }

        // Ajustar para o dia correto
        nextMonthly.setDate(dayOfMonth);

        // Validar se o mês tem esse dia (ex: 31 em fevereiro)
        if (nextMonthly.getDate() !== dayOfMonth) {
          // Se não tem, usar último dia do mês
          nextMonthly.setDate(0); // Volta para último dia do mês anterior
        }

        return nextMonthly.toISOString().split('T')[0];

      default:
        return '';
    }
  }

  // Obter descrição amigável da frequência
  static getFrequencyDescription(config: AllowanceConfig): string {
    switch (config.frequency) {
      case 'daily':
        return 'Todo dia';

      case 'weekly':
        const daysOfWeek = [
          'Domingo',
          'Segunda',
          'Terça',
          'Quarta',
          'Quinta',
          'Sexta',
          'Sábado',
        ];
        return `Toda ${daysOfWeek[config.day_of_week || 0]}`;

      case 'biweekly':
        return 'Quinzenal (dias 1 e 15)';

      case 'monthly':
        return `Todo dia ${config.day_of_month || 1} do mês`;

      default:
        return 'Não configurado';
    }
  }

  // Validar valor da mesada
  static validateAmount(amount: number): {
    isValid: boolean;
    error?: string;
    warning?: string;
  } {
    if (amount < 0) {
      return {
        isValid: false,
        error: 'Valor não pode ser negativo',
      };
    }

    if (amount === 0) {
      return {
        isValid: true,
        warning: 'Valor de R$ 0 significa que não haverá mesada',
      };
    }

    if (amount > 1000) {
      return {
        isValid: true,
        warning:
          'Valor muito alto para mesada. Tem certeza de que deseja configurar R$ ' +
          amount.toFixed(2) +
          '?',
      };
    }

    return { isValid: true };
  }

  // Validar configuração completa
  static validateConfig(config: Partial<AllowanceConfig>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar valor
    if (config.amount !== undefined) {
      const amountValidation = this.validateAmount(config.amount);
      if (!amountValidation.isValid && amountValidation.error) {
        errors.push(amountValidation.error);
      }
      if (amountValidation.warning) {
        warnings.push(amountValidation.warning);
      }
    }

    // Validar frequência
    if (
      config.frequency &&
      !['daily', 'weekly', 'biweekly', 'monthly'].includes(config.frequency)
    ) {
      errors.push('Frequência inválida');
    }

    // Validar dia da semana
    if (
      config.frequency === 'weekly' &&
      (config.day_of_week === undefined ||
        config.day_of_week < 0 ||
        config.day_of_week > 6)
    ) {
      errors.push('Dia da semana inválido (0-6)');
    }

    // Validar dia do mês
    if (
      config.frequency === 'monthly' &&
      (config.day_of_month === undefined ||
        config.day_of_month < 1 ||
        config.day_of_month > 28)
    ) {
      errors.push('Dia do mês inválido (1-28)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
