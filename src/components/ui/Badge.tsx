import React from 'react';

export type BadgeVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'neutral',
      size = 'md',
      dot = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = `
      inline-flex items-center gap-1.5
      font-semibold rounded-full
      transition-all duration-200
    `;

    // Variant styles
    const variantStyles = {
      primary: 'bg-primary text-bg-primary',
      success: 'bg-success text-white',
      warning: 'bg-warning text-white',
      error: 'bg-error text-white',
      info: 'bg-info text-white',
      neutral: 'bg-bg-secondary text-text-primary border border-border',
    };

    // Size styles
    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    // Dot size
    const dotSize = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5',
    };

    const computedClassName = `
      ${baseStyles}
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${className}
    `.trim();

    return (
      <span ref={ref} className={computedClassName} {...props}>
        {dot && (
          <span
            className={`rounded-full bg-current ${dotSize[size]}`}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

/**
 * BadgeGroup — Agrupa múltiplos badges
 */
export interface BadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  wrap?: boolean;
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({
  wrap = true,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`flex items-center gap-2 ${wrap ? 'flex-wrap' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

BadgeGroup.displayName = 'BadgeGroup';
