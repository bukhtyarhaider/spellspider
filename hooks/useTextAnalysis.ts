import { useState, useCallback } from "react";
import { PageScanResult } from "../types";
import { analyzeTextForErrors } from "../services/geminiService";

export const useTextAnalysis = () => {
  const [manualTitle, setManualTitle] = useState("");
  const [manualText, setManualText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const analyzeText = useCallback(async (): Promise<PageScanResult | null> => {
    if (!manualText) return null;

    setIsAnalyzing(true);
    setErrorDetails(null);

    const pseudoUrl = "manual-input";
    const title = manualTitle || "Manual Text Entry";

    try {
      const wordCount = manualText.split(/\s+/).length;
      const { errors, score, summary } = await analyzeTextForErrors(manualText);

      return {
        url: pseudoUrl,
        title,
        status: "completed",
        errors,
        score,
        summary,
        wordCount,
        scannedAt: new Date().toISOString(),
      };
    } catch (e) {
      console.error(e);
      setErrorDetails("Analysis failed.");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [manualText, manualTitle]);

  const reset = useCallback(() => {
    setManualTitle("");
    setManualText("");
    setErrorDetails(null);
  }, []);

  return {
    manualTitle,
    setManualTitle,
    manualText,
    setManualText,
    isAnalyzing,
    errorDetails,
    analyzeText,
    reset,
  };
};
