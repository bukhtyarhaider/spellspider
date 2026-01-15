import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { ScanSelectionPage } from "../pages/ScanSelectionPage";
import { ResultsPage } from "../pages/ResultsPage";
import { SavedReport } from "../types";
import { generatePDFReport } from "../services/pdfService";
import { useWebsiteScan, useHistory } from "../hooks";

export const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const websiteScan = useWebsiteScan();
  const history = useHistory();

  const [loadedFromHistory, setLoadedFromHistory] = useState(false);
  const [resolvedErrors, setResolvedErrors] = useState<Set<string>>(new Set());

  const results = websiteScan.results;
  const isScanning = websiteScan.isScanning;
  const step = websiteScan.step;

  // Handlers
  const loadFromHistory = (report: SavedReport) => {
    websiteScan.setResults(report.results);
    websiteScan.setUrlInput(report.targetUrl);
    websiteScan.setStep("finished");
    setLoadedFromHistory(true);
    if (report.resolvedErrors) {
      setResolvedErrors(new Set(report.resolvedErrors));
    } else {
      setResolvedErrors(new Set());
    }
    navigate("/results");
  };

  // Listen for history load events from Layout
  useEffect(() => {
    const handleLoadEvent = (e: Event) => {
      const customEvent = e as CustomEvent<SavedReport>;
      if (customEvent.detail) {
        loadFromHistory(customEvent.detail);
      }
    };
    window.addEventListener("spellspider:load-report", handleLoadEvent);
    return () => {
      window.removeEventListener("spellspider:load-report", handleLoadEvent);
    };
  }, [websiteScan, navigate]);

  // Navigation effects based on step changes
  useEffect(() => {
    if (step === "selection" && location.pathname !== "/select") {
      navigate("/select");
    } else if (
      (step === "analyzing" || step === "finished") &&
      results.length > 0 &&
      location.pathname !== "/results"
    ) {
      navigate("/results");
    } else if (step === "input" && location.pathname !== "/") {
      navigate("/");
    }
  }, [step, navigate, location.pathname, results.length]);

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
      // We need to use history hook just for adding, or move this logic to context?
      // Since useHistory uses localStorage directly, we can use it here just for adding.
      // But wait, useHistory is also used in Layout. 
      // It's better if simple add works.
      history.addToHistory(newReport);
    }
  }, [
    step,
    isScanning,
    websiteScan.urlInput,
    results.length,
    loadedFromHistory,
    history // Added dependency
  ]);

  // Reset loadedFromHistory when starting a new scan
  useEffect(() => {
    if (step !== "finished") {
      setLoadedFromHistory(false);
      setResolvedErrors(new Set());
    }
  }, [step]);


  const handleReset = () => {
    websiteScan.handleReset();
    navigate("/");
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
      totalErrors: results.reduce((acc, r) => acc + r.errors.length, 0),
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              urlInput={websiteScan.urlInput}
              onUrlChange={websiteScan.setUrlInput}
              onDiscover={websiteScan.handleDiscover}
              onReset={websiteScan.handleReset}
              step={
                step === "input" ||
                step === "discovering" ||
                step === "selection"
                  ? step
                  : "input"
              }
              discoveryProgress={websiteScan.discoveryProgress}
              errorDetails={websiteScan.errorDetails}
            />
          }
        />
        <Route
          path="/select"
          element={
            <ScanSelectionPage
              pages={websiteScan.discoveredPages}
              selectedPages={websiteScan.selectedPages}
              onTogglePage={websiteScan.togglePageSelection}
              onToggleAll={websiteScan.toggleSelectAll}
              onStartAnalysis={websiteScan.startAnalysis}
            />
          }
        />
        <Route
          path="/results"
          element={
            <ResultsPage
              results={results}
              isScanning={isScanning}
              currentScanningUrl={websiteScan.currentScanningUrl}
              urlInput={websiteScan.urlInput}
              onStop={websiteScan.handleStop}
              onDownloadPDF={downloadReportPDF}
              onExportJSON={exportReportJson}
              onReset={handleReset}
              resolvedErrors={resolvedErrors}
              onToggleResolvedError={toggleResolvedError}
              onRetest={handleRetest}
            />
          }
        />
      </Routes>
    </div>
  );
};
