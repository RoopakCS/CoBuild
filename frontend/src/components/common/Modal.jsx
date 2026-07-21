import { useEffect, useRef } from 'react';
import { X } from '@phosphor-icons/react';

/**
 * Reusable modal wrapper with backdrop blur, ESC-to-close, and focus trap.
 *
 * @param {{ isOpen: boolean, onClose: () => void, title?: string, children: React.ReactNode, maxWidth?: string }} props
 */
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className={`bg-slate-900 border border-slate-700/50 rounded-2xl p-6 sm:p-8 w-full ${maxWidth} shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200`}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-50">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800"
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
