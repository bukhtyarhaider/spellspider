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
    <div className="animate-fade-in">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex-grow">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Audit Results
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-md">
            {urlInput}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {isScanning && (
            <Button
              variant="danger"
              size="sm"
              icon={<StopCircle size={16} />}
              onClick={onStop}
            >
              Stop
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            icon={<FileDown size={16} />}
            onClick={onDownloadPDF}
          >
            Download PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<FileJson size={16} />}
            onClick={onExportJSON}
          >
            Export JSON
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Trash2 size={16} />}
            onClick={onReset}
          >
            New Scan
          </Button>
        </div>
      </div>

      <ScanProgress
        results={results}
        isScanning={isScanning}
        currentUrl={currentScanningUrl}
        totalErrors={totalErrors}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar: Pages & Chart */}
        <div className="lg:col-span-3 space-y-4 lg:h-[calc(100vh-10rem)] lg:sticky lg:top-4 flex flex-col">
          {/* Page List */}
          <Card padding="none" className="flex flex-col flex-1 overflow-hidden">
            <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/80 dark:to-slate-800/50 border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-center shrink-0">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Pages
              </span>
              <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md">
                {results.length}
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50 overflow-y-auto flex-1">
              {results.map((result, index) => (
                <button
                  key={result.url}
                  onClick={() => {
                    setSelectedPageId(result.url);
                    resetFilters();
                  }}
                  className={`w-full text-left p-3 transition-all duration-150 flex items-start gap-3 ${
                    selectedPageId === result.url
                      ? "bg-indigo-50 dark:bg-indigo-900/20 border-l-2 border-l-indigo-500"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-2 border-l-transparent"
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                      selectedPageId === result.url
                        ? "bg-indigo-500 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {index + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-medium text-sm truncate ${
                        selectedPageId === result.url
                          ? "text-indigo-900 dark:text-indigo-100"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                      title={result.title}
                    >
                      {result.title || "Untitled"}
                    </div>

                    <div className="flex items-center gap-2 mt-1.5">
                      {result.status === "pending" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          <Square size={8} /> Pending
                        </span>
                      )}
                      {result.status === "processing" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                          <Loader2 size={8} className="animate-spin" />{" "}
                          Analyzing
                        </span>
                      )}
                      {result.status === "failed" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                          <AlertTriangle size={8} /> Failed
                        </span>
                      )}
                      {result.status === "completed" && (
                        <>
                          <span
                            className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              result.errors.length > 0
                                ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30"
                                : "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30"
                            }`}
                          >
                            {result.errors.length} issues
                          </span>
                          {result.score !== undefined && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                result.score > 80
                                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30"
                                  : result.score > 50
                                  ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30"
                                  : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30"
                              }`}
                            >
                              {result.score}%
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Chart */}
          {totalErrors > 0 && (
            <Card padding="md">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
                Error Distribution
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-3 text-xs flex-wrap mt-2">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    ></div>
                    <span className="text-slate-600 dark:text-slate-400">
                      {entry.name}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Main Content: Error List */}
        <div className="lg:col-span-6 lg:h-[calc(100vh-10rem)]">
          {selectedResult ? (
            <Card
              padding="none"
              className="h-full flex flex-col overflow-hidden"
            >
              {/* Page Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="overflow-hidden flex-grow flex items-center gap-3">
                    <button
                      onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-400"
                      title={
                        isSummaryExpanded
                          ? "Collapse summary"
                          : "Expand summary"
                      }
                    >
                      {isSummaryExpanded ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                    <div className="overflow-hidden">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1 truncate">
                        {selectedResult.title}
                      </h2>
                      <a
                        href={selectedResult.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 truncate"
                      >
                        {selectedResult.url}
                        <ArrowRight size={12} />
                      </a>
                    </div>
                  </div>

                  {selectedResult.status === "completed" &&
                    isSummaryExpanded && (
                      <div className="flex items-center gap-4 shrink-0 animate-fade-in-right">
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                            Quality Score
                          </span>
                          <div
                            className={`text-2xl font-bold flex items-center gap-1 ${
                              (selectedResult.score || 0) > 80
                                ? "text-green-600"
                                : (selectedResult.score || 0) > 50
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {selectedResult.score ?? "--"}
                            <span className="text-sm text-slate-400 font-normal">
                              /100
                            </span>
                          </div>
                        </div>
                        <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden md:block"></div>
                        <div className="text-right">
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            Word Count
                          </div>
                          <div className="font-mono font-medium text-slate-900 dark:text-slate-200">
                            {selectedResult.wordCount}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Summary Section */}
              {selectedResult.status === "completed" &&
                selectedResult.summary &&
                isSummaryExpanded && (
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border-b border-indigo-100 dark:border-indigo-900/30 flex gap-3 animate-slide-up">
                    <Star
                      className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5"
                      size={18}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 mb-1">
                        Editorial Summary
                      </h4>
                      <p className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed">
                        {selectedResult.summary}
                      </p>
                    </div>
                  </div>
                )}

              {/* Filtering Toolbar */}
              {selectedResult.status === "completed" &&
                selectedResult.errors.length > 0 && (
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-2 flex-wrap flex-1">
                        <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          <Filter
                            size={12}
                            className="text-slate-500 dark:text-slate-400"
                          />
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Filter
                          </span>
                        </div>

                        <Select
                          size="sm"
                          variant="default"
                          value={filterSeverity}
                          onChange={(e) => setFilterSeverity(e.target.value)}
                          options={[
                            { value: "All", label: "All Severity" },
                            ...SEVERITY_OPTIONS.map((s) => ({
                              value: s,
                              label: s,
                            })),
                          ]}
                        />

                        <Select
                          size="sm"
                          variant="default"
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          options={[
                            { value: "All", label: "All Types" },
                            ...ERROR_TYPE_OPTIONS.map((t) => ({
                              value: t,
                              label: t,
                            })),
                          ]}
                        />

                        {(filterSeverity !== "All" || filterType !== "All") && (
                          <button
                            onClick={resetFilters}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium px-2 py-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {filteredErrors.length}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          of {selectedResult.errors.length} issues
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              <div className="p-6 bg-slate-50/50 dark:bg-slate-900/30 flex-1 overflow-y-auto">
                {selectedResult.status === "pending" ? (
                  <EmptyState
                    icon={Square}
                    title="Waiting in queue..."
                    description="This page will be analyzed shortly"
                  />
                ) : selectedResult.status === "processing" ? (
                  <div className="flex items-center justify-center h-full">
                    <Spinner
                      size="lg"
                      label="Analyzing content with Gemini AI..."
                      variant="primary"
                    />
                  </div>
                ) : selectedResult.status === "failed" ? (
                  <EmptyState
                    icon={AlertTriangle}
                    title="Could not access this page"
                    description="The website likely has security blocks against automated scanners."
                  />
                ) : selectedResult.errors.length === 0 ? (
                  <EmptyState
                    icon={CheckCircle}
                    title="Perfect Score!"
                    description="No grammar, style, or clarity issues found."
                  />
                ) : (
                  <div className="grid gap-4">
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
                        title="No errors match filters"
                        description="Try adjusting your filter criteria"
                        action={
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetFilters}
                          >
                            Clear Filters
                          </Button>
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center p-8">
              <EmptyState
                icon={FileSearch}
                title="No page selected"
                description="Select a page from the list to view details"
              />
            </Card>
          )}
        </div>

        {/* Checklist Panel */}
        <div className="lg:col-span-3 hidden lg:block lg:h-[calc(100vh-10rem)] lg:sticky lg:top-4">
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
  );
};
