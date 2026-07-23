import { forwardRef } from 'react';

const baseClasses =
  'w-full bg-slate-900/50 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all';

/**
 * Styled text input with consistent theming.
 */
export const Input = forwardRef(function Input({ className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`${baseClasses} p-3 sm:p-4 text-sm sm:text-base ${className}`}
      {...props}
    />
  );
});

/**
 * Styled textarea with consistent theming.
 */
export const Textarea = forwardRef(function Textarea({ className = '', ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={`${baseClasses} p-3 sm:p-4 text-sm sm:text-base resize-none ${className}`}
      {...props}
    />
  );
});

/**
 * Styled select with consistent theming.
 */
export const Select = forwardRef(function Select({ className = '', children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={`${baseClasses} p-3 sm:p-4 text-sm sm:text-base appearance-none ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});

/**
 * Form field wrapper with label.
 */
export function FormField({ label, htmlFor, required, error, children }) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-bold text-slate-300 mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-red-400">{error}</p>}
    </div>
  );
}
