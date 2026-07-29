import { forwardRef } from 'react';

const baseClasses =
  'w-full bg-surface-dim border border-border-subtle text-primary placeholder-text-muted rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all';

/**
 * Styled text input with consistent theming.
 */
export const Input = forwardRef(function Input({ className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`${baseClasses} px-4 py-3 text-sm sm:text-base ${className}`}
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
      className={`${baseClasses} px-4 py-3 text-sm sm:text-base resize-none ${className}`}
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
      className={`${baseClasses} px-4 py-3 text-sm sm:text-base appearance-none ${className}`}
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
        <label htmlFor={htmlFor} className="block text-sm font-semibold text-primary mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-error">{error}</p>}
    </div>
  );
}
