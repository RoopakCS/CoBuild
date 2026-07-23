import { useState, useEffect } from 'react';
import { Modal } from './Modal';

/**
 * Confirmation dialog built on the shared Modal. Drop-in replacement for the old ConfirmModal.
 *
 * @param {{ isOpen: boolean, title: string, message: string, onConfirm: () => void, onCancel: () => void, confirmText?: string, cancelText?: string, isDangerous?: boolean, isPending?: boolean }} props
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = true,
  isPending = false,
  requireMessage = false,
  messagePlaceholder = 'Enter your reason here...',
}) {
  const [messageText, setMessageText] = useState('');

  // Reset text when modal opens
  useEffect(() => {
    if (isOpen) {
      setMessageText('');
    }
  }, [isOpen]);
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} maxWidth="max-w-md">
      <h3 className="text-xl font-bold text-slate-100 font-display mb-3">{title}</h3>
      <p className="text-slate-400 text-sm sm:text-base mb-6 leading-relaxed">
        {message}
      </p>
      {requireMessage && (
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder={messagePlaceholder}
          disabled={isPending}
          rows={3}
          className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-200 mb-6 resize-none shadow-inner"
        />
      )}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={onCancel}
          disabled={isPending}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all duration-200 disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={() => onConfirm(messageText)}
          disabled={isPending || (requireMessage && !messageText.trim())}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${
            isDangerous
              ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 shadow-red-500/10'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
          }`}
        >
          {isPending ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
