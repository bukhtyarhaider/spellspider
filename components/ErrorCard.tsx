import React, { useState } from "react";
import { SpellingError } from "../types";
import {
  AlertCircle,
  FileText,
  CheckCircle2,
  Zap,
  AlignLeft,
  Type,
  Copy,
  Check,
} from "lucide-react";
import { ERROR_TYPES, SEVERITY_COLORS } from "../constants";

interface ErrorCardProps {
  error: SpellingError;
  id?: string;
  onClick?: () => void;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({ error, id, onClick }) => {
  const [copied, setCopied] = useState(false);

  const style = ERROR_TYPES[error.type] || ERROR_TYPES.Spelling;

  const icons = {
    Spelling: AlertCircle,
    Grammar: Type,
    Style: AlignLeft,
    Clarity: Zap,
    Tone: FileText,
  };

  const Icon = icons[error.type] || AlertCircle;

  const handleCopySuggestion = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(error.suggestion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const severityStyle =
    SEVERITY_COLORS[error.severity] || SEVERITY_COLORS.Medium;

  return (
    <div
      id={id}
      onClick={onClick}
      className={`group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          {/* Category Badge */}
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-md border inline-flex items-center gap-1.5 ${style.bg} ${style.text} ${style.border}`}
          >
            <Icon size={12} strokeWidth={2.5} />
            {error.type}
          </span>

          {/* Severity Badge */}
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded-md border inline-flex items-center gap-1.5 uppercase tracking-wider ${severityStyle.bg} ${severityStyle.text} ${severityStyle.border}`}
          >
            {error.severity}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
         {/* Original */}
        <div className="relative p-4 rounded-lg bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
          <div className="text-[10px] text-red-400 dark:text-red-400 font-bold mb-1.5 uppercase tracking-wider flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Original
          </div>
          <div className="font-medium text-red-900 dark:text-red-200 line-through decoration-red-300/60 dark:decoration-red-700 decoration-2 text-sm leading-relaxed">
            {error.original}
          </div>
        </div>

        {/* Suggestion */}
        <div className="relative p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors">
          <div className="flex justify-between items-start">
             <div className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Suggestion
             </div>
             <button
              onClick={handleCopySuggestion}
              className="text-emerald-500/70 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors absolute top-2 right-2 p-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded"
              title="Copy suggestion"
            >
              {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
            </button>
          </div>
          
          <div className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm leading-relaxed flex items-start gap-2 pr-6">
            <span className="flex-grow">{error.suggestion}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Context */}
        <div className="text-sm bg-slate-50 dark:bg-slate-950/50 px-3 py-2.5 rounded-md border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 italic">
          <span className="not-italic text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mr-2 select-none">
            Context
          </span>
          "{error.context}"
        </div>

        {/* Explanation */}
        {error.explanation && (
          <div className="text-sm flex gap-2.5 items-start pl-1">
            <div className="mt-1 w-1 h-1 rounded-full bg-indigo-500 shrink-0"></div>
            <span className="text-slate-600 dark:text-slate-300 leading-relaxed">
               <span className="font-semibold text-slate-700 dark:text-slate-200 mr-1">Why:</span>
               {error.explanation}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
