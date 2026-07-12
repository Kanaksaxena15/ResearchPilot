import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Eye, Trash2 } from 'lucide-react';
import { Paper } from '../types';

interface PaperListProps {
  papers: Paper[];
  onDelete: (e: React.MouseEvent, id: number) => void;
  deleteLoadingId: number | null;
}

const formatPaperDate = (dateStr: string) => {
  try {
    if (!dateStr) return '';
    const formattedStr = dateStr.includes(' ') && !dateStr.includes('T') ? dateStr.replace(' ', 'T') : dateStr;
    const d = new Date(formattedStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleString();
  } catch {
    return dateStr;
  }
};

export const PaperList: React.FC<PaperListProps> = ({ 
  papers, 
  onDelete, 
  deleteLoadingId 
}) => {
  return (
    <div id="paper-list" className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#393939] text-[#8d8d8d] text-[11px] font-mono uppercase tracking-wider bg-neutral-900/50">
            <th className="py-3 px-6">Research Title</th>
            <th className="py-3 px-6">Ingested Date</th>
            <th className="py-3 px-6">Status Parameters</th>
            <th className="py-3 px-6 text-right">Workspace Controls</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#262626] bg-[#161616]">
          {papers.map((paper) => (
            <tr key={paper.id} className="hover:bg-neutral-800/40 transition-colors group">
              <td className="py-4 px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-blue-950/20 border border-blue-900/40 rounded-sm">
                    <FileText className="text-blue-400" size={14} />
                  </div>
                  <div className="max-w-md sm:max-w-lg lg:max-w-xl">
                    <Link to={`/papers/${paper.id}`} className="block font-bold text-sm text-white group-hover:text-blue-400 transition-all truncate">
                      {paper.title}
                    </Link>
                    <span className="block text-[10px] text-[#8d8d8d] truncate mt-0.5" title={paper.filename}>
                      {paper.filename}
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6 font-mono text-xs text-[#8d8d8d]">
                {formatPaperDate(paper.created_at)}
              </td>
              <td className="py-4 px-6">
                <div className="flex flex-wrap gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    paper.has_summary || paper.summary
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900' 
                      : 'bg-neutral-800 text-[#8d8d8d] border border-[#393939]'
                  }`}>
                    {paper.has_summary || paper.summary ? 'Summary Ingested' : 'No Summary'}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    paper.has_insights || paper.insights
                      ? 'bg-purple-950/40 text-purple-400 border border-purple-900' 
                      : 'bg-neutral-800 text-[#8d8d8d] border border-[#393939]'
                  }`}>
                    {paper.has_insights || paper.insights ? 'Insights Connected' : 'No Insights'}
                  </span>
                </div>
              </td>
              <td className="py-4 px-6 text-right">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    to={`/papers/${paper.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded bg-neutral-900 border border-[#393939] hover:border-blue-600 hover:text-blue-400 text-[#e0e0e0] transition-all"
                    title="Enter workspace"
                  >
                    <Eye size={13} />
                  </Link>
                  <button
                    onClick={(e) => onDelete(e, paper.id)}
                    disabled={deleteLoadingId === paper.id}
                    className="flex h-8 w-8 items-center justify-center rounded bg-neutral-900 border border-[#393939] hover:border-red-800 hover:text-red-400 text-[#8d8d8d] transition-all disabled:opacity-50 cursor-pointer"
                    title="Remove paper"
                  >
                    <Trash2 size={13} className={deleteLoadingId === paper.id ? 'animate-pulse' : ''} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
