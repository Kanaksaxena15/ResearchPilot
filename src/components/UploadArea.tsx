import React from 'react';
import { Upload, FileText } from 'lucide-react';

interface UploadAreaProps {
  dragActive: boolean;
  file: File | null;
  loading: boolean;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectClick: () => void;
  onClear: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const UploadArea: React.FC<UploadAreaProps> = ({
  dragActive,
  file,
  loading,
  onDrag,
  onDrop,
  onFileChange,
  onSelectClick,
  onClear,
  fileInputRef,
}) => {
  return (
    <div
      id="upload-area-component"
      onDragEnter={onDrag}
      onDragOver={onDrag}
      onDragLeave={onDrag}
      onDrop={onDrop}
      className={`flex flex-col items-center justify-center rounded border-2 border-dashed p-10 text-center transition-all min-h-[250px] ${
        dragActive
          ? 'border-blue-600 bg-blue-950/10'
          : 'border-[#393939] bg-[#161616] hover:border-neutral-700'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={onFileChange}
        disabled={loading}
      />

      <div className="mx-auto flex h-14 w-14 items-center justify-center bg-neutral-900 border border-[#393939] rounded-sm mb-4">
        <Upload className="text-[#8d8d8d]" size={24} />
      </div>

      {file ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-white font-semibold text-sm font-mono">
            <FileText className="text-blue-400" size={16} />
            <span className="truncate max-w-xs">{file.name}</span>
          </div>
          <p className="text-[11px] text-[#8d8d8d]">
            Size: {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for ingestion
          </p>
          <button
            type="button"
            onClick={onClear}
            disabled={loading}
            className="text-xs text-red-400 hover:text-red-300 hover:underline cursor-pointer pt-2"
          >
            Clear Selection
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm font-semibold text-white">Drag & drop your research paper PDF here</p>
          <p className="text-xs text-[#8d8d8d] mt-1">or select from local directory (Max 15MB)</p>
          <button
            type="button"
            onClick={onSelectClick}
            disabled={loading}
            className="mt-6 rounded-sm border border-[#393939] bg-neutral-900 px-4 py-2.5 text-xs text-[#e0e0e0] hover:bg-neutral-800 hover:border-neutral-700 transition-all cursor-pointer"
          >
            Select File
          </button>
        </div>
      )}
    </div>
  );
};
