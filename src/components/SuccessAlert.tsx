import React from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessAlertProps {
  message: string;
  onClose?: () => void;
}

export const SuccessAlert: React.FC<SuccessAlertProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div id="success-alert" className="rounded bg-emerald-950/20 border border-emerald-800/60 p-4 text-xs text-emerald-400 flex items-start gap-3 justify-between animate-fade-in">
      <div className="flex items-center gap-3">
        <CheckCircle size={16} className="flex-shrink-0 text-emerald-500" />
        <span className="font-light tracking-wide">{message}</span>
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          className="text-emerald-400 hover:text-emerald-300 p-0.5 rounded transition-colors cursor-pointer"
          title="Dismiss alert"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
