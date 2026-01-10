import React, { useState, useEffect, useMemo } from "react";
import { Layout } from "./components/Layout";
import { ScanProgress } from "./components/ScanProgress";
import { ErrorCard } from "./components/ErrorCard";
import { Button, Card, Select, Badge } from "./components/ui";
import { HistoryPanel } from "./features/history/HistoryPanel";
import { ChecklistPanel } from "./components/ChecklistPanel";
import { UrlInput } from "./features/scan/UrlInput";
import { PageSelector } from "./features/scan/PageSelector";
import { ErrorMessage } from "./features/scan/ErrorMessage";
import { PageScanResult, SavedReport } from "./types";
import { generatePDFReport } from "./services/pdfService";
import {
  History,
  Download,
  Trash2,
  RefreshCw,
  StopCircle,
  Loader2,
  FileJson,
  FileDown,
  ArrowRight,
  AlertTriangle,
  Star,
  Filter,
  Square,
  CheckCircle,
  FileSearch,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useWebsiteScan, useHistory, useFilterState } from "./hooks";
import {
  CHART_COLORS,
  ERROR_TYPE_OPTIONS,
  SEVERITY_OPTIONS,
} from "./constants";
import { ThemeProvider } from "./components/ThemeContext";

function App() {
  // State
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [loadedFromHistory, setLoadedFromHistory] = useState(false);
  const [resolvedErrors, setResolvedErrors] = useState<Set<string>>(new Set());
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  // Website Scanning
  const websiteScan = useWebsiteScan();

  // History
  const history = useHistory();

  // Results and scanning state
  const results = websiteScan.results;
  const isScanning = websiteScan.isScanning;
  const step = websiteScan.step;

  // Save to history when finished
  useEffect(() => {
    if (
      step === "finished" &&
      results.length > 0 &&
      !isScanning &&
      !loadedFromHistory
    ) {
      const totalErrors = results.reduce((acc, r) => acc + r.errors.length, 0);
      const newReport: SavedReport = {
        id: crypto.randomUUID(),
        targetUrl: websiteScan.urlInput || results[0].url,
        timestamp: new Date().toISOString(),
        results,
        totalErrors,
        resolvedErrors: Array.from(resolvedErrors),
      };
      history.addToHistory(newReport);
    }
  }, [
    step,
    isScanning,
    websiteScan.urlInput,
    results.length,
    loadedFromHistory,
  ]);

  // Reset loadedFromHistory when starting a new scan
  useEffect(() => {
    if (step !== "finished") {
      setLoadedFromHistory(false);
      setResolvedErrors(new Set());
    }
  }, [step]);

  // Scroll helper
  const handleScrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // clear any previous highlights
      document.querySelectorAll(".highlight-pulse").forEach((el) => {
        el.classList.remove("highlight-pulse");
      });
      // add highlight
      element.classList.add("highlight-pulse");
      setTimeout(() => {
        element.classList.remove("highlight-pulse");
      }, 2000);
    } else {
      console.warn(`Element with id ${elementId} not found`);
    }
  };

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

  // Re-calculate filtered errors based on newly ID'd results
  const filteredErrors = useMemo(() => {
    if (!selectedResult || !("errors" in selectedResult)) return [];
    return selectedResult.errors.filter((error) => {
      // Filter by type
      if (
        filterType !== "All" &&
        error.type !== filterType
      )
        return false;
      // Filter by severity
      if (
        filterSeverity !== "All" &&
        error.severity !== filterSeverity
      )
        return false;
      return true;
    });
  }, [selectedResult, filterType, filterSeverity]);

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



  // Handlers
  const handleReset = () => {
    websiteScan.handleReset();
    setSelectedPageId(null);
  };

  const downloadReportPDF = () => {
    generatePDFReport(results, websiteScan.urlInput);
  };

  const exportReportJson = () => {
    const reportData: SavedReport = {
      id: crypto.randomUUID(),
      targetUrl: websiteScan.urlInput,
      timestamp: new Date().toISOString(),
      results,
      totalErrors,
      resolvedErrors: Array.from(resolvedErrors),
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spellspider-data-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string) as SavedReport;
        if (json.results && Array.isArray(json.results)) {
          websiteScan.setResults(json.results);
          websiteScan.setUrlInput(json.targetUrl);
          if (json.results.length > 0) setSelectedPageId(json.results[0].url);
          setLoadedFromHistory(true);
          if (json.resolvedErrors) {
            setResolvedErrors(new Set(json.resolvedErrors));
          } else {
            setResolvedErrors(new Set());
          }
          history.setShowHistory(false);
        } else {
          alert("Invalid report file format.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    if (event.target) event.target.value = "";
  };

  const exportHistory = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      reports: history.history,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spellspider-history-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadFromHistory = (report: SavedReport) => {
    websiteScan.setResults(report.results);
    websiteScan.setUrlInput(report.targetUrl);
    websiteScan.setStep("finished");
    if (report.results.length > 0) setSelectedPageId(report.results[0].url);
    setLoadedFromHistory(true);
    if (report.resolvedErrors) {
      setResolvedErrors(new Set(report.resolvedErrors));
    } else {
      setResolvedErrors(new Set());
    }
  };

  const toggleResolvedError = (id: string) => {
    setResolvedErrors((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleRetest = () => {
    websiteScan.startAnalysis();
    setResolvedErrors(new Set());
  };

  return (
    <ThemeProvider>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          {/* Top Bar Actions */}
          <div className="flex justify-end mb-4 gap-3">
            <Button
              variant="secondary"
              size="sm"
              icon={<History size={16} />}
              onClick={() => history.setShowHistory(true)}
            >
              History
            </Button>
          </div>

          {/* Main App Flow */}

          {/* Step 1: Input & Discovery */}
          <div
            className={`max-w-3xl mx-auto mb-16 text-center transition-all duration-700 ease-out ${
              step === "analyzing" || step === "finished" ? "hidden" : "block"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-in">
              <Sparkles size={12} className="animate-pulse" />
              AI-Powered Audit
            </div>

            <h2 className="text-5xl sm:text-7xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight animate-slide-up">
              Refine Your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-400 animate-gradient-x bg-[length:200%_auto]">
                Digital Presence
              </span>
            </h2>

            <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up [animation-delay:100ms]">
              Instant, professional analysis of spelling, grammar, tone, and
              style for your website.
            </p>

            <div className="flex flex-col gap-6 animate-slide-up [animation-delay:200ms]">
              <div className="transform hover:scale-[1.01] transition-transform duration-300">
                <UrlInput
                  urlInput={websiteScan.urlInput}
                  onUrlChange={websiteScan.setUrlInput}
                  onDiscover={websiteScan.handleDiscover}
                  onReset={websiteScan.handleReset}
                  step={step}
                />
              </div>

              {websiteScan.errorDetails && (
                <ErrorMessage message={websiteScan.errorDetails} />
              )}
            </div>
          </div>

          {/* Step 2: Page Selection */}
          {step === "selection" && (
            <PageSelector
              pages={websiteScan.discoveredPages}
              selectedPages={websiteScan.selectedPages}
              onTogglePage={websiteScan.togglePageSelection}
              onToggleAll={websiteScan.toggleSelectAll}
              onStartAnalysis={websiteScan.startAnalysis}
            />
          )}

          {/* Step 3: Analysis Results */}
          {(step === "analyzing" || step === "finished") &&
            results.length > 0 && (
              <div className="animate-fade-in">
                {/* Header Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                  <div className="flex-grow">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Audit Results
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-md">
                      {websiteScan.urlInput}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {isScanning && (
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<StopCircle size={16} />}
                        onClick={websiteScan.handleStop}
                      >
                        Stop
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<FileDown size={16} />}
                      onClick={downloadReportPDF}
                    >
                      Download PDF
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<FileJson size={16} />}
                      onClick={exportReportJson}
                    >
                      Export JSON
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Trash2 size={16} />}
                      onClick={handleReset}
                    >
                      New Scan
                    </Button>
                  </div>
                </div>

                <ScanProgress
                  results={results}
                  isScanning={isScanning}
                  currentUrl={websiteScan.currentScanningUrl}
                  totalErrors={totalErrors}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Sidebar: Pages & Chart */}
                  <div className="lg:col-span-3 space-y-4 lg:h-[calc(100vh-10rem)] lg:sticky lg:top-4 flex flex-col">
                    {/* Page List */}
                    <Card
                      padding="none"
                      className="flex flex-col flex-1 overflow-hidden"
                    >
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
                            {/* Index Number */}
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
                                    <RefreshCw
                                      size={8}
                                      className="animate-spin"
                                    />{" "}
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
                                    fill={
                                      CHART_COLORS[index % CHART_COLORS.length]
                                    }
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-3 text-xs flex-wrap mt-2">
                          {pieData.map((entry, index) => (
                            <div
                              key={entry.name}
                              className="flex items-center gap-1"
                            >
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
                                onClick={() =>
                                  setIsSummaryExpanded(!isSummaryExpanded)
                                }
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

                            {/* Stats */}
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
                                {/* Filter Controls */}
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
                                    onChange={(e) =>
                                      setFilterSeverity(e.target.value)
                                    }
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
                                    onChange={(e) =>
                                      setFilterType(e.target.value)
                                    }
                                    options={[
                                      { value: "All", label: "All Types" },
                                      ...ERROR_TYPE_OPTIONS.map((t) => ({
                                        value: t,
                                        label: t,
                                      })),
                                    ]}
                                  />

                                  {(filterSeverity !== "All" ||
                                    filterType !== "All") && (
                                    <button
                                      onClick={resetFilters}
                                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium px-2 py-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                                    >
                                      Clear
                                    </button>
                                  )}
                                </div>

                                {/* Results Count */}
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
                            <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400 dark:text-slate-500">
                              <Square
                                size={40}
                                className="mb-4 text-slate-300 dark:text-slate-600"
                              />
                              <p>Waiting in queue...</p>
                            </div>
                          ) : selectedResult.status === "processing" ? (
                            <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400 dark:text-slate-500">
                              <Loader2
                                size={40}
                                className="animate-spin mb-4 text-indigo-400"
                              />
                              <p>Analyzing content with Gemini AI...</p>
                              <p className="text-sm mt-2">
                                Checking grammar, tone, clarity...
                              </p>
                            </div>
                          ) : selectedResult.status === "failed" ? (
                            <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400 dark:text-slate-500">
                              <AlertTriangle
                                size={40}
                                className="mb-4 text-red-400"
                              />
                              <p className="text-center max-w-md font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Could not access this page.
                              </p>
                              <p className="text-center text-sm max-w-sm mb-4">
                                The website likely has security blocks against
                                automated scanners.
                              </p>
                            </div>
                          ) : selectedResult.errors.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400 dark:text-slate-500">
                              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4 text-green-500 dark:text-green-400">
                                <CheckCircle size={32} />
                              </div>
                              <p className="text-lg font-medium text-slate-700 dark:text-slate-200">
                                Perfect Score!
                              </p>
                              <p className="text-sm">
                                No grammar, style, or clarity issues found.
                              </p>
                            </div>
                          ) : (
                            <div className="grid gap-4">
                              {filteredErrors.length > 0 ? (
                                filteredErrors.map((error, idx) => (
                                  <ErrorCard
                                    key={idx}
                                    error={error}
                                    id={`error-card-${error.id}`}
                                    onClick={() =>
                                      handleScrollToElement(
                                        `checklist-item-${error.id}`
                                      )
                                    }
                                  />
                                ))
                              ) : (
                                <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                                  <p>No errors match the selected filters.</p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetFilters}
                                    className="mt-2"
                                  >
                                    Clear Filters
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    ) : (
                      <Card className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 p-8">
                        <div className="text-center">
                          <FileSearch
                            size={48}
                            className="mx-auto mb-3 opacity-20"
                          />
                          <p>Select a page from the queue to view details.</p>
                        </div>
                      </Card>
                    )}
                  </div>
                  {/* Checklist Panel */}
                  <div className="lg:col-span-3 hidden lg:block lg:h-[calc(100vh-10rem)] lg:sticky lg:top-4">
                    <ChecklistPanel
                      results={resultsWithIds as any}
                      resolvedErrors={resolvedErrors}
                      onToggleError={toggleResolvedError}
                      onScrollToIssue={(id) =>
                         handleScrollToElement(`error-card-${id}`)
                      }
                      onRetest={handleRetest}
                      isScanning={isScanning}
                    />
                  </div>
                </div>
              </div>
            )}
        </div>
      </Layout>

      {/* History Panel - Outside Layout to avoid stacking context issues */}
      <HistoryPanel
        isOpen={history.showHistory}
        onClose={() => history.setShowHistory(false)}
        history={history.history}
        onLoadReport={loadFromHistory}
        onDeleteReport={history.deleteFromHistory}
        onClearHistory={history.clearHistory}
        selectedItem={history.selectedHistoryItem}
        onViewItem={history.viewHistoryItem}
        onCloseItemView={history.closeHistoryItemView}
        onImportFile={handleImportFile}
        onExportHistory={exportHistory}
      />
    </ThemeProvider>
  );
}

export default App;
