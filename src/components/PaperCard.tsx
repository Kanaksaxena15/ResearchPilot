import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, Layers, Trash2, ArrowRight } from 'lucide-react';
import { Paper } from '../types';

interface PaperCardProps {
  paper: Paper;
  onDelete?: (e: React.MouseEvent, id: number) => void;
  deleteLoading?: boolean;
}

const formatPaperDate = (dateStr: string) => {
  try {
    if (!dateStr) return '';
    const formattedStr = dateStr.includes(' ') && !dateStr.includes('T') ? dateStr.replace(' ', 'T') : dateStr;
    const d = new Date(formattedStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
  } catch {
    return dateStr;
  }
};

export const PaperCard: React.FC<PaperCardProps> = ({ 
  paper, 
  onDelete, 
  deleteLoading = false 
}) => {
  return (
    <div 
      id={`paper-card-${paper.id}`}
      className="rounded bg-[#161616] border border-[#393939] hover:border-blue-600/60 p-5 space-y-4 flex flex-col justify-between transition-all group"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center bg-blue-950/30 border border-blue-900 rounded-sm">
            <FileText className="text-blue-400" size={18} />
          </div>
          {onDelete && (
            <button
              onClick={(e) => onDelete(e, paper.id)}
              disabled={deleteLoading}
              className="text-[#8d8d8d] hover:text-red-400 p-1.5 rounded transition-all cursor-pointer disabled:opacity-50"
              title="Delete paper"
            >
              <Trash2 size={14} className={deleteLoading ? 'animate-pulse' : ''} />
            </button>
          )}
        </div>

        <div className="space-y-1">
          <Link to={`/papers/${paper.id}`} className="block">
            <h4 className="font-sans font-bold text-sm text-white group-hover:text-blue-400 transition-all line-clamp-2 leading-snug">
              {paper.title}
            </h4>
          </Link>
          <p className="text-[11px] text-[#8d8d8d] font-mono truncate" title={paper.filename}>
            {paper.filename}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-[#262626] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-[10px] text-[#a8a8a8] font-mono">
          <div className="flex items-center gap-1">
            <Calendar size={11} className="text-[#8d8d8d]" />
            <span>{formatPaperDate(paper.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Layers size={11} className="text-[#8d8d8d]" />
            <span>{((paper.text_length || 0) / 6).toFixed(0)} words</span>
          </div>
        </div>

        <Link
          to={`/papers/${paper.id}`}
          className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          <span>Query</span>
          <ArrowRight size={10} className="transform group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
