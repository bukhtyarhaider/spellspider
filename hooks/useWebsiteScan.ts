import React, { useState, useCallback, useEffect, useRef } from "react";
import { PageScanResult } from "../types";
import { fetchPageContent, discoverUrls } from "../services/crawlerService";
import { analyzeTextForErrors } from "../services/geminiService";

type ScanStep =
  | "input"
  | "discovering"
  | "selection"
  | "analyzing"
  | "finished";

export const useWebsiteScan = () => {
  const [step, setStep] = useState<ScanStep>("input");
  const [urlInput, setUrlInput] = useState("");
  const [discoveredPages, setDiscoveredPages] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<PageScanResult[]>([]);
  const [currentScanningUrl, setCurrentScanningUrl] = useState<
    string | undefined
  >();
  const [isScanning, setIsScanning] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [discoveryProgress, setDiscoveryProgress] = useState<string>("");

  // Ref to track scanning status for the async loop without closure staleness
  const isScanningRef = React.useRef(false);

  const handleDiscover = useCallback(async () => {
    if (!urlInput) return;

    let targetUrl = urlInput;
    if (!targetUrl.startsWith("http")) {
      targetUrl = "https://" + targetUrl;
      setUrlInput(targetUrl);
    }

    setStep("discovering");
    setErrorDetails(null);
    setDiscoveredPages([]);
    setDiscoveryProgress("Starting discovery...");

    try {
      const uniqueLinks = await discoverUrls(targetUrl, (message) => {
        setDiscoveryProgress(message);
      });
      if (uniqueLinks.length === 0) {
        throw new Error("No pages found.");
      }
      setDiscoveredPages(uniqueLinks);
      setSelectedPages(new Set(uniqueLinks));
      setDiscoveryProgress("");
      setStep("selection");
    } catch (e) {
      console.error(e);
      setErrorDetails(
        "Could not access the website. It may be blocking automated scans."
      );
      setDiscoveryProgress("");
      setStep("input");
    }
  }, [urlInput]);

  const togglePageSelection = useCallback((url: string) => {
    setSelectedPages((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(url)) {
        newSelection.delete(url);
      } else {
        newSelection.add(url);
      }
      return newSelection;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedPages.size === discoveredPages.length) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(discoveredPages));
    }
  }, [selectedPages.size, discoveredPages]);

  const startAnalysis = useCallback(async () => {
    setStep("analyzing");
    setIsScanning(true);
    isScanningRef.current = true;
    setResults([]);

    const pagesToScan = Array.from(selectedPages) as string[];
    const initialResults: PageScanResult[] = pagesToScan.map((url) => ({
      url,
      title: "Pending...",
      status: "pending",
      errors: [],
      scannedAt: new Date().toISOString(),
      wordCount: 0,
    }));
    setResults(initialResults);

    try {
      for (const currentUrl of pagesToScan) {
        if (!isScanningRef.current) break;

        setCurrentScanningUrl(currentUrl);
        setResults((prev) =>
          prev.map((r) =>
            r.url === currentUrl
              ? { ...r, status: "processing", title: "Analyzing..." }
              : r
          )
        );

        try {
          const { text, title } = await fetchPageContent(currentUrl);
          const wordCount = text.split(/\s+/).length;
          const { errors, score, summary } = await analyzeTextForErrors(text);

          setResults((prev) =>
            prev.map((r) =>
              r.url === currentUrl
                ? {
                    ...r,
                    status: "completed",
                    title,
                    errors,
                    score,
                    summary,
                    wordCount,
                  }
                : r
            )
          );
        } catch (error: any) {
          console.error(`Failed to scan ${currentUrl}`, error);
          setResults((prev) =>
            prev.map((r) =>
              r.url === currentUrl
                ? {
                    ...r,
                    status: "failed",
                    title:
                      error.message?.includes("Access Denied") ||
                      error.message?.includes("blocks automated")
                        ? "Access Denied"
                        : "Analysis Failed",
                    errors: [],
                  }
                : r
            )
          );
        }
      }
    } catch (e) {
      setErrorDetails("An unexpected error occurred during the analysis.");
    } finally {
      setIsScanning(false);
      isScanningRef.current = false;
      setCurrentScanningUrl(undefined);
      setStep("finished");
    }
  }, [selectedPages]);

  const handleStop = useCallback(() => {
    setIsScanning(false);
    isScanningRef.current = false;
    setCurrentScanningUrl(undefined);
    setStep("finished");
  }, []);

  const handleReset = useCallback(() => {
    setStep("input");
    setResults([]);
    setUrlInput("");
    setDiscoveredPages([]);
    setSelectedPages(new Set());
    setErrorDetails(null);
  }, []);

  return {
    step,
    setStep,
    urlInput,
    setUrlInput,
    discoveredPages,
    selectedPages,
    results,
    setResults,
    currentScanningUrl,
    isScanning,
    errorDetails,
    setErrorDetails,
    discoveryProgress,
    handleDiscover,
    togglePageSelection,
    toggleSelectAll,
    startAnalysis,
    handleStop,
    handleReset,
  };
};
