// Serviço para gerenciar configurações de juros - CONECTADO AO SUPABASE
import { supabase } from '../supabase';
import type { InterestConfig, Child } from '../supabase';

// Tipo para criar/atualizar configurações (sem id, created_at)
export type InterestConfigInput = Omit<
  InterestConfig,
  'id' | 'created_at' | 'last_interest_date'
>;

// Interface estendida com dados da criança
export interface InterestConfigWithChild extends InterestConfig {
  child?: Child;
}

export class InterestService {
  // Carregar todas as configurações de juros do Supabase
  static async getAllConfigs(): Promise<InterestConfigWithChild[]> {
    try {
      const { data, error } = await supabase
        .from('interest_config')
        .select(
          `
          *,
          children (*)
        `
        )
        .order('children(name)');

      if (error) {
        console.error('❌ Erro ao carregar configurações de juros:', error);
        throw error;
      }

      console.log('💰 Configurações de juros carregadas:', data?.length || 0);
      return (data || []) as InterestConfigWithChild[];
    } catch (error) {
      console.error('❌ Erro ao buscar configurações:', error);
      return [];
    }
  }

  // Buscar configuração por child_id
  static async getConfigByChildId(
    childId: string
  ): Promise<InterestConfig | null> {
    try {
      const { data, error } = await supabase
        .from('interest_config')
        .select('*')
        .eq('child_id', childId)
        .single();

      if (error) {
        // Erro 406 significa que não encontrou - isso é ok
        if (error.code === 'PGRST116') {
          console.log('ℹ️  Nenhuma configuração de juros para child:', childId);
          return null;
        }
        console.error('❌ Erro ao buscar configuração:', error);
        throw error;
      }

      return data as InterestConfig;
    } catch (error) {
      console.error('❌ Erro ao buscar configuração:', error);
      return null;
    }
  }

  // Atualizar configuração existente
  static async updateConfig(
    childId: string,
    updates: Partial<InterestConfigInput>
  ): Promise<InterestConfig | null> {
    try {
      console.log('💰 Atualizando configuração de juros:', childId, updates);

      const { data, error } = await supabase
        .from('interest_config')
        .update(updates)
        .eq('child_id', childId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar configuração:', error);
        throw error;
      }

      console.log('✅ Configuração atualizada:', data);
      return data as InterestConfig;
    } catch (error) {
      console.error('❌ Erro ao atualizar configuração:', error);
      return null;
    }
  }

  // Criar nova configuração
  static async createConfig(
    config: InterestConfigInput
  ): Promise<InterestConfig | null> {
    try {
      console.log('💰 Criando nova configuração de juros:', config);

      const newConfig = {
        child_id: config.child_id,
        monthly_rate: config.monthly_rate,
        compound_frequency: config.compound_frequency,
        minimum_balance: config.minimum_balance,
        is_active: config.is_active,
      };

      const { data, error } = await supabase
        .from('interest_config')
        .insert([newConfig])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar configuração:', error);
        throw error;
      }

      console.log('✅ Nova configuração criada:', data);
      return data as InterestConfig;
    } catch (error) {
      console.error('❌ Erro ao criar configuração:', error);
      return null;
    }
  }

  // Upsert (criar ou atualizar)
  static async upsertConfig(
    childId: string,
    updates: Partial<InterestConfigInput>
  ): Promise<InterestConfig | null> {
    try {
      // Verificar se já existe
      const existing = await this.getConfigByChildId(childId);

      if (existing) {
        // Atualizar
        return await this.updateConfig(childId, updates);
      } else {
        // Criar
        const fullConfig: InterestConfigInput = {
          child_id: childId,
          monthly_rate: updates.monthly_rate || 9.9,
          compound_frequency: updates.compound_frequency || 'monthly',
          minimum_balance: updates.minimum_balance || 5.0,
          is_active: updates.is_active !== undefined ? updates.is_active : true,
        };
        return await this.createConfig(fullConfig);
      }
    } catch (error) {
      console.error('❌ Erro ao upsert configuração:', error);
      return null;
    }
  }

  // Desativar configuração de juros
  static async deactivateConfig(childId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('interest_config')
        .update({ is_active: false })
        .eq('child_id', childId);

      if (error) {
        console.error('❌ Erro ao desativar configuração:', error);
        throw error;
      }

      console.log('✅ Configuração desativada:', childId);
      return true;
    } catch (error) {
      console.error('❌ Erro ao desativar configuração:', error);
      return false;
    }
  }

  // Ativar configuração de juros
  static async activateConfig(childId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('interest_config')
        .update({ is_active: true })
        .eq('child_id', childId);

      if (error) {
        console.error('❌ Erro ao ativar configuração:', error);
        throw error;
      }

      console.log('✅ Configuração ativada:', childId);
      return true;
    } catch (error) {
      console.error('❌ Erro ao ativar configuração:', error);
      return false;
    }
  }

  // Calcular preview de rendimento
  static calculatePreview(
    balance: number,
    monthlyRate: number, // Taxa mensal em % (ex: 9.9)
    frequency: 'daily' | 'weekly' | 'monthly'
  ): {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  } {
    // Converter taxa mensal para decimal
    const monthlyDecimal = monthlyRate / 100;

    // Calcular rendimentos para cada período
    const monthly = balance * monthlyDecimal;
    const yearly = monthly * 12; // Juros compostos simples (aproximado)
    const weekly = monthly / 4.33; // ~4.33 semanas por mês
    const daily = monthly / 30; // ~30 dias por mês

    return {
      daily: Math.round(daily * 100) / 100,
      weekly: Math.round(weekly * 100) / 100,
      monthly: Math.round(monthly * 100) / 100,
      yearly: Math.round(yearly * 100) / 100,
    };
  }

  // Validar taxa de juros (0% a 100%)
  static validateRate(rate: number): {
    isValid: boolean;
    error?: string;
    warning?: string;
  } {
    if (rate < 0) {
      return {
        isValid: false,
        error: 'Taxa não pode ser negativa',
      };
    }

    if (rate > 100) {
      return {
        isValid: false,
        error: 'Taxa máxima permitida: 100%',
        warning:
          'Taxas acima de 100% ao mês podem causar crescimento exponencial extremo',
      };
    }

    if (rate === 0) {
      return {
        isValid: true,
        warning: 'Taxa de 0% significa que não haverá rendimento',
      };
    }

    if (rate > 20) {
      return {
        isValid: true,
        warning:
          'Taxa mensal acima de 20% resultará em crescimento muito rápido',
      };
    }

    return { isValid: true };
  }

  // Validar saldo mínimo
  static validateMinimumBalance(balance: number): {
    isValid: boolean;
    error?: string;
    warning?: string;
  } {
    if (balance < 0) {
      return {
        isValid: false,
        error: 'Saldo mínimo não pode ser negativo',
      };
    }

    if (balance === 0) {
      return {
        isValid: true,
        warning:
          'Saldo mínimo de R$ 0 significa que qualquer valor renderá juros',
      };
    }

    if (balance > 1000) {
      return {
        isValid: true,
        warning:
          'Saldo mínimo muito alto pode impedir que crianças recebam juros',
      };
    }

    return { isValid: true };
  }
}
