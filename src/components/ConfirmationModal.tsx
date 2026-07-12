import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete Permanently',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div id="confirmation-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fade-in">
      <div className="w-full max-w-md rounded bg-[#161616] border border-[#393939] p-6 space-y-6 shadow-2xl animate-scale-up">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-red-950/40 border border-red-900 rounded-sm">
            <AlertTriangle className="text-red-500" size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white font-sans">{title}</h3>
            <p className="text-xs text-[#a8a8a8] leading-relaxed font-light">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2 border-t border-[#262626]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-sm border border-[#393939] bg-neutral-900 px-4 py-2 text-xs text-[#e0e0e0] hover:bg-neutral-800 hover:border-neutral-700 transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-sm bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-semibold text-white transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {isLoading && (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
