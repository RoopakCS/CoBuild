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
}) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} maxWidth="max-w-sm">
      <h3 className="text-xl font-bold text-slate-50 mb-3">{title}</h3>
      <p className="text-slate-300 text-sm sm:text-base mb-8 leading-relaxed">
        {message}
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          disabled={isPending}
          className="px-4 py-2 rounded-xl text-sm font-bold text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isPending}
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
