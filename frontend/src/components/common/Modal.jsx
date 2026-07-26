import { useEffect, useRef } from 'react';
import { X } from '@phosphor-icons/react';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  const overlayRef = useRef(null);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-sm px-4 animate-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className={`surface-1 rounded-lg p-6 sm:p-8 w-full ${maxWidth} shadow-2xl animate-scale-in`}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <div className="flex items-center justify-between mb-6">
            <h3 className="headline-lg tracking-[-0.02em]">{title}</h3>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-primary transition-colors p-1 rounded hover:bg-surface-dim"
            >
              <X size={20} weight="bold" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
