/**
 * Reusable badge/chip component for status tags, skill tags, capacity indicators.
 *
 * @param {{ variant?: 'success'|'warning'|'danger'|'neutral'|'info', size?: 'sm'|'md', children: React.ReactNode, className?: string }} props
 */
export function Badge({ variant = 'neutral', size = 'sm', children, className = '' }) {
  const variants = {
    success: 'bg-blue-600/15 text-blue-500 border-blue-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    danger:  'bg-red-500/15 text-red-400 border-red-500/25',
    neutral: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
    info:    'bg-blue-600/15 text-blue-500 border-blue-500/30',
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
