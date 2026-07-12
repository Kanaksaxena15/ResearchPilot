import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Upload, CheckCircle, ArrowRight } from 'lucide-react';

// Import newly created modular components
import { ErrorAlert } from '../components/ErrorAlert';
import { UploadArea } from '../components/UploadArea';

export const UploadPaper: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ id: number; title: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Unsupported file type. Please upload a PDF (.pdf) file only.');
      return;
    }
    // Limit to 15MB
    if (selectedFile.size > 15 * 1024 * 1024) {
      setError('File size exceeds the 15MB limit. Please upload a smaller PDF.');
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setProgressStatus('Uploading physical file to the container filesystem...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Step 1: Upload file and trigger backend text extraction
      const uploadResponse = await api.post('/papers/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProgressStatus('Indexing metadata inside the SQLite database...');
      
      const paperData = uploadResponse.data.paper;
      setSuccessData({
        id: paperData.id,
        title: paperData.title,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'An unexpected error occurred during PDF parsing. Please try again.');
    } finally {
      setLoading(false);
      setProgressStatus('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Upload Research Paper</h2>
        <p className="text-sm text-[#a8a8a8] font-light mt-1.5">
          Upload PDF documents. Our system automatically extracts technical texts, indices paragraphs, and loads context libraries for IBM Granite.
        </p>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {successData ? (
        <div className="rounded bg-[#161616] border border-emerald-800 p-8 text-center space-y-6 animate-fade-in">
          <div className="mx-auto flex h-14 w-14 items-center justify-center bg-emerald-900/40 border border-emerald-700 rounded-full">
            <CheckCircle className="text-emerald-400" size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-sans">PDF Uploaded & Indexed Successfully!</h3>
            <p className="text-xs text-emerald-400 font-mono mt-1">"{successData.title}"</p>
            <p className="text-xs text-[#a8a8a8] max-w-sm mx-auto mt-2 leading-relaxed font-light">
              Your research paper is parsed and registered in our local index database. You can now generate structured summaries and analyze insights.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => navigate(`/papers/${successData.id}`)}
              className="inline-flex items-center gap-2 rounded-sm bg-blue-600 hover:bg-blue-700 px-5 py-3 text-sm font-semibold text-white tracking-wide transition-all cursor-pointer"
            >
              Enter Research Workspace
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpload} className="space-y-6">
          <UploadArea 
            dragActive={dragActive}
            file={file}
            loading={loading}
            onDrag={handleDrag}
            onDrop={handleDrop}
            onFileChange={handleFileChange}
            onSelectClick={handleButtonClick}
            onClear={() => setFile(null)}
            fileInputRef={fileInputRef}
          />

          {loading && (
            <div className="rounded bg-neutral-900 border border-[#393939] p-5 text-center animate-pulse">
              <div className="mb-2.5 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent border-blue-600 mx-auto"></div>
              <p className="font-mono text-[11px] text-blue-400 tracking-wide uppercase">{progressStatus}</p>
              <p className="text-[10px] text-[#8d8d8d] mt-1 font-light">This may take up to a few seconds depending on PDF character density.</p>
            </div>
          )}

          {file && !loading && (
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-sm bg-blue-600 hover:bg-blue-700 px-5 py-3 text-sm font-semibold text-white tracking-wide transition-all shadow-md shadow-blue-900/20 cursor-pointer"
            >
              <Upload size={16} />
              Process and Index Research Paper
            </button>
          )}
        </form>
      )}
    </div>
  );
};
