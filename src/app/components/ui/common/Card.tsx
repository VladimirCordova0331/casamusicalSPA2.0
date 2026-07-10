import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, hover = true, className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`
        bg-card border border-border rounded-lg p-4
        ${hover ? 'hover:border-accent/50 transition-colors' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = 'Card';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge = ({ 
  children, 
  variant = 'neutral',
  size = 'sm'
}: BadgeProps) => {
  const baseClasses = 'inline-flex items-center rounded-full font-semibold';
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-1 text-[10px]'
    : 'px-3 py-1.5 text-xs';
  
  const variantClasses = {
    success: 'bg-green-500/20 text-green-500',
    warning: 'bg-yellow-500/20 text-yellow-500',
    error: 'bg-red-500/20 text-red-500',
    info: 'bg-blue-500/20 text-blue-500',
    neutral: 'bg-muted text-muted-foreground',
  };

  return (
    <span className={`${baseClasses} ${sizeClasses} ${variantClasses[variant]}`}>
      {children}
    </span>
  );
};

interface StatProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export const Stat = ({ label, value, change, trend = 'neutral' }: StatProps) => (
  <div>
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5">
      {label}
    </p>
    <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
    {change && (
      <p className={`text-xs font-medium ${
        trend === 'up' ? 'text-green-500' : 
        trend === 'down' ? 'text-red-500' : 
        'text-muted-foreground'
      }`}>
        {change}
      </p>
    )}
  </div>
);
