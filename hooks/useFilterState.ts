import { useState, useMemo, useCallback } from "react";
import { SpellingError } from "../types";

export const useFilterState = (errors: SpellingError[]) => {
  const [filterSeverity, setFilterSeverity] = useState<string>("All");
  const [filterType, setFilterType] = useState<string>("All");

  const filteredErrors = useMemo(() => {
    return errors.filter((e) => {
      const matchSeverity =
        filterSeverity === "All" || e.severity === filterSeverity;
      const matchType = filterType === "All" || e.type === filterType;
      return matchSeverity && matchType;
    });
  }, [errors, filterSeverity, filterType]);

  const resetFilters = useCallback(() => {
    setFilterSeverity("All");
    setFilterType("All");
  }, []);

  return {
    filterSeverity,
    setFilterSeverity,
    filterType,
    setFilterType,
    filteredErrors,
    resetFilters,
  };
};
