import React from "react";
import { PageSelector } from "../features/scan/PageSelector";

interface ScanSelectionPageProps {
  pages: string[];
  selectedPages: Set<string>;
  onTogglePage: (page: string) => void;
  onToggleAll: () => void;
  onStartAnalysis: () => void;
}

export const ScanSelectionPage: React.FC<ScanSelectionPageProps> = ({
  pages,
  selectedPages,
  onTogglePage,
  onToggleAll,
  onStartAnalysis,
}) => {
  return (
    <PageSelector
      pages={pages}
      selectedPages={selectedPages}
      onTogglePage={onTogglePage}
      onToggleAll={onToggleAll}
      onStartAnalysis={onStartAnalysis}
    />
  );
};
