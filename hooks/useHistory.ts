import { useState, useEffect, useCallback } from "react";
import { SavedReport } from "../types";
import { STORAGE_KEYS, APP_CONFIG } from "../constants";

export const useHistory = () => {
  const [history, setHistory] = useState<SavedReport[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<SavedReport | null>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.history);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const addToHistory = useCallback((report: SavedReport) => {
    setHistory((prev) => {
      const updated = [report, ...prev].slice(0, APP_CONFIG.maxHistoryItems);
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteFromHistory = useCallback((reportId: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== reportId);
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(updated));
      return updated;
    });
    // Close preview if the deleted item was being viewed
    setSelectedHistoryItem((current) =>
      current?.id === reportId ? null : current
    );
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setSelectedHistoryItem(null);
    localStorage.removeItem(STORAGE_KEYS.history);
  }, []);

  const viewHistoryItem = useCallback((report: SavedReport) => {
    setSelectedHistoryItem(report);
  }, []);

  const closeHistoryItemView = useCallback(() => {
    setSelectedHistoryItem(null);
  }, []);

  return {
    history,
    showHistory,
    setShowHistory,
    addToHistory,
    deleteFromHistory,
    clearHistory,
    selectedHistoryItem,
    viewHistoryItem,
    closeHistoryItemView,
  };
};
