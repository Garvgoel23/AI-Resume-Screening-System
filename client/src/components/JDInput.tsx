import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface JDInputProps {
  jdText: string;
  jdFile: File | null;
  onTextChange: (text: string) => void;
  onFileChange: (file: File | null) => void;
}

const JDInput: React.FC<JDInputProps> = ({ jdText, jdFile, onTextChange, onFileChange }) => {
  const [mode, setMode] = useState<'text' | 'pdf'>('text');

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileChange(acceptedFiles[0]);
      }
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  return (
    <div className="saas-card p-6 h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3 min-w-[150px] flex-1">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl shadow-sm border border-blue-100 shrink-0">
            📝
          </div>
          <div className="min-w-0">
            <h2 className="text-slate-900 font-outfit font-bold text-lg tracking-tight truncate">Job Description</h2>
            <p className="text-slate-500 text-xs font-medium truncate">Paste text or upload PDF</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
          {(['text', 'pdf'] as const).map((m) => (
            <button
              key={m}
              id={`jd-mode-${m}`}
              onClick={() => {
                setMode(m);
                if (m === 'text') onFileChange(null);
                if (m === 'pdf') onTextChange('');
              }}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                mode === m
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {m === 'text' ? 'Text Input' : 'PDF Upload'}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-[240px]">
        {/* Text Mode */}
        {mode === 'text' && (
          <textarea
            id="jd-textarea"
            value={jdText}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Paste your job description here. Mention key skills (e.g., React, Node.js, Python) for optimal matching accuracy."
            className="input-field h-full min-h-[240px] resize-none text-sm leading-relaxed"
          />
        )}

        {/* PDF Mode */}
        {mode === 'pdf' && (
          <div
            {...getRootProps()}
            id="jd-pdf-dropzone"
            className={`h-full min-h-[240px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 cursor-pointer transition-all duration-200 group ${
              isDragActive
                ? 'border-slate-900 bg-slate-50 scale-[0.99]'
                : jdFile
                ? 'border-emerald-500/30 bg-emerald-50/50'
                : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            <input {...getInputProps()} id="jd-pdf-input" />
            {jdFile ? (
              <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl mx-auto border border-emerald-200 shadow-sm">
                  📄
                </div>
                <div>
                  <p className="text-emerald-700 font-bold text-sm truncate max-w-[200px] mx-auto">{jdFile.name}</p>
                  <p className="text-emerald-600/70 text-[10px] font-bold uppercase tracking-widest mt-1">{(jdFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  id="jd-pdf-remove"
                  onClick={(e) => { e.stopPropagation(); onFileChange(null); }}
                  className="px-4 py-1.5 rounded-lg bg-white border border-slate-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors shadow-sm"
                >
                  Remove File
                </button>
              </div>
            ) : (
              <div className="text-center space-y-3 group-hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-3xl mx-auto border border-slate-200 shadow-sm group-hover:border-slate-300 group-hover:text-slate-900 transition-all">
                  {isDragActive ? '📂' : '📥'}
                </div>
                <div>
                  <p className="text-slate-700 font-bold text-sm">
                    {isDragActive ? 'Drop JD PDF here' : 'Click or drag JD PDF'}
                  </p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Max 10 MB • PDF Only</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-2">
        <p className="text-[10px] text-slate-500 font-medium leading-tight text-center bg-slate-50 p-2 rounded-lg border border-slate-100">
          💡 Clear, concise descriptions with specific requirements result in the highest AI matching accuracy.
        </p>
      </div>
    </div>
  );
};

export default JDInput;
