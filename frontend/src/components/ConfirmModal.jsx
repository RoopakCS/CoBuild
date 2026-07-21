import React from 'react';

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isDangerous = true }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div 
        className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 sm:p-8 w-full max-w-sm shadow-2xl transform transition-all scale-100"
        role="dialog"
        aria-modal="true"
      >
        <h3 className="text-xl font-bold text-slate-50 mb-3">{title}</h3>
        <p className="text-slate-300 text-sm sm:text-base mb-8 leading-relaxed">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-bold text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              isDangerous
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'bg-green-500 text-slate-900 hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
