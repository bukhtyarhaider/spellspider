import React, { useState, useMemo } from "react";
import { PageScanResult, SavedReport } from "../types";
import { ScanProgress } from "../components/ScanProgress";
import { ErrorCard } from "../components/ErrorCard";
import { ChecklistPanel } from "../components/ChecklistPanel";
import {
  Button,
  Card,
  Select,
  Spinner,
  EmptyState,
  Badge,
} from "../components/ui";
import {
  StopCircle,
  FileDown,
  FileJson,
  Trash2,
  ArrowRight,
  Star,
  Filter,
  Square,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FileSearch,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useFilterState } from "../hooks";
import {
  CHART_COLORS,
  ERROR_TYPE_OPTIONS,
  SEVERITY_OPTIONS,
} from "../constants";

interface ResultsPageProps {
  results: PageScanResult[];
  isScanning: boolean;
  currentScanningUrl?: string;
  urlInput: string;
  onStop: () => void;
  onDownloadPDF: () => void;
  onExportJSON: () => void;
  onReset: () => void;
  resolvedErrors: Set<string>;
  onToggleResolvedError: (id: string) => void;
  onRetest: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  results,
  isScanning,
  currentScanningUrl,
  urlInput,
  onStop,
  onDownloadPDF,
  onExportJSON,
  onReset,
  resolvedErrors,
  onToggleResolvedError,
  onRetest,
}) => {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(
    results.length > 0 ? results[0].url : null
  );
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  // Ensure errors have stable IDs for linking logic
  const resultsWithIds = useMemo(() => {
    return results.map((page) => ({
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
    }));
  }, [results]);

  // Stats calculation
  const totalErrors = results.reduce(
    (acc, curr) => acc + (curr.errors?.length || 0),
    0
  );
  const errorTypes = results
    .flatMap((r) => r.errors)
    .reduce((acc, err) => {
      acc[err.type] = (acc[err.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(errorTypes).map(([name, value]) => ({
    name,
    value,
  }));

  // Derived state for the view
  const selectedResult = useMemo(() => {
    if (!selectedPageId) return null;
    return (
      resultsWithIds.find((r) => r.url === selectedPageId) || {
        url: selectedPageId,
        status: "pending",
        errors: [],
      }
    );
  }, [resultsWithIds, selectedPageId]);

  // Filtering
  const {
    filterSeverity,
    setFilterSeverity,
    filterType,
    setFilterType,
    resetFilters,
  } = useFilterState(selectedResult?.errors || []);

  // Re-calculate filtered errors
  const filteredErrors = useMemo(() => {
    if (!selectedResult || !("errors" in selectedResult)) return [];
    return selectedResult.errors.filter((error) => {
      if (filterType !== "All" && error.type !== filterType) return false;
      if (filterSeverity !== "All" && error.severity !== filterSeverity)
        return false;
      return true;
    });
  }, [selectedResult, filterType, filterSeverity]);

  // Scroll helper
  const handleScrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      document.querySelectorAll(".highlight-pulse").forEach((el) => {
        el.classList.remove("highlight-pulse");
      });
      element.classList.add("highlight-pulse");
      setTimeout(() => {
        element.classList.remove("highlight-pulse");
      }, 2000);
    }
  };

  return (
    <div className="animate-fade-in min-h-screen bg-slate-50 dark:bg-slate-950 pb-10">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 mb-6">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Audit Results
              </h1>
              {selectedResult?.status === "completed" && (
                <Badge
                  variant={
                    (selectedResult.score || 0) > 80
                      ? "success"
                      : (selectedResult.score || 0) > 50
                      ? "warning"
                      : "danger"
                  }
                  size="sm"
                >
                  Score: {selectedResult.score ?? "--"}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="truncate max-w-md font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs select-all">
                {urlInput}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isScanning && (
              <Button
                variant="danger"
                size="sm"
                icon={<StopCircle size={16} />}
                onClick={onStop}
                className="shadow-sm"
              >
                Stop Scan
              </Button>
            )}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block" />
            <Button
              variant="outline"
              size="sm"
              icon={<FileDown size={16} />}
              onClick={onDownloadPDF}
            >
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<FileJson size={16} />}
              onClick={onExportJSON}
            >
              JSON
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowRight size={16} />}
              onClick={onReset}
              className="ml-2"
            >
              New Scan
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6">
        <ScanProgress
          results={results}
          isScanning={isScanning}
          currentUrl={currentScanningUrl}
          totalErrors={totalErrors}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
          {/* Left Sidebar: Navigation & Stats */}
          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
            <nav aria-label="Pages navigation">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Pages Analyzed
                </h3>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                  {results.length}
                </span>
              </div>
              
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {results.map((result, index) => (
                    <button
                      key={result.url}
                      onClick={() => {
                        setSelectedPageId(result.url);
                        resetFilters();
                      }}
                      className={`w-full text-left p-3.5 flex items-start gap-3 border-l-[3px] transition-all duration-200 ${
                        selectedPageId === result.url
                          ? "bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-500"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium mb-1 truncate ${
                          selectedPageId === result.url ? "text-indigo-900 dark:text-indigo-100" : "text-slate-700 dark:text-slate-300"
                        }`}>
                          {result.title || "Untitled Page"}
                        </div>
                        <div className="flex items-center gap-2">
                           {result.status === "completed" ? (
                             <>
                               {result.errors.length === 0 ? (
                                 <span className="text-[10px] items-center flex gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">
                                   <CheckCircle size={10} /> Perfect
                                 </span>
                               ) : (
                                <span className="text-[10px] items-center flex gap-1 font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded">
                                  <AlertTriangle size={10} /> {result.errors.length} Issues
                                </span>
                               )}
                             </>
                           ) : (
                             <span className="text-[10px] capitalize text-slate-500 dark:text-slate-400">
                               {result.status}...
                             </span>
                           )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </nav>

            {/* Impact Chart */}
            {totalErrors > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                  Issue Distribution
                </h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                            strokeWidth={0}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: 'none', 
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                      <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">
                        {entry.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-6 space-y-6">
            {selectedResult ? (
              <>
                {/* Page Overview Card */}
                {selectedResult.status === "completed" && (
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-6 relative z-10">
                      {/* Score Circle */}
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[120px] text-center border border-slate-100 dark:border-slate-700">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                          Quality Score
                        </span>
                        <div className={`text-4xl font-black ${
                          (selectedResult.score || 0) > 80
                            ? "text-emerald-500"
                            : (selectedResult.score || 0) > 50
                            ? "text-amber-500"
                            : "text-rose-500"
                        }`}>
                          {selectedResult.score ?? "--"}
                        </div>
                        <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              (selectedResult.score || 0) > 80
                              ? "bg-emerald-500"
                              : (selectedResult.score || 0) > 50
                              ? "bg-amber-500"
                              : "bg-rose-500"
                            }`}
                            style={{ width: `${selectedResult.score || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Editorial Summary */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-300">
                             <Star size={16} fill="currentColor" fillOpacity={0.2} />
                          </div>
                          <h3 className="font-bold text-slate-900 dark:text-white">Editorial Insight</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {selectedResult.summary || "No specific insights available for this page."}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                           <div className="text-xs">
                             <span className="text-slate-400 uppercase font-semibold">Words:</span>
                             <span className="ml-1 font-mono text-slate-700 dark:text-slate-200 font-medium">{selectedResult.wordCount}</span>
                           </div>
                           <div className="text-xs">
                             <span className="text-slate-400 uppercase font-semibold">Issues:</span>
                             <span className="ml-1 font-mono text-slate-700 dark:text-slate-200 font-medium">{selectedResult.errors.length}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Filters & Content */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                  {/* Filter Bar */}
                  {selectedResult.status === "completed" && selectedResult.errors.length > 0 && (
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-wrap items-center gap-3 sticky top-0 z-20 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <Filter size={14} /> Filter
                        </div>
                        <Select
                          size="sm"
                          value={filterSeverity}
                          onChange={(e) => setFilterSeverity(e.target.value)}
                          options={[
                            { value: "All", label: "Severity: All" },
                            ...SEVERITY_OPTIONS.map((s) => ({ value: s, label: s })),
                          ]}
                          className="min-w-[120px]"
                        />
                        <Select
                          size="sm"
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          options={[
                            { value: "All", label: "Type: All" },
                            ...ERROR_TYPE_OPTIONS.map((t) => ({ value: t, label: t })),
                          ]}
                          className="min-w-[120px]"
                        />
                        
                        {(filterSeverity !== "All" || filterType !== "All") && (
                           <Button variant="ghost" size="sm" onClick={resetFilters}>Clear</Button>
                        )}
                        
                        <div className="ml-auto text-xs font-medium text-slate-400">
                          Showing {filteredErrors.length} of {selectedResult.errors.length}
                        </div>
                    </div>
                  )}

                  {/* Feed */}
                  <div className="p-6 bg-slate-50/30 dark:bg-slate-950/30 flex-1">
                    {selectedResult.status === "pending" ? (
                      <EmptyState
                        icon={Square}
                        title="Waiting in queue..."
                        description="This page will be analyzed shortly"
                      />
                    ) : selectedResult.status === "processing" ? (
                      <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="relative">
                           <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                           <Spinner size="lg" variant="primary" />
                        </div>
                        <p className="text-slate-500 font-medium animate-pulse">Analyzing content...</p>
                      </div>
                    ) : selectedResult.status === "failed" ? (
                      <EmptyState
                        icon={AlertTriangle}
                        title="Access Failed"
                        description="Could not access content. The site might block crawlers."
                      />
                    ) : selectedResult.errors.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center">
                         <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
                           <CheckCircle size={32} />
                         </div>
                         <h3 className="text-lg font-bold text-slate-900 dark:text-white">Flawless Page!</h3>
                         <p className="text-slate-500 max-w-sm">
                           No grammar or style issues found. Great job!
                         </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredErrors.length > 0 ? (
                          filteredErrors.map((error, idx) => (
                            <ErrorCard
                              key={idx}
                              error={error}
                              id={`error-card-${error.id}`}
                              onClick={() =>
                                handleScrollToElement(`checklist-item-${error.id}`)
                              }
                            />
                          ))
                        ) : (
                          <EmptyState
                            icon={Filter}
                            title="No matching issues"
                            description="Try clearing your filters"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <Card className="h-full flex items-center justify-center p-12 min-h-[400px]">
                <EmptyState
                  icon={FileSearch}
                  title="Select a Page"
                  description="Choose a page from the list to view its audit details"
                />
              </Card>
            )}
          </div>

          {/* Right Sidebar: Checklist */}
          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
             <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
               <ChecklistPanel
                 results={resultsWithIds as any}
                 resolvedErrors={resolvedErrors}
                 onToggleError={onToggleResolvedError}
                 onScrollToIssue={(id) => handleScrollToElement(`error-card-${id}`)}
                 onRetest={onRetest}
                 isScanning={isScanning}
               />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
