/**
 * Reusable badge/chip component for status tags, skill tags, capacity indicators.
 *
 * @param {{ variant?: 'success'|'warning'|'danger'|'neutral'|'info', size?: 'sm'|'md', children: React.ReactNode, className?: string }} props
 */
export function Badge({ variant = 'neutral', size = 'sm', children, className = '' }) {
  const variants = {
    success: 'bg-success-green/10 text-success-green border-success-green/25',
    warning: 'bg-warning-amber/10 text-warning-amber border-warning-amber/25',
    danger:  'bg-error/10 text-error border-error/25',
    neutral: 'bg-surface-dim text-text-muted border-border-subtle',
    info:    'bg-tertiary/10 text-tertiary border-tertiary/25',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}
