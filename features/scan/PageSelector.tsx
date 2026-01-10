import React, { useState, useMemo } from "react";
import {
  List,
  Globe,
  Check,
  Play,
  Search,
  FileText,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { Card, Button } from "../../components/ui";

interface PageSelectorProps {
  pages: string[];
  selectedPages: Set<string>;
  onTogglePage: (url: string) => void;
  onToggleAll: () => void;
  onStartAnalysis: () => void;
}

// Helper to extract readable page name from URL
const getPageName = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    if (path === "/" || path === "") return "Homepage";
    const segments = path.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1] || "Page";
    return lastSegment
      .replace(/[-_]/g, " ")
      .replace(/\.\w+$/, "")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return url;
  }
};

// Helper to get path from URL
const getPath = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname || "/";
  } catch {
    return url;
  }
};

export const PageSelector: React.FC<PageSelectorProps> = ({
  pages,
  selectedPages,
  onTogglePage,
  onToggleAll,
  onStartAnalysis,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return pages;
    const query = searchQuery.toLowerCase();
    return pages.filter((url) => url.toLowerCase().includes(query));
  }, [pages, searchQuery]);

  const allFilteredSelected = filteredPages.every((url) =>
    selectedPages.has(url)
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Card
        padding="none"
        className="overflow-hidden shadow-xl shadow-indigo-500/5 border-slate-200/80 dark:border-slate-700/50"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700/50 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Layers
                  size={20}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Select Pages to Audit
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {pages.length} page{pages.length !== 1 ? "s" : ""} discovered
                </p>
              </div>
            </div>
            <button
              onClick={onToggleAll}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
            >
              <Check size={14} />
              {selectedPages.size === pages.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>

          {/* Search Bar */}
          {pages.length > 5 && (
            <div className="mt-4 relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>
          )}
        </div>

        {/* Pages List */}
        <div className="max-h-[400px] overflow-y-auto bg-white dark:bg-slate-900">
          {filteredPages.length === 0 ? (
            <div className="p-8 text-center">
              <Search
                size={32}
                className="mx-auto mb-3 text-slate-300 dark:text-slate-600"
              />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No pages match your search
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPages.map((url, index) => {
                const isSelected = selectedPages.has(url);
                const pageName = getPageName(url);
                const path = getPath(url);

                return (
                  <label
                    key={url}
                    className={`flex items-center gap-3 p-4 cursor-pointer transition-all group ${
                      isSelected
                        ? "bg-indigo-50/50 dark:bg-indigo-900/10"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="relative flex-shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isSelected}
                        onChange={() => onTogglePage(url)}
                      />
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500"
                            : "border-slate-300 dark:border-slate-600 group-hover:border-indigo-400"
                        }`}
                      >
                        {isSelected && (
                          <Check
                            size={12}
                            className="text-white"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                    </div>

                    {/* Page Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText
                          size={14}
                          className={`flex-shrink-0 ${
                            isSelected
                              ? "text-indigo-500 dark:text-indigo-400"
                              : "text-slate-400"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium truncate ${
                            isSelected
                              ? "text-slate-900 dark:text-slate-100"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {pageName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5 pl-[22px]">
                        {path}
                      </p>
                    </div>

                    {/* Index Badge */}
                    <span className="flex-shrink-0 text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      #{index + 1}
                    </span>

                    {/* External Link */}
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 p-1.5 text-slate-300 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-all"
                      onClick={(e) => e.stopPropagation()}
                      title="Open in new tab"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center justify-between gap-4">
            {/* Selection Info */}
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                  selectedPages.size > 0
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                }`}
              >
                {selectedPages.size}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {selectedPages.size === 0
                    ? "No pages selected"
                    : selectedPages.size === 1
                    ? "1 page selected"
                    : `${selectedPages.size} pages selected`}
                </p>
                {selectedPages.size > 0 &&
                  selectedPages.size < pages.length && (
                    <p className="text-xs text-slate-400">
                      {pages.length - selectedPages.size} remaining
                    </p>
                  )}
              </div>
            </div>

            {/* Start Button */}
            <Button
              onClick={onStartAnalysis}
              disabled={selectedPages.size === 0}
              className="shadow-lg shadow-indigo-500/20"
            >
              <Sparkles size={16} className="mr-2" />
              Start AI Analysis
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
