import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  emoji?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  emoji,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}
    >
      {/* Icon/Emoji */}
      <div className="mb-4">
        {emoji && <div className="text-6xl mb-2">{emoji}</div>}
        {icon && <div className="text-text-secondary">{icon}</div>}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-text-secondary max-w-md mb-6">{description}</p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';

/**
 * EmptyStateVariants — Variações pré-configuradas
 */

export const NoDataEmptyState: React.FC<{
  title?: string;
  description?: string;
  onRefresh?: () => void;
}> = ({
  title = 'Nenhum dado encontrado',
  description = 'Não há dados para exibir no momento.',
  onRefresh,
}) => {
  return (
    <EmptyState
      emoji="📭"
      title={title}
      description={description}
      {...(onRefresh && {
        action: {
          label: 'Atualizar',
          onClick: onRefresh,
          variant: 'secondary' as const,
        },
      })}
    />
  );
};

export const NoResultsEmptyState: React.FC<{
  searchTerm?: string;
  onClearFilters?: () => void;
}> = ({ searchTerm, onClearFilters }) => {
  return (
    <EmptyState
      emoji="🔍"
      title="Nenhum resultado encontrado"
      description={
        searchTerm
          ? `Não encontramos resultados para "${searchTerm}". Tente ajustar seus filtros.`
          : 'Tente ajustar os filtros para encontrar o que procura.'
      }
      {...(onClearFilters && {
        action: {
          label: 'Limpar filtros',
          onClick: onClearFilters,
          variant: 'secondary' as const,
        },
      })}
    />
  );
};

export const ErrorEmptyState: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
}> = ({
  title = 'Algo deu errado',
  description = 'Não foi possível carregar os dados. Tente novamente.',
  onRetry,
}) => {
  return (
    <EmptyState
      emoji="⚠️"
      title={title}
      description={description}
      {...(onRetry && {
        action: {
          label: 'Tentar novamente',
          onClick: onRetry,
          variant: 'primary' as const,
        },
      })}
    />
  );
};

export const CreateFirstEmptyState: React.FC<{
  resourceName: string;
  description?: string;
  onCreate: () => void;
  emoji?: string;
}> = ({ resourceName, description, onCreate, emoji = '✨' }) => {
  return (
    <EmptyState
      emoji={emoji}
      title={`Crie seu primeiro ${resourceName}`}
      description={
        description || `Comece criando seu primeiro ${resourceName}.`
      }
      action={{
        label: `Criar ${resourceName}`,
        onClick: onCreate,
        variant: 'primary',
      }}
    />
  );
};
