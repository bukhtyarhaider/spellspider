import React from "react";
import { Sparkles } from "lucide-react";
import { UrlInput } from "../features/scan/UrlInput";
import { ErrorMessage } from "../features/scan/ErrorMessage";
import { Card } from "../components/ui";
import { Loader2 } from "lucide-react";

interface HomePageProps {
  urlInput: string;
  onUrlChange: (url: string) => void;
  onDiscover: () => void;
  onReset: () => void;
  step: "input" | "discovering" | "selection";
  discoveryProgress?: string;
  errorDetails?: string | null;
}

export const HomePage: React.FC<HomePageProps> = ({
  urlInput,
  onUrlChange,
  onDiscover,
  onReset,
  step,
  discoveryProgress,
  errorDetails,
}) => {
  return (
    <div className="max-w-3xl mx-auto mb-16 text-center transition-all duration-700 ease-out">
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
        Instant, professional analysis of spelling, grammar, tone, and style for
        your website.
      </p>

      <div className="flex flex-col gap-6 animate-slide-up [animation-delay:200ms]">
        <div className="transform hover:scale-[1.01] transition-transform duration-300">
          <UrlInput
            urlInput={urlInput}
            onUrlChange={onUrlChange}
            onDiscover={onDiscover}
            onReset={onReset}
            step={step}
          />
        </div>

        {discoveryProgress && step === "discovering" && (
          <Card className="animate-pulse border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20">
            <div className="flex items-center gap-3">
              <Loader2
                className="animate-spin text-indigo-600 dark:text-indigo-400"
                size={20}
              />
              <div>
                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                  Discovering pages...
                </p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                  {discoveryProgress}
                </p>
              </div>
            </div>
          </Card>
        )}

        {errorDetails && <ErrorMessage message={errorDetails} />}
      </div>
    </div>
  );
};
