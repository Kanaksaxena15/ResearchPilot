import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Paper } from '../types';
import { Search } from 'lucide-react';

// Import newly created modular components
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { EmptyState } from '../components/EmptyState';
import { PaperCard } from '../components/PaperCard';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const MyPapers: React.FC = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Confirmation Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [targetPaperId, setTargetPaperId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/papers');
      setPapers(response.data.papers || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load research papers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const openDeleteModal = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
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
      alert(err.response?.data?.error || 'Failed to delete paper');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredPapers = papers.filter((p) => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Literature Library</h2>
          <p className="text-sm text-[#a8a8a8] font-light mt-1">
            Browse and query all indexed research publications and documentation.
          </p>
        </div>

        <Link
          to="/upload"
          className="flex items-center gap-2 rounded-sm bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white tracking-wide transition-all cursor-pointer"
        >
          Upload New PDF
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex rounded bg-[#161616] border border-[#393939] px-4 py-3 items-center gap-3">
        <Search className="text-[#8d8d8d]" size={18} />
        <input
          type="text"
          placeholder="Search documents by title or filename..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-white text-sm w-full focus:ring-0 placeholder-neutral-500"
        />
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner message="PARSING DIGITAL LIBRARY DATABASE..." size="md" />
      ) : filteredPapers.length === 0 ? (
        <EmptyState 
          title={searchQuery ? "No matching documents found" : "No literature indexed yet"}
          description={
            searchQuery 
              ? `No papers match the term "${searchQuery}". Please check your spelling or search terms.`
              : 'Start your project by uploading PDF documents to parse summaries and opportunities.'
          }
          actionLabel={searchQuery ? "" : "Upload First PDF"}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPapers.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              onDelete={openDeleteModal}
              deleteLoading={deleteLoading && targetPaperId === paper.id}
            />
          ))}
        </div>
      )}

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
