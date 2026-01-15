import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  History,
  Calendar,
  Trash2,
  Eye,
  ArrowLeft,
  Globe,
  FileText,
  Clock,
  X,
  ExternalLink,
  AlertTriangle,
  Upload,
  ChevronDown,
  ChevronRight,
  Folder,
  Download,
} from "lucide-react";
import { SavedReport } from "../../types";
import { Badge, EmptyState, Button, Card } from "../../components/ui";

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: SavedReport[];
  onLoadReport: (report: SavedReport) => void;
  onDeleteReport: (reportId: string) => void;
  onClearHistory: () => void;
  selectedItem: SavedReport | null;
  onViewItem: (report: SavedReport) => void;
  onCloseItemView: () => void;
  onImportFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportHistory: () => void;
}

// Confirmation Modal Component
const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning";
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
        <div className="p-6">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
              variant === "danger"
                ? "bg-red-100 dark:bg-red-900/30"
                : "bg-amber-100 dark:bg-amber-900/30"
            }`}
          >
            <AlertTriangle
              size={24}
              className={
                variant === "danger"
                  ? "text-red-600 dark:text-red-400"
                  : "text-amber-600 dark:text-amber-400"
              }
            />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 text-center mb-2">
            {title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            {message}
          </p>
        </div>
        <div className="flex gap-3 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "secondary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

// History Item Card Component
const HistoryItemCard: React.FC<{
  report: SavedReport;
  onView: () => void;
  onLoad: () => void;
  onDelete: () => void;
}> = ({ report, onView, onLoad, onDelete }) => {
  const hostname = report.targetUrl.startsWith("http")
    ? new URL(report.targetUrl).hostname
    : report.targetUrl;

  const date = new Date(report.timestamp);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const hasErrors = report.totalErrors > 0;

  return (
    <div className="group bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-200">
      <div className="p-4">
        {/* Header Row */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
              hasErrors
                ? "bg-red-50 dark:bg-red-900/20"
                : "bg-emerald-50 dark:bg-emerald-900/20"
            }`}
          >
            <Globe
              size={18}
              className={
                hasErrors
                  ? "text-red-500 dark:text-red-400"
                  : "text-emerald-500 dark:text-emerald-400"
              }
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate text-sm">
              {hostname}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <Clock size={10} />
              <span>
                {formattedDate} • {formattedTime}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
            title="Delete report"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="default" size="sm" icon={<FileText size={12} />}>
            {report.results.length}{" "}
            {report.results.length === 1 ? "page" : "pages"}
          </Badge>
          <Badge variant={hasErrors ? "danger" : "success"} size="sm" dot>
            {report.totalErrors} {report.totalErrors === 1 ? "issue" : "issues"}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onView}
            variant="secondary"
            size="sm"
            icon={<Eye size={14} />}
            className="flex-1"
          >
            Preview
          </Button>
          <Button
            onClick={onLoad}
            variant="primary"
            size="sm"
            icon={<ExternalLink size={14} />}
            className="flex-1"
          >
            Open
          </Button>
        </div>
      </div>
    </div>
  );
};

// Detail View Component
const HistoryDetailView: React.FC<{
  report: SavedReport;
  onBack: () => void;
  onLoad: () => void;
  onDelete: () => void;
}> = ({ report, onBack, onLoad, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const hostname = report.targetUrl.startsWith("http")
    ? new URL(report.targetUrl).hostname
    : report.targetUrl;

  const date = new Date(report.timestamp);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const errorsByType = report.results
    .flatMap((r) => r.errors)
    .reduce((acc, err) => {
      acc[err.type] = (acc[err.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const avgScore =
    report.results.filter((r) => r.score !== undefined).length > 0
      ? Math.round(
          report.results
            .filter((r) => r.score !== undefined)
            .reduce((acc, r) => acc + (r.score || 0), 0) /
            report.results.filter((r) => r.score !== undefined).length
        )
      : null;

  const typeColors: Record<string, string> = {
    Spelling: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    Grammar:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    Style: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    Clarity:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    Tone: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  };

  return (
    <>
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={onDelete}
        title="Delete Report"
        message="This report will be permanently removed from your history. This action cannot be undone."
        confirmText="Delete Report"
      />

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors shadow-sm bg-white dark:bg-slate-800"
          >
            <ArrowLeft
              size={18}
              className="text-slate-600 dark:text-slate-300"
            />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100 truncate text-sm">
              {hostname}
            </h2>
            <p className="text-xs text-slate-400 truncate">
              {report.targetUrl}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Stats Grid */}
          <div className="p-4 grid grid-cols-2 gap-3">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {report.results.length}
              </div>
              <div className="text-xs text-indigo-600/70 dark:text-indigo-400/70 font-medium">
                Pages Scanned
              </div>
            </div>
            <div
              className={`rounded-xl p-4 text-center ${
                report.totalErrors > 0
                  ? "bg-red-50 dark:bg-red-900/20"
                  : "bg-emerald-50 dark:bg-emerald-900/20"
              }`}
            >
              <div
                className={`text-2xl font-bold ${
                  report.totalErrors > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {report.totalErrors}
              </div>
              <div
                className={`text-xs font-medium ${
                  report.totalErrors > 0
                    ? "text-red-600/70 dark:text-red-400/70"
                    : "text-emerald-600/70 dark:text-emerald-400/70"
                }`}
              >
                Issues Found
              </div>
            </div>
            {avgScore !== null && (
              <div
                className={`col-span-2 rounded-xl p-4 text-center ${
                  avgScore >= 80
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : avgScore >= 60
                    ? "bg-amber-50 dark:bg-amber-900/20"
                    : "bg-red-50 dark:bg-red-900/20"
                }`}
              >
                <div
                  className={`text-2xl font-bold ${
                    avgScore >= 80
                      ? "text-emerald-600 dark:text-emerald-400"
                      : avgScore >= 60
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {avgScore}%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Quality Score
                </div>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 rounded-lg px-3 py-2">
              <Calendar size={14} />
              <span>
                {formattedDate} at {formattedTime}
              </span>
            </div>
          </div>

          {/* Error Breakdown */}
          {Object.keys(errorsByType).length > 0 && (
            <div className="px-4 pb-4">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Issues by Type
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(errorsByType).map(([type, count]) => (
                  <span
                    key={type}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      typeColors[type] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {type} ({count})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pages List */}
          <div className="px-4 pb-4">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Scanned Pages
            </h3>
            <div className="space-y-1.5">
              {report.results.map((page, index) => (
                <div
                  key={page.url}
                  className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/30 rounded-lg"
                >
                  <div className="flex-shrink-0 w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                      {page.title || "Untitled Page"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {page.score !== undefined && (
                      <Badge
                        variant={
                          page.score >= 80
                            ? "success"
                            : page.score >= 60
                            ? "warning"
                            : "danger"
                        }
                        size="xs"
                      >
                        {page.score}%
                      </Badge>
                    )}
                    <Badge
                      variant={page.errors.length > 0 ? "danger" : "success"}
                      size="xs"
                    >
                      {page.errors.length}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-2">
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            variant="danger"
            size="sm"
            icon={<Trash2 size={18} />}
            title="Delete report"
          />
          <Button
            onClick={onLoad}
            variant="primary"
            size="md"
            icon={<ExternalLink size={16} />}
            className="flex-1"
          >
            Open in Workspace
          </Button>
        </div>
      </div>
    </>
  );
};

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  onClose,
  history,
  onLoadReport,
  onDeleteReport,
  onClearHistory,
  selectedItem,
  onViewItem,
  onCloseItemView,
  onImportFile,
  onExportHistory,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeleteItem = (reportId: string) => {
    setDeleteTargetId(reportId);
  };

  const confirmDeleteItem = () => {
    if (deleteTargetId) {
      onDeleteReport(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(
    new Set()
  );

  // Group reports by domain
  const groupedReports = React.useMemo(() => {
    const groups: Record<string, SavedReport[]> = {};
    history.forEach((report) => {
      let domain = "Unsorted";
      try {
        if (report.targetUrl.startsWith("http")) {
          domain = new URL(report.targetUrl).hostname;
        } else {
          domain = report.targetUrl.split("/")[0] || report.targetUrl;
        }
      } catch (e) {
        domain = report.targetUrl;
      }

      if (!groups[domain]) {
        groups[domain] = [];
      }
      groups[domain].push(report);
    });
    return groups;
  }, [history]);

  // Initial expand mechanism
  React.useEffect(() => {
    if (history.length > 0 && expandedDomains.size === 0) {
      const domains = Object.keys(groupedReports);
      if (domains.length > 0) {
        setExpandedDomains(new Set([domains[0]]));
      }
    }
  }, [groupedReports, history.length]);

  const toggleDomain = (domain: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) {
        next.delete(domain);
      } else {
        next.add(domain);
      }
      return next;
    });
  };

  if (!isOpen) return null;

  const panel = (
    <>
      {/* Delete Single Item Confirmation */}
      <ConfirmationModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDeleteItem}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
        confirmText="Delete"
      />

      {/* Clear All Confirmation */}
      <ConfirmationModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={onClearHistory}
        title="Clear All History"
        message={`This will permanently delete all ${history.length} saved reports. This action cannot be undone.`}
        confirmText="Clear All"
        variant="warning"
      />

      {/* Panel Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-[10000] flex flex-col animate-slide-in-right">
        {selectedItem ? (
          <HistoryDetailView
            report={selectedItem}
            onBack={onCloseItemView}
            onLoad={() => {
              onLoadReport(selectedItem);
              onCloseItemView();
              onClose();
            }}
            onDelete={() => {
              onDeleteReport(selectedItem.id);
              onCloseItemView();
            }}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                  <History
                    size={18}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    History
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {history.length}{" "}
                    {history.length === 1 ? "report" : "reports"} saved
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  icon={<Upload size={18} />}
                  title="Import JSON"
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onImportFile}
                  className="hidden"
                  accept=".json"
                />
                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onExportHistory}
                    icon={<Download size={18} />}
                    title="Export All History"
                    className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  icon={<X size={20} />}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {history.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <EmptyState
                    icon={History}
                    title="No History Yet"
                    description="Scan results will appear here automatically"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {(
                    Object.entries(groupedReports) as [string, SavedReport[]][]
                  ).map(([domain, reports]) => {
                    const isExpanded = expandedDomains.has(domain);
                    return (
                      <div key={domain} className="space-y-2">
                        <button
                          onClick={() => toggleDomain(domain)}
                          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                        >
                          {isExpanded ? (
                            <ChevronDown
                              size={16}
                              className="text-slate-400 group-hover:text-indigo-500"
                            />
                          ) : (
                            <ChevronRight
                              size={16}
                              className="text-slate-400 group-hover:text-indigo-500"
                            />
                          )}
                          <Folder
                            size={16}
                            className="text-indigo-400 dark:text-indigo-500"
                          />
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {domain}
                          </span>
                          <Badge
                            variant="default"
                            size="xs"
                            className="ml-auto"
                          >
                            {reports.length}
                          </Badge>
                        </button>

                        {isExpanded && (
                          <div className="space-y-2.5 pl-4 ml-2 border-l border-slate-200 dark:border-slate-800 animate-slide-up">
                            {reports.map((report) => (
                              <HistoryItemCard
                                key={report.id}
                                report={report}
                                onView={() => onViewItem(report)}
                                onLoad={() => {
                                  onLoadReport(report);
                                  onClose();
                                }}
                                onDelete={() => handleDeleteItem(report.id)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {history.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/20">
                <Button
                  onClick={() => setShowClearConfirm(true)}
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 size={14} />}
                  className="w-full justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Clear All History
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );

  return createPortal(panel, document.body);
};
