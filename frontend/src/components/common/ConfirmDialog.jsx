import { useState, useEffect } from 'react';
import { Modal } from './Modal';

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

  useEffect(() => {
    if (isOpen) {
      setMessageText('');
    }
  }, [isOpen]);
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} maxWidth="max-w-md">
      <h3 className="headline-lg tracking-[-0.02em] text-primary mb-4">{title}</h3>
      <p className="body-md text-text-muted mb-6 leading-relaxed">
        {message}
      </p>
      {requireMessage && (
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder={messagePlaceholder}
          disabled={isPending}
          rows={3}
          className="w-full bg-surface-dim border border-border-subtle rounded-md px-4 py-3 body-md text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all mb-6 resize-none"
        />
      )}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={onCancel}
          disabled={isPending}
          className="btn-secondary px-4 py-2"
        >
          {cancelText}
        </button>
        <button
          onClick={() => onConfirm(messageText)}
          disabled={isPending || (requireMessage && !messageText.trim())}
          className={`btn-primary px-4 py-2 ${
            isDangerous
              ? '!bg-error-container !text-error border !border-error/20 hover:!bg-error/20'
              : ''
          }`}
        >
          {isPending ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
