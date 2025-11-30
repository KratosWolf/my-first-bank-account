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
        annual_rate: config.annual_rate,
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
          annual_rate: updates.annual_rate || 9.9,
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
    annualRate: number,
    frequency: 'daily' | 'weekly' | 'monthly'
  ): {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  } {
    // Converter taxa anual para decimal
    const rateDecimal = annualRate / 100;

    // Calcular rendimentos para cada período
    const yearly = balance * rateDecimal;
    const monthly = yearly / 12;
    const weekly = yearly / 52;
    const daily = yearly / 365;

    return {
      daily: Math.round(daily * 100) / 100,
      weekly: Math.round(weekly * 100) / 100,
      monthly: Math.round(monthly * 100) / 100,
      yearly: Math.round(yearly * 100) / 100,
    };
  }

  // Validar taxa de juros (considerando limitação de schema)
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

    if (rate > 9.9) {
      return {
        isValid: false,
        error: 'Taxa máxima permitida: 9.9%',
        warning:
          'O banco de dados atual aceita apenas taxas até 9.9%. Para usar taxas maiores, execute a migração 003_fix_interest_config_columns.sql',
      };
    }

    if (rate === 0) {
      return {
        isValid: true,
        warning: 'Taxa de 0% significa que não haverá rendimento',
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

    if (balance > 9.9) {
      return {
        isValid: false,
        error: 'Saldo mínimo máximo permitido: R$ 9.90',
        warning:
          'O banco de dados atual aceita apenas valores até R$ 9.90. Para usar valores maiores, execute a migração 003_fix_interest_config_columns.sql',
      };
    }

    if (balance === 0) {
      return {
        isValid: true,
        warning:
          'Saldo mínimo de R$ 0 significa que qualquer valor renderá juros',
      };
    }

    return { isValid: true };
  }
}
