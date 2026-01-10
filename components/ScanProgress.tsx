import React from "react";
import { Loader2, FileSearch, AlertTriangle } from "lucide-react";
import { PageScanResult } from "../types";
import { Card } from "./ui";

interface ScanProgressProps {
  results: PageScanResult[];
  isScanning: boolean;
  currentUrl?: string;
  totalErrors: number;
}

export const ScanProgress: React.FC<ScanProgressProps> = ({
  results,
  isScanning,
  currentUrl,
  totalErrors,
}) => {
  const completed = results.filter(
    (r) => r.status === "completed" || r.status === "failed"
  ).length;
  const avgScore =
    results.length > 0
      ? Math.round(
          results
            .filter((r) => r.score !== undefined)
            .reduce((acc, r) => acc + (r.score || 0), 0) /
            results.filter((r) => r.score !== undefined).length
        )
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card padding="lg" className="text-center">
        <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-3">
          Pages Scanned
        </div>
        <div className="text-3xl font-bold text-slate-900 dark:text-white flex items-baseline justify-center gap-2 leading-none">
          {completed}
          <span className="text-lg text-slate-400 dark:text-slate-500 font-normal">
            / {results.length}
          </span>
          {isScanning && (
            <Loader2 className="animate-spin text-indigo-500 self-center ml-1" size={18} />
          )}
        </div>
      </Card>

      <Card padding="lg" className="text-center">
        <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">
          Issues Found
        </div>
        <div
          className={`text-3xl font-bold ${
            totalErrors > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
          }`}
        >
          {totalErrors}
        </div>
      </Card>

      <Card padding="lg" className="text-center">
        <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">
          Avg. Quality
        </div>
        <div
          className={`text-3xl font-bold ${
            avgScore > 80
              ? "text-green-600 dark:text-green-400"
              : avgScore > 50
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {avgScore || "--"}
          {avgScore > 0 && (
            <span className="text-lg text-slate-400 dark:text-slate-500 font-normal">/100</span>
          )}
        </div>
      </Card>

      <Card padding="lg">
        <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">Status</div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isScanning ? "bg-green-500 animate-pulse" : "bg-slate-300 dark:bg-slate-600"
            }`}
          ></div>
          <span
            className="text-sm text-slate-700 dark:text-slate-200 font-medium truncate max-w-[200px]"
            title={currentUrl || "Idle"}
          >
            {isScanning ? "Analyzing..." : "Ready"}
          </span>
        </div>
        {currentUrl && (
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-2 truncate flex items-center gap-1">
            <FileSearch size={12} />
            {currentUrl}
          </div>
        )}
      </Card>
    </div>
  );
};
