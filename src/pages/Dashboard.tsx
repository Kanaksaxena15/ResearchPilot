import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Paper } from '../types';
import { 
  FileText, 
  Upload, 
  ArrowRight, 
  FileCheck, 
  ShieldCheck, 
  Activity
} from 'lucide-react';

// Import newly created modular components
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { EmptyState } from '../components/EmptyState';
import { PaperList } from '../components/PaperList';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Confirmation Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [targetPaperId, setTargetPaperId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();

  const fetchPapers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/papers');
      setPapers(response.data.papers || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch research papers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const openDeleteModal = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setTargetPaperId(id);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!targetPaperId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/papers/${targetPaperId}`);
      setPapers((prev) => prev.filter((p) => p.id !== targetPaperId));
      setModalOpen(false);
      setTargetPaperId(null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete research paper');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Compute metrics
  const totalPapers = papers.length;
  const summarizedCount = papers.filter((p) => p.has_summary || p.summary).length;
  const insightedCount = papers.filter((p) => p.has_insights || p.insights).length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded bg-[#161616] border border-[#393939] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="font-mono text-xs text-blue-400 font-semibold tracking-widest uppercase">Research Assistant Control</span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, {user?.name || 'Researcher'}
          </h2>
          <p className="mt-1.5 text-sm text-[#a8a8a8] font-light max-w-xl">
            You have active cloud database indexing initialized. Feed PDFs to start extracting executive summaries, chatting with papers, and analyzing core opportunities.
          </p>
        </div>
        
        <Link
          to="/upload"
          className="flex-shrink-0 flex items-center gap-2 rounded-sm bg-blue-600 hover:bg-blue-700 px-5 py-3 text-sm font-semibold text-white tracking-wide transition-all shadow-md shadow-blue-900/20 cursor-pointer"
        >
          <Upload size={16} />
          Upload New Paper
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded bg-[#161616] border border-[#393939] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8d8d8d]">Total Papers</span>
            <FileText size={18} className="text-blue-400" />
          </div>
          <span className="block mt-2 text-3xl font-extrabold text-white tracking-tight">{totalPapers}</span>
          <span className="block mt-1 text-[11px] text-[#a8a8a8]">Indexed in SQLite DB</span>
        </div>

        <div className="rounded bg-[#161616] border border-[#393939] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8d8d8d]">Summarized</span>
            <FileCheck size={18} className="text-emerald-400" />
          </div>
          <span className="block mt-2 text-3xl font-extrabold text-white tracking-tight">{summarizedCount}</span>
          <span className="block mt-1 text-[11px] text-[#a8a8a8]">AI Exec Overviews ready</span>
        </div>

        <div className="rounded bg-[#161616] border border-[#393939] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8d8d8d]">Opportunities Map</span>
            <Activity size={18} className="text-purple-400" />
          </div>
          <span className="block mt-2 text-3xl font-extrabold text-white tracking-tight">{insightedCount}</span>
          <span className="block mt-1 text-[11px] text-[#a8a8a8]">Insight metrics extracted</span>
        </div>

        <div className="rounded bg-[#161616] border border-[#393939] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8d8d8d]">AI Engine Status</span>
            <ShieldCheck size={18} className="text-blue-500" />
          </div>
          <span className="block mt-2 text-lg font-bold text-blue-400 font-mono">IBMGranite</span>
          <span className="block mt-1 text-[11px] text-[#a8a8a8]">Service layers loaded</span>
        </div>
      </div>

      {/* Main Grid: My Papers list */}
      <div className="rounded bg-[#161616] border border-[#393939] overflow-hidden">
        <div className="border-b border-[#393939] px-6 py-4 flex items-center justify-between">
          <h3 className="font-sans font-bold text-base text-white">Recent Literature</h3>
          <Link to="/papers" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium hover:underline">
            View All Literature ({totalPapers})
            <ArrowRight size={12} />
          </Link>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

        {loading ? (
          <LoadingSpinner message="LOADING ACADEMIC RECORDS..." size="sm" />
        ) : papers.length === 0 ? (
          <EmptyState 
            title="Your digital library is empty"
            description="Upload your first scientific publication or book chapter PDF, and let IBM Granite help you synthesize its structure instantly."
            actionLabel="Upload Paper"
            actionPath="/upload"
          />
        ) : (
          <PaperList 
            papers={papers.slice(0, 5)} 
            onDelete={openDeleteModal} 
            deleteLoadingId={targetPaperId} 
          />
        )}
      </div>

      {/* Reusable confirmation modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        title="Delete Paper permanently?"
        message="This action is irreversible. All parsed indices, metadata and insights will be removed."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setModalOpen(false);
          setTargetPaperId(null);
        }}
        isLoading={deleteLoading}
      />
    </div>
  );
};
