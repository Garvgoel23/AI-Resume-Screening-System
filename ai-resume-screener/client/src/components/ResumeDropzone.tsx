import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface ResumeDropzoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const ResumeDropzone: React.FC<ResumeDropzoneProps> = ({ files, onFilesChange }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Merge with existing, avoid duplicates by name
      const existing = new Set(files.map((f) => f.name));
      const newFiles = acceptedFiles.filter((f) => !existing.has(f.name));
      onFilesChange([...files, ...newFiles]);
    },
    [files, onFilesChange]
  );

  const removeFile = (name: string) => {
    onFilesChange(files.filter((f) => f.name !== name));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
  });

  return (
    <div className="saas-card p-6 h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl shadow-sm border border-slate-100 shrink-0">
            👥
          </div>
          <div className="min-w-0">
            <h2 className="text-slate-900 font-outfit font-bold text-lg tracking-tight truncate">Candidate Resumes</h2>
            <p className="text-slate-500 text-xs font-medium truncate">Bulk upload PDFs</p>
          </div>
        </div>
        {files.length > 0 && (
          <div className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider animate-in fade-in slide-in-from-right-2 shrink-0 self-start xl:self-auto">
            {files.length} {files.length === 1 ? 'Resume' : 'Resumes'}
          </div>
        )}
      </div>

      {/* Drop Zone */}
      <div className="space-y-4 flex-1">
        <div
          {...getRootProps()}
          id="resume-dropzone"
          className={`relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 cursor-pointer transition-all duration-200 group ${
            isDragActive
              ? 'border-slate-900 bg-slate-50 scale-[0.99]'
              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
          }`}
        >
          <input {...getInputProps()} id="resume-file-input" />
          <div className="text-center space-y-3 group-hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-3xl mx-auto border border-slate-200 shadow-sm group-hover:border-slate-300 group-hover:text-slate-900 transition-all">
              {isDragActive ? '📂' : '📎'}
            </div>
            <div>
              <p className="text-slate-700 font-bold text-sm">
                {isDragActive ? 'Release to upload' : 'Click or drag resumes'}
              </p>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 px-4">
                PDF format • Up to 10 MB per file
              </p>
            </div>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Queued for Analysis</span>
              <button 
                onClick={() => onFilesChange([])}
                className="text-[10px] font-bold text-slate-500 hover:text-red-500 transition-colors uppercase tracking-widest"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
              {files.map((file, i) => (
                <div
                  key={file.name + i}
                  className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-slate-200 shadow-sm group/item hover:border-slate-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-900 text-sm font-bold truncate">{file.name}</p>
                      <p className="text-slate-500 text-[10px] font-medium mt-0.5">{formatSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    id={`remove-resume-${i}`}
                    onClick={(e) => { e.stopPropagation(); removeFile(file.name); }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-100 transition-all"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-2">
        <p className="text-[10px] text-slate-500 font-medium leading-tight text-center bg-slate-50 p-2 rounded-lg border border-slate-100">
          🔒 Your files are processed securely and deleted immediately after the analysis session ends.
        </p>
      </div>
    </div>
  );
};

export default ResumeDropzone;
