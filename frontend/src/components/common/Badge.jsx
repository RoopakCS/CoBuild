/**
 * Reusable badge/chip component for status tags, skill tags, capacity indicators.
 *
 * @param {{ variant?: 'success'|'warning'|'danger'|'neutral'|'info', size?: 'sm'|'md', children: React.ReactNode, className?: string }} props
 */
export function Badge({ variant = 'neutral', size = 'sm', children, className = '' }) {
  const variants = {
    success: 'bg-green-500/15 text-green-400 border-green-500/25',
    warning: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
    danger:  'bg-red-500/15 text-red-400 border-red-500/25',
    neutral: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
    info:    'bg-blue-500/15 text-blue-400 border-blue-500/25',
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
