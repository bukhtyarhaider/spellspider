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
    <Card className="h-full flex flex-col overflow-hidden" padding="none">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500" size={18} />
            Fix Checklist
          </h3>
          <Badge variant="success" size="sm">
            {resolvedCount} / {totalErrors}
          </Badge>
        </div>

        {/* Progress Bar */}
        <Progress
          value={progress}
          variant="success"
          size="sm"
          className="w-full"
        />
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {errorsByPage.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm">
            No issues found to minimize.
          </div>
        ) : (
          errorsByPage.map((page) => (
            <div key={page.url} className="space-y-2">
              <div className="flex items-center gap-2 px-2 pt-2">
                <FileText size={14} className="text-slate-400" />
                <h4
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate"
                  title={page.title || page.url}
                >
                  {page.title || "Untitled Page"}
                </h4>
              </div>

              <div className="space-y-1">
                {page.errors.map((error) => {
                  const isResolved = resolvedErrors.has(error.id!);
                  return (
                    <div
                      key={error.id}
                      id={`checklist-item-${error.id}`}
                      onClick={() => onScrollToIssue(error.id!)}
                      className={`group p-2.5 rounded-lg border cursor-pointer transition-all duration-200 flex items-start gap-3 ${
                        isResolved
                          ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 opacity-75"
                          : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800"
                      }`}
                    >
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleError(error.id!);
                        }}
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 hover:scale-110 active:scale-95 ${
                          isResolved
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 group-hover:border-indigo-400"
                        }`}
                      >
                        {isResolved && <Check size={10} strokeWidth={3} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-xs font-medium mb-0.5 truncate ${
                            isResolved
                              ? "text-slate-500 dark:text-slate-400 line-through decoration-slate-400"
                              : "text-slate-900 dark:text-slate-200"
                          }`}
                        >
                          {error.suggestion}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {error.original}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer / Retest Action */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
        <Button
          variant={isComplete ? "primary" : "secondary"}
          size="md"
          className="w-full justify-center"
          onClick={onRetest}
          disabled={isScanning || totalErrors === 0}
          icon={
            isScanning ? (
              <RefreshCw className="animate-spin" size={16} />
            ) : (
              <RotateCw size={16} />
            )
          }
        >
          {isScanning ? "Retesting..." : "Retest / Verify"}
        </Button>
        {!isComplete && totalErrors > 0 && (
          <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2">
            Resolve all items to verify fixes
          </p>
        )}
      </div>
    </Card>
  );
};
