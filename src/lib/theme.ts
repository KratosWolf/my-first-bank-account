/**
 * TEMA CENTRALIZADO — My First Bank Account
 *
 * Paleta de cores aprovada para Fase 2 (Redesign Visual)
 * Referências: ArobixBank (profissional para pais) + Porquinho (lúdico para crianças)
 */

export const theme = {
  /**
   * CORES PRINCIPAIS
   */
  colors: {
    // Backgrounds
    background: {
      primary: '#0D2818', // Verde escuro — background principal
      secondary: '#1A4731', // Verde médio — background secundário
      card: '#1A4731CC', // Verde com transparência — cards/containers
    },

    // Cores de ação
    primary: {
      DEFAULT: '#F5B731', // Amarelo/dourado — CTAs, destaques
      light: '#FFD966', // Amarelo claro — hover, secundário
      dark: '#D69E1F', // Amarelo escuro — pressed state
    },

    // Cores de feedback
    success: '#22C55E', // Verde claro — operações positivas
    error: '#EF4444', // Vermelho — erros, ações destrutivas
    warning: '#F59E0B', // Laranja — alertas
    info: '#3B82F6', // Azul — informações neutras

    // Textos
    text: {
      primary: '#FFFFFF', // Branco — texto principal
      secondary: '#FFFFFFB3', // Branco 70% opacidade — texto secundário
      muted: '#FFFFFF66', // Branco 40% opacidade — texto desabilitado
    },

    // Utilitários
    border: '#FFFFFF1A', // Branco 10% opacidade — bordas sutis
    overlay: '#0D281899', // Verde escuro com transparência — overlays/modals
    transparent: 'transparent',
  },

  /**
   * TIPOGRAFIA
   */
  typography: {
    fontFamily: {
      base: 'var(--font-inter)',
      heading: 'var(--font-poppins)',
    },
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem', // 48px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  /**
   * ESPAÇAMENTO
   */
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
    '4xl': '6rem', // 96px
  },

  /**
   * BORDAS E RAIOS
   */
  borderRadius: {
    sm: '0.25rem', // 4px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px', // Círculo completo
  },

  /**
   * SOMBRAS
   */
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },

  /**
   * TRANSIÇÕES
   */
  transitions: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },

  /**
   * BREAKPOINTS (para referência)
   */
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

/**
 * TIPO EXPORTADO (para autocomplete)
 */
export type Theme = typeof theme;

/**
 * HELPER: Gera gradiente da paleta principal
 */
export const gradients = {
  primary: `linear-gradient(135deg, ${theme.colors.primary.DEFAULT} 0%, ${theme.colors.primary.light} 100%)`,
  background: `linear-gradient(180deg, ${theme.colors.background.primary} 0%, ${theme.colors.background.secondary} 100%)`,
  card: `linear-gradient(135deg, ${theme.colors.background.card} 0%, ${theme.colors.background.secondary} 100%)`,
} as const;
