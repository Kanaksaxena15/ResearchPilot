import React from 'react';
import { Inbox, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionPath?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No literature indexed yet',
  description = 'Start your project by uploading PDF documents to parse summaries and opportunities.',
  actionLabel = 'Upload First PDF',
  actionPath = '/upload',
}) => {
  return (
    <div id="empty-state" className="text-center py-12 px-6 max-w-md mx-auto space-y-6 flex flex-col items-center justify-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center bg-neutral-900 border border-[#393939] rounded-sm">
        <Inbox className="text-[#8d8d8d]" size={24} />
      </div>
      <div className="space-y-1.5">
        <h4 className="font-bold text-white text-base font-sans">{title}</h4>
        <p className="text-xs text-[#a8a8a8] leading-relaxed font-light">{description}</p>
      </div>
      {actionLabel && actionPath && (
        <div>
          <Link
            to={actionPath}
            className="inline-flex items-center gap-2 rounded-sm bg-blue-600 hover:bg-blue-700 px-5 py-3 text-xs font-semibold text-white tracking-wide transition-all cursor-pointer shadow-md shadow-blue-900/20"
          >
            <Upload size={13} />
            {actionLabel}
          </Link>
        </div>
      )}
    </div>
  );
};
