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
      className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group ${
        onClick ? "cursor-pointer active:scale-[0.99]" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Badge */}
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border inline-flex items-center gap-2 ${style.bg} ${style.text} ${style.border}`}
          >
            <span
              className={`w-5 h-5 rounded-md flex items-center justify-center ${
                style.icon || style.bg
              }`}
            >
              <Icon size={12} className="stroke-[2.5px]" />
            </span>
            {error.type}
          </span>

          {/* Severity Badge */}
          <span
            className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg border inline-flex items-center gap-2 ${severityStyle.bg} ${severityStyle.text} ${severityStyle.border}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${severityStyle.dot} animate-pulse`}
            />
            {error.severity}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-red-50/70 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30 group-hover:border-red-200 dark:group-hover:border-red-800 transition-colors">
          <div className="text-xs text-red-500 dark:text-red-400 font-bold mb-2 uppercase tracking-wider">
            Original
          </div>
          <div className="font-medium text-red-900 dark:text-red-200 line-through decoration-red-400 decoration-2">
            {error.original}
          </div>
        </div>
        <div className="p-4 bg-green-50/70 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30 group-hover:border-green-200 dark:group-hover:border-green-800 transition-colors relative">
          <div className="text-xs text-green-600 dark:text-green-400 font-bold mb-2 uppercase tracking-wider flex items-center justify-between">
            <span>Suggestion</span>
            <button
              onClick={handleCopySuggestion}
              className="text-green-500 hover:text-green-700 dark:hover:text-green-300 transition-colors p-1"
              title="Copy suggestion"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
          <div className="font-medium text-green-900 dark:text-green-200 flex items-start gap-2">
            <span className="flex-grow">{error.suggestion}</span>
            <CheckCircle2
              size={16}
              className="text-green-500 shrink-0 mt-0.5"
            />
          </div>
        </div>
      </div>

      <div className="text-slate-600 dark:text-slate-300 text-sm bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg italic border-l-4 border-slate-300 dark:border-slate-600 mb-3">
        <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold block mb-1">
          Context
        </span>
        "{error.context}"
      </div>

      {error.explanation && (
        <div className="text-sm text-slate-600 dark:text-slate-300 flex gap-2 items-start bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
          <span className="font-bold shrink-0 text-indigo-700 dark:text-indigo-300">
            Why:
          </span>
          <span>{error.explanation}</span>
        </div>
      )}
    </div>
  );
};
