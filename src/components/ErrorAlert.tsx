import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div id="error-alert" className="rounded bg-red-950/20 border border-red-800/60 p-4 text-xs text-red-400 flex items-start gap-3 justify-between animate-fade-in">
      <div className="flex items-center gap-3">
        <AlertCircle size={16} className="flex-shrink-0 text-red-500" />
        <span className="font-light tracking-wide">{message}</span>
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          className="text-red-400 hover:text-red-300 p-0.5 rounded transition-colors cursor-pointer"
          title="Dismiss alert"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
