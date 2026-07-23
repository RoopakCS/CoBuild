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
    <Modal isOpen={isOpen} onClose={onCancel} maxWidth="max-w-sm">
      <h3 className="text-xl font-bold text-slate-50 mb-3">{title}</h3>
      <p className="text-slate-300 text-sm sm:text-base mb-8 leading-relaxed">
        {message}
      </p>
      {requireMessage && (
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder={messagePlaceholder}
          disabled={isPending}
          rows={3}
          className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all mb-6 resize-none"
        />
      )}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          disabled={isPending}
          className="px-4 py-2 rounded-xl text-sm font-bold text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={() => onConfirm(messageText)}
          disabled={isPending || (requireMessage && !messageText.trim())}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${
            isDangerous
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              : 'bg-green-500 text-slate-900 hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/20'
          }`}
        >
          {isPending ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
