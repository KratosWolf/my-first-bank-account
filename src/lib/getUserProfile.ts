import { supabase } from './supabase';

/**
 * Interface do perfil do usuário retornado pela consulta
 */
export interface UserProfile {
  id: string;
  email: string;
  role: 'parent' | 'child';
  name: string;
  familyId: string;
  childId: string | null;
  avatar: string;
  // Dados adicionais quando é criança
  childName?: string;
  childBalance?: number;
  childPin?: string;
  familyName?: string;
}

/**
 * Busca o perfil do usuário na tabela user_links pelo email
 *
 * @param email - Email do usuário logado (Google OAuth)
 * @returns UserProfile ou null se não encontrado
 */
export async function getUserProfile(
  email: string
): Promise<UserProfile | null> {
  try {
    console.log('🔍 Buscando perfil para:', email);

    // Consultar usando a função SQL get_user_by_email
    const { data, error } = await supabase.rpc('get_user_by_email', {
      user_email: email,
    });

    if (error) {
      console.error('❌ Erro ao buscar perfil:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ Nenhum perfil encontrado para:', email);
      return null;
    }

    const profile = data[0];

    const userProfile: UserProfile = {
      id: profile.id,
      email: profile.email,
      role: profile.role as 'parent' | 'child',
      name: profile.name,
      familyId: profile.family_id,
      childId: profile.child_id,
      avatar: profile.avatar || '👤',
      childName: profile.child_name,
      childBalance: profile.child_balance,
      childPin: profile.child_pin,
      familyName: profile.family_name,
    };

    console.log('✅ Perfil encontrado:', {
      name: userProfile.name,
      role: userProfile.role,
      familyId: userProfile.familyId,
    });

    return userProfile;
  } catch (err) {
    console.error('💥 Exceção ao buscar perfil:', err);
    return null;
  }
}

/**
 * Busca o perfil do usuário usando consulta direta (fallback)
 *
 * @param email - Email do usuário logado
 * @returns UserProfile ou null se não encontrado
 */
export async function getUserProfileDirect(
  email: string
): Promise<UserProfile | null> {
  try {
    console.log('🔍 Buscando perfil (direto) para:', email);

    const { data, error } = await supabase
      .from('user_links')
      .select(
        `
        id,
        email,
        role,
        name,
        family_id,
        child_id,
        avatar,
        children (
          name,
          balance,
          pin
        ),
        families (
          parent_name
        )
      `
      )
      .eq('email', email)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar perfil (direto):', error);
      return null;
    }

    if (!data) {
      console.warn('⚠️ Nenhum perfil encontrado (direto) para:', email);
      return null;
    }

    const userProfile: UserProfile = {
      id: data.id,
      email: data.email,
      role: data.role as 'parent' | 'child',
      name: data.name,
      familyId: data.family_id,
      childId: data.child_id,
      avatar: data.avatar || '👤',
      childName: (data.children as any)?.name,
      childBalance: (data.children as any)?.balance,
      childPin: (data.children as any)?.pin,
      familyName: (data.families as any)?.parent_name,
    };

    console.log('✅ Perfil encontrado (direto):', {
      name: userProfile.name,
      role: userProfile.role,
      familyId: userProfile.familyId,
    });

    return userProfile;
  } catch (err) {
    console.error('💥 Exceção ao buscar perfil (direto):', err);
    return null;
  }
}
