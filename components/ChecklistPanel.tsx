import React, { useMemo } from "react";
import { Card, Button, Progress, Badge } from "../components/ui";
import {
  Check,
  RefreshCw,
  CheckCircle2,
  RotateCw,
  FileText,
} from "lucide-react";
import { SpellingError, PageScanResult } from "../types";

interface ChecklistPanelProps {
  results: PageScanResult[];
  resolvedErrors: Set<string>;
  onToggleError: (id: string) => void;
  onScrollToIssue: (id: string) => void;
  onRetest: () => void;
  isScanning: boolean;
}

export const ChecklistPanel: React.FC<ChecklistPanelProps> = ({
  results,
  resolvedErrors,
  onToggleError,
  onScrollToIssue,
  onRetest,
  isScanning,
}) => {
  // Group errors by page
  const errorsByPage = useMemo(() => {
    return results
      .map((page) => ({
        ...page,
        errors: page.errors.map((error, idx) => ({
          ...error,
          pageUrl: page.url,
          id:
            error.id ||
            `${page.url}-${error.context}-${error.original}-${idx}`.replace(
              /\s+/g,
              ""
            ),
        })),
      }))
      .filter((page) => page.errors.length > 0);
  }, [results]);

  const totalErrors = errorsByPage.reduce(
    (acc, page) => acc + page.errors.length,
    0
  );
  const resolvedCount = resolvedErrors.size;
  const progress = totalErrors > 0 ? (resolvedCount / totalErrors) * 100 : 0;
  const isComplete = totalErrors > 0 && resolvedCount === totalErrors;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wide">
            <CheckCircle2 className="text-emerald-500" size={16} />
            Correction Plan
          </h3>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {resolvedCount}/{totalErrors}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
           <Progress
             value={progress}
             variant="success"
             size="sm"
             className="w-full h-1.5"
           />
           <div className="flex justify-between text-[10px] text-slate-400 uppercase font-semibold">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
           </div>
        </div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto p-0 hover:p-0 custom-scrollbar">
        {errorsByPage.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
             <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                <Check size={20} className="text-slate-300 dark:text-slate-600" />
             </div>
             <p className="text-sm font-medium text-slate-900 dark:text-slate-200">All Clear!</p>
             <p className="text-xs text-slate-500 mt-1">No pending issues to resolve.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {errorsByPage.map((page) => (
              <div key={page.url} className="">
                <div className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <FileText size={12} className="text-slate-400" />
                  <h4
                    className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]"
                    title={page.title || page.url}
                  >
                    {page.title || "Untitled Page"}
                  </h4>
                </div>

                <div className="">
                  {page.errors.map((error) => {
                    const isResolved = resolvedErrors.has(error.id!);
                    return (
                      <div
                        key={error.id}
                        id={`checklist-item-${error.id}`}
                        onClick={() => onScrollToIssue(error.id!)}
                        className={`group px-4 py-3 cursor-pointer transition-all duration-200 flex items-start gap-3 border-l-[3px] hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          isResolved
                            ? "border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/5"
                            : "border-l-transparent hover:border-l-indigo-400"
                        }`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleError(error.id!);
                          }}
                          className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0 ${
                            isResolved
                              ? "bg-emerald-500 border-emerald-500 text-white scale-100"
                              : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-transparent hover:border-indigo-400 scale-90 group-hover:scale-100"
                          }`}
                        >
                          <Check size={12} strokeWidth={4} />
                        </button>

                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-xs font-medium mb-0.5 leading-relaxed ${
                              isResolved
                                ? "text-slate-500 dark:text-slate-500 line-through decoration-slate-400/50"
                                : "text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            {error.suggestion}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-mono">
                            {error.original}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Retest Action */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
        <Button
          variant={isComplete ? "primary" : "secondary"}
          size="sm"
          className="w-full justify-center shadow-sm"
          onClick={onRetest}
          disabled={isScanning || totalErrors === 0}
          icon={
            isScanning ? (
              <RefreshCw className="animate-spin" size={14} />
            ) : (
              <RotateCw size={14} />
            )
          }
        >
          {isScanning ? "Retesting..." : "Verify Fixes"}
        </Button>
      </div>
    </div>
  );
};
